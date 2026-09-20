-- ─────────────────────────────────────────────────────────────────────────────
-- Storage buckets and their access rules.
--
-- Course content is private. The player never gets a raw object URL; it calls
-- createSignedUrl(), and the policies below decide whether that call succeeds.
-- This is also why MediaViewer's Google Docs iframe has to go: that viewer
-- fetches the URL server-side from Google's infrastructure, which a
-- short-lived signed URL scoped to the learner will not survive reliably.
-- ─────────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('course-content', 'course-content', false, 524288000,
   array['video/mp4','video/webm','video/quicktime',
         'application/pdf',
         'application/vnd.openxmlformats-officedocument.presentationml.presentation',
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
         'image/png','image/jpeg']),
  ('certificates', 'certificates', false, 10485760, array['application/pdf']),
  ('avatars', 'avatars', true, 2097152, array['image/png','image/jpeg','image/webp','image/svg+xml'])
on conflict (id) do nothing;

-- ─── course-content ──────────────────────────────────────────────────────────
-- Path convention: <course_id>/<module_id>/<filename>. The first segment is
-- what the policies key off, so uploads must follow it.

create policy "course content readable by enrolled or staff"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'course-content'
    and (
      public.owns_course(public.safe_uuid((storage.foldername(name))[1]))
      or exists (
        select 1 from public.enrollments e
         where e.course_id = public.safe_uuid((storage.foldername(name))[1])
           and e.student_id = auth.uid()
           and e.status in ('active', 'completed')
      )
    )
  );

create policy "course content writable by course staff"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'course-content'
    and public.owns_course(public.safe_uuid((storage.foldername(name))[1]))
  );

create policy "course content updatable by course staff"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'course-content'
    and public.owns_course(public.safe_uuid((storage.foldername(name))[1]))
  );

create policy "course content deletable by course staff"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'course-content'
    and public.owns_course(public.safe_uuid((storage.foldername(name))[1]))
  );

-- ─── certificates ────────────────────────────────────────────────────────────
-- Path convention: <student_id>/<credential_id>.pdf

create policy "certificates readable by owner or staff"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'certificates'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff())
  );

create policy "certificates writable by admin"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'certificates' and public.is_admin());

-- ─── avatars ─────────────────────────────────────────────────────────────────
-- Public bucket, but a user may only write under their own id.

create policy "avatars readable by all"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'avatars');

create policy "avatars writable by owner"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars updatable by owner"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars deletable by owner"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
