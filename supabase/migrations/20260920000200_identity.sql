-- ─────────────────────────────────────────────────────────────────────────────
-- Identity: profiles mirroring auth.users, plus the role helpers every RLS
-- policy in 20260920001000_rls.sql depends on.
-- ─────────────────────────────────────────────────────────────────────────────

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text        not null,
  email       text        not null unique,
  role        public.user_role   not null default 'student',
  status      public.user_status not null default 'active',
  avatar_url  text,
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is
  'Public profile per auth user. `role` is the single source of truth for portal access and is not writable by the user themselves (see RLS).';

create index profiles_role_idx   on public.profiles (role);
create index profiles_status_idx on public.profiles (status);

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ─── Provisioning ────────────────────────────────────────────────────────────
-- A new auth user gets a profile automatically. Name and avatar come from the
-- signup metadata; role always starts as 'student' regardless of what the
-- client sent, so a user cannot self-elevate by passing role in the signup
-- payload. Staff are promoted by an admin afterwards.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, avatar_url, phone)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1)),
    new.email,
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill. The trigger only fires on INSERT, so any account created before
-- this migration ran — a test signup against the bare project, for instance —
-- would be left with no profile and could never sign in, since the session
-- store treats a missing profile as signed out.
insert into public.profiles (id, name, email, avatar_url, phone)
select u.id,
       coalesce(nullif(trim(u.raw_user_meta_data ->> 'name'), ''), split_part(u.email, '@', 1)),
       u.email,
       nullif(u.raw_user_meta_data ->> 'avatar_url', ''),
       nullif(u.raw_user_meta_data ->> 'phone', '')
  from auth.users u
 where u.email is not null
on conflict (id) do nothing;

-- ─── Role helpers ────────────────────────────────────────────────────────────
-- These are SECURITY DEFINER so they can read profiles without tripping the
-- RLS policies that are themselves defined in terms of these functions. Without
-- that, every profiles policy would recurse.

create or replace function public.auth_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' and status = 'active' from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('admin', 'instructor') and status = 'active'
       from public.profiles where id = auth.uid()),
    false
  );
$$;

revoke all on function public.auth_role()   from public;
revoke all on function public.is_admin()    from public;
revoke all on function public.is_staff()    from public;

grant execute on function public.auth_role()   to authenticated;
grant execute on function public.is_admin()    to authenticated;
grant execute on function public.is_staff()    to authenticated;

-- public.owns_course() is defined in the catalog migration, since its body
-- references public.courses and SQL function bodies are validated at creation.

-- ─── Safe cast ───────────────────────────────────────────────────────────────
-- Storage policies key off the first path segment as a course or user id. A
-- bare ::uuid cast would raise on a malformed path and abort the whole query
-- rather than simply denying the row, so policies use this instead.

create or replace function public.safe_uuid(p_text text)
returns uuid
language plpgsql
immutable
as $$
begin
  return p_text::uuid;
exception when others then
  return null;
end;
$$;

grant execute on function public.safe_uuid(text) to anon, authenticated;
