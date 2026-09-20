-- ─────────────────────────────────────────────────────────────────────────────
-- Enrollment, lesson progress, waitlist and payments.
--
-- Progress is the piece the current UI has no backing for at all: the player
-- never marks anything complete, and Course.progress is a static number in the
-- seed. lesson_progress + the recompute trigger below make it real.
-- ─────────────────────────────────────────────────────────────────────────────

create table public.enrollments (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references public.courses (id) on delete cascade,
  student_id   uuid not null references public.profiles (id) on delete cascade,
  status       public.enrollment_status not null default 'pending',
  -- Percent 0–100, maintained by recompute_enrollment_progress(). Denormalised
  -- so course lists do not need a per-row aggregate.
  progress     integer not null default 0 check (progress between 0 and 100),
  last_item_id uuid references public.module_items (id) on delete set null,
  enrolled_at  timestamptz not null default now(),
  completed_at timestamptz,
  unique (course_id, student_id)
);

comment on column public.enrollments.last_item_id is
  'Drives "resume where you left off" on the overview screen.';

create index enrollments_student_idx on public.enrollments (student_id, status);
create index enrollments_course_idx  on public.enrollments (course_id, status);

create table public.lesson_progress (
  id             uuid primary key default gen_random_uuid(),
  enrollment_id  uuid not null references public.enrollments (id) on delete cascade,
  module_item_id uuid not null references public.module_items (id) on delete cascade,
  completed_at   timestamptz not null default now(),
  unique (enrollment_id, module_item_id)
);

create index lesson_progress_enrollment_idx on public.lesson_progress (enrollment_id);

-- Seats are derived, never stored as a counter, so concurrent enrollment can't
-- drift. courses.seats_total is the cap; this view supplies the taken count
-- that the UI's `seats: { enrolled, total }` shape needs.
create view public.course_seat_counts
with (security_invoker = true)
as
  select c.id  as course_id,
         c.seats_total,
         count(e.id) filter (where e.status in ('active', 'completed')) as seats_taken
    from public.courses c
    left join public.enrollments e on e.course_id = c.id
   group by c.id, c.seats_total;

-- ─── Progress recomputation ──────────────────────────────────────────────────
-- Recomputes percent complete for the affected enrollment whenever a lesson is
-- ticked off or un-ticked. Quiz items count the same as content items.

create or replace function public.recompute_enrollment_progress()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_enrollment uuid;
  total_items   integer;
  done_items    integer;
  next_progress integer;
begin
  -- NEW is unassigned on DELETE and OLD on INSERT, so neither can be read
  -- unconditionally: plpgsql raises rather than returning null.
  if tg_op = 'DELETE' then
    target_enrollment := old.enrollment_id;
  else
    target_enrollment := new.enrollment_id;
  end if;

  select count(mi.id)
    into total_items
    from public.enrollments e
    join public.course_modules cm on cm.course_id = e.course_id
    join public.module_items   mi on mi.module_id = cm.id
   where e.id = target_enrollment;

  select count(*) into done_items
    from public.lesson_progress
   where enrollment_id = target_enrollment;

  next_progress := case when total_items = 0 then 0
                        else least(100, round(done_items::numeric * 100 / total_items))
                   end;

  update public.enrollments
     set progress     = next_progress,
         status       = case when next_progress = 100 and status = 'active' then 'completed'
                             else status end,
         completed_at = case when next_progress = 100 then coalesce(completed_at, now())
                             else null end
   where id = target_enrollment;

  return null;
end;
$$;

create trigger lesson_progress_recompute
  after insert or delete on public.lesson_progress
  for each row execute function public.recompute_enrollment_progress();

-- ─── Waitlist ────────────────────────────────────────────────────────────────

create table public.waitlist_entries (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references public.courses (id) on delete cascade,
  student_id   uuid not null references public.profiles (id) on delete cascade,
  position     integer not null check (position > 0),
  status       public.waitlist_status not null default 'waiting',
  requested_at timestamptz not null default now(),
  unique (course_id, student_id)
);

create index waitlist_course_idx on public.waitlist_entries (course_id, position);

-- ─── Payments ────────────────────────────────────────────────────────────────
-- Amounts are integer minor units (kobo), currency NGN, per the conventions in
-- docs/ROLES-FEATURES-ENDPOINTS.md. No provider is wired yet: mark_payment_settled()
-- in the functions migration stands in for a gateway webhook, so swapping in
-- Paystack later needs no schema change — only a real callback that flips the
-- same row.

create table public.payments (
  id            uuid primary key default gen_random_uuid(),
  reference     text not null unique,
  student_id    uuid not null references public.profiles (id) on delete cascade,
  course_id     uuid references public.courses (id) on delete set null,
  enrollment_id uuid references public.enrollments (id) on delete set null,
  purpose       public.payment_purpose not null default 'tuition',
  amount        integer not null check (amount >= 0),
  currency      text not null default 'NGN',
  method        public.payment_method not null default 'card',
  status        public.payment_status not null default 'pending',
  -- Opaque provider payload, kept for reconciliation once a gateway exists.
  provider_ref  text,
  created_at    timestamptz not null default now(),
  settled_at    timestamptz
);

create index payments_student_idx on public.payments (student_id, created_at desc);
create index payments_status_idx  on public.payments (status, created_at desc);
