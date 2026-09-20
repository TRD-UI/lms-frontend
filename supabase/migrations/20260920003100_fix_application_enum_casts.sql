-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: approving an application errored at the moment it mattered.
--
--   column "status" is of type enrollment_status but expression is of type text
--
-- A bare `case ... then 'active' end` is text, and Postgres will not assign
-- text to an enum column. Two of them here: the enrolment insert and the
-- application's own status update. Exactly the failure shape as the
-- attendance_method cast in 20260920002900 — worth the explicit casts
-- everywhere an enum is written from a CASE.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.review_application(
  p_application_id uuid,
  p_approve        boolean,
  p_note           text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  a public.course_applications;
  c public.courses;
  taken integer;
begin
  select * into a from public.course_applications where id = p_application_id for update;
  if a is null then
    raise exception 'Application not found' using errcode = 'no_data_found';
  end if;

  if not (public.is_admin() or public.teaches_course(a.course_id)) then
    raise exception 'Not your course to decide' using errcode = 'insufficient_privilege';
  end if;

  if a.status <> 'pending' then
    raise exception 'This application has already been %', a.status
      using errcode = 'check_violation';
  end if;

  -- Lock the course so two reviewers cannot both approve into the last seat.
  select * into c from public.courses where id = a.course_id for update;

  if p_approve then
    select count(*) into taken
      from public.enrollments
     where course_id = a.course_id and status in ('active', 'completed');

    if c.seats_total > 0 and taken >= c.seats_total then
      raise exception 'Course is full — no seat to admit into' using errcode = 'check_violation';
    end if;

    insert into public.enrollments (course_id, student_id, status)
    values (a.course_id, a.student_id, 'active')
    on conflict (course_id, student_id) do update
      set status = (case when enrollments.status = 'completed'
                         then 'completed' else 'active' end)::public.enrollment_status;

    update public.waitlist_entries
       set status = 'promoted'
     where course_id = a.course_id and student_id = a.student_id and status = 'waiting';
  end if;

  update public.course_applications
     set status      = (case when p_approve then 'approved' else 'rejected' end)::public.application_status,
         reviewed_at = now(),
         reviewed_by = auth.uid(),
         review_note = coalesce(p_note, '')
   where id = a.id
  returning * into a;

  insert into public.notifications (user_id, type, title, message, link)
  values (
    a.student_id,
    'course_update',
    case when p_approve then 'Application approved' else 'Application not successful' end,
    case when p_approve
         then format('You have a place on %s. The course is now in My Learning.', c.title)
         else format('Your application for %s was not successful.%s', c.title,
                     case when coalesce(p_note, '') = '' then '' else ' ' || p_note end)
    end,
    case when p_approve then '/dashboard/learning' else '/dashboard/learning/' || c.id::text end
  );

  perform public.log_audit(
    case when p_approve then 'application.approve' else 'application.reject' end,
    c.title,
    coalesce(p_note, '')
  );

  return to_jsonb(a);
end;
$$;

revoke all on function public.review_application(uuid, boolean, text) from public;
grant execute on function public.review_application(uuid, boolean, text) to authenticated;
