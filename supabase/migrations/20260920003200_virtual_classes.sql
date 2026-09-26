-- ─────────────────────────────────────────────────────────────────────────────
-- Virtual classes.
--
-- A session can now be delivered online. It carries a join link, and that link
-- follows the same rule as an entry pass: it opens on the day, not before.
-- Handing out a meeting URL a fortnight early is the same leak as handing out
-- a door code early — it gets forwarded.
--
-- RLS is row-level, so hiding one column takes a grant, exactly as the answer
-- key on question_options does. `meeting_url` is unreadable from the client;
-- session_meeting_link() is the only way to it.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.course_sessions
  add column meeting_url text not null default '';

comment on column public.course_sessions.meeting_url is
  'Join link for an online class. Non-empty means the session is virtual. Withheld '
  'from learners until the day of the class, via session_meeting_link().';

revoke select on public.course_sessions from anon, authenticated;
grant select (
  id, course_id, title, session_date, starts_at, ends_at,
  venue_id, venue_name, room_number, capacity, instructor_id, created_at
) on public.course_sessions to authenticated;

-- ─── The link, when it is due ────────────────────────────────────────────────

create or replace function public.session_meeting_link(p_session_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  s public.course_sessions;
begin
  select * into s from public.course_sessions where id = p_session_id;
  if s is null then
    raise exception 'Session not found' using errcode = 'no_data_found';
  end if;

  if coalesce(s.meeting_url, '') = '' then
    return jsonb_build_object('virtual', false);
  end if;

  -- Whoever runs the class needs the link at all times — to set it up, to test
  -- it, and to put it back if it changes.
  if public.is_admin() or s.instructor_id = auth.uid() then
    return jsonb_build_object('virtual', true, 'released', true, 'url', s.meeting_url);
  end if;

  if not exists (
    select 1 from public.enrollments e
     where e.course_id = s.course_id
       and e.student_id = auth.uid()
       and e.status in ('active', 'completed')
  ) then
    raise exception 'Not enrolled on this course' using errcode = 'insufficient_privilege';
  end if;

  if s.session_date > current_date then
    return jsonb_build_object('virtual', true, 'released', false,
                              'reason', 'not_yet', 'availableOn', s.session_date);
  end if;

  if s.session_date < current_date then
    return jsonb_build_object('virtual', true, 'released', false, 'reason', 'past');
  end if;

  return jsonb_build_object('virtual', true, 'released', true, 'url', s.meeting_url);
end;
$$;

revoke all on function public.session_meeting_link(uuid) from public;
grant execute on function public.session_meeting_link(uuid) to authenticated;

-- ─── No door pass for a class with no door ───────────────────────────────────
--
-- Otherwise a virtual session issues a QR code and tells the learner their
-- "entry pass is ready" for something they join from a browser.

create or replace function public.sync_entry_passes(p_course_id uuid, p_student_id uuid)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  s record;
  enrolled boolean;
  unlocked boolean;
begin
  select exists (
    select 1 from public.enrollments
     where course_id = p_course_id and student_id = p_student_id
       and status in ('active', 'completed')
  ) into enrolled;

  unlocked := public.entry_pass_unlocked(p_course_id, p_student_id);

  for s in
    select * from public.course_sessions
     where course_id = p_course_id
       and session_date >= current_date
       and coalesce(meeting_url, '') = ''
  loop
    if enrolled and unlocked then
      insert into public.entry_passes (session_id, student_id, pass_code)
      values (
        s.id,
        p_student_id,
        upper(
          regexp_replace(substr(s.title, 1, 3), '[^a-zA-Z]', '', 'g') || '-' ||
          to_char(s.session_date, 'YYYY') || '-' ||
          substr(encode(extensions.gen_random_bytes(4), 'hex'), 1, 6)
        )
      )
      on conflict (session_id, student_id) do update
        set status = case when entry_passes.status = 'revoked' then 'active'
                          else entry_passes.status end;
    else
      update public.entry_passes
         set status = 'revoked'
       where session_id = s.id and student_id = p_student_id and status = 'active';
    end if;
  end loop;
end;
$$;
