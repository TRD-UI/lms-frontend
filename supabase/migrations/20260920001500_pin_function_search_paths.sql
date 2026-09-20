-- ─────────────────────────────────────────────────────────────────────────────
-- Harden: pin search_path on the two remaining functions that lacked it.
--
-- A function with a mutable search_path can be steered to resolve an unqualified
-- name against an attacker-controlled schema. Every other function in this
-- schema already pins it; these two were missed. Supabase's security advisor
-- reports this as `function_search_path_mutable`.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.safe_uuid(p_text text)
returns uuid
language plpgsql
immutable
set search_path = pg_catalog, public
as $$
begin
  return p_text::uuid;
exception when others then
  return null;
end;
$$;
