-- ─────────────────────────────────────────────────────────────────────────────
-- Physical sessions (cohorts), QR entry passes, attendance and subjective
-- grades.
--
-- The current UI builds QR codes from a plaintext pass code and renders them
-- via api.qrserver.com, which is forgeable by anyone who can guess the format.
-- Here the scannable payload is an HMAC over (pass id, session id, secret),
-- verified server-side in redeem_entry_pass().
-- ─────────────────────────────────────────────────────────────────────────────

create table public.course_sessions (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references public.courses (id) on delete cascade,
  title         text not null,
  session_date  date not null,
  starts_at     time not null,
  ends_at       time not null,
  venue_id      uuid references public.venues (id) on delete set null,
  venue_name    text not null default '',
  room_number   text not null default '',
  capacity      integer check (capacity > 0),
  instructor_id uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now(),

  constraint course_sessions_time_order check (ends_at > starts_at)
);

create index course_sessions_course_idx     on public.course_sessions (course_id, session_date desc);
create index course_sessions_instructor_idx on public.course_sessions (instructor_id, session_date desc);

create table public.entry_passes (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.course_sessions (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  -- Human-readable code shown on the pass (e.g. PSW-UI-2026-001). Display only;
  -- never trusted on its own for admission.
  pass_code  text not null unique,
  status     public.pass_status not null default 'active',
  issued_at  timestamptz not null default now(),
  used_at    timestamptz,
  used_by    uuid references public.profiles (id) on delete set null,
  unique (session_id, student_id)
);

create index entry_passes_student_idx on public.entry_passes (student_id, status);
create index entry_passes_session_idx on public.entry_passes (session_id);

create table public.attendance_records (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references public.course_sessions (id) on delete cascade,
  student_id    uuid not null references public.profiles (id) on delete cascade,
  status        public.attendance_status not null default 'absent',
  method        public.attendance_method not null default 'manual',
  check_in_time timestamptz,
  marked_by     uuid references public.profiles (id) on delete set null,
  -- Set by the offline sync endpoint so a retried batch cannot double-count.
  -- Unique per device, which is what makes the sync idempotent.
  client_record_id text,
  device_id        text,
  updated_at    timestamptz not null default now(),
  unique (session_id, student_id),
  unique (device_id, client_record_id)
);

create index attendance_session_idx on public.attendance_records (session_id, status);
create index attendance_student_idx on public.attendance_records (student_id);

create trigger attendance_touch_updated_at
  before update on public.attendance_records
  for each row execute function public.touch_updated_at();

create table public.subjective_grades (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.course_sessions (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  score      integer not null check (score between 0 and 100),
  notes      text,
  graded_by  uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (session_id, student_id)
);

create index subjective_grades_session_idx on public.subjective_grades (session_id);

-- ─── Pass signing secret ─────────────────────────────────────────────────────
-- Kept out of the public schema and out of every API grant. Only the
-- SECURITY DEFINER functions in the functions migration can read it.

create schema if not exists private;
revoke all on schema private from anon, authenticated;

create table private.app_secrets (
  key        text primary key,
  value      text not null,
  created_at timestamptz not null default now()
);

revoke all on private.app_secrets from anon, authenticated;

-- Generated once at migration time. Rotate with:
--   update private.app_secrets set value = encode(gen_random_bytes(32), 'hex')
--    where key = 'entry_pass_hmac';
-- Rotating invalidates every QR already in a learner's pocket, so reissue after.
insert into private.app_secrets (key, value)
values ('entry_pass_hmac', encode(extensions.gen_random_bytes(32), 'hex'))
on conflict (key) do nothing;
