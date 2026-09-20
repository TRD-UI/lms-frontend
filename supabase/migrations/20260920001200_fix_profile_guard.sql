-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: guard_profile_privileges() blocked trusted server-side writes.
--
-- The guard stops a user promoting themselves by writing to profiles.role or
-- profiles.status. It only exempted admins, which meant any write without a
-- logged-in user — a migration, the seed, the service role, another trigger —
-- was rejected with "Role is not self-assignable".
--
-- auth.uid() is null exactly when the write is not coming from an end user's
-- JWT, so that case is now exempt. This does not open a hole: `anon` also has a
-- null auth.uid(), but every update policy on profiles is granted `to
-- authenticated` and requires id = auth.uid(), so anon cannot reach this
-- trigger at all. The service role already bypasses RLS by design.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- No JWT: a migration, the seed, the service role or another trigger.
  if auth.uid() is null then
    return new;
  end if;

  if public.is_admin() then
    return new;
  end if;

  if new.role <> old.role then
    raise exception 'Role is not self-assignable' using errcode = 'insufficient_privilege';
  end if;
  if new.status <> old.status then
    raise exception 'Status is not self-assignable' using errcode = 'insufficient_privilege';
  end if;

  return new;
end;
$$;
