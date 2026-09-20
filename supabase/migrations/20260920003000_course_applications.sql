-- ─────────────────────────────────────────────────────────────────────────────
-- Course applications.
--
-- Until now "Apply for Admission" was a button that did nothing, and
-- enroll_in_course() let a learner put themselves straight onto a course. TRD
-- admits by application: the learner submits, staff review, and only an
-- approval creates the enrolment.
--
-- The decision is the part worth protecting, so `course_applications` has no
-- insert or update policy at all. Both paths go through SECURITY DEFINER
-- functions below — which is what makes "approve your own application" a thing
-- the client cannot express, however it is called.
-- ─────────────────────────────────────────────────────────────────────────────

create type public.application_status as enum ('pending', 'approved', 'rejected', 'withdrawn');

create table public.course_applications (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references public.courses (id) on delete cascade,
  student_id   uuid not null references public.profiles (id) on delete cascade,
  status       public.application_status not null default 'pending',

  -- What the applicant tells us. Kept deliberately small: anything longer is a
  -- form people abandon.
  phone        text not null default '',
  employer     text not null default '',
  experience   text not null default '',
  motivation   text not null default '',

  submitted_at timestamptz not null default now(),
  reviewed_at  timestamptz,
  reviewed_by  uuid references public.profiles (id) on delete set null,
  review_note  text not null default '',

  -- One live application per learner per course. A rejected applicant re-applies
  -- by resetting this row, not by stacking a second one.
  unique (course_id, student_id)
);

create index course_applications_course_idx  on public.course_applications (course_id, status);
create index course_applications_student_idx on public.course_applications (student_id, submitted_at desc);
create index course_applications_queue_idx   on public.course_applications (status, submitted_at);

comment on table public.course_applications is
  'Admission requests. Approval is the only route into enrollments for an applied course.';

alter table public.course_applications enable row level security;

-- Read: your own, or staff. An instructor sees applications for courses they
-- teach — not the whole institution's intake.
create policy course_applications_select_own on public.course_applications
  for select to authenticated
  using (
    student_id = auth.uid()
    or public.is_admin()
    or public.teaches_course(course_id)
  );

-- No insert/update/delete policy. See the header.

-- ─── Applying ────────────────────────────────────────────────────────────────

create or replace function public.apply_for_course(
  p_course_id  uuid,
  p_phone      text default '',
  p_employer   text default '',
  p_experience text default '',
  p_motivation text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.courses;
  a public.course_applications;
  already public.enrollment_status;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = 'insufficient_privilege';
  end if;

  select * into c from public.courses where id = p_course_id;
  if c is null or c.status <> 'published' then
    raise exception 'Course not available' using errcode = 'no_data_found';
  end if;

  select status into already
    from public.enrollments
   where course_id = p_course_id and student_id = auth.uid();

  if already in ('active', 'completed') then
    raise exception 'You are already enrolled on this course' using errcode = 'unique_violation';
  end if;

  insert into public.course_applications
    (course_id, student_id, status, phone, employer, experience, motivation)
  values
    (p_course_id, auth.uid(), 'pending', coalesce(p_phone, ''), coalesce(p_employer, ''),
     coalesce(p_experience, ''), coalesce(p_motivation, ''))
  on conflict (course_id, student_id) do update
    set status       = 'pending',
        phone        = excluded.phone,
        employer     = excluded.employer,
        experience   = excluded.experience,
        motivation   = excluded.motivation,
        submitted_at = now(),
        reviewed_at  = null,
        reviewed_by  = null,
        review_note  = ''
    -- Re-applying is for a decision already made. An application still sitting
    -- in the queue should not be silently rewritten under the reviewer.
    where course_applications.status <> 'pending'
  returning * into a;

  if a is null then
    raise exception 'Your application for this course is already under review'
      using errcode = 'unique_violation';
  end if;

  -- Tell the people who can act on it: the course's instructor, and admins.
  insert into public.notifications (user_id, type, title, message, link)
  select p.id, 'system', 'New course application',
         format('%s applied for %s.',
                (select name from public.profiles where id = auth.uid()), c.title),
         '/admin/courses'
    from public.profiles p
   where p.status = 'active'
     and (p.role = 'admin' or p.id = c.instructor_id);

  return to_jsonb(a);
end;
$$;

revoke all on function public.apply_for_course(uuid, text, text, text, text) from public;
grant execute on function public.apply_for_course(uuid, text, text, text, text) to authenticated;

/** Pull an application before anyone has ruled on it. */
create or replace function public.withdraw_application(p_course_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  a public.course_applications;
begin
  update public.course_applications
     set status = 'withdrawn'
   where course_id = p_course_id
     and student_id = auth.uid()
     and status = 'pending'
  returning * into a;

  if a is null then
    raise exception 'No pending application to withdraw' using errcode = 'no_data_found';
  end if;
  return to_jsonb(a);
end;
$$;

revoke all on function public.withdraw_application(uuid) from public;
grant execute on function public.withdraw_application(uuid) to authenticated;

-- ─── Reviewing ───────────────────────────────────────────────────────────────

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
      set status = case when enrollments.status = 'completed'
                        then 'completed' else 'active' end;

    -- Admitted from the waitlist, if they were on it.
    update public.waitlist_entries
       set status = 'promoted'
     where course_id = a.course_id and student_id = a.student_id and status = 'waiting';
  end if;

  update public.course_applications
     set status      = case when p_approve then 'approved' else 'rejected' end,
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
