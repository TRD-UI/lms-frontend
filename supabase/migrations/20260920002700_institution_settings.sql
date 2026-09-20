-- ─────────────────────────────────────────────────────────────────────────────
-- Institution copy.
--
-- The enrolment rules, facilities list and enquiry phone numbers shown on the
-- course page were hardcoded in src/data/courses.ts. That is content an
-- administrator should be able to change without a deploy, and a phone number
-- that only a developer can update is a phone number that goes stale.
--
-- A single row, because there is one institution. The check keeps it that way.
-- ─────────────────────────────────────────────────────────────────────────────

create table public.institution_settings (
  id                   boolean primary key default true,
  enrollment_rule      text not null default '',
  special_package_rule text not null default '',
  facilities           text[] not null default '{}',
  contacts             text[] not null default '{}',
  updated_at           timestamptz not null default now(),

  -- One institution, one row.
  constraint institution_settings_singleton check (id)
);

alter table public.institution_settings enable row level security;

-- Readable by anyone: it appears on the public course page.
create policy institution_settings_read on public.institution_settings
  for select to anon, authenticated using (true);

create policy institution_settings_admin_write on public.institution_settings
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant select on public.institution_settings to anon, authenticated;
grant insert, update on public.institution_settings to authenticated;

create trigger institution_settings_touch
  before update on public.institution_settings
  for each row execute function public.touch_updated_at();

-- Seeded with the copy that was previously in the bundle.
insert into public.institution_settings
  (id, enrollment_rule, special_package_rule, facilities, contacts)
values (
  true,
  'Enrollment is monthly – Class begins at the beginning of a new month.',
  'Special Class Package takes a minimum of three (3) and maximum of five (5) students.',
  array['State-of-the-art computers', 'Conducive environment', 'Seasoned instructors'],
  array['0803-302-7479', '0802-924-8172', '0806-273-3470']
)
on conflict (id) do nothing;
