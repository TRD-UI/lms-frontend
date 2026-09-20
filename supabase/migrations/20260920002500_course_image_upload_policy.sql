-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: a cover image could never be uploaded for a new course.
--
-- The insert policy required owns_course(<first path segment>), but the image
-- is chosen while the course is still being filled in — the row does not exist,
-- so ownership can never be true and every upload was refused.
--
-- Insert is therefore open to active staff, who are the only people with a
-- course form at all. Replacing or deleting an existing image still requires
-- ownership, so one instructor cannot overwrite another's artwork.
-- ─────────────────────────────────────────────────────────────────────────────

drop policy if exists "course images writable by course staff" on storage.objects;

create policy "course images writable by staff"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'course-images' and public.is_staff());
