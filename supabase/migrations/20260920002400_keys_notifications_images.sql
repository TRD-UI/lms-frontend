-- ─────────────────────────────────────────────────────────────────────────────
-- Three things: stop the answer-key read from 403-ing, give notifications a
-- real life, and let a course carry a cover image.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Answer keys, in one call, without raising ────────────────────────────
--
-- The client was calling assessment_authoring_payload() once per assessment to
-- collect answer keys. That function raises `insufficient_privilege` for
-- anyone who is not the course's instructor or an admin — so a learner's
-- catalogue read fired one 403 per assessment, and even an instructor 403'd on
-- every course they do not teach.
--
-- Fetching a key you may not have is not an error, it is an empty result. This
-- returns keys for exactly the assessments the caller may author, in one round
-- trip. The raising function stays for the single-assessment authoring case.

create or replace function public.assessment_keys()
returns table (question_id uuid, option_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select o.question_id, o.id
    from public.question_options o
    join public.assessment_questions q on q.id = o.question_id
    join public.assessments a on a.id = q.assessment_id
   where o.is_correct
     and (public.teaches_course(a.course_id) or public.is_admin());
$$;

grant execute on function public.assessment_keys() to authenticated;

-- ─── 2. Notifications ────────────────────────────────────────────────────────
-- The table already existed but nothing wrote to it except the payment path.
-- These triggers announce the events a learner actually needs to know about.

create or replace function public.notify_enrolled(
  p_course_id uuid,
  p_type public.notification_type,
  p_title text,
  p_message text,
  p_link text default null
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.notifications (user_id, type, title, message, link)
  select e.student_id, p_type, p_title, p_message, p_link
    from public.enrollments e
   where e.course_id = p_course_id
     and e.status in ('active', 'completed');
$$;

revoke execute on function public.notify_enrolled(uuid, public.notification_type, text, text, text)
  from anon, authenticated;

/** A newly scheduled class is the thing learners most need warning of. */
create or replace function public.notify_new_class()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  course_title text;
begin
  select title into course_title from public.courses where id = new.course_id;
  perform public.notify_enrolled(
    new.course_id,
    'new_class',
    'New class scheduled',
    format('%s on %s at %s.', new.title,
           to_char(new.session_date, 'FMDay DD Mon'), new.venue_name),
    '/dashboard/passes'
  );
  return new;
end;
$$;

create trigger course_sessions_notify
  after insert on public.course_sessions
  for each row execute function public.notify_new_class();

/** Publishing an assessment makes it actionable, so it is worth announcing. */
create or replace function public.notify_assessment_published()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'published' and coalesce(old.status, 'draft') <> 'published' then
    perform public.notify_enrolled(
      new.course_id,
      'course_update',
      'New assessment available',
      format('"%s" is now open.', new.title),
      '/dashboard/assessments'
    );
  end if;
  return new;
end;
$$;

create trigger assessments_notify_published
  after update on public.assessments
  for each row execute function public.notify_assessment_published();

/** A released entry pass is the learner's cue that the door is open. */
create or replace function public.notify_pass_issued()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  session_title text;
begin
  select title into session_title from public.course_sessions where id = new.session_id;
  insert into public.notifications (user_id, type, title, message, link)
  values (new.student_id, 'system', 'Entry pass issued',
          format('Your pass for %s is ready.', coalesce(session_title, 'an upcoming class')),
          '/dashboard/passes');
  return new;
end;
$$;

create trigger entry_passes_notify
  after insert on public.entry_passes
  for each row execute function public.notify_pass_issued();

revoke execute on function public.notify_new_class() from anon, authenticated;
revoke execute on function public.notify_assessment_published() from anon, authenticated;
revoke execute on function public.notify_pass_issued() from anon, authenticated;

/** Marks every unread notification for the caller. */
create or replace function public.mark_all_notifications_read()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  touched integer;
begin
  update public.notifications
     set is_read = true
   where user_id = auth.uid() and not is_read;
  get diagnostics touched = row_count;
  return touched;
end;
$$;

grant execute on function public.mark_all_notifications_read() to authenticated;

-- A learner may clear their own notifications.
create policy notifications_delete_own on public.notifications
  for delete to authenticated using (user_id = auth.uid());

grant delete on public.notifications to authenticated;

-- ─── 3. Course cover image ───────────────────────────────────────────────────
-- The learner's course cards render an image; until now that was a placeholder
-- SVG for every course.

alter table public.courses
  add column if not exists image_url text;

comment on column public.courses.image_url is
  'Public URL of the cover image shown on course cards.';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('course-images', 'course-images', true, 5242880,
        array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;

-- Covers are catalogue content: visible to anyone browsing, written by the
-- course's owner. Path convention: <course id>/<file>.
create policy "course images readable by all"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'course-images');

create policy "course images writable by course staff"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'course-images'
    and public.owns_course(public.safe_uuid((storage.foldername(name))[1]))
  );

create policy "course images updatable by course staff"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'course-images'
    and public.owns_course(public.safe_uuid((storage.foldername(name))[1]))
  );

create policy "course images deletable by course staff"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'course-images'
    and public.owns_course(public.safe_uuid((storage.foldername(name))[1]))
  );
