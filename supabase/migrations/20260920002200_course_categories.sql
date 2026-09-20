-- ─────────────────────────────────────────────────────────────────────────────
-- Course categories.
--
-- The category list was held in browser state, so it reset on reload and two
-- admins never saw the same options. Venues already had a table; this gives
-- categories the same treatment, and both now back the course form.
-- ─────────────────────────────────────────────────────────────────────────────

create table public.course_categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz not null default now()
);

alter table public.course_categories enable row level security;

create policy course_categories_read on public.course_categories
  for select to anon, authenticated using (true);

create policy course_categories_admin_write on public.course_categories
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant select on public.course_categories to anon, authenticated;
grant insert, update, delete on public.course_categories to authenticated;

-- Seed from the categories the existing courses already use, so nothing in the
-- catalog is left pointing at an option that is not on the list.
insert into public.course_categories (name)
select distinct category from public.courses where coalesce(category, '') <> ''
on conflict (name) do nothing;
