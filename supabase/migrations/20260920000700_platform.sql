-- ─────────────────────────────────────────────────────────────────────────────
-- Certificates, notifications, audit trail and device sync logs.
-- ─────────────────────────────────────────────────────────────────────────────

create table public.certificates (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.profiles (id) on delete cascade,
  course_id     uuid not null references public.courses (id) on delete cascade,
  -- Printed on the certificate and used for public verification.
  credential_id text not null unique,
  issued_at     timestamptz not null default now(),
  -- Object path in the `certificates` storage bucket. NULL while the PDF is
  -- still generated client-side by jsPDF.
  storage_path  text,
  revoked_at    timestamptz,
  unique (student_id, course_id)
);

create index certificates_student_idx on public.certificates (student_id, issued_at desc);

-- Public verification: anyone holding a credential id can confirm it, without
-- the certificates table itself being readable. Exposed through
-- public.verify_certificate() in the functions migration.

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  type       public.notification_type not null default 'system',
  title      text not null,
  message    text not null default '',
  link       text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, is_read, created_at desc);

create table public.audit_logs (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references public.profiles (id) on delete set null,
  actor_name text not null default '',
  actor_role public.user_role,
  action     text not null,
  target     text not null default '',
  details    text not null default '',
  created_at timestamptz not null default now()
);

comment on table public.audit_logs is
  'Append-only. No update or delete policy exists for any role, including admin.';

create index audit_logs_created_idx on public.audit_logs (created_at desc);

create table public.device_sync_logs (
  id            uuid primary key default gen_random_uuid(),
  instructor_id uuid references public.profiles (id) on delete set null,
  device_id     text not null,
  record_count  integer not null default 0 check (record_count >= 0),
  status        public.sync_status not null default 'pending',
  error_detail  text,
  synced_at     timestamptz not null default now()
);

create index device_sync_logs_synced_idx on public.device_sync_logs (synced_at desc);
