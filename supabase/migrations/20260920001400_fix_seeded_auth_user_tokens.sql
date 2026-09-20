-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: seeded auth.users rows broke sign-in with
--   500 "Database error querying schema"
--
-- GoTrue scans several auth.users columns into non-nullable Go strings. They
-- are declared nullable in Postgres and default to NULL, so a row inserted
-- without naming them — which is exactly what the seed does — makes GoTrue's
-- row scan fail, and every login on the project returns a 500.
--
-- The column set differs between GoTrue versions, so this checks the catalog
-- rather than naming columns blind.
-- ─────────────────────────────────────────────────────────────────────────────

do $$
declare
  col text;
  patched text[] := '{}';
begin
  foreach col in array array[
    'confirmation_token',
    'recovery_token',
    'email_change',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change',
    'phone_change_token',
    'reauthentication_token'
  ]
  loop
    if exists (
      select 1 from information_schema.columns
       where table_schema = 'auth' and table_name = 'users' and column_name = col
    ) then
      execute format(
        'update auth.users set %1$I = '''' where %1$I is null', col
      );
      patched := patched || col;
    end if;
  end loop;

  raise notice 'Normalised NULL auth.users token columns: %', patched;
end;
$$;
