-- ─────────────────────────────────────────────────────────────────────────────
-- Assessments, questions, options and attempts.
-- Mirrors src/data/assessment-types.ts.
--
-- The answer key (question_options.is_correct) must never reach a learner's
-- browser. Row-level security cannot hide a column, so this migration also
-- revokes the column privilege — see the bottom of the file.
-- ─────────────────────────────────────────────────────────────────────────────

create table public.assessments (
  id                 uuid primary key default gen_random_uuid(),
  course_id          uuid not null references public.courses (id) on delete cascade,
  -- Set when the assessment is a checkpoint for one specific module.
  module_id          uuid references public.course_modules (id) on delete set null,
  title              text not null,
  description        text not null default '',
  kind               public.assessment_kind   not null default 'checkpoint',
  status             public.assessment_status not null default 'draft',
  passing_score      integer not null default 70 check (passing_score between 0 and 100),
  time_limit_minutes integer not null default 15 check (time_limit_minutes >= 0),
  -- 0 means unlimited.
  max_attempts       integer not null default 0 check (max_attempts >= 0),
  -- Passing this releases the QR entry pass for the course's physical session.
  gates_entry_pass   boolean not null default false,
  created_by         uuid references public.profiles (id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  -- Mirrors the rule stated in docs/ROLES-FEATURES-ENDPOINTS.md: only a
  -- prerequisite assessment may gate the entry pass.
  constraint assessments_gate_requires_prerequisite check (
    not gates_entry_pass or kind = 'prerequisite'
  )
);

create index assessments_course_idx on public.assessments (course_id);
create index assessments_status_idx on public.assessments (status);

create trigger assessments_touch_updated_at
  before update on public.assessments
  for each row execute function public.touch_updated_at();

-- module_items.assessment_id could not be constrained until now.
alter table public.module_items
  add constraint module_items_assessment_fk
  foreign key (assessment_id) references public.assessments (id) on delete set null;

create table public.assessment_questions (
  id                uuid primary key default gen_random_uuid(),
  assessment_id     uuid not null references public.assessments (id) on delete cascade,
  prompt            text not null,
  type              public.question_type not null default 'single',
  explanation       text,
  difficulty        public.difficulty not null default 'medium',
  points            integer not null default 1 check (points > 0),
  tags              text[] not null default '{}',
  -- Where to send the learner when they get this wrong — drives the
  -- "smart remediation" links on the results screen.
  remedial_module_id uuid references public.course_modules (id) on delete set null,
  position          integer not null default 0,
  created_at        timestamptz not null default now()
);

create index assessment_questions_assessment_idx on public.assessment_questions (assessment_id, position);

create table public.question_options (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.assessment_questions (id) on delete cascade,
  label       text not null,
  is_correct  boolean not null default false,
  position    integer not null default 0
);

create index question_options_question_idx on public.question_options (question_id, position);

-- ─── Attempts ────────────────────────────────────────────────────────────────

create table public.assessment_attempts (
  id               uuid primary key default gen_random_uuid(),
  assessment_id    uuid not null references public.assessments (id) on delete cascade,
  course_id        uuid not null references public.courses (id) on delete cascade,
  student_id       uuid not null references public.profiles (id) on delete cascade,
  attempt_number   integer not null check (attempt_number > 0),
  score            integer check (score between 0 and 100),
  points_earned    integer,
  points_possible  integer,
  passed           boolean,
  started_at       timestamptz not null default now(),
  submitted_at     timestamptz,
  duration_seconds integer,
  unique (assessment_id, student_id, attempt_number)
);

comment on column public.assessment_attempts.submitted_at is
  'NULL while the attempt is open. Grading fields stay NULL until submit_attempt() fills them.';

create index assessment_attempts_student_idx    on public.assessment_attempts (student_id, assessment_id);
create index assessment_attempts_assessment_idx on public.assessment_attempts (assessment_id, submitted_at desc);
create index assessment_attempts_course_idx     on public.assessment_attempts (course_id);

-- One row per answered question. selected_option_ids is an array because
-- question_type 'multiple' allows several.
create table public.attempt_answers (
  id                  uuid primary key default gen_random_uuid(),
  attempt_id          uuid not null references public.assessment_attempts (id) on delete cascade,
  question_id         uuid not null references public.assessment_questions (id) on delete cascade,
  selected_option_ids uuid[] not null default '{}',
  -- Filled by submit_attempt(), so the results screen does not re-derive it.
  correct             boolean,
  points_earned       integer,
  unique (attempt_id, question_id)
);

create index attempt_answers_attempt_idx on public.attempt_answers (attempt_id);

-- ─── Answer-key protection ───────────────────────────────────────────────────
-- RLS is row-level; hiding a column takes a column privilege. `authenticated`
-- may read every column of question_options EXCEPT is_correct. Grading happens
-- in submit_attempt(), which is SECURITY DEFINER and therefore unaffected.
--
-- Note the grant must be re-issued per column: revoking one column's SELECT
-- from a table-wide grant requires naming the columns that remain.

revoke select on public.question_options from authenticated;
grant select (id, question_id, label, position) on public.question_options to authenticated;

-- Staff still need the key to author and review questions. They get it from
-- public.assessment_authoring_payload() in the functions migration: a
-- SECURITY DEFINER function that checks owns_course() and raises otherwise.
--
-- A view is deliberately NOT used here. With security_invoker = true the
-- column revoke above would block staff as well (both roles are
-- `authenticated`); with security_invoker = false it would hand the answer key
-- to every logged-in student. A function can make the ownership check
-- explicit, which neither view mode can.
