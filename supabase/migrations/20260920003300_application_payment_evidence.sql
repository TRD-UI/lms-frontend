-- ─────────────────────────────────────────────────────────────────────────────
-- Proof of payment on a course application.
--
-- A receipt carries a name, a bank and an amount, so the bucket is private and
-- reads go through a signed URL. Three parties may look at one: the applicant
-- who uploaded it, an admin, and the instructor of the course applied for.
-- Nobody else, including other instructors.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.course_applications
  add column payment_evidence_path text not null default '';

comment on column public.course_applications.payment_evidence_path is
  'Object path in the private application-evidence bucket. Read with a signed URL.';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('application-evidence', 'application-evidence', false, 5242880,
        array['image/png', 'image/jpeg', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;

-- Path convention: <applicant id>/<file>. The folder is the applicant, so an
-- applicant can only ever write into their own.
create policy "evidence writable by the applicant"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'application-evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "evidence replaceable by the applicant"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'application-evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "evidence removable by the applicant"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'application-evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "evidence readable by the applicant and its reviewers"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'application-evidence'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
      or exists (
        select 1
          from public.course_applications a
         where a.payment_evidence_path = storage.objects.name
           and public.teaches_course(a.course_id)
      )
    )
  );

-- ─── Applying, now with the receipt ─────────────────────────────────────────
--
-- A new parameter means a new signature, so the old one goes rather than
-- leaving two overloads for the client to pick between.

drop function if exists public.apply_for_course(uuid, text, text, text, text);

create or replace function public.apply_for_course(
  p_course_id  uuid,
  p_phone      text default '',
  p_employer   text default '',
  p_experience text default '',
  p_motivation text default '',
  p_evidence   text default ''
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

  -- The path is the applicant's own folder or nothing; a forged path would
  -- otherwise point the reviewer at somebody else's file.
  if coalesce(p_evidence, '') <> ''
     and split_part(p_evidence, '/', 1) <> auth.uid()::text then
    raise exception 'Evidence must be uploaded under your own folder'
      using errcode = 'insufficient_privilege';
  end if;

  select status into already
    from public.enrollments
   where course_id = p_course_id and student_id = auth.uid();

  if already in ('active', 'completed') then
    raise exception 'You are already enrolled on this course' using errcode = 'unique_violation';
  end if;

  insert into public.course_applications
    (course_id, student_id, status, phone, employer, experience, motivation, payment_evidence_path)
  values
    (p_course_id, auth.uid(), 'pending', coalesce(p_phone, ''), coalesce(p_employer, ''),
     coalesce(p_experience, ''), coalesce(p_motivation, ''), coalesce(p_evidence, ''))
  on conflict (course_id, student_id) do update
    set status                = 'pending',
        phone                 = excluded.phone,
        employer              = excluded.employer,
        experience            = excluded.experience,
        motivation            = excluded.motivation,
        payment_evidence_path = excluded.payment_evidence_path,
        submitted_at          = now(),
        reviewed_at           = null,
        reviewed_by           = null,
        review_note           = ''
    -- Re-applying is for a decision already made. An application still sitting
    -- in the queue should not be silently rewritten under the reviewer.
    where course_applications.status <> 'pending'
  returning * into a;

  if a is null then
    raise exception 'Your application for this course is already under review'
      using errcode = 'unique_violation';
  end if;

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

revoke all on function public.apply_for_course(uuid, text, text, text, text, text) from public;
grant execute on function public.apply_for_course(uuid, text, text, text, text, text) to authenticated;
