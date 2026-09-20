-- ─────────────────────────────────────────────────────────────────────────────
-- Extensions and domain enums.
--
-- Every enum here mirrors a union type in src/data/*.ts so the database and the
-- TypeScript layer cannot drift apart silently.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists pgcrypto with schema extensions;

-- Identity -------------------------------------------------------------------
create type public.user_role   as enum ('student', 'instructor', 'admin');
create type public.user_status as enum ('active', 'suspended', 'pending');

-- Catalog --------------------------------------------------------------------
create type public.course_status    as enum ('draft', 'published');
create type public.fee_type         as enum ('flat', 'tiered');
create type public.module_item_type as enum ('video', 'pdf', 'document', 'quiz');

-- Assessments ----------------------------------------------------------------
create type public.assessment_kind   as enum ('prerequisite', 'checkpoint', 'final');
create type public.assessment_status as enum ('draft', 'published');
create type public.question_type     as enum ('single', 'multiple', 'boolean');
create type public.difficulty        as enum ('easy', 'medium', 'hard');

-- Enrollment and money -------------------------------------------------------
create type public.enrollment_status as enum ('pending', 'active', 'completed', 'withdrawn');
create type public.waitlist_status   as enum ('waiting', 'promoted', 'removed');
create type public.payment_status    as enum ('pending', 'settled', 'failed', 'refunded');
create type public.payment_method    as enum ('card', 'transfer', 'ussd', 'cash');
create type public.payment_purpose   as enum ('tuition', 'application_fee');

-- Sessions, passes and attendance --------------------------------------------
create type public.pass_status       as enum ('active', 'used', 'past', 'revoked');
create type public.attendance_status as enum ('present', 'absent', 'excused');
create type public.attendance_method as enum ('qr', 'manual');

-- Platform -------------------------------------------------------------------
create type public.notification_type as enum ('course_update', 'new_class', 'transaction', 'system');
create type public.sync_status       as enum ('synced', 'pending', 'failed');

-- Shared trigger: keep updated_at honest -------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
