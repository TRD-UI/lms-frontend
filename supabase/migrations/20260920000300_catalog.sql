-- ─────────────────────────────────────────────────────────────────────────────
-- Catalog: courses, their fee structure, modules and module items.
-- Mirrors src/data/types.ts.
-- ─────────────────────────────────────────────────────────────────────────────

create table public.venues (
  id         uuid primary key default gen_random_uuid(),
  name       text    not null unique,
  capacity   integer not null check (capacity > 0),
  created_at timestamptz not null default now()
);

create table public.courses (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text not null default '',
  duration        text not null default '',
  location        text not null default '',
  category        text not null,
  seats_total     integer not null default 0 check (seats_total >= 0),
  fee_type        public.fee_type not null default 'flat',
  -- Minor units (kobo). NULL when fee_type = 'tiered'; tiers live in their own
  -- table. Enforced by the check below so the two representations can't both
  -- be populated and disagree.
  fee_amount      integer check (fee_amount >= 0),
  application_fee integer not null default 0 check (application_fee >= 0),
  status          public.course_status not null default 'draft',
  instructor_id   uuid references public.profiles (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint courses_fee_shape check (
    (fee_type = 'flat'   and fee_amount is not null) or
    (fee_type = 'tiered' and fee_amount is null)
  )
);

comment on column public.courses.fee_amount is
  'Minor units (kobo), currency NGN. NULL for tiered courses — see course_fee_tiers.';

create index courses_instructor_idx on public.courses (instructor_id);
create index courses_status_idx     on public.courses (status);
create index courses_category_idx   on public.courses (category);

create trigger courses_touch_updated_at
  before update on public.courses
  for each row execute function public.touch_updated_at();

create table public.course_fee_tiers (
  id        uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  name      text not null,
  amount    integer not null check (amount >= 0),
  position  integer not null default 0,
  unique (course_id, name)
);

create index course_fee_tiers_course_idx on public.course_fee_tiers (course_id, position);

create table public.course_modules (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.courses (id) on delete cascade,
  title      text not null,
  position   integer not null default 0,
  created_at timestamptz not null default now()
);

create index course_modules_course_idx on public.course_modules (course_id, position);

create table public.module_items (
  id         uuid primary key default gen_random_uuid(),
  module_id  uuid not null references public.course_modules (id) on delete cascade,
  title      text not null,
  type       public.module_item_type not null,
  -- For video/pdf/document: an object path inside the `course-content` storage
  -- bucket. The client never reads this directly; it calls
  -- public.signed_item_url() which enforces enrollment first.
  storage_path text,
  -- Escape hatch for content hosted elsewhere (the seed uses public sample URLs).
  external_url text,
  -- Required when type = 'quiz'. FK added in the assessments migration, since
  -- public.assessments does not exist yet.
  assessment_id uuid,
  position   integer not null default 0,
  created_at timestamptz not null default now(),

  constraint module_items_payload check (
    (type = 'quiz' and assessment_id is not null)
    or (type <> 'quiz' and (storage_path is not null or external_url is not null))
  )
);

create index module_items_module_idx on public.module_items (module_id, position);

-- ─── Ownership helper ────────────────────────────────────────────────────────
-- Defined here rather than in the identity migration because its body
-- references public.courses, and SQL function bodies are parsed at creation.

create or replace function public.owns_course(target_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
      or exists (
           select 1 from public.courses c
            where c.id = target_course_id
              and c.instructor_id = auth.uid()
         );
$$;

revoke all on function public.owns_course(uuid) from public;
grant execute on function public.owns_course(uuid) to authenticated;
