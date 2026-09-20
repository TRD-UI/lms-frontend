-- GENERATED FILE — do not edit by hand.
-- Regenerate with: npm run seed:gen
--
-- Source: src/data/*.ts. Short mock ids are mapped to deterministic UUID v5
-- values, so this file is stable across regenerations and safe to re-apply.
--
-- Every account's password is: Password123!

begin;

-- ────────────────────────────────────────────────────────────────────────────
-- Auth users and profiles
-- ────────────────────────────────────────────────────────────────────────────
-- Inserting into auth.users fires public.handle_new_user(), which creates the
-- matching profiles row. Role and status are applied afterwards, because the
-- trigger deliberately ignores client-supplied roles.

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000000', '3639ec96-9d24-56d6-af88-9a6ce62ea66a', 'authenticated', 'authenticated',
  'cyber.smith@example.com', extensions.crypt('Password123!', extensions.gen_salt('bf')), '2026-01-02T00:00:00Z',
  '2026-01-02T00:00:00Z', '2026-01-02T00:00:00Z',
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('name', 'Cyber Smith', 'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=CyberSmith'),
  false, false,
  '', '', '', '', '', '', '', ''
) on conflict (id) do nothing;
insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('cyber.smith@example.com', '3639ec96-9d24-56d6-af88-9a6ce62ea66a', jsonb_build_object('sub', '3639ec96-9d24-56d6-af88-9a6ce62ea66a', 'email', 'cyber.smith@example.com', 'email_verified', true, 'phone_verified', false), 'email', '2026-01-02T00:00:00Z', '2026-01-02T00:00:00Z', '2026-01-02T00:00:00Z')
on conflict (provider, provider_id) do nothing;
update public.profiles set name = 'Cyber Smith', role = 'student'::public.user_role, status = 'active'::public.user_status, avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=CyberSmith', created_at = '2026-01-02T00:00:00Z' where id = '3639ec96-9d24-56d6-af88-9a6ce62ea66a';

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000000', '03b70a2c-70d5-538f-8c6c-474b2633fe0b', 'authenticated', 'authenticated',
  'adewale.j@trd.edu', extensions.crypt('Password123!', extensions.gen_salt('bf')), '2026-01-05T00:00:00Z',
  '2026-01-05T00:00:00Z', '2026-01-05T00:00:00Z',
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('name', 'Adewale Johnson', 'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=adewale'),
  false, false,
  '', '', '', '', '', '', '', ''
) on conflict (id) do nothing;
insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('adewale.j@trd.edu', '03b70a2c-70d5-538f-8c6c-474b2633fe0b', jsonb_build_object('sub', '03b70a2c-70d5-538f-8c6c-474b2633fe0b', 'email', 'adewale.j@trd.edu', 'email_verified', true, 'phone_verified', false), 'email', '2026-01-05T00:00:00Z', '2026-01-05T00:00:00Z', '2026-01-05T00:00:00Z')
on conflict (provider, provider_id) do nothing;
update public.profiles set name = 'Adewale Johnson', role = 'student'::public.user_role, status = 'active'::public.user_status, avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=adewale', created_at = '2026-01-05T00:00:00Z' where id = '03b70a2c-70d5-538f-8c6c-474b2633fe0b';

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000000', 'd2aabb89-7202-55bb-bec8-1ac21ed47a51', 'authenticated', 'authenticated',
  'funke.a@trd.edu', extensions.crypt('Password123!', extensions.gen_salt('bf')), '2025-09-12T00:00:00Z',
  '2025-09-12T00:00:00Z', '2025-09-12T00:00:00Z',
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('name', 'Dr. Funke Akindele', 'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=funke'),
  false, false,
  '', '', '', '', '', '', '', ''
) on conflict (id) do nothing;
insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('funke.a@trd.edu', 'd2aabb89-7202-55bb-bec8-1ac21ed47a51', jsonb_build_object('sub', 'd2aabb89-7202-55bb-bec8-1ac21ed47a51', 'email', 'funke.a@trd.edu', 'email_verified', true, 'phone_verified', false), 'email', '2025-09-12T00:00:00Z', '2025-09-12T00:00:00Z', '2025-09-12T00:00:00Z')
on conflict (provider, provider_id) do nothing;
update public.profiles set name = 'Dr. Funke Akindele', role = 'instructor'::public.user_role, status = 'active'::public.user_status, avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=funke', created_at = '2025-09-12T00:00:00Z' where id = 'd2aabb89-7202-55bb-bec8-1ac21ed47a51';

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000000', '63fb03c7-54ac-597b-8a36-70d65756dd74', 'authenticated', 'authenticated',
  'chinedu.o@trd.edu', extensions.crypt('Password123!', extensions.gen_salt('bf')), '2026-02-01T00:00:00Z',
  '2026-02-01T00:00:00Z', '2026-02-01T00:00:00Z',
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('name', 'Chinedu Okafor', 'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=chinedu'),
  false, false,
  '', '', '', '', '', '', '', ''
) on conflict (id) do nothing;
insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('chinedu.o@trd.edu', '63fb03c7-54ac-597b-8a36-70d65756dd74', jsonb_build_object('sub', '63fb03c7-54ac-597b-8a36-70d65756dd74', 'email', 'chinedu.o@trd.edu', 'email_verified', true, 'phone_verified', false), 'email', '2026-02-01T00:00:00Z', '2026-02-01T00:00:00Z', '2026-02-01T00:00:00Z')
on conflict (provider, provider_id) do nothing;
update public.profiles set name = 'Chinedu Okafor', role = 'student'::public.user_role, status = 'active'::public.user_status, avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=chinedu', created_at = '2026-02-01T00:00:00Z' where id = '63fb03c7-54ac-597b-8a36-70d65756dd74';

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000000', 'ebd94036-72f2-5d8b-8711-2a9be4ad36ea', 'authenticated', 'authenticated',
  'halima.b@trd.edu', extensions.crypt('Password123!', extensions.gen_salt('bf')), '2025-11-20T00:00:00Z',
  '2025-11-20T00:00:00Z', '2025-11-20T00:00:00Z',
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('name', 'Halima Bello', 'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=halima'),
  false, false,
  '', '', '', '', '', '', '', ''
) on conflict (id) do nothing;
insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('halima.b@trd.edu', 'ebd94036-72f2-5d8b-8711-2a9be4ad36ea', jsonb_build_object('sub', 'ebd94036-72f2-5d8b-8711-2a9be4ad36ea', 'email', 'halima.b@trd.edu', 'email_verified', true, 'phone_verified', false), 'email', '2025-11-20T00:00:00Z', '2025-11-20T00:00:00Z', '2025-11-20T00:00:00Z')
on conflict (provider, provider_id) do nothing;
update public.profiles set name = 'Halima Bello', role = 'student'::public.user_role, status = 'suspended'::public.user_status, avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=halima', created_at = '2025-11-20T00:00:00Z' where id = 'ebd94036-72f2-5d8b-8711-2a9be4ad36ea';

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000000', 'dd8ca978-4697-5e0f-bf62-43a4f3ed3c5c', 'authenticated', 'authenticated',
  'eze.n@trd.edu', extensions.crypt('Password123!', extensions.gen_salt('bf')), '2025-06-01T00:00:00Z',
  '2025-06-01T00:00:00Z', '2025-06-01T00:00:00Z',
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('name', 'Prof. Eze Nwosu', 'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=eze'),
  false, false,
  '', '', '', '', '', '', '', ''
) on conflict (id) do nothing;
insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('eze.n@trd.edu', 'dd8ca978-4697-5e0f-bf62-43a4f3ed3c5c', jsonb_build_object('sub', 'dd8ca978-4697-5e0f-bf62-43a4f3ed3c5c', 'email', 'eze.n@trd.edu', 'email_verified', true, 'phone_verified', false), 'email', '2025-06-01T00:00:00Z', '2025-06-01T00:00:00Z', '2025-06-01T00:00:00Z')
on conflict (provider, provider_id) do nothing;
update public.profiles set name = 'Prof. Eze Nwosu', role = 'admin'::public.user_role, status = 'active'::public.user_status, avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=eze', created_at = '2025-06-01T00:00:00Z' where id = 'dd8ca978-4697-5e0f-bf62-43a4f3ed3c5c';

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000000', 'a92a75c2-6729-50c6-944c-edac377f65bd', 'authenticated', 'authenticated',
  'seun.f@trd.edu', extensions.crypt('Password123!', extensions.gen_salt('bf')), '2025-08-15T00:00:00Z',
  '2025-08-15T00:00:00Z', '2025-08-15T00:00:00Z',
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('name', 'Oluwaseun Fadare', 'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=seun'),
  false, false,
  '', '', '', '', '', '', '', ''
) on conflict (id) do nothing;
insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('seun.f@trd.edu', 'a92a75c2-6729-50c6-944c-edac377f65bd', jsonb_build_object('sub', 'a92a75c2-6729-50c6-944c-edac377f65bd', 'email', 'seun.f@trd.edu', 'email_verified', true, 'phone_verified', false), 'email', '2025-08-15T00:00:00Z', '2025-08-15T00:00:00Z', '2025-08-15T00:00:00Z')
on conflict (provider, provider_id) do nothing;
update public.profiles set name = 'Oluwaseun Fadare', role = 'instructor'::public.user_role, status = 'active'::public.user_status, avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=seun', created_at = '2025-08-15T00:00:00Z' where id = 'a92a75c2-6729-50c6-944c-edac377f65bd';

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000000', '14579911-7e15-5947-b6d7-9060549f630d', 'authenticated', 'authenticated',
  'amaka.e@trd.edu', extensions.crypt('Password123!', extensions.gen_salt('bf')), '2026-02-20T00:00:00Z',
  '2026-02-20T00:00:00Z', '2026-02-20T00:00:00Z',
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('name', 'Amaka Eze', 'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=amaka'),
  false, false,
  '', '', '', '', '', '', '', ''
) on conflict (id) do nothing;
insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('amaka.e@trd.edu', '14579911-7e15-5947-b6d7-9060549f630d', jsonb_build_object('sub', '14579911-7e15-5947-b6d7-9060549f630d', 'email', 'amaka.e@trd.edu', 'email_verified', true, 'phone_verified', false), 'email', '2026-02-20T00:00:00Z', '2026-02-20T00:00:00Z', '2026-02-20T00:00:00Z')
on conflict (provider, provider_id) do nothing;
update public.profiles set name = 'Amaka Eze', role = 'student'::public.user_role, status = 'pending'::public.user_status, avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=amaka', created_at = '2026-02-20T00:00:00Z' where id = '14579911-7e15-5947-b6d7-9060549f630d';

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000000', '3d060f89-0b05-5c52-a2e1-bff3626a1659', 'authenticated', 'authenticated',
  'ibrahim.m@trd.edu', extensions.crypt('Password123!', extensions.gen_salt('bf')), '2025-10-10T00:00:00Z',
  '2025-10-10T00:00:00Z', '2025-10-10T00:00:00Z',
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('name', 'Ibrahim Musa', 'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ibrahim'),
  false, false,
  '', '', '', '', '', '', '', ''
) on conflict (id) do nothing;
insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('ibrahim.m@trd.edu', '3d060f89-0b05-5c52-a2e1-bff3626a1659', jsonb_build_object('sub', '3d060f89-0b05-5c52-a2e1-bff3626a1659', 'email', 'ibrahim.m@trd.edu', 'email_verified', true, 'phone_verified', false), 'email', '2025-10-10T00:00:00Z', '2025-10-10T00:00:00Z', '2025-10-10T00:00:00Z')
on conflict (provider, provider_id) do nothing;
update public.profiles set name = 'Ibrahim Musa', role = 'student'::public.user_role, status = 'active'::public.user_status, avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=ibrahim', created_at = '2025-10-10T00:00:00Z' where id = '3d060f89-0b05-5c52-a2e1-bff3626a1659';

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000000', '72783d8a-6eb0-5adc-bd2a-262e3d750132', 'authenticated', 'authenticated',
  'ngozi.o@trd.edu', extensions.crypt('Password123!', extensions.gen_salt('bf')), '2025-12-03T00:00:00Z',
  '2025-12-03T00:00:00Z', '2025-12-03T00:00:00Z',
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('name', 'Ngozi Obi', 'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ngozi'),
  false, false,
  '', '', '', '', '', '', '', ''
) on conflict (id) do nothing;
insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('ngozi.o@trd.edu', '72783d8a-6eb0-5adc-bd2a-262e3d750132', jsonb_build_object('sub', '72783d8a-6eb0-5adc-bd2a-262e3d750132', 'email', 'ngozi.o@trd.edu', 'email_verified', true, 'phone_verified', false), 'email', '2025-12-03T00:00:00Z', '2025-12-03T00:00:00Z', '2025-12-03T00:00:00Z')
on conflict (provider, provider_id) do nothing;
update public.profiles set name = 'Ngozi Obi', role = 'student'::public.user_role, status = 'active'::public.user_status, avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=ngozi', created_at = '2025-12-03T00:00:00Z' where id = '72783d8a-6eb0-5adc-bd2a-262e3d750132';

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000000', 'e9f3c827-bef8-52b0-9dbf-f5efa33710f0', 'authenticated', 'authenticated',
  'yusuf.a@trd.edu', extensions.crypt('Password123!', extensions.gen_salt('bf')), '2026-01-18T00:00:00Z',
  '2026-01-18T00:00:00Z', '2026-01-18T00:00:00Z',
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('name', 'Yusuf Abdullahi', 'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=yusuf'),
  false, false,
  '', '', '', '', '', '', '', ''
) on conflict (id) do nothing;
insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('yusuf.a@trd.edu', 'e9f3c827-bef8-52b0-9dbf-f5efa33710f0', jsonb_build_object('sub', 'e9f3c827-bef8-52b0-9dbf-f5efa33710f0', 'email', 'yusuf.a@trd.edu', 'email_verified', true, 'phone_verified', false), 'email', '2026-01-18T00:00:00Z', '2026-01-18T00:00:00Z', '2026-01-18T00:00:00Z')
on conflict (provider, provider_id) do nothing;
update public.profiles set name = 'Yusuf Abdullahi', role = 'student'::public.user_role, status = 'active'::public.user_status, avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=yusuf', created_at = '2026-01-18T00:00:00Z' where id = 'e9f3c827-bef8-52b0-9dbf-f5efa33710f0';


-- ────────────────────────────────────────────────────────────────────────────
-- Venues
-- ────────────────────────────────────────────────────────────────────────────
insert into public.venues (id, name, capacity) values ('8951504c-9eea-5256-af9d-673641f85a28', 'Training Lab 1', 25) on conflict (name) do nothing;
insert into public.venues (id, name, capacity) values ('bfc4f36d-aea7-549e-8209-beb72ced4ffc', 'Training Lab 2', 30) on conflict (name) do nothing;
insert into public.venues (id, name, capacity) values ('ca8c6c9c-d9ce-5af8-b1a5-bd92d8612f07', 'Conference Hall', 100) on conflict (name) do nothing;
insert into public.venues (id, name, capacity) values ('00075ea6-b4f7-5ea7-94cd-524495c8505c', 'Virtual Room 1', 50) on conflict (name) do nothing;
insert into public.venues (id, name, capacity) values ('4d2ca517-52e3-5a5e-8690-44cadb2e19ba', 'Tech Lab 3', 20) on conflict (name) do nothing;
insert into public.venues (id, name, capacity) values ('cc9e6815-f457-5648-9125-a4c4644d9d6f', 'Main Auditorium', 200) on conflict (name) do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- Courses, fee tiers, modules and items
-- ────────────────────────────────────────────────────────────────────────────
insert into public.courses (id, title, description, duration, location, category, seats_total, fee_type, fee_amount, application_fee, status, instructor_id)
values ('577ea935-461d-53d4-b88b-52ee31473d1b', 'Tech Odyssey', 'Master web development, python, and graphics in this comprehensive digital journey.', '3 months', 'Training Lab 1, ITeMS Building, UI', 'Software Development', 25,
        'flat'::public.fee_type, 15000000, 2000000,
        'published'::public.course_status, 'd2aabb89-7202-55bb-bec8-1ac21ed47a51')
on conflict (id) do nothing;
insert into public.course_modules (id, course_id, title, position) values ('7d341255-a8ef-56ff-a45e-22795a1f2768', '577ea935-461d-53d4-b88b-52ee31473d1b', 'Web Foundation (HTML/CSS/JS)', 0) on conflict (id) do nothing;
insert into public.course_modules (id, course_id, title, position) values ('8a903244-6a42-5a16-9a38-0a07757c97c1', '577ea935-461d-53d4-b88b-52ee31473d1b', 'Styling & Layout Systems', 1) on conflict (id) do nothing;
insert into public.course_modules (id, course_id, title, position) values ('e435e266-3217-5981-93c8-139ce95ae822', '577ea935-461d-53d4-b88b-52ee31473d1b', 'Programming with JavaScript & Python', 2) on conflict (id) do nothing;

insert into public.courses (id, title, description, duration, location, category, seats_total, fee_type, fee_amount, application_fee, status, instructor_id)
values ('a011cbb4-addf-58ac-b215-075d496c936f', 'Web Development', 'HTML, CSS, Java script, and real-world projects.', '3 months', 'Training Lab 1, ITeMS Building, UI', 'Software Development', 20,
        'flat'::public.fee_type, 20000000, 2000000,
        'published'::public.course_status, 'a92a75c2-6729-50c6-944c-edac377f65bd')
on conflict (id) do nothing;
insert into public.course_modules (id, course_id, title, position) values ('e3c86a31-a93b-5e58-9c9d-b2728d9dcbc6', 'a011cbb4-addf-58ac-b215-075d496c936f', 'Frontend Mastery', 0) on conflict (id) do nothing;

insert into public.courses (id, title, description, duration, location, category, seats_total, fee_type, fee_amount, application_fee, status, instructor_id)
values ('e56df1b0-d187-50bb-911c-a77deba8e2dd', 'Python Programming', 'Language basics to real-world applications.', '3 months', 'Training Lab 1, ITeMS Building, UI', 'Software Development', 20,
        'flat'::public.fee_type, 15000000, 2000000,
        'published'::public.course_status, 'd2aabb89-7202-55bb-bec8-1ac21ed47a51')
on conflict (id) do nothing;
insert into public.course_modules (id, course_id, title, position) values ('292b3965-f7bd-5506-b550-3ff5733632f5', 'e56df1b0-d187-50bb-911c-a77deba8e2dd', 'Python Basics', 0) on conflict (id) do nothing;
insert into public.course_modules (id, course_id, title, position) values ('6069c09e-8d12-57ec-abaf-0141671328ec', 'e56df1b0-d187-50bb-911c-a77deba8e2dd', 'Control Flow & Collections', 1) on conflict (id) do nothing;
insert into public.course_modules (id, course_id, title, position) values ('872c5ab2-5dec-5061-aa13-dec7f58cdeba', 'e56df1b0-d187-50bb-911c-a77deba8e2dd', 'Certification', 2) on conflict (id) do nothing;

insert into public.courses (id, title, description, duration, location, category, seats_total, fee_type, fee_amount, application_fee, status, instructor_id)
values ('556e576c-a311-5e54-bf14-34d9d37c7184', 'Digital Literacy', 'Basic Computer Operations, Online Security, Productivity Tools.', '1 month', 'Training Lab 1, ITeMS Building, UI', 'Digital Literacy', 30,
        'tiered'::public.fee_type, null, 2000000,
        'published'::public.course_status, 'a92a75c2-6729-50c6-944c-edac377f65bd')
on conflict (id) do nothing;
insert into public.course_fee_tiers (id, course_id, name, amount, position) values ('de3e2e76-da2d-5358-ad48-860fd64fe526', '556e576c-a311-5e54-bf14-34d9d37c7184', 'Cohort', 5000000, 0) on conflict (course_id, name) do nothing;
insert into public.course_fee_tiers (id, course_id, name, amount, position) values ('41a56246-b01f-5d56-89cc-f6caa2cb459a', '556e576c-a311-5e54-bf14-34d9d37c7184', 'Special', 10000000, 1) on conflict (course_id, name) do nothing;
insert into public.course_modules (id, course_id, title, position) values ('205cf578-2285-5f43-abbf-1d3eeaed7ac5', '556e576c-a311-5e54-bf14-34d9d37c7184', 'Digital Foundations', 0) on conflict (id) do nothing;

insert into public.courses (id, title, description, duration, location, category, seats_total, fee_type, fee_amount, application_fee, status, instructor_id)
values ('829f6967-e9a3-5172-9892-963a17018cb2', 'ArcGIS & Spatial Analysis', 'Mapping and spatial data analysis.', '1 month', 'ITeMS Building, UI', 'Data Science', 10,
        'flat'::public.fee_type, 5000000, 2000000,
        'published'::public.course_status, 'd2aabb89-7202-55bb-bec8-1ac21ed47a51')
on conflict (id) do nothing;
insert into public.course_modules (id, course_id, title, position) values ('a877ed61-c220-5ce4-b952-9600471a2375', '829f6967-e9a3-5172-9892-963a17018cb2', 'ArcGIS Intro', 0) on conflict (id) do nothing;

insert into public.courses (id, title, description, duration, location, category, seats_total, fee_type, fee_amount, application_fee, status, instructor_id)
values ('6c7571e3-9a65-5a1c-abf4-4161116d4da3', 'Data Analysis / Data Analytics', 'SPSS, Excel, Power BI for data insights.', '5 weeks', 'ITeMS Building, UI', 'Data Science', 15,
        'tiered'::public.fee_type, null, 2000000,
        'published'::public.course_status, 'a92a75c2-6729-50c6-944c-edac377f65bd')
on conflict (id) do nothing;
insert into public.course_fee_tiers (id, course_id, name, amount, position) values ('629ce9a1-3210-5459-ad95-fe6520f50881', '6c7571e3-9a65-5a1c-abf4-4161116d4da3', 'Cohort', 8000000, 0) on conflict (course_id, name) do nothing;
insert into public.course_fee_tiers (id, course_id, name, amount, position) values ('f324a5c4-2628-5b8e-ad2c-6aabbed9819a', '6c7571e3-9a65-5a1c-abf4-4161116d4da3', 'Special', 15000000, 1) on conflict (course_id, name) do nothing;
insert into public.course_modules (id, course_id, title, position) values ('be221ce8-0591-5c71-9e40-4ee182565039', '6c7571e3-9a65-5a1c-abf4-4161116d4da3', 'Data Tools', 0) on conflict (id) do nothing;

insert into public.courses (id, title, description, duration, location, category, seats_total, fee_type, fee_amount, application_fee, status, instructor_id)
values ('466129d2-af54-51a4-b4f4-41b16cee9eb9', 'DATA PROCESSING', 'Excel, Word, PowerPoint, SPSS mastery.', '8 weeks', 'ITeMS Building, UI', 'Digital Literacy', 15,
        'flat'::public.fee_type, 10000000, 2000000,
        'published'::public.course_status, 'a92a75c2-6729-50c6-944c-edac377f65bd')
on conflict (id) do nothing;
insert into public.course_modules (id, course_id, title, position) values ('e7bec537-c63c-56ad-90c7-3c507c9256bd', '466129d2-af54-51a4-b4f4-41b16cee9eb9', 'Word & Excel', 0) on conflict (id) do nothing;

insert into public.courses (id, title, description, duration, location, category, seats_total, fee_type, fee_amount, application_fee, status, instructor_id)
values ('d14b913d-d2d5-575b-a6d5-d9f012c0d6cf', 'Digital Productivity Tools', 'Online collaboration and office suite mastery.', '1 month', 'ITeMS Building, UI', 'Digital Literacy', 20,
        'tiered'::public.fee_type, null, 2000000,
        'published'::public.course_status, 'a92a75c2-6729-50c6-944c-edac377f65bd')
on conflict (id) do nothing;
insert into public.course_fee_tiers (id, course_id, name, amount, position) values ('e9fb4454-c90f-5694-864f-ca75c6ef686f', 'd14b913d-d2d5-575b-a6d5-d9f012c0d6cf', 'Cohort', 8000000, 0) on conflict (course_id, name) do nothing;
insert into public.course_fee_tiers (id, course_id, name, amount, position) values ('901211a3-702b-5650-997d-42a874b72d04', 'd14b913d-d2d5-575b-a6d5-d9f012c0d6cf', 'Special', 15000000, 1) on conflict (course_id, name) do nothing;
insert into public.course_modules (id, course_id, title, position) values ('5e8f2db5-e5d9-5e2a-b0fc-0ee657528c98', 'd14b913d-d2d5-575b-a6d5-d9f012c0d6cf', 'Collaboration', 0) on conflict (id) do nothing;

insert into public.courses (id, title, description, duration, location, category, seats_total, fee_type, fee_amount, application_fee, status, instructor_id)
values ('e4df4b90-8a0a-5e3c-9e30-a7c0d053a927', 'Generative AI', 'Leveraging AI for creative and professional tasks.', '1 month', 'ITeMS Building, UI', 'AI & ML', 25,
        'flat'::public.fee_type, 10000000, 2000000,
        'published'::public.course_status, 'd2aabb89-7202-55bb-bec8-1ac21ed47a51')
on conflict (id) do nothing;
insert into public.course_modules (id, course_id, title, position) values ('a2ccde09-4ce1-56d1-93e6-9a6d2ed6b6b0', 'e4df4b90-8a0a-5e3c-9e30-a7c0d053a927', 'AI Basics', 0) on conflict (id) do nothing;

insert into public.courses (id, title, description, duration, location, category, seats_total, fee_type, fee_amount, application_fee, status, instructor_id)
values ('1297a671-9773-5184-b07d-5038714a7d33', 'Routing & Wireless Networking', 'MikroTik OS and wireless network management.', '2 weeks', 'ITeMS Building, UI', 'Networking', 12,
        'flat'::public.fee_type, 10000000, 2000000,
        'published'::public.course_status, 'd2aabb89-7202-55bb-bec8-1ac21ed47a51')
on conflict (id) do nothing;
insert into public.course_modules (id, course_id, title, position) values ('afcb7d0a-9910-52b9-ba55-4e27de994ab5', '1297a671-9773-5184-b07d-5038714a7d33', 'MikroTik Setup', 0) on conflict (id) do nothing;

insert into public.courses (id, title, description, duration, location, category, seats_total, fee_type, fee_amount, application_fee, status, instructor_id)
values ('e892e7df-1cfb-5379-9b12-924c9812a944', 'Basic Computer Networking', 'Foundational networking concepts.', '4 weeks', 'ITeMS Building, UI', 'Networking', 20,
        'tiered'::public.fee_type, null, 2000000,
        'published'::public.course_status, 'd2aabb89-7202-55bb-bec8-1ac21ed47a51')
on conflict (id) do nothing;
insert into public.course_fee_tiers (id, course_id, name, amount, position) values ('8d6df6ab-70f6-5b61-8120-613a21104d97', 'e892e7df-1cfb-5379-9b12-924c9812a944', 'Cohort', 8000000, 0) on conflict (course_id, name) do nothing;
insert into public.course_fee_tiers (id, course_id, name, amount, position) values ('adfe9eaa-95ea-5820-ad3b-e0ca144165ae', 'e892e7df-1cfb-5379-9b12-924c9812a944', 'Special', 15000000, 1) on conflict (course_id, name) do nothing;
insert into public.course_modules (id, course_id, title, position) values ('c9fbe03f-bdfb-5cdc-acef-ef22b4de54ee', 'e892e7df-1cfb-5379-9b12-924c9812a944', 'Networking Basics', 0) on conflict (id) do nothing;

insert into public.courses (id, title, description, duration, location, category, seats_total, fee_type, fee_amount, application_fee, status, instructor_id)
values ('505771c5-aa1d-5a7b-9173-395eaee4fc14', 'Data Science', 'Analytics, modeling, and data-driven insights.', '4 months', 'ITeMS Building, UI', 'Data Science', 25,
        'flat'::public.fee_type, 30000000, 2000000,
        'published'::public.course_status, 'a92a75c2-6729-50c6-944c-edac377f65bd')
on conflict (id) do nothing;
insert into public.course_modules (id, course_id, title, position) values ('fa4bd05a-5d66-5eea-ac1a-239a65739562', '505771c5-aa1d-5a7b-9173-395eaee4fc14', 'Data Analysis', 0) on conflict (id) do nothing;

insert into public.courses (id, title, description, duration, location, category, seats_total, fee_type, fee_amount, application_fee, status, instructor_id)
values ('b4584a3f-bcd0-5a1e-be81-2577f820cbfc', 'Cybersecurity', 'Network security and ethical hacking.', '4 months', 'ITeMS Building, UI', 'Cybersecurity', 20,
        'flat'::public.fee_type, 30000000, 2000000,
        'published'::public.course_status, 'd2aabb89-7202-55bb-bec8-1ac21ed47a51')
on conflict (id) do nothing;
insert into public.course_modules (id, course_id, title, position) values ('968c97c3-d787-5525-afba-39ea278eea90', 'b4584a3f-bcd0-5a1e-be81-2577f820cbfc', 'Security Labs', 0) on conflict (id) do nothing;

insert into public.courses (id, title, description, duration, location, category, seats_total, fee_type, fee_amount, application_fee, status, instructor_id)
values ('1296b991-4846-55c9-bed5-a9d8a3a31ad4', 'Digital Marketing', 'Social media, SEO, and digital growth strategies.', '4 months', 'ITeMS Building, UI', 'Digital Literacy', 30,
        'flat'::public.fee_type, 30000000, 2000000,
        'published'::public.course_status, 'a92a75c2-6729-50c6-944c-edac377f65bd')
on conflict (id) do nothing;
insert into public.course_modules (id, course_id, title, position) values ('74b401bf-e3f9-5250-9c9b-f10ae868aaad', '1296b991-4846-55c9-bed5-a9d8a3a31ad4', 'SEO Strategy', 0) on conflict (id) do nothing;


-- ────────────────────────────────────────────────────────────────────────────
-- Assessments, questions and options
-- ────────────────────────────────────────────────────────────────────────────
insert into public.assessments (id, course_id, module_id, title, description, kind, status, passing_score, time_limit_minutes, max_attempts, gates_entry_pass, created_by, updated_at)
values ('ee51b273-4c43-55a7-a17a-10ab033fb324', '577ea935-461d-53d4-b88b-52ee31473d1b', null,
        'Digital Readiness Check', 'Confirms you have the baseline computing skills needed before attending the on-site lab. You must pass this to receive your entry pass.', 'prerequisite'::public.assessment_kind, 'published'::public.assessment_status,
        70, 15, 3, true,
        'd2aabb89-7202-55bb-bec8-1ac21ed47a51', 'Feb 20, 2026')
on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('ab480890-d0c0-52ad-96a6-d0284185598c', 'ee51b273-4c43-55a7-a17a-10ab033fb324', 'Which of these is a web browser?', 'single'::public.question_type, 'Firefox is a browser; the others are desktop applications for other tasks.',
        'easy'::public.difficulty, 1, array['Digital Literacy']::text[],
        '7d341255-a8ef-56ff-a45e-22795a1f2768', 0)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('86d9d4c3-b703-5cce-b8f6-8f26eadf2ea8', 'ab480890-d0c0-52ad-96a6-d0284185598c', 'Photoshop', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('5ca10fa1-7955-5bd8-9590-c16b3d646a64', 'ab480890-d0c0-52ad-96a6-d0284185598c', 'Firefox', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('65db3e00-3105-507b-ad9b-f52d29440740', 'ab480890-d0c0-52ad-96a6-d0284185598c', 'Excel', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('7f667cbb-7bbe-5dc7-a8e5-d2a28ea357b1', 'ab480890-d0c0-52ad-96a6-d0284185598c', 'VLC', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('1aef657e-9952-5aa6-9aa4-54d0f68382bb', 'ee51b273-4c43-55a7-a17a-10ab033fb324', 'What does a file extension such as .pdf or .docx tell you?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Digital Literacy']::text[],
        '7d341255-a8ef-56ff-a45e-22795a1f2768', 1)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('8af021b5-e9ae-5995-9598-3a9a62622144', '1aef657e-9952-5aa6-9aa4-54d0f68382bb', 'The file''s size', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('df186c99-fdfb-580f-867c-e7366128ccdb', '1aef657e-9952-5aa6-9aa4-54d0f68382bb', 'The file''s format and which app opens it', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('c8bd4991-530a-5c16-9619-ff7077f60925', '1aef657e-9952-5aa6-9aa4-54d0f68382bb', 'Who created the file', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('e01a24a0-1f91-5473-a7dc-66e61b764518', '1aef657e-9952-5aa6-9aa4-54d0f68382bb', 'Where the file is stored', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('54257e16-5107-5fd4-bf0a-35faa3307b78', 'ee51b273-4c43-55a7-a17a-10ab033fb324', 'Select every practice that helps keep an online account secure.', 'multiple'::public.question_type, '2FA and a password manager both reduce risk. Reuse and sharing both increase it.',
        'medium'::public.difficulty, 1, array['Security']::text[],
        '8a903244-6a42-5a16-9a38-0a07757c97c1', 2)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('7f648d33-1b15-5738-8670-1d0b6aff2d79', '54257e16-5107-5fd4-bf0a-35faa3307b78', 'Reusing one password everywhere', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('47243aa1-c0c5-52c4-a900-112b6fd05dd8', '54257e16-5107-5fd4-bf0a-35faa3307b78', 'Enabling two-factor authentication', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('b245a751-7ff7-5c64-8164-5ab875b63a5b', '54257e16-5107-5fd4-bf0a-35faa3307b78', 'Using a password manager', true, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('49782e9d-15d6-5e3f-ac88-084e0387498b', '54257e16-5107-5fd4-bf0a-35faa3307b78', 'Sharing your password with a colleague', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('8349f429-8512-5394-8519-2292499fa99b', 'ee51b273-4c43-55a7-a17a-10ab033fb324', 'Keyboard shortcut to copy on Windows?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Digital Literacy']::text[],
        '7d341255-a8ef-56ff-a45e-22795a1f2768', 3)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('cf6f46ef-3613-5e1c-bbd3-c06d4d74c3f3', '8349f429-8512-5394-8519-2292499fa99b', 'Ctrl + X', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('4392f9d7-9d20-5510-9bea-5705db2231b6', '8349f429-8512-5394-8519-2292499fa99b', 'Ctrl + V', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('a9d21f16-0fe2-57f7-9172-5ee32d585948', '8349f429-8512-5394-8519-2292499fa99b', 'Ctrl + C', true, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('7501bc37-7122-560c-989a-424dc61d2e45', '8349f429-8512-5394-8519-2292499fa99b', 'Ctrl + P', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('1a4e9068-223f-5098-9a87-6accd9f23a87', 'ee51b273-4c43-55a7-a17a-10ab033fb324', 'Cloud storage means your files are held on a remote server rather than only on your device.', 'boolean'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Digital Literacy']::text[],
        '8a903244-6a42-5a16-9a38-0a07757c97c1', 4)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('2ffee54f-bf32-57f7-8ebb-69d6a20b1a46', '1a4e9068-223f-5098-9a87-6accd9f23a87', 'True', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('d5023e61-bf8a-517c-b78f-d6c8396f884e', '1a4e9068-223f-5098-9a87-6accd9f23a87', 'False', false, 1) on conflict (id) do nothing;

insert into public.assessments (id, course_id, module_id, title, description, kind, status, passing_score, time_limit_minutes, max_attempts, gates_entry_pass, created_by, updated_at)
values ('873e4a25-652f-5e92-90aa-f729dd1fc890', '577ea935-461d-53d4-b88b-52ee31473d1b', '7d341255-a8ef-56ff-a45e-22795a1f2768',
        'Web Foundation Checkpoint', 'Covers the HTML, CSS and JavaScript fundamentals from Module 1.', 'checkpoint'::public.assessment_kind, 'published'::public.assessment_status,
        60, 20, 0, false,
        'd2aabb89-7202-55bb-bec8-1ac21ed47a51', 'Feb 22, 2026')
on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('52dca8bf-9fb7-570e-9c8c-8b35711c4742', '873e4a25-652f-5e92-90aa-f729dd1fc890', 'Which HTML tag creates the largest heading?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['HTML']::text[],
        '7d341255-a8ef-56ff-a45e-22795a1f2768', 0)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('e18f972e-fe45-54d0-9ef5-497a118d47b0', '52dca8bf-9fb7-570e-9c8c-8b35711c4742', '<h6>', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('dc3a9c90-d1a8-5ef2-b80d-6154902e7238', '52dca8bf-9fb7-570e-9c8c-8b35711c4742', '<head>', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('3799fc2b-009c-588d-a2e0-8554c95b4b93', '52dca8bf-9fb7-570e-9c8c-8b35711c4742', '<h1>', true, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('10d92ba4-b766-561f-badd-f120440ef43f', '52dca8bf-9fb7-570e-9c8c-8b35711c4742', '<header>', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('6b86470d-0e68-5a5f-9fd2-6e7df2ce1367', '873e4a25-652f-5e92-90aa-f729dd1fc890', 'In CSS, which property controls the stacking order of elements?', 'single'::public.question_type, 'z-index sets stacking order for positioned elements.',
        'medium'::public.difficulty, 1, array['CSS']::text[],
        '8a903244-6a42-5a16-9a38-0a07757c97c1', 1)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('49a08e33-df74-5d30-b942-24268a1a0535', '6b86470d-0e68-5a5f-9fd2-6e7df2ce1367', 'position', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('2fe454fc-bf89-5c74-976e-932df8d8929b', '6b86470d-0e68-5a5f-9fd2-6e7df2ce1367', 'display', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('00dc7119-f9dd-5dab-b12f-82a941c62c85', '6b86470d-0e68-5a5f-9fd2-6e7df2ce1367', 'z-index', true, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('baa9d917-5bc6-590a-a2de-0b811a4a6540', '6b86470d-0e68-5a5f-9fd2-6e7df2ce1367', 'float', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('7fd7f0a6-cafd-5587-a930-ca8a169c71ef', '873e4a25-652f-5e92-90aa-f729dd1fc890', 'Select all valid ways to declare a variable in modern JavaScript.', 'multiple'::public.question_type, null,
        'medium'::public.difficulty, 1, array['JavaScript']::text[],
        'e435e266-3217-5981-93c8-139ce95ae822', 2)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('7154121d-5b7b-5ab7-a12a-70ae87997979', '7fd7f0a6-cafd-5587-a930-ca8a169c71ef', 'let', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('32367857-6a47-58b1-a132-a7460bb91360', '7fd7f0a6-cafd-5587-a930-ca8a169c71ef', 'const', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('a221bcc3-0151-5330-8a90-c22195a5aa55', '7fd7f0a6-cafd-5587-a930-ca8a169c71ef', 'var', true, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('07d0ef39-5916-5808-a094-dd979fae7948', '7fd7f0a6-cafd-5587-a930-ca8a169c71ef', 'define', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('4b75ac81-5dd6-5806-ad71-18824b4f20c1', '873e4a25-652f-5e92-90aa-f729dd1fc890', 'What does the CSS box model''s `padding` control?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['CSS']::text[],
        '8a903244-6a42-5a16-9a38-0a07757c97c1', 3)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('a459f84a-c9b9-5868-a311-a82165cdcbde', '4b75ac81-5dd6-5806-ad71-18824b4f20c1', 'Space outside the border', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('34db9ed4-852d-58ac-84f5-f5fe7644fe3d', '4b75ac81-5dd6-5806-ad71-18824b4f20c1', 'Space between content and border', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('1880dac0-b0ba-5eaa-9ebc-430d404462b4', '4b75ac81-5dd6-5806-ad71-18824b4f20c1', 'The border thickness', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('f1f85ccc-f0f8-5870-badc-cef7c401f7e8', '4b75ac81-5dd6-5806-ad71-18824b4f20c1', 'The element''s font size', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('ef1b16c1-6dfe-5065-81da-74b7623a84a9', '873e4a25-652f-5e92-90aa-f729dd1fc890', '`===` in JavaScript compares value and type.', 'boolean'::public.question_type, null,
        'medium'::public.difficulty, 1, array['JavaScript']::text[],
        'e435e266-3217-5981-93c8-139ce95ae822', 4)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('c9c8aab5-66dd-5de9-91fc-8553ba72f314', 'ef1b16c1-6dfe-5065-81da-74b7623a84a9', 'True', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('e79e439a-3f1d-5482-b081-03cbace39d58', 'ef1b16c1-6dfe-5065-81da-74b7623a84a9', 'False', false, 1) on conflict (id) do nothing;

insert into public.assessments (id, course_id, module_id, title, description, kind, status, passing_score, time_limit_minutes, max_attempts, gates_entry_pass, created_by, updated_at)
values ('7a66d1aa-ca17-5d34-9f1d-54594cba3301', '577ea935-461d-53d4-b88b-52ee31473d1b', null,
        'Tech Odyssey Capstone', 'Final graded assessment across all three tracks. Required for certification.', 'final'::public.assessment_kind, 'published'::public.assessment_status,
        75, 45, 2, false,
        'd2aabb89-7202-55bb-bec8-1ac21ed47a51', 'Feb 25, 2026')
on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('1106e1fd-41dd-5c4b-8294-419f0c5554aa', '7a66d1aa-ca17-5d34-9f1d-54594cba3301', 'Which Python data structure is immutable?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Python']::text[],
        'e435e266-3217-5981-93c8-139ce95ae822', 0)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('5d55344d-ba24-554c-af5d-dfec7d8a6ebd', '1106e1fd-41dd-5c4b-8294-419f0c5554aa', 'List', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('2062077c-5e10-5ff2-9fcf-c07c54db1f2c', '1106e1fd-41dd-5c4b-8294-419f0c5554aa', 'Dictionary', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('8418dac3-6830-5a27-aa24-309678d5cf63', '1106e1fd-41dd-5c4b-8294-419f0c5554aa', 'Set', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('bb6b194a-2c22-5b9f-9d7f-f56e735026fe', '1106e1fd-41dd-5c4b-8294-419f0c5554aa', 'Tuple', true, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('151f52a4-b0d4-5031-bad2-52c0ec65f224', '7a66d1aa-ca17-5d34-9f1d-54594cba3301', 'What is the default port for HTTPS?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Networking']::text[],
        null, 1)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('7e8abf2e-0b28-5857-9a09-10f34c45d9b5', '151f52a4-b0d4-5031-bad2-52c0ec65f224', '80', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('57ce16ea-afb4-5ab1-a039-53124ea764a8', '151f52a4-b0d4-5031-bad2-52c0ec65f224', '443', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('109d0781-ab4c-572c-8fd1-ee613368b70c', '151f52a4-b0d4-5031-bad2-52c0ec65f224', '8080', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('2c3c30e3-cccb-55f6-aace-1946981fb78e', '151f52a4-b0d4-5031-bad2-52c0ec65f224', '22', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('2184e500-bb8f-5c77-8cd6-3e790ef0a703', '7a66d1aa-ca17-5d34-9f1d-54594cba3301', 'A race condition occurs when two processes compete for a resource in an unpredictable order.', 'boolean'::public.question_type, null,
        'hard'::public.difficulty, 1, array['Programming']::text[],
        null, 2)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('47e903f6-c81f-5a82-911c-d57a305ee282', '2184e500-bb8f-5c77-8cd6-3e790ef0a703', 'True', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('736e3450-b76e-5cbc-83d4-7d323dbe7784', '2184e500-bb8f-5c77-8cd6-3e790ef0a703', 'False', false, 1) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('9c3c41e4-a315-5f30-bd3c-74342565279d', '7a66d1aa-ca17-5d34-9f1d-54594cba3301', 'Which image format supports transparency and lossless compression?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Graphics']::text[],
        null, 3)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('f8b9186f-4b9c-5d54-87dc-00a44d0b4c56', '9c3c41e4-a315-5f30-bd3c-74342565279d', 'JPEG', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('3dbeda96-70e1-51c7-9f0f-66e066fe6679', '9c3c41e4-a315-5f30-bd3c-74342565279d', 'PNG', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('5a3da96c-ecbc-5e3d-8ac6-0e4d736a35de', '9c3c41e4-a315-5f30-bd3c-74342565279d', 'BMP', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('46dffe8d-8273-5b02-8377-3a764272087d', '9c3c41e4-a315-5f30-bd3c-74342565279d', 'GIF', false, 3) on conflict (id) do nothing;

insert into public.assessments (id, course_id, module_id, title, description, kind, status, passing_score, time_limit_minutes, max_attempts, gates_entry_pass, created_by, updated_at)
values ('afc4d8d1-7e06-5718-8212-10b34c6677eb', 'a011cbb4-addf-58ac-b215-075d496c936f', null,
        'Frontend Entry Test', 'Prerequisite check before joining the Web Development cohort lab.', 'prerequisite'::public.assessment_kind, 'published'::public.assessment_status,
        70, 15, 3, true,
        'a92a75c2-6729-50c6-944c-edac377f65bd', 'Feb 18, 2026')
on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('36e908e5-7a54-5112-b791-62c07a53433f', 'afc4d8d1-7e06-5718-8212-10b34c6677eb', 'Which CSS layout system is one-dimensional?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['CSS']::text[],
        'e3c86a31-a93b-5e58-9c9d-b2728d9dcbc6', 0)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('7061544f-07d9-5e95-9cfa-fcd7cf3778e8', '36e908e5-7a54-5112-b791-62c07a53433f', 'Grid', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('b56d2128-8a8d-5bce-b879-dfaf0e9a08f2', '36e908e5-7a54-5112-b791-62c07a53433f', 'Flexbox', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('ffc4ecc1-0571-5684-8bba-022e26b2af0c', '36e908e5-7a54-5112-b791-62c07a53433f', 'Float', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('bf351d94-f347-5964-804f-521c875c6d82', '36e908e5-7a54-5112-b791-62c07a53433f', 'Table', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('072e3aa4-181c-5c80-9187-405cf2a4acef', 'afc4d8d1-7e06-5718-8212-10b34c6677eb', 'HTML stands for…', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['HTML']::text[],
        'e3c86a31-a93b-5e58-9c9d-b2728d9dcbc6', 1)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('56954b6b-bba2-5c8d-9761-47d7db135efb', '072e3aa4-181c-5c80-9187-405cf2a4acef', 'Hyper Text Markup Language', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('6a1284f2-f1a9-552e-b2c8-a31165191002', '072e3aa4-181c-5c80-9187-405cf2a4acef', 'High Transfer Machine Language', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('87be3652-75f6-50cd-b24a-8badc166fd63', '072e3aa4-181c-5c80-9187-405cf2a4acef', 'Hyperlink Text Management Layer', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('5f36898b-1638-57aa-b9b5-ed634bcbeaaa', '072e3aa4-181c-5c80-9187-405cf2a4acef', 'Home Tool Markup Language', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('62eca08d-675e-564f-bedc-d7acfadb5164', 'afc4d8d1-7e06-5718-8212-10b34c6677eb', 'Select every valid CSS unit.', 'multiple'::public.question_type, null,
        'medium'::public.difficulty, 1, array['CSS']::text[],
        'e3c86a31-a93b-5e58-9c9d-b2728d9dcbc6', 2)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('25014ba3-07c3-5e49-b63a-79781e63ff0e', '62eca08d-675e-564f-bedc-d7acfadb5164', 'rem', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('f5c63e6e-8958-5e4a-8076-71cbddaf6288', '62eca08d-675e-564f-bedc-d7acfadb5164', 'px', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('e3e032a5-2ea4-5320-a580-62c5c5e42bde', '62eca08d-675e-564f-bedc-d7acfadb5164', 'vh', true, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('b43db4d2-2164-50e5-b310-465670aba885', '62eca08d-675e-564f-bedc-d7acfadb5164', 'dpi', false, 3) on conflict (id) do nothing;

insert into public.assessments (id, course_id, module_id, title, description, kind, status, passing_score, time_limit_minutes, max_attempts, gates_entry_pass, created_by, updated_at)
values ('b3239c3f-027e-525a-8dee-e1284ea0c8ff', 'a011cbb4-addf-58ac-b215-075d496c936f', null,
        'Responsive Design Final', 'Assesses responsive layout, accessibility and deployment knowledge.', 'final'::public.assessment_kind, 'draft'::public.assessment_status,
        75, 30, 2, false,
        'a92a75c2-6729-50c6-944c-edac377f65bd', 'Feb 26, 2026')
on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('3afde117-f7f2-58ee-b6fb-034587237926', 'b3239c3f-027e-525a-8dee-e1284ea0c8ff', 'Which meta tag is required for responsive scaling on mobile?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Responsive']::text[],
        null, 0)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('62c396d5-397f-5685-83d4-99d8ad203af4', '3afde117-f7f2-58ee-b6fb-034587237926', 'charset', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('ec19051d-38a3-569d-bbb4-66043f63a8a5', '3afde117-f7f2-58ee-b6fb-034587237926', 'viewport', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('8b8a2fef-bcf3-5caf-965f-472bf8fd3d5b', '3afde117-f7f2-58ee-b6fb-034587237926', 'robots', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('64c1448d-0330-5c1c-89a7-2e0ef959999f', '3afde117-f7f2-58ee-b6fb-034587237926', 'author', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('49858b71-451e-5b95-a5e5-c640b4cbf6df', 'b3239c3f-027e-525a-8dee-e1284ea0c8ff', 'A media query at `min-width: 768px` targets screens 768px and wider.', 'boolean'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Responsive']::text[],
        null, 1)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('fbee7130-c7f4-5fb8-998a-6ac71feb93ea', '49858b71-451e-5b95-a5e5-c640b4cbf6df', 'True', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('bab1cbb7-eee4-5fe3-a847-dc9363e068f2', '49858b71-451e-5b95-a5e5-c640b4cbf6df', 'False', false, 1) on conflict (id) do nothing;

insert into public.assessments (id, course_id, module_id, title, description, kind, status, passing_score, time_limit_minutes, max_attempts, gates_entry_pass, created_by, updated_at)
values ('fb3b8c2c-9f92-51d3-99d0-2a10bfb0c87b', 'e56df1b0-d187-50bb-911c-a77deba8e2dd', null,
        'Python Readiness Check', 'Confirms basic programming logic before the first on-site lab session.', 'prerequisite'::public.assessment_kind, 'published'::public.assessment_status,
        70, 15, 3, true,
        'd2aabb89-7202-55bb-bec8-1ac21ed47a51', 'Feb 19, 2026')
on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('459e77e9-056d-5a77-aa28-0b83233caa5d', 'fb3b8c2c-9f92-51d3-99d0-2a10bfb0c87b', 'What symbol starts a comment in Python?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Python']::text[],
        '292b3965-f7bd-5506-b550-3ff5733632f5', 0)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('54bbde4e-9499-5c23-8939-5e89f413677e', '459e77e9-056d-5a77-aa28-0b83233caa5d', '//', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('7f3ca62d-3d72-541a-a07b-f10365c919dc', '459e77e9-056d-5a77-aa28-0b83233caa5d', '#', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('96f95f67-77d0-568b-b7ba-468fba3d304d', '459e77e9-056d-5a77-aa28-0b83233caa5d', '--', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('7c719d9c-6c97-5d78-83ed-c5d42e54c2f4', '459e77e9-056d-5a77-aa28-0b83233caa5d', '/*', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('dc352232-fbb6-51d9-85ee-44cfbf23e771', 'fb3b8c2c-9f92-51d3-99d0-2a10bfb0c87b', 'Which keyword defines a function in Python?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Python']::text[],
        '292b3965-f7bd-5506-b550-3ff5733632f5', 1)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('59e3bd87-d23f-5be9-8e90-f84687f4ee53', 'dc352232-fbb6-51d9-85ee-44cfbf23e771', 'func', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('ff851170-abc5-5f8b-b051-5700d443763c', 'dc352232-fbb6-51d9-85ee-44cfbf23e771', 'function', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('3b45c27b-a380-517a-8654-43a21d849274', 'dc352232-fbb6-51d9-85ee-44cfbf23e771', 'def', true, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('c8aefd11-15d4-577b-873b-be590da570d0', 'dc352232-fbb6-51d9-85ee-44cfbf23e771', 'lambda', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('672e71c3-ac1b-5fcb-a294-3ef9dbcc3120', 'fb3b8c2c-9f92-51d3-99d0-2a10bfb0c87b', 'Python is a statically typed language.', 'boolean'::public.question_type, 'Python is dynamically typed — types are resolved at runtime.',
        'medium'::public.difficulty, 1, array['Python']::text[],
        '292b3965-f7bd-5506-b550-3ff5733632f5', 2)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('c2445b07-242d-5461-bb57-35a34cbe790d', '672e71c3-ac1b-5fcb-a294-3ef9dbcc3120', 'True', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('9a51e6a0-e479-52f1-a0e7-f5e938b68754', '672e71c3-ac1b-5fcb-a294-3ef9dbcc3120', 'False', true, 1) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('93650092-8306-5b8a-92d6-5f0784bc77e2', 'fb3b8c2c-9f92-51d3-99d0-2a10bfb0c87b', 'Select every valid Python collection type.', 'multiple'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Python', 'Data Structures']::text[],
        '6069c09e-8d12-57ec-abaf-0141671328ec', 3)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('736501e4-476a-5c3e-aec2-9667ff168ec3', '93650092-8306-5b8a-92d6-5f0784bc77e2', 'list', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('cd3a5737-ece5-5cef-9e8b-8a73f9afb992', '93650092-8306-5b8a-92d6-5f0784bc77e2', 'tuple', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('8a97ffb6-d7b1-5e5e-a34d-47d8c1afddef', '93650092-8306-5b8a-92d6-5f0784bc77e2', 'dict', true, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('81d20493-98e5-5e2b-89a0-0eba89fa06dc', '93650092-8306-5b8a-92d6-5f0784bc77e2', 'array', false, 3) on conflict (id) do nothing;

insert into public.assessments (id, course_id, module_id, title, description, kind, status, passing_score, time_limit_minutes, max_attempts, gates_entry_pass, created_by, updated_at)
values ('0da77ac4-5265-526e-a4ed-5fe3045df8e7', 'e56df1b0-d187-50bb-911c-a77deba8e2dd', '6069c09e-8d12-57ec-abaf-0141671328ec',
        'Control Flow Checkpoint', 'Loops, conditionals and comprehensions.', 'checkpoint'::public.assessment_kind, 'published'::public.assessment_status,
        60, 20, 0, false,
        'd2aabb89-7202-55bb-bec8-1ac21ed47a51', 'Feb 24, 2026')
on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('a83c155c-6ba2-5a34-ab72-1aabb887b04f', '0da77ac4-5265-526e-a4ed-5fe3045df8e7', 'What does `range(3)` produce?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Python']::text[],
        '6069c09e-8d12-57ec-abaf-0141671328ec', 0)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('841fd5f4-f870-59a3-8d54-0ecc798ffdfa', 'a83c155c-6ba2-5a34-ab72-1aabb887b04f', '1, 2, 3', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('26d0beb1-8725-5eff-96cf-3bed58eb9b2d', 'a83c155c-6ba2-5a34-ab72-1aabb887b04f', '0, 1, 2', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('bf050b27-e8c5-5e98-b174-9d4d8308a009', 'a83c155c-6ba2-5a34-ab72-1aabb887b04f', '0, 1, 2, 3', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('541eb8c7-2821-5c2d-a6b6-1544ef39bf74', 'a83c155c-6ba2-5a34-ab72-1aabb887b04f', '3', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('7051c69a-9239-5acf-8dae-cf0586ef8382', '0da77ac4-5265-526e-a4ed-5fe3045df8e7', 'Which statement exits a loop immediately?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Python']::text[],
        '6069c09e-8d12-57ec-abaf-0141671328ec', 1)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('3fa73de7-309d-517e-a55f-843739eb6f05', '7051c69a-9239-5acf-8dae-cf0586ef8382', 'continue', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('1b05f8cb-2427-5551-bdbf-254a72a804ef', '7051c69a-9239-5acf-8dae-cf0586ef8382', 'pass', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('eb355ad9-f118-5798-a463-f99e5d59761a', '7051c69a-9239-5acf-8dae-cf0586ef8382', 'break', true, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('d980a30c-8f26-54a6-a843-f5ded1fda759', '7051c69a-9239-5acf-8dae-cf0586ef8382', 'return', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('da9dc387-acf8-5b11-b050-269e78073888', '0da77ac4-5265-526e-a4ed-5fe3045df8e7', 'A list comprehension is generally faster than an equivalent for-loop append.', 'boolean'::public.question_type, null,
        'hard'::public.difficulty, 1, array['Python']::text[],
        '6069c09e-8d12-57ec-abaf-0141671328ec', 2)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('17d1631c-15a4-5176-85ec-c62e3ef26ce9', 'da9dc387-acf8-5b11-b050-269e78073888', 'True', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('aeeb28a3-d42d-5690-bb9e-8b43bcc14c8a', 'da9dc387-acf8-5b11-b050-269e78073888', 'False', false, 1) on conflict (id) do nothing;

insert into public.assessments (id, course_id, module_id, title, description, kind, status, passing_score, time_limit_minutes, max_attempts, gates_entry_pass, created_by, updated_at)
values ('207e7804-3038-530d-8174-4d70e3325f35', 'e56df1b0-d187-50bb-911c-a77deba8e2dd', null,
        'Python Certification Exam', 'Final graded exam. A pass issues the Python Programming certificate.', 'final'::public.assessment_kind, 'published'::public.assessment_status,
        70, 40, 2, false,
        'd2aabb89-7202-55bb-bec8-1ac21ed47a51', 'Feb 27, 2026')
on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('ed2f3d73-8dee-5e78-8d5a-cd79af0eec43', '207e7804-3038-530d-8174-4d70e3325f35', 'Which module handles file paths in a cross-platform way?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Python']::text[],
        null, 0)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('deda013b-2cc8-5a7d-ac16-50b5aad671d8', 'ed2f3d73-8dee-5e78-8d5a-cd79af0eec43', 'os.path', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('6d1ef420-126a-563f-82ec-890965532962', 'ed2f3d73-8dee-5e78-8d5a-cd79af0eec43', 'sys', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('5b578aea-fb99-5034-89f0-00010b89ab70', 'ed2f3d73-8dee-5e78-8d5a-cd79af0eec43', 'io', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('08375269-c501-512d-9521-d43b7fdd6883', 'ed2f3d73-8dee-5e78-8d5a-cd79af0eec43', 'shutil', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('cbd91fe6-7ca0-59a9-82e1-38ceb0037215', '207e7804-3038-530d-8174-4d70e3325f35', 'What does `len({''a'': 1, ''b'': 2})` return?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Python']::text[],
        null, 1)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('4589ccc4-2ce5-5b97-ad44-b4cfecc9fd51', 'cbd91fe6-7ca0-59a9-82e1-38ceb0037215', '1', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('c66daa59-1a90-556b-b81d-d60e6ea6f68d', 'cbd91fe6-7ca0-59a9-82e1-38ceb0037215', '2', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('dad9b1cc-7d3c-577e-8740-f1007e3611e7', 'cbd91fe6-7ca0-59a9-82e1-38ceb0037215', '4', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('e61f5568-e008-5e69-aeb1-76d0a2478315', 'cbd91fe6-7ca0-59a9-82e1-38ceb0037215', 'TypeError', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('6447731b-8e10-5d1c-a932-efeb208059b2', '207e7804-3038-530d-8174-4d70e3325f35', 'Select every truthy value in Python.', 'multiple'::public.question_type, 'Non-empty containers and non-empty strings are truthy; 0 and None are falsy.',
        'hard'::public.difficulty, 1, array['Python']::text[],
        null, 2)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('bad757e2-9e35-5f1f-a576-1ca8f7d8845a', '6447731b-8e10-5d1c-a932-efeb208059b2', '[1]', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('26be9db9-ed63-5cc5-87df-8165185cba2a', '6447731b-8e10-5d1c-a932-efeb208059b2', '0', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('37baaa45-b20a-5365-a846-2d4551b8c30c', '6447731b-8e10-5d1c-a932-efeb208059b2', '''0''', true, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('6c1338c0-e314-5c34-a57d-eee4a6b1d238', '6447731b-8e10-5d1c-a932-efeb208059b2', 'None', false, 3) on conflict (id) do nothing;

insert into public.assessments (id, course_id, module_id, title, description, kind, status, passing_score, time_limit_minutes, max_attempts, gates_entry_pass, created_by, updated_at)
values ('f6548efa-d28c-503b-81a5-b0804bfe2add', '556e576c-a311-5e54-bf14-34d9d37c7184', null,
        'Computer Basics Entry Test', 'Required before the Digital Literacy induction session.', 'prerequisite'::public.assessment_kind, 'published'::public.assessment_status,
        60, 10, 3, true,
        'a92a75c2-6729-50c6-944c-edac377f65bd', 'Feb 15, 2026')
on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('3378479b-2c4d-5914-a25d-fb20d1fb9a20', 'f6548efa-d28c-503b-81a5-b0804bfe2add', 'Which device is an input device?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Hardware']::text[],
        '205cf578-2285-5f43-abbf-1d3eeaed7ac5', 0)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('fc32adeb-dd3d-54ee-8898-7859aa79666b', '3378479b-2c4d-5914-a25d-fb20d1fb9a20', 'Monitor', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('a5efa53c-ff6c-5d55-8c7c-3dd1666d62a3', '3378479b-2c4d-5914-a25d-fb20d1fb9a20', 'Printer', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('61fbb086-7f9f-5856-9c74-3eb8c0db14c8', '3378479b-2c4d-5914-a25d-fb20d1fb9a20', 'Keyboard', true, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('31339ac2-2fb7-5292-a5de-f1f468c209e3', '3378479b-2c4d-5914-a25d-fb20d1fb9a20', 'Speaker', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('6ebec4fe-c663-5ce9-affe-a10d8649c511', 'f6548efa-d28c-503b-81a5-b0804bfe2add', 'What does ''RAM'' stand for?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Hardware']::text[],
        '205cf578-2285-5f43-abbf-1d3eeaed7ac5', 1)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('30bd6d80-f186-5554-a4d8-1feb656b3c9d', '6ebec4fe-c663-5ce9-affe-a10d8649c511', 'Random Access Memory', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('ff53ace4-7484-597c-b968-22e9aed8f697', '6ebec4fe-c663-5ce9-affe-a10d8649c511', 'Read Access Mode', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('a6644aac-8109-55cf-9d7c-7f4761481057', '6ebec4fe-c663-5ce9-affe-a10d8649c511', 'Remote Access Module', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('44684e4f-3bb0-5d88-aa4d-9335c5880cc4', '6ebec4fe-c663-5ce9-affe-a10d8649c511', 'Rapid Archive Memory', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('8a6e159c-6c67-58b9-a66a-c03ba35320d2', 'f6548efa-d28c-503b-81a5-b0804bfe2add', 'A phishing email tries to trick you into revealing sensitive information.', 'boolean'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Security']::text[],
        '205cf578-2285-5f43-abbf-1d3eeaed7ac5', 2)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('0855dd28-810f-5ffd-b1f8-6cd289be9758', '8a6e159c-6c67-58b9-a66a-c03ba35320d2', 'True', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('a5f9526d-bca4-5452-aef7-0e9b1a64321e', '8a6e159c-6c67-58b9-a66a-c03ba35320d2', 'False', false, 1) on conflict (id) do nothing;

insert into public.assessments (id, course_id, module_id, title, description, kind, status, passing_score, time_limit_minutes, max_attempts, gates_entry_pass, created_by, updated_at)
values ('0a2d6c51-0499-5188-809f-d80fe71a12f1', '556e576c-a311-5e54-bf14-34d9d37c7184', null,
        'Productivity Tools Final', 'Word processing, spreadsheets and presentation software.', 'final'::public.assessment_kind, 'published'::public.assessment_status,
        65, 25, 2, false,
        'a92a75c2-6729-50c6-944c-edac377f65bd', 'Feb 21, 2026')
on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('24a9dc63-9194-593d-a2b0-cb30fa42c2ab', '0a2d6c51-0499-5188-809f-d80fe71a12f1', 'In a spreadsheet, which symbol begins a formula?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Excel']::text[],
        null, 0)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('67656693-4eff-5685-83f2-cbfe26147fc7', '24a9dc63-9194-593d-a2b0-cb30fa42c2ab', '#', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('47e41530-adde-5bbd-a0e3-eabd24eb1122', '24a9dc63-9194-593d-a2b0-cb30fa42c2ab', '=', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('ff2aedcc-1942-5fdd-992a-07114ee27a08', '24a9dc63-9194-593d-a2b0-cb30fa42c2ab', '@', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('3af34ccc-a5b9-5c3b-b5b1-45eec5b1a5bd', '24a9dc63-9194-593d-a2b0-cb30fa42c2ab', '$', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('5ae9e162-62e8-5ce4-89ae-430f6dcf5d72', '0a2d6c51-0499-5188-809f-d80fe71a12f1', 'Which function totals a range of cells?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Excel']::text[],
        null, 1)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('0f60a4e9-623a-5510-b983-6aae0cefb2a2', '5ae9e162-62e8-5ce4-89ae-430f6dcf5d72', 'COUNT', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('72dfcf49-d9c8-5d36-8cff-9882330c8c0c', '5ae9e162-62e8-5ce4-89ae-430f6dcf5d72', 'AVERAGE', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('bc4675b2-0bd2-594f-822a-563ce0f22579', '5ae9e162-62e8-5ce4-89ae-430f6dcf5d72', 'SUM', true, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('f47073e7-d23d-5cfd-ac14-9d77f23863b5', '5ae9e162-62e8-5ce4-89ae-430f6dcf5d72', 'MAX', false, 3) on conflict (id) do nothing;

insert into public.assessments (id, course_id, module_id, title, description, kind, status, passing_score, time_limit_minutes, max_attempts, gates_entry_pass, created_by, updated_at)
values ('bc2a0b09-a292-55cb-91c3-32b956306fa6', 'e4df4b90-8a0a-5e3c-9e30-a7c0d053a927', null,
        'AI Foundations Check', 'Prerequisite for the Generative AI workshop.', 'prerequisite'::public.assessment_kind, 'published'::public.assessment_status,
        70, 15, 3, true,
        'd2aabb89-7202-55bb-bec8-1ac21ed47a51', 'Feb 23, 2026')
on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('203cbb5c-dee3-5422-8374-3b2c38f1ba95', 'bc2a0b09-a292-55cb-91c3-32b956306fa6', 'What does a ''prompt'' refer to in generative AI?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['AI']::text[],
        'a2ccde09-4ce1-56d1-93e6-9a6d2ed6b6b0', 0)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('954df9e4-41f3-50e6-a780-48e3116859b5', '203cbb5c-dee3-5422-8374-3b2c38f1ba95', 'The model''s training data', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('05d32c16-e980-57f7-83c8-996e04259dd3', '203cbb5c-dee3-5422-8374-3b2c38f1ba95', 'The instruction given to the model', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('b73e29ef-6c7d-5ff8-9d9b-69ca287d1823', '203cbb5c-dee3-5422-8374-3b2c38f1ba95', 'The model''s parameter count', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('236d5319-555f-5a1b-81c0-5993ce5e61a5', '203cbb5c-dee3-5422-8374-3b2c38f1ba95', 'The output format', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('bedbc7ca-c12e-5c8c-beff-5fc2ae079468', 'bc2a0b09-a292-55cb-91c3-32b956306fa6', 'Select every practice that improves prompt quality.', 'multiple'::public.question_type, null,
        'medium'::public.difficulty, 1, array['AI']::text[],
        'a2ccde09-4ce1-56d1-93e6-9a6d2ed6b6b0', 1)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('86a8a484-1dc2-5835-8691-8d33bcd8c197', 'bedbc7ca-c12e-5c8c-beff-5fc2ae079468', 'Giving clear context', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('db0044a7-f4b9-5b33-9c75-e5154ebb6f1d', 'bedbc7ca-c12e-5c8c-beff-5fc2ae079468', 'Specifying the desired format', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('fb260f0d-5c45-5316-9ceb-a5d6968fde48', 'bedbc7ca-c12e-5c8c-beff-5fc2ae079468', 'Being deliberately vague', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('4b061f58-c65a-54b6-93bd-f9cd06767bf1', 'bedbc7ca-c12e-5c8c-beff-5fc2ae079468', 'Providing examples', true, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('b5bcdbbc-03c2-5428-b7ad-3900a5b54f7c', 'bc2a0b09-a292-55cb-91c3-32b956306fa6', 'Generative models can produce confident but factually wrong output.', 'boolean'::public.question_type, 'Commonly called hallucination — always verify factual claims.',
        'medium'::public.difficulty, 1, array['AI', 'Ethics']::text[],
        'a2ccde09-4ce1-56d1-93e6-9a6d2ed6b6b0', 2)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('b3ad8cf6-31a2-530f-9ca9-731e363729cf', 'b5bcdbbc-03c2-5428-b7ad-3900a5b54f7c', 'True', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('3bb9d334-9c4c-588e-b6ff-42c0c875821a', 'b5bcdbbc-03c2-5428-b7ad-3900a5b54f7c', 'False', false, 1) on conflict (id) do nothing;

insert into public.assessments (id, course_id, module_id, title, description, kind, status, passing_score, time_limit_minutes, max_attempts, gates_entry_pass, created_by, updated_at)
values ('9555d6f9-7e12-5802-8633-eaa5c6fb5793', '505771c5-aa1d-5a7b-9173-395eaee4fc14', null,
        'Statistics Readiness', 'Baseline statistics knowledge required before the Data Science lab.', 'prerequisite'::public.assessment_kind, 'published'::public.assessment_status,
        75, 20, 3, true,
        'a92a75c2-6729-50c6-944c-edac377f65bd', 'Feb 17, 2026')
on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('02fefb56-05d5-52c7-9b49-d40052f584fc', '9555d6f9-7e12-5802-8633-eaa5c6fb5793', 'Which measure is most affected by outliers?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Statistics']::text[],
        'fa4bd05a-5d66-5eea-ac1a-239a65739562', 0)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('9b2584e9-10cb-5179-bf29-155454a4adac', '02fefb56-05d5-52c7-9b49-d40052f584fc', 'Median', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('a5989498-e95e-5ed6-b958-0503179bab21', '02fefb56-05d5-52c7-9b49-d40052f584fc', 'Mode', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('a7537cae-1f37-58fd-a634-47514d43a184', '02fefb56-05d5-52c7-9b49-d40052f584fc', 'Mean', true, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('19754029-9d91-5f1a-9d9e-17b438f13b97', '02fefb56-05d5-52c7-9b49-d40052f584fc', 'Range', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('a0a645ee-b6be-50b9-8c78-a3841a550433', '9555d6f9-7e12-5802-8633-eaa5c6fb5793', 'Correlation implies causation.', 'boolean'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Statistics']::text[],
        'fa4bd05a-5d66-5eea-ac1a-239a65739562', 1)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('6b03dfec-0ab6-5a71-9ea7-25ff95a1bf4d', 'a0a645ee-b6be-50b9-8c78-a3841a550433', 'True', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('ad9a5fa7-0d15-5374-8ae0-af75ac2c37a7', 'a0a645ee-b6be-50b9-8c78-a3841a550433', 'False', true, 1) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('395b6349-7c50-52ab-afae-5c2cb47c1ee1', '9555d6f9-7e12-5802-8633-eaa5c6fb5793', 'Which library is the standard for dataframes in Python?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Python', 'Data Science']::text[],
        'fa4bd05a-5d66-5eea-ac1a-239a65739562', 2)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('72d264e8-2c2d-5036-861d-f91c81273e82', '395b6349-7c50-52ab-afae-5c2cb47c1ee1', 'NumPy', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('b22b7a05-7d16-5e02-a1e7-3aa0c478ad8b', '395b6349-7c50-52ab-afae-5c2cb47c1ee1', 'Pandas', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('63c22ca3-6da9-5ac2-bb65-7ffafb81d62d', '395b6349-7c50-52ab-afae-5c2cb47c1ee1', 'Matplotlib', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('c30fb78f-aa5a-5e6c-bacc-330bd4b4bdd0', '395b6349-7c50-52ab-afae-5c2cb47c1ee1', 'SciPy', false, 3) on conflict (id) do nothing;

insert into public.assessments (id, course_id, module_id, title, description, kind, status, passing_score, time_limit_minutes, max_attempts, gates_entry_pass, created_by, updated_at)
values ('edf89185-a313-5b23-8d77-32d0847efb35', '505771c5-aa1d-5a7b-9173-395eaee4fc14', null,
        'Modelling Final Exam', 'Regression, classification and model evaluation.', 'final'::public.assessment_kind, 'draft'::public.assessment_status,
        75, 45, 2, false,
        'a92a75c2-6729-50c6-944c-edac377f65bd', 'Feb 28, 2026')
on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('1f24ca8c-bd87-5b15-9092-9363c0d0272f', 'edf89185-a313-5b23-8d77-32d0847efb35', 'Which metric suits an imbalanced classification problem?', 'single'::public.question_type, null,
        'hard'::public.difficulty, 1, array['Machine Learning']::text[],
        null, 0)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('dea0ac9b-7034-56d3-b5fe-57a2abf85302', '1f24ca8c-bd87-5b15-9092-9363c0d0272f', 'Accuracy', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('5fd16f25-668a-5ee0-b024-ea09209dd2dd', '1f24ca8c-bd87-5b15-9092-9363c0d0272f', 'F1 score', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('c79246ff-0ace-5386-8368-026d9b1226f2', '1f24ca8c-bd87-5b15-9092-9363c0d0272f', 'Mean squared error', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('a7b4695c-de6b-5656-9c04-1e5117224a20', '1f24ca8c-bd87-5b15-9092-9363c0d0272f', 'R-squared', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('901f1179-ef55-5f3b-9169-fc6f90f4ae36', 'edf89185-a313-5b23-8d77-32d0847efb35', 'Overfitting means the model performs well on training data but poorly on unseen data.', 'boolean'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Machine Learning']::text[],
        null, 1)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('1926ea3e-e073-59e2-b9ad-83e5e247f85f', '901f1179-ef55-5f3b-9169-fc6f90f4ae36', 'True', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('de80a681-e9cd-5009-907f-cc910e1cef1a', '901f1179-ef55-5f3b-9169-fc6f90f4ae36', 'False', false, 1) on conflict (id) do nothing;

insert into public.assessments (id, course_id, module_id, title, description, kind, status, passing_score, time_limit_minutes, max_attempts, gates_entry_pass, created_by, updated_at)
values ('e1c10126-13e4-55fa-9ec2-6d1a67684782', 'b4584a3f-bcd0-5a1e-be81-2577f820cbfc', null,
        'Security Fundamentals Gate', 'Mandatory prerequisite. Controls access to the hands-on security lab.', 'prerequisite'::public.assessment_kind, 'published'::public.assessment_status,
        80, 20, 3, true,
        'd2aabb89-7202-55bb-bec8-1ac21ed47a51', 'Feb 16, 2026')
on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('a8088586-ba70-5e98-9e34-fcda6c7c9759', 'e1c10126-13e4-55fa-9ec2-6d1a67684782', 'Which protocol operates at the transport layer of the OSI model?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Networking', 'OSI Model']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 0)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('aafe8000-ef37-5fe7-832b-315b888d1b2e', 'a8088586-ba70-5e98-9e34-fcda6c7c9759', 'HTTP', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('1a58cf5b-c331-518e-8b89-70103fa1fb21', 'a8088586-ba70-5e98-9e34-fcda6c7c9759', 'TCP', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('4683dc50-21bc-5a0f-afc9-ad6aed86699e', 'a8088586-ba70-5e98-9e34-fcda6c7c9759', 'IP', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('0b8d226a-b6c7-5a7a-b2fc-91f915159253', 'a8088586-ba70-5e98-9e34-fcda6c7c9759', 'ARP', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('b7c492c7-b1b4-5673-a008-eef7bdf566e1', 'e1c10126-13e4-55fa-9ec2-6d1a67684782', 'What is the primary purpose of a firewall?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 1)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('04c7a0be-6429-5aaa-bae8-eda31721edd9', 'b7c492c7-b1b4-5673-a008-eef7bdf566e1', 'Speed up the network', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('02dfae6c-fcae-5b73-b381-6f71b3793f7e', 'b7c492c7-b1b4-5673-a008-eef7bdf566e1', 'Filter traffic', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('22ac2ceb-2e6b-5e68-aaa6-16c82e15a8c8', 'b7c492c7-b1b4-5673-a008-eef7bdf566e1', 'Store data', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('525eb28c-f44c-5248-a914-a034bface382', 'b7c492c7-b1b4-5673-a008-eef7bdf566e1', 'Compress files', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('f3d73d98-e11d-5240-9800-00c4af3debb7', 'e1c10126-13e4-55fa-9ec2-6d1a67684782', 'Which encryption standard is considered most secure?', 'single'::public.question_type, null,
        'hard'::public.difficulty, 1, array['Encryption']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 2)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('10a2d754-b649-56e1-9cc0-446ad2c1db40', 'f3d73d98-e11d-5240-9800-00c4af3debb7', 'DES', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('ece55628-ca95-525e-a905-557a03951f46', 'f3d73d98-e11d-5240-9800-00c4af3debb7', '3DES', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('d5789ac6-6e6a-5fc3-8d0d-4b29b62306a4', 'f3d73d98-e11d-5240-9800-00c4af3debb7', 'AES-256', true, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('820b09e9-465e-5b44-8c71-e2772c817511', 'f3d73d98-e11d-5240-9800-00c4af3debb7', 'RC4', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('955867c4-a4da-5f2f-9f32-f174749ade2f', 'e1c10126-13e4-55fa-9ec2-6d1a67684782', 'Select every factor that qualifies as multi-factor authentication.', 'multiple'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 3)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('16b4e755-0e5d-57ef-9130-af38da75b918', '955867c4-a4da-5f2f-9f32-f174749ade2f', 'Something you know', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('e0bb1e92-5513-5ddb-8044-36d4c0f4df41', '955867c4-a4da-5f2f-9f32-f174749ade2f', 'Something you have', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('8302114d-1eee-5d20-b766-be500acb180c', '955867c4-a4da-5f2f-9f32-f174749ade2f', 'Something you are', true, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('008fe509-15f8-592e-a9ee-bd278c05bed4', '955867c4-a4da-5f2f-9f32-f174749ade2f', 'Something you want', false, 3) on conflict (id) do nothing;

insert into public.assessments (id, course_id, module_id, title, description, kind, status, passing_score, time_limit_minutes, max_attempts, gates_entry_pass, created_by, updated_at)
values ('2b5d39a2-2377-59b1-8e13-e29232e297f8', 'b4584a3f-bcd0-5a1e-be81-2577f820cbfc', '968c97c3-d787-5525-afba-39ea278eea90',
        'Threat Modelling Checkpoint', 'Attack surfaces, threat actors and mitigation strategy.', 'checkpoint'::public.assessment_kind, 'published'::public.assessment_status,
        65, 25, 0, false,
        'd2aabb89-7202-55bb-bec8-1ac21ed47a51', 'Feb 26, 2026')
on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('6d9da885-cffa-5753-8717-3b78ef101155', '2b5d39a2-2377-59b1-8e13-e29232e297f8', 'A zero-day is a vulnerability with no available patch at disclosure time.', 'boolean'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 0)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('2c496df6-cd00-527e-8bd8-e954e4bbfabc', '6d9da885-cffa-5753-8717-3b78ef101155', 'True', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('d7fdb4eb-efca-5966-9c1a-e96665ada8fa', '6d9da885-cffa-5753-8717-3b78ef101155', 'False', false, 1) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('f3d9a98a-78e7-52f6-976e-d2fecf7f98ae', '2b5d39a2-2377-59b1-8e13-e29232e297f8', 'Which attack floods a service to make it unavailable?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 1)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('8bc04e8f-0c82-5d09-81f3-656941db4dc2', 'f3d9a98a-78e7-52f6-976e-d2fecf7f98ae', 'SQL injection', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('b8ef0ab1-cf7d-5650-b72e-448998f02ab2', 'f3d9a98a-78e7-52f6-976e-d2fecf7f98ae', 'Denial of service', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('acf130b6-8d16-5d41-bdd3-d214e64235fd', 'f3d9a98a-78e7-52f6-976e-d2fecf7f98ae', 'Phishing', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('fa3628e1-58e2-5d6c-bca8-7d8997b6e329', 'f3d9a98a-78e7-52f6-976e-d2fecf7f98ae', 'Privilege escalation', false, 3) on conflict (id) do nothing;

insert into public.assessments (id, course_id, module_id, title, description, kind, status, passing_score, time_limit_minutes, max_attempts, gates_entry_pass, created_by, updated_at)
values ('f761b6b3-706a-58db-ba68-9dcb9b23a964', 'b4584a3f-bcd0-5a1e-be81-2577f820cbfc', null,
        'Cybersecurity Certification Exam', 'Final exam. A pass issues the Cybersecurity certificate.', 'final'::public.assessment_kind, 'published'::public.assessment_status,
        80, 60, 2, false,
        'd2aabb89-7202-55bb-bec8-1ac21ed47a51', 'Feb 28, 2026')
on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('f74545cc-9048-5654-863f-8db7452f0b7b', 'f761b6b3-706a-58db-ba68-9dcb9b23a964', 'What does the principle of least privilege require?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        null, 0)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('3fe77dfd-ebab-5a25-9467-2f4e9079708f', 'f74545cc-9048-5654-863f-8db7452f0b7b', 'Users get admin by default', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('2d6d5870-84a8-5b6b-a84b-d98198e551d8', 'f74545cc-9048-5654-863f-8db7452f0b7b', 'Users get only the access they need', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('0a5742f8-be73-5ef1-bccc-84b3e2f01c1c', 'f74545cc-9048-5654-863f-8db7452f0b7b', 'All users share one account', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('2452a8b6-f642-5ef0-b9ea-8908ae578bc7', 'f74545cc-9048-5654-863f-8db7452f0b7b', 'Access is never revoked', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('48a13084-7bb8-5db1-8403-83f82e12f060', 'f761b6b3-706a-58db-ba68-9dcb9b23a964', 'Hashing is reversible; encryption is not.', 'boolean'::public.question_type, 'It is the other way round — encryption is reversible with a key, hashing is one-way.',
        'hard'::public.difficulty, 1, array['Encryption']::text[],
        null, 1)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('78c93101-0370-59ce-8354-44a33d7a39f3', '48a13084-7bb8-5db1-8403-83f82e12f060', 'True', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('f6b1012d-7667-5d15-9d1a-b03c3b4c205d', '48a13084-7bb8-5db1-8403-83f82e12f060', 'False', true, 1) on conflict (id) do nothing;

insert into public.assessments (id, course_id, module_id, title, description, kind, status, passing_score, time_limit_minutes, max_attempts, gates_entry_pass, created_by, updated_at)
values ('f0e86781-bb94-5715-9ff5-fb7eeaa1119f', '1296b991-4846-55c9-bed5-a9d8a3a31ad4', null,
        'Marketing Fundamentals Check', 'Prerequisite for the Digital Marketing cohort.', 'prerequisite'::public.assessment_kind, 'published'::public.assessment_status,
        65, 15, 3, true,
        'a92a75c2-6729-50c6-944c-edac377f65bd', 'Feb 14, 2026')
on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('7de0f0f8-752e-5f13-a677-7860f1554a54', 'f0e86781-bb94-5715-9ff5-fb7eeaa1119f', 'What does SEO stand for?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['SEO']::text[],
        '74b401bf-e3f9-5250-9c9b-f10ae868aaad', 0)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('fa053ae3-86f8-557c-ba56-912d6b83c3fa', '7de0f0f8-752e-5f13-a677-7860f1554a54', 'Search Engine Optimisation', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('da8764bc-f156-5f9f-a434-6049db847099', '7de0f0f8-752e-5f13-a677-7860f1554a54', 'Social Engagement Output', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('7b409009-b446-5772-9dcf-0f1884605df8', '7de0f0f8-752e-5f13-a677-7860f1554a54', 'Site Entry Operation', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('64bf2ae2-4da4-5d60-aac2-06f3ef823a0b', '7de0f0f8-752e-5f13-a677-7860f1554a54', 'Search Entry Order', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('f7f2926a-88b8-5f4b-b798-9417ebeee870', 'f0e86781-bb94-5715-9ff5-fb7eeaa1119f', 'Which metric measures the share of visitors who take a desired action?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Analytics']::text[],
        '74b401bf-e3f9-5250-9c9b-f10ae868aaad', 1)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('bd6aaa42-fea8-5efe-91e3-13cb0d97c3da', 'f7f2926a-88b8-5f4b-b798-9417ebeee870', 'Bounce rate', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('b19f4c53-5076-5560-ad1e-94f551ba3b42', 'f7f2926a-88b8-5f4b-b798-9417ebeee870', 'Conversion rate', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('1d43f558-19d7-5294-b0d9-6e597d887f2f', 'f7f2926a-88b8-5f4b-b798-9417ebeee870', 'Impressions', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('d44683c5-c9a1-5d78-9b57-68a570709e6d', 'f7f2926a-88b8-5f4b-b798-9417ebeee870', 'Reach', false, 3) on conflict (id) do nothing;

insert into public.assessments (id, course_id, module_id, title, description, kind, status, passing_score, time_limit_minutes, max_attempts, gates_entry_pass, created_by, updated_at)
values ('4e09d118-38cb-5330-a540-f4fe75c676e0', 'b4584a3f-bcd0-5a1e-be81-2577f820cbfc', null,
        'Cybersecurity Final Examination', 'The full end-of-course paper. Thirty questions across networking, cryptography, threats and secure design.', 'final'::public.assessment_kind, 'published'::public.assessment_status,
        70, 45, 2, false,
        'd2aabb89-7202-55bb-bec8-1ac21ed47a51', '2026-03-01T09:00:00.000Z')
on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('1c195f11-d50f-5c4c-88df-83f7b1898a79', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Which layer of the OSI model does TCP operate at?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 0)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('94138d5e-07ed-5767-9f00-2068cadbfdb1', '1c195f11-d50f-5c4c-88df-83f7b1898a79', 'Network', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('6e4b6b60-604e-5883-8cf0-ad7c849ce3e9', '1c195f11-d50f-5c4c-88df-83f7b1898a79', 'Transport', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('0e2b965c-e8ac-5ce6-9d43-744f2045a42b', '1c195f11-d50f-5c4c-88df-83f7b1898a79', 'Session', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('a80105eb-6678-5bcd-a328-59ac61216779', '1c195f11-d50f-5c4c-88df-83f7b1898a79', 'Data link', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('7bea3d47-d405-52af-91cb-4c92448f5af2', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'What is the default port for HTTPS?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 1)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('67cb6463-2903-5f54-987b-dfa04f6caf49', '7bea3d47-d405-52af-91cb-4c92448f5af2', '80', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('507c0539-6b22-53ca-9d06-301a123efd8d', '7bea3d47-d405-52af-91cb-4c92448f5af2', '443', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('f74b1878-47aa-5022-a9c4-30899255b88a', '7bea3d47-d405-52af-91cb-4c92448f5af2', '8080', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('dec17aac-ac13-5ee6-88b3-8f685714579e', '7bea3d47-d405-52af-91cb-4c92448f5af2', '22', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('8a897560-ca83-51d0-941f-9a20ececd775', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Which encryption standard is considered strongest here?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 2)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('c184c4ea-cdea-5559-8ff5-b5a8ea91a1b2', '8a897560-ca83-51d0-941f-9a20ececd775', 'DES', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('6bd280ad-110c-5a7d-aedc-a53409d49696', '8a897560-ca83-51d0-941f-9a20ececd775', '3DES', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('ac91bc3d-25da-5fee-a998-10c193a1b8c1', '8a897560-ca83-51d0-941f-9a20ececd775', 'AES-256', true, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('3cb0e93e-fcf8-53da-a79f-20869d271263', '8a897560-ca83-51d0-941f-9a20ececd775', 'RC4', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('cb0ce1ab-6579-5e84-b789-fb90fe63a9d2', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'A firewall''s primary purpose is to filter network traffic.', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 3)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('c974ef85-19c7-5b08-8601-31cb9562c448', 'cb0ce1ab-6579-5e84-b789-fb90fe63a9d2', 'True', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('3633e6d4-4eac-5a64-87c5-a60dafdd780b', 'cb0ce1ab-6579-5e84-b789-fb90fe63a9d2', 'False', false, 1) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('071d4262-6086-5117-ac8e-afd03312813f', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'What does CIA stand for in security?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 4)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('f2ed4b15-8937-5d31-9bdc-745d78fcd8a7', '071d4262-6086-5117-ac8e-afd03312813f', 'Confidentiality, Integrity, Availability', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('ab4df572-feee-5945-8781-bef6c5641a30', '071d4262-6086-5117-ac8e-afd03312813f', 'Control, Identity, Access', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('ed245c0e-37e9-513f-b63d-6d6eecf1d5d1', '071d4262-6086-5117-ac8e-afd03312813f', 'Cipher, Integrity, Audit', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('60a983c9-8f06-529c-8d25-6357ce0a8abe', '071d4262-6086-5117-ac8e-afd03312813f', 'Confidentiality, Identity, Authorisation', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('ec881bd6-2bb9-5ab0-866f-98a054a5ca32', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Which of these is a symmetric cipher?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 5)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('c2b68d99-3509-55ea-96b7-3ea67147e109', 'ec881bd6-2bb9-5ab0-866f-98a054a5ca32', 'RSA', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('1a221bcf-202a-5eff-b553-5db9535008ed', 'ec881bd6-2bb9-5ab0-866f-98a054a5ca32', 'AES', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('e619672d-7d37-58f1-b296-e709c8d76b32', 'ec881bd6-2bb9-5ab0-866f-98a054a5ca32', 'ECDSA', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('7318ea24-c960-5645-8576-1c60323b2f88', 'ec881bd6-2bb9-5ab0-866f-98a054a5ca32', 'Diffie-Hellman', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('567721ac-87cd-5254-b6d7-d308bbd9d65d', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Phishing primarily exploits which weakness?', 'single'::public.question_type, null,
        'hard'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 6)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('dc14b44b-c8b8-5e6e-80f0-a7f3f027d0be', '567721ac-87cd-5254-b6d7-d308bbd9d65d', 'Buffer overflows', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('2746f207-0f6b-5683-afa3-0bdd3a6a5f8b', '567721ac-87cd-5254-b6d7-d308bbd9d65d', 'Human judgement', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('9ef497d3-5d91-54de-a536-016e77bf1d94', '567721ac-87cd-5254-b6d7-d308bbd9d65d', 'Weak ciphers', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('1c9f3870-e073-5a87-a0fe-a1fa0b13ddf3', '567721ac-87cd-5254-b6d7-d308bbd9d65d', 'Open ports', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('4b522e1c-3c19-52ea-9d57-a52990306e48', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'What does a salt protect against?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 7)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('022f1485-c04f-5c5b-93f2-aedc6e3ff6a9', '4b522e1c-3c19-52ea-9d57-a52990306e48', 'Brute force', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('50b07253-aa40-5238-a746-2cd8d965a8ee', '4b522e1c-3c19-52ea-9d57-a52990306e48', 'Rainbow tables', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('7c3858fa-9359-5415-83e6-f42fb11a9b71', '4b522e1c-3c19-52ea-9d57-a52990306e48', 'Packet sniffing', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('78b9be86-cff5-5b36-b27e-727232b759a2', '4b522e1c-3c19-52ea-9d57-a52990306e48', 'SQL injection', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('c0a5ab51-55db-56b8-a58a-ce9b96cb8c5d', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Which HTTP header enforces transport security?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 8)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('c5f2a504-d27c-5f21-bc72-2688591fb6e2', 'c0a5ab51-55db-56b8-a58a-ce9b96cb8c5d', 'X-Frame-Options', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('5a0d1846-2e31-5bc4-b424-31f0c5d686c7', 'c0a5ab51-55db-56b8-a58a-ce9b96cb8c5d', 'Strict-Transport-Security', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('9e91ca4c-9836-5567-aa2e-d2c953ce3aa6', 'c0a5ab51-55db-56b8-a58a-ce9b96cb8c5d', 'Content-Type', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('d5d2d250-c3f5-5368-b89c-0f2b0f946309', 'c0a5ab51-55db-56b8-a58a-ce9b96cb8c5d', 'Accept-Encoding', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('0ae55f19-0f2c-579c-875b-a6d56866cf89', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Select every valid authentication factor.', 'multiple'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 9)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('95ca86c4-f209-538a-a58a-56d61a5c1645', '0ae55f19-0f2c-579c-875b-a6d56866cf89', 'Something you know', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('cb40eccf-2a27-529f-8515-cd889e4b8682', '0ae55f19-0f2c-579c-875b-a6d56866cf89', 'Something you have', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('af04ce42-ceb8-5b7c-8076-2b9fdfbf5a72', '0ae55f19-0f2c-579c-875b-a6d56866cf89', 'Something you are', true, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('81ae3b2a-1634-5749-b6fe-fb5ee7fabb50', '0ae55f19-0f2c-579c-875b-a6d56866cf89', 'Something you want', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('8fd8c787-cf80-5e7a-a9ca-34338960f875', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'What is privilege escalation?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 10)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('8b0c8dd4-2d8d-5682-8828-1dd249e9cb98', '8fd8c787-cf80-5e7a-a9ca-34338960f875', 'Gaining higher access than granted', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('a62550fe-92ef-508f-b7c4-9a1ed55c033c', '8fd8c787-cf80-5e7a-a9ca-34338960f875', 'Resetting a password', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('533beadc-ca1a-505b-9e16-7381bf01149b', '8fd8c787-cf80-5e7a-a9ca-34338960f875', 'Encrypting a disk', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('1acb4685-8d1d-5171-8ef5-10c54c2a357a', '8fd8c787-cf80-5e7a-a9ca-34338960f875', 'Rotating a key', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('24dd9777-53a7-5a97-b8e9-bc34900b660b', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'A VPN guarantees anonymity from all parties.', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 11)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('70ee0737-b189-5b63-9677-4709a515604f', '24dd9777-53a7-5a97-b8e9-bc34900b660b', 'True', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('4024f422-ce18-5947-acad-77f60a79559e', '24dd9777-53a7-5a97-b8e9-bc34900b660b', 'False', true, 1) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('019c5038-f5dc-543d-a0c6-5b8059786322', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Which tool captures network packets?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 12)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('71ae7f0f-fde0-5a16-830c-4a95785d6f50', '019c5038-f5dc-543d-a0c6-5b8059786322', 'Wireshark', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('f9de67a0-dfb8-5f27-8640-885fb506a4e9', '019c5038-f5dc-543d-a0c6-5b8059786322', 'Photoshop', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('2afdabd6-4bd5-5878-a9fb-433ebc64cca4', '019c5038-f5dc-543d-a0c6-5b8059786322', 'Postman', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('45fb23e2-ca10-5e25-93df-8a1e93c7eeac', '019c5038-f5dc-543d-a0c6-5b8059786322', 'Figma', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('69caf08e-d1f7-5a1d-a104-49f63ddcf728', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'What does SQL injection target?', 'single'::public.question_type, null,
        'hard'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 13)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('73d25d31-c5e0-5472-aa22-ce9b70b0d05d', '69caf08e-d1f7-5a1d-a104-49f63ddcf728', 'The database query layer', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('fab7c776-8625-5b15-bd6f-5af74678a441', '69caf08e-d1f7-5a1d-a104-49f63ddcf728', 'The CSS renderer', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('7cef3079-5890-518c-9402-7b8bab308fc5', '69caf08e-d1f7-5a1d-a104-49f63ddcf728', 'The DNS resolver', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('9e6b7691-2707-534f-a3d4-ff614686c72b', '69caf08e-d1f7-5a1d-a104-49f63ddcf728', 'The file system', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('5fc2a9bc-d758-542b-ba25-1b916c2088c8', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Which is a denial-of-service indicator?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 14)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('173d0ce9-6e49-5919-bbef-e21fb4030b6f', '5fc2a9bc-d758-542b-ba25-1b916c2088c8', 'Sudden traffic flood', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('4b9215f8-1f8f-5880-bb6a-071729cd242e', '5fc2a9bc-d758-542b-ba25-1b916c2088c8', 'Slow typing', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('ea29f5b2-f225-57e6-8043-dacf84267a56', '5fc2a9bc-d758-542b-ba25-1b916c2088c8', 'Low disk space', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('8ecaa67e-a2f1-5331-9264-e350dd5eee5a', '5fc2a9bc-d758-542b-ba25-1b916c2088c8', 'Expired cookie', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('cf77c383-229a-5eb8-9bca-d656833e3d58', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'What is the purpose of a WAF?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 15)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('5de76070-917c-5063-b78f-8db79bbe3e25', 'cf77c383-229a-5eb8-9bca-d656833e3d58', 'Filter web application traffic', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('025430b1-79d4-55d5-a3db-4c1fd39d02ff', 'cf77c383-229a-5eb8-9bca-d656833e3d58', 'Compress images', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('58264069-b7bc-5d38-85c0-017e6d6f03a3', 'cf77c383-229a-5eb8-9bca-d656833e3d58', 'Cache DNS', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('4c9320d0-d150-5741-9d53-59944dc90f3d', 'cf77c383-229a-5eb8-9bca-d656833e3d58', 'Balance CPU load', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('9b333225-6f7f-5d19-b881-4281eacaf2a2', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Two-factor authentication requires two of the same factor type.', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 16)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('52d460a8-8c6b-51dc-aa8a-5914c708c73e', '9b333225-6f7f-5d19-b881-4281eacaf2a2', 'True', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('1f20e2bd-9bd2-5b41-871a-86a3a0c6d512', '9b333225-6f7f-5d19-b881-4281eacaf2a2', 'False', true, 1) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('6b6dd721-2715-51b1-baa5-9e65694711ec', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Which describes a zero-day?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 17)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('27f2e7de-049f-59b1-b87f-32c36d8b63ae', '6b6dd721-2715-51b1-baa5-9e65694711ec', 'A patched bug', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('cce95c65-9d82-581f-a9ed-e507ad1511ce', '6b6dd721-2715-51b1-baa5-9e65694711ec', 'A vulnerability with no patch yet', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('d3c6a54f-58fe-5897-891e-1bfa8b19671e', '6b6dd721-2715-51b1-baa5-9e65694711ec', 'An expired certificate', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('007e124d-5cc0-5a26-94d3-6fa9c8985ebe', '6b6dd721-2715-51b1-baa5-9e65694711ec', 'A retired protocol', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('3d04c226-97fc-5876-a2e8-b4888932f663', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'What does hashing provide?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 18)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('407fa2c8-fe31-5f82-8fbb-101e003b11b6', '3d04c226-97fc-5876-a2e8-b4888932f663', 'Reversible transformation', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('08efc02e-7a3c-5288-9837-aef280dbe68c', '3d04c226-97fc-5876-a2e8-b4888932f663', 'One-way fingerprint', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('8778b360-3283-5d1c-8935-3248b6baae66', '3d04c226-97fc-5876-a2e8-b4888932f663', 'Compression', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('d13b5f67-a109-5eaf-a31b-644fe3093c9f', '3d04c226-97fc-5876-a2e8-b4888932f663', 'Encoding', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('b50af431-1f00-5fa3-9008-5d4e6a63950b', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Select every common malware category.', 'multiple'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 19)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('abe40869-2d98-532b-a64c-ec5cb108c66f', 'b50af431-1f00-5fa3-9008-5d4e6a63950b', 'Ransomware', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('df839cbd-449d-519a-bb13-ac44106d84f9', 'b50af431-1f00-5fa3-9008-5d4e6a63950b', 'Spyware', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('556174fe-12ae-586f-8720-845430af9438', 'b50af431-1f00-5fa3-9008-5d4e6a63950b', 'Worm', true, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('9b0046cd-c6f0-509a-b6d1-012afd44213d', 'b50af431-1f00-5fa3-9008-5d4e6a63950b', 'Firewall', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('7ed673b4-5790-59d8-9b4c-f0e7e2755ed1', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Which protocol secures email in transit?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 20)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('c6986df0-51a0-5503-8932-bbbfceb47fd7', '7ed673b4-5790-59d8-9b4c-f0e7e2755ed1', 'SMTP', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('02c01d0c-235d-5d60-808d-738c360d9eac', '7ed673b4-5790-59d8-9b4c-f0e7e2755ed1', 'STARTTLS', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('7070af57-40da-5189-85f7-46d64bff9387', '7ed673b4-5790-59d8-9b4c-f0e7e2755ed1', 'POP3', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('146d0780-f499-57e1-823c-91400ca148b8', '7ed673b4-5790-59d8-9b4c-f0e7e2755ed1', 'IMAP', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('97191cbf-d4ee-59ba-940d-80f07fc3be39', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'What is lateral movement?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 21)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('d787bc4e-9661-58b7-8a9b-91bcf5eea801', '97191cbf-d4ee-59ba-940d-80f07fc3be39', 'Spreading across systems post-compromise', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('60592ce2-4456-5b08-adeb-9fe5960a4d04', '97191cbf-d4ee-59ba-940d-80f07fc3be39', 'Rebooting a server', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('c60a1086-85ee-5b87-a75f-a959df5b8608', '97191cbf-d4ee-59ba-940d-80f07fc3be39', 'Rotating logs', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('1ea0056c-5c93-5c55-a017-83428bcd26c6', '97191cbf-d4ee-59ba-940d-80f07fc3be39', 'Scaling horizontally', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('94fd5c20-af5c-5b29-9e52-ad04ef5efd43', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'A certificate authority''s role is to vouch for identity.', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 22)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('c6f9da44-5fc2-5e74-8db0-1441328ebef0', '94fd5c20-af5c-5b29-9e52-ad04ef5efd43', 'True', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('fb561482-ba6d-5b1c-8147-e0f1011eb710', '94fd5c20-af5c-5b29-9e52-ad04ef5efd43', 'False', false, 1) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('71145b1f-6ef8-53a4-a05b-43704e023968', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Which is a secure password practice?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 23)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('73c40f72-2a62-5300-a272-eb1a54cfce71', '71145b1f-6ef8-53a4-a05b-43704e023968', 'Reuse across sites', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('69498c6a-3424-5459-a732-817db763bf74', '71145b1f-6ef8-53a4-a05b-43704e023968', 'Long unique passphrases', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('4ec14b2b-e136-5f50-aaeb-2f929b93c10e', '71145b1f-6ef8-53a4-a05b-43704e023968', 'Write on a sticky note', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('5d366039-b2ec-5352-893e-fa80c966ea44', '71145b1f-6ef8-53a4-a05b-43704e023968', 'Share with the team', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('8a019ec7-6242-5efb-ae2c-fb838f2f4e2d', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'What does IDS stand for?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 24)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('f4edb3d4-ec94-5bdd-af9d-bd4e95220aaf', '8a019ec7-6242-5efb-ae2c-fb838f2f4e2d', 'Intrusion Detection System', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('ad6fd393-c7f4-56a0-a2cb-d3cbf8578656', '8a019ec7-6242-5efb-ae2c-fb838f2f4e2d', 'Internal Data Store', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('b5bc3726-33a5-5227-ac76-06235857e29f', '8a019ec7-6242-5efb-ae2c-fb838f2f4e2d', 'Identity Directory Service', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('57e40dc3-2a95-52c2-b3bb-dd6897874bd5', '8a019ec7-6242-5efb-ae2c-fb838f2f4e2d', 'Integrated Defence Suite', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('833ec969-a94a-521d-b69d-368cbd09d44b', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Which reduces the blast radius of a breach?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 25)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('dd8ca1aa-9b9d-5bf8-b491-9397ffd03693', '833ec969-a94a-521d-b69d-368cbd09d44b', 'Flat networks', false, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('13747acd-8b2f-57a1-9443-a0c7321edb21', '833ec969-a94a-521d-b69d-368cbd09d44b', 'Network segmentation', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('d3971051-31bd-5c0f-971c-2345c4199e2c', '833ec969-a94a-521d-b69d-368cbd09d44b', 'Shared credentials', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('39f04239-cec2-5e16-92e1-7e568fec2f84', '833ec969-a94a-521d-b69d-368cbd09d44b', 'Disabled logging', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('b86d3cfe-f2d8-5a09-acc1-a9500b2c1532', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'What is social engineering?', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 26)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('10db67c1-2bee-5590-a52f-20532048f041', 'b86d3cfe-f2d8-5a09-acc1-a9500b2c1532', 'Manipulating people to gain access', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('e667b992-f886-5846-b148-e9b8c2f47703', 'b86d3cfe-f2d8-5a09-acc1-a9500b2c1532', 'Refactoring code', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('bb49fa80-fdce-55ca-8124-65014de6b4fb', 'b86d3cfe-f2d8-5a09-acc1-a9500b2c1532', 'Tuning a database', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('fb44552a-db68-5e7f-b8b4-8780e2c9d096', 'b86d3cfe-f2d8-5a09-acc1-a9500b2c1532', 'Designing a network', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('e0b01665-216a-5671-927b-ddf008639f55', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Select every principle of secure design.', 'multiple'::public.question_type, null,
        'hard'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 27)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('6c95b2e7-c8ab-55eb-8d0b-85bb3dbbc284', 'e0b01665-216a-5671-927b-ddf008639f55', 'Least privilege', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('38079f5a-0fc4-5492-a841-826f5a42d9f5', 'e0b01665-216a-5671-927b-ddf008639f55', 'Defence in depth', true, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('8fddbf36-4f9b-53e4-ad1f-b402c58363d0', 'e0b01665-216a-5671-927b-ddf008639f55', 'Fail securely', true, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('1a81d63e-02b7-53d9-bcde-3869a03d932d', 'e0b01665-216a-5671-927b-ddf008639f55', 'Security through obscurity', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('a0eb6cd2-f845-56de-ae7e-5457832a94fb', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Which log is most useful after a breach?', 'single'::public.question_type, null,
        'medium'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 28)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('e3168836-ee71-5bf7-9eca-ba3f7c8e5495', 'a0eb6cd2-f845-56de-ae7e-5457832a94fb', 'Audit trail', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('b0be5256-4692-55c8-9849-e657e6dd0fdb', 'a0eb6cd2-f845-56de-ae7e-5457832a94fb', 'Marketing analytics', false, 1) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('d254e832-33ea-5f86-ad05-195226cde5ea', 'a0eb6cd2-f845-56de-ae7e-5457832a94fb', 'Build log', false, 2) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('6faf98d0-4106-576e-8e81-c54ce6e10966', 'a0eb6cd2-f845-56de-ae7e-5457832a94fb', 'Changelog', false, 3) on conflict (id) do nothing;
insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values ('5d012451-1f63-5052-a62c-3427d073ff98', '4e09d118-38cb-5330-a540-f4fe75c676e0', 'Patching is a preventive control.', 'single'::public.question_type, null,
        'easy'::public.difficulty, 1, array['Security']::text[],
        '968c97c3-d787-5525-afba-39ea278eea90', 29)
on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('f68425ee-4a5b-57d9-8a98-c380a6eac9e8', '5d012451-1f63-5052-a62c-3427d073ff98', 'True', true, 0) on conflict (id) do nothing;
insert into public.question_options (id, question_id, label, is_correct, position) values ('a7d9ba20-dc97-5427-b1e7-1514eb797cee', '5d012451-1f63-5052-a62c-3427d073ff98', 'False', false, 1) on conflict (id) do nothing;


-- ────────────────────────────────────────────────────────────────────────────
-- Module items
-- ────────────────────────────────────────────────────────────────────────────
-- Emitted after assessments so quiz items can reference them.

insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('311bf053-6898-5315-9de6-0e3977062350', '7d341255-a8ef-56ff-a45e-22795a1f2768', 'Project Overview Video', 'video'::public.module_item_type,
        'https://www.w3schools.com/html/mov_bbb.mp4', null, 0)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('8aac3000-8dae-5580-890d-c0ad97feb6cc', '7d341255-a8ef-56ff-a45e-22795a1f2768', 'Tech Roadmap PDF', 'pdf'::public.module_item_type,
        'https://morth.nic.in/sites/default/files/dd12-13_0.pdf', null, 1)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('18ecfb7b-5df3-5528-b609-fe42b2651e10', '7d341255-a8ef-56ff-a45e-22795a1f2768', 'Web Foundation Checkpoint', 'quiz'::public.module_item_type,
        null, '873e4a25-652f-5e92-90aa-f729dd1fc890', 2)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('3d7f8993-a2e6-52d8-8e5e-c876d845f3f2', '8a903244-6a42-5a16-9a38-0a07757c97c1', 'The CSS Box Model', 'video'::public.module_item_type,
        'https://www.w3schools.com/html/mov_bbb.mp4', null, 0)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('767cb459-6711-5c40-a8bf-898aca8af47b', '8a903244-6a42-5a16-9a38-0a07757c97c1', 'Flexbox & Grid Reference', 'pdf'::public.module_item_type,
        'https://morth.nic.in/sites/default/files/dd12-13_0.pdf', null, 1)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('7dd347aa-5e11-5781-aa01-6bca51b8d411', '8a903244-6a42-5a16-9a38-0a07757c97c1', 'Responsive Patterns', 'document'::public.module_item_type,
        null, null, 2)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('38aa3199-6479-596f-b74b-29056c6609b2', 'e435e266-3217-5981-93c8-139ce95ae822', 'Variables, Types & Scope', 'video'::public.module_item_type,
        'https://www.w3schools.com/html/mov_bbb.mp4', null, 0)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('4bc8b9cf-8178-5cd7-9c53-e371456e8ac2', 'e435e266-3217-5981-93c8-139ce95ae822', 'Functions & Control Flow', 'video'::public.module_item_type,
        'https://www.w3schools.com/html/mov_bbb.mp4', null, 1)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('f7a5ec76-e7ee-566e-9c2d-5af8712c1cef', 'e435e266-3217-5981-93c8-139ce95ae822', 'Tech Odyssey Capstone', 'quiz'::public.module_item_type,
        null, '7a66d1aa-ca17-5d34-9f1d-54594cba3301', 2)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('69971f85-6de7-5c30-8d9d-5f0cee6ee135', 'e3c86a31-a93b-5e58-9c9d-b2728d9dcbc6', 'Flexbox & Grid Video', 'video'::public.module_item_type,
        'https://www.w3schools.com/html/mov_bbb.mp4', null, 0)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('563fa2ea-edaa-5b81-bcf1-6b207330218f', '292b3965-f7bd-5506-b550-3ff5733632f5', 'Syntax Video', 'video'::public.module_item_type,
        'https://www.w3schools.com/html/mov_bbb.mp4', null, 0)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('1351965e-11f6-54c9-b493-71b23adb951c', '292b3965-f7bd-5506-b550-3ff5733632f5', 'Setting Up Your Environment', 'pdf'::public.module_item_type,
        'https://morth.nic.in/sites/default/files/dd12-13_0.pdf', null, 1)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('a50123dc-509e-5c65-8709-0bc56ac32ec8', '6069c09e-8d12-57ec-abaf-0141671328ec', 'Loops & Conditionals', 'video'::public.module_item_type,
        'https://www.w3schools.com/html/mov_bbb.mp4', null, 0)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('147ffb93-2459-5ff2-95b2-b13a1d87c856', '6069c09e-8d12-57ec-abaf-0141671328ec', 'Lists, Tuples & Dictionaries', 'video'::public.module_item_type,
        'https://www.w3schools.com/html/mov_bbb.mp4', null, 1)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('46220ccf-4d30-52e3-8d9a-7da0ee02c2bc', '6069c09e-8d12-57ec-abaf-0141671328ec', 'Control Flow Checkpoint', 'quiz'::public.module_item_type,
        null, '0da77ac4-5265-526e-a4ed-5fe3045df8e7', 2)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('9a9626ea-3486-5106-8008-84c963e06b91', '872c5ab2-5dec-5061-aa13-dec7f58cdeba', 'Exam Preparation Guide', 'pdf'::public.module_item_type,
        'https://morth.nic.in/sites/default/files/dd12-13_0.pdf', null, 0)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('82e797dd-d7cc-56fa-b1fe-4804b8d1002e', '872c5ab2-5dec-5061-aa13-dec7f58cdeba', 'Python Certification Exam', 'quiz'::public.module_item_type,
        null, '207e7804-3038-530d-8174-4d70e3325f35', 1)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('14b63ba8-48af-5cd3-b584-841d0cdd6217', '205cf578-2285-5f43-abbf-1d3eeaed7ac5', 'OS Basics Video', 'video'::public.module_item_type,
        'https://www.w3schools.com/html/mov_bbb.mp4', null, 0)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('729f406d-c379-5c37-8cd0-ff112d067e38', '205cf578-2285-5f43-abbf-1d3eeaed7ac5', 'Productivity Tools Final', 'quiz'::public.module_item_type,
        null, '0a2d6c51-0499-5188-809f-d80fe71a12f1', 1)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('adde9c86-08d9-5797-980e-0d48d317ed33', 'a877ed61-c220-5ce4-b952-9600471a2375', 'Mapping Video', 'video'::public.module_item_type,
        'https://www.w3schools.com/html/mov_bbb.mp4', null, 0)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('95207145-d982-54ac-bcdb-f7e74c047766', 'be221ce8-0591-5c71-9e40-4ee182565039', 'Power BI Basics', 'video'::public.module_item_type,
        'https://www.w3schools.com/html/mov_bbb.mp4', null, 0)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('80bfb6cf-22cc-50cb-ae74-1cf0fd5bde7e', 'e7bec537-c63c-56ad-90c7-3c507c9256bd', 'Excel Formulas', 'video'::public.module_item_type,
        'https://www.w3schools.com/html/mov_bbb.mp4', null, 0)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('84207853-bf67-54f1-9e68-6b2e74f801c0', '5e8f2db5-e5d9-5e2a-b0fc-0ee657528c98', 'Teams & Zoom Video', 'video'::public.module_item_type,
        'https://www.w3schools.com/html/mov_bbb.mp4', null, 0)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('038e621d-9dae-526c-b451-c5bb5b6e7569', 'a2ccde09-4ce1-56d1-93e6-9a6d2ed6b6b0', 'Prompt Engineering', 'video'::public.module_item_type,
        'https://www.w3schools.com/html/mov_bbb.mp4', null, 0)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('81a86b41-c3fa-5d4b-9a9b-815c8e1e6a97', 'afcb7d0a-9910-52b9-ba55-4e27de994ab5', 'Routing Intro', 'video'::public.module_item_type,
        'https://www.w3schools.com/html/mov_bbb.mp4', null, 0)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('7dec8796-a6ad-5ac9-b725-e5a90dee7bf1', 'c9fbe03f-bdfb-5cdc-acef-ef22b4de54ee', 'IP Addressing', 'video'::public.module_item_type,
        'https://www.w3schools.com/html/mov_bbb.mp4', null, 0)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('5e6b7a08-b636-5fdb-a385-ac4add9d432f', 'fa4bd05a-5d66-5eea-ac1a-239a65739562', 'Pandas Intro', 'video'::public.module_item_type,
        'https://www.w3schools.com/html/mov_bbb.mp4', null, 0)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('6db064fb-4922-546f-bc5d-0cefa5a749fe', '968c97c3-d787-5525-afba-39ea278eea90', 'Auth Systems', 'video'::public.module_item_type,
        'https://www.w3schools.com/html/mov_bbb.mp4', null, 0)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('5332b0f4-944d-5594-a7ae-643c28000013', '968c97c3-d787-5525-afba-39ea278eea90', 'Threat Modelling Checkpoint', 'quiz'::public.module_item_type,
        null, '2b5d39a2-2377-59b1-8e13-e29232e297f8', 1)
on conflict (id) do nothing;
insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values ('cd1a312b-5b73-5366-8e28-93a12e4b4c2a', '74b401bf-e3f9-5250-9c9b-f10ae868aaad', 'Search Engines', 'video'::public.module_item_type,
        'https://www.w3schools.com/html/mov_bbb.mp4', null, 0)
on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- Enrollments
-- ────────────────────────────────────────────────────────────────────────────
-- The demo student's paid courses come from purchasedCourseIds. Other
-- learners get a deterministic spread so the admin analytics screens and
-- instructor rosters are not empty.

insert into public.enrollments (id, course_id, student_id, status) values ('7b6ce0df-81ff-5be7-9b90-fd9ac070c2e5', '577ea935-461d-53d4-b88b-52ee31473d1b', '3639ec96-9d24-56d6-af88-9a6ce62ea66a', 'active'::public.enrollment_status) on conflict (course_id, student_id) do nothing;
insert into public.enrollments (id, course_id, student_id, status) values ('6969828a-c4c1-5ee1-82bd-74104e80d10d', 'e56df1b0-d187-50bb-911c-a77deba8e2dd', '3639ec96-9d24-56d6-af88-9a6ce62ea66a', 'active'::public.enrollment_status) on conflict (course_id, student_id) do nothing;
insert into public.enrollments (id, course_id, student_id, status) values ('a5c99498-f241-55f2-a24e-772e0717dbd5', 'b4584a3f-bcd0-5a1e-be81-2577f820cbfc', '3639ec96-9d24-56d6-af88-9a6ce62ea66a', 'active'::public.enrollment_status) on conflict (course_id, student_id) do nothing;
insert into public.enrollments (id, course_id, student_id, status) values ('4f3cff89-b427-58d5-a78b-5cd66f2f347a', '577ea935-461d-53d4-b88b-52ee31473d1b', '03b70a2c-70d5-538f-8c6c-474b2633fe0b', 'active'::public.enrollment_status) on conflict (course_id, student_id) do nothing;
insert into public.enrollments (id, course_id, student_id, status) values ('72cca3ff-2a2f-5382-a248-2ac89098cc79', 'a011cbb4-addf-58ac-b215-075d496c936f', '03b70a2c-70d5-538f-8c6c-474b2633fe0b', 'active'::public.enrollment_status) on conflict (course_id, student_id) do nothing;
insert into public.enrollments (id, course_id, student_id, status) values ('e3a32a72-80d6-53d6-a8b2-941cee632f05', 'e56df1b0-d187-50bb-911c-a77deba8e2dd', '03b70a2c-70d5-538f-8c6c-474b2633fe0b', 'active'::public.enrollment_status) on conflict (course_id, student_id) do nothing;
insert into public.enrollments (id, course_id, student_id, status) values ('f7b45588-51bb-5318-bd4e-46ac20765f82', '556e576c-a311-5e54-bf14-34d9d37c7184', '63fb03c7-54ac-597b-8a36-70d65756dd74', 'active'::public.enrollment_status) on conflict (course_id, student_id) do nothing;
insert into public.enrollments (id, course_id, student_id, status) values ('d2cbf90d-2201-513b-a96c-27c12f718639', '829f6967-e9a3-5172-9892-963a17018cb2', '63fb03c7-54ac-597b-8a36-70d65756dd74', 'active'::public.enrollment_status) on conflict (course_id, student_id) do nothing;
insert into public.enrollments (id, course_id, student_id, status) values ('2d2b0094-5dc9-5081-ab9e-ee23b8f42044', '6c7571e3-9a65-5a1c-abf4-4161116d4da3', 'ebd94036-72f2-5d8b-8711-2a9be4ad36ea', 'pending'::public.enrollment_status) on conflict (course_id, student_id) do nothing;
insert into public.enrollments (id, course_id, student_id, status) values ('1427e63f-f1f5-5b59-bf88-a37857866cca', '466129d2-af54-51a4-b4f4-41b16cee9eb9', '3d060f89-0b05-5c52-a2e1-bff3626a1659', 'active'::public.enrollment_status) on conflict (course_id, student_id) do nothing;
insert into public.enrollments (id, course_id, student_id, status) values ('077c79c8-6f0b-501e-928f-95b49c6d92c7', 'd14b913d-d2d5-575b-a6d5-d9f012c0d6cf', '3d060f89-0b05-5c52-a2e1-bff3626a1659', 'active'::public.enrollment_status) on conflict (course_id, student_id) do nothing;
insert into public.enrollments (id, course_id, student_id, status) values ('f007beab-82dc-5263-a2a6-6d1b9787fdde', 'e4df4b90-8a0a-5e3c-9e30-a7c0d053a927', '3d060f89-0b05-5c52-a2e1-bff3626a1659', 'active'::public.enrollment_status) on conflict (course_id, student_id) do nothing;
insert into public.enrollments (id, course_id, student_id, status) values ('5f5e3149-e2b4-5b88-b622-1d20741e2b31', '1297a671-9773-5184-b07d-5038714a7d33', '3d060f89-0b05-5c52-a2e1-bff3626a1659', 'active'::public.enrollment_status) on conflict (course_id, student_id) do nothing;
insert into public.enrollments (id, course_id, student_id, status) values ('6e6b082d-4549-5c17-9f4a-f409e67134b3', 'e892e7df-1cfb-5379-9b12-924c9812a944', '72783d8a-6eb0-5adc-bd2a-262e3d750132', 'active'::public.enrollment_status) on conflict (course_id, student_id) do nothing;
insert into public.enrollments (id, course_id, student_id, status) values ('520a39a9-69f2-571d-ba09-65639cb26512', '505771c5-aa1d-5a7b-9173-395eaee4fc14', '72783d8a-6eb0-5adc-bd2a-262e3d750132', 'active'::public.enrollment_status) on conflict (course_id, student_id) do nothing;
insert into public.enrollments (id, course_id, student_id, status) values ('4b6a5a96-f8f1-5a50-9c91-457dacd34308', 'b4584a3f-bcd0-5a1e-be81-2577f820cbfc', 'e9f3c827-bef8-52b0-9dbf-f5efa33710f0', 'active'::public.enrollment_status) on conflict (course_id, student_id) do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- Assessment attempts
-- ────────────────────────────────────────────────────────────────────────────
insert into public.assessment_attempts (id, assessment_id, course_id, student_id, attempt_number, score, points_earned, points_possible, passed, started_at, submitted_at, duration_seconds)
values ('814cb855-9d36-5348-9d05-48aa517f8473', 'fb3b8c2c-9f92-51d3-99d0-2a10bfb0c87b', 'e56df1b0-d187-50bb-911c-a77deba8e2dd', '3639ec96-9d24-56d6-af88-9a6ce62ea66a',
        1, 100, 4, 4, true,
        '2026-02-20T10:24:00.000Z'::timestamptz - make_interval(secs => 412), '2026-02-20T10:24:00.000Z', 412)
on conflict (assessment_id, student_id, attempt_number) do nothing;
insert into public.assessment_attempts (id, assessment_id, course_id, student_id, attempt_number, score, points_earned, points_possible, passed, started_at, submitted_at, duration_seconds)
values ('91ed7b3f-a961-5496-83d5-c9777dc2540e', 'ee51b273-4c43-55a7-a17a-10ab033fb324', '577ea935-461d-53d4-b88b-52ee31473d1b', '3639ec96-9d24-56d6-af88-9a6ce62ea66a',
        1, 40, 2, 5, false,
        '2026-02-21T14:02:00.000Z'::timestamptz - make_interval(secs => 388), '2026-02-21T14:02:00.000Z', 388)
on conflict (assessment_id, student_id, attempt_number) do nothing;
insert into public.assessment_attempts (id, assessment_id, course_id, student_id, attempt_number, score, points_earned, points_possible, passed, started_at, submitted_at, duration_seconds)
values ('98dedc9c-87cc-5478-a552-4aeec50995c0', 'ee51b273-4c43-55a7-a17a-10ab033fb324', '577ea935-461d-53d4-b88b-52ee31473d1b', '3639ec96-9d24-56d6-af88-9a6ce62ea66a',
        2, 80, 4, 5, true,
        '2026-02-22T09:15:00.000Z'::timestamptz - make_interval(secs => 305), '2026-02-22T09:15:00.000Z', 305)
on conflict (assessment_id, student_id, attempt_number) do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- Physical sessions, entry passes and attendance
-- ────────────────────────────────────────────────────────────────────────────
insert into public.course_sessions (id, course_id, title, session_date, starts_at, ends_at, venue_name, room_number, instructor_id)
values ('10970f19-6c51-5ebb-9ee0-345909c6ca00', '577ea935-461d-53d4-b88b-52ee31473d1b', 'Physical Security Workshop 2026', '2026-03-15'::date, '10:00:00'::time, '14:00:00'::time,
        'ITeMS Building, University of Ibadan', 'Lab 01 (Ground Floor)', 'd2aabb89-7202-55bb-bec8-1ac21ed47a51')
on conflict (id) do nothing;
insert into public.course_sessions (id, course_id, title, session_date, starts_at, ends_at, venue_name, room_number, instructor_id)
values ('210ef37b-2d12-50af-b93d-83be5925698c', 'e56df1b0-d187-50bb-911c-a77deba8e2dd', 'LMS Onboarding Session', '2026-04-10'::date, '09:00:00'::time, '11:30:00'::time,
        'Virtual Room 4 (Google Meet)', 'N/A (Virtual)', 'd2aabb89-7202-55bb-bec8-1ac21ed47a51')
on conflict (id) do nothing;
insert into public.course_sessions (id, course_id, title, session_date, starts_at, ends_at, venue_name, room_number, instructor_id)
values ('18474894-7e95-5458-8fea-a54b13cc2cea', 'b4584a3f-bcd0-5a1e-be81-2577f820cbfc', 'Cybersecurity Hands-on Lab', '2026-03-28'::date, '13:00:00'::time, '18:00:00'::time,
        'Tech Lab 3, ITeMS Building', 'Level 2, Room 204', 'd2aabb89-7202-55bb-bec8-1ac21ed47a51')
on conflict (id) do nothing;
insert into public.course_sessions (id, course_id, title, session_date, starts_at, ends_at, venue_name, room_number, instructor_id)
values ('d4afaaf0-1eb3-5d46-96aa-4aaf8502f1e2', '556e576c-a311-5e54-bf14-34d9d37c7184', 'Digital Literacy Induction', '2026-01-12'::date, '12:00:00'::time, '15:00:00'::time,
        'Conference Hall, UI', 'Main Auditorium', 'a92a75c2-6729-50c6-944c-edac377f65bd')
on conflict (id) do nothing;
insert into public.course_sessions (id, course_id, title, session_date, starts_at, ends_at, venue_name, room_number, instructor_id)
values ('1f8cd95a-1804-5171-b8fe-7d43276b585c', '829f6967-e9a3-5172-9892-963a17018cb2', 'Spatial Analysis Bootcamp', '2025-12-05'::date, '08:00:00'::time, '17:00:00'::time,
        'Tech Lab 3, ITeMS Building', 'Level 2, Room 204', 'd2aabb89-7202-55bb-bec8-1ac21ed47a51')
on conflict (id) do nothing;
insert into public.course_sessions (id, course_id, title, session_date, starts_at, ends_at, venue_name, room_number, instructor_id)
values ('a535ab2b-d9fa-5d7a-84e8-fb10f01d8ea0', '577ea935-461d-53d4-b88b-52ee31473d1b', 'Physical Security Workshop 2026', '2026-02-28'::date, '10:00:00'::time, '14:00:00'::time,
        'Training Lab 1, ITeMS Building', '', 'd2aabb89-7202-55bb-bec8-1ac21ed47a51')
on conflict (id) do nothing;
insert into public.course_sessions (id, course_id, title, session_date, starts_at, ends_at, venue_name, room_number, instructor_id)
values ('dc028eed-ab12-53c0-87f6-232fefc7b35e', 'e56df1b0-d187-50bb-911c-a77deba8e2dd', 'Python Programming — Lab Session', '2026-02-27'::date, '14:00:00'::time, '17:00:00'::time,
        'Tech Lab 3, ITeMS Building', '', 'd2aabb89-7202-55bb-bec8-1ac21ed47a51')
on conflict (id) do nothing;
insert into public.course_sessions (id, course_id, title, session_date, starts_at, ends_at, venue_name, room_number, instructor_id)
values ('9a218789-7dbf-5399-a817-7ed4af1c63aa', '556e576c-a311-5e54-bf14-34d9d37c7184', 'Digital Literacy Induction', '2026-02-26'::date, '09:00:00'::time, '12:00:00'::time,
        'Conference Hall, University of Ibadan', '', 'a92a75c2-6729-50c6-944c-edac377f65bd')
on conflict (id) do nothing;

insert into public.entry_passes (id, session_id, student_id, pass_code, status, issued_at)
values ('11f40cad-f986-59f3-8961-308464ee2631', '10970f19-6c51-5ebb-9ee0-345909c6ca00', '3639ec96-9d24-56d6-af88-9a6ce62ea66a', 'PSW-UI-2026-001', 'active'::public.pass_status, '2026-03-15'::timestamptz)
on conflict (session_id, student_id) do nothing;
insert into public.entry_passes (id, session_id, student_id, pass_code, status, issued_at)
values ('306b3f77-0345-5b79-88e1-eb6ca7d5dea2', '210ef37b-2d12-50af-b93d-83be5925698c', '3639ec96-9d24-56d6-af88-9a6ce62ea66a', 'LOS-VIRT-2026-045', 'active'::public.pass_status, '2026-04-10'::timestamptz)
on conflict (session_id, student_id) do nothing;
insert into public.entry_passes (id, session_id, student_id, pass_code, status, issued_at)
values ('f08ae728-3623-5c66-8948-6adad4f5f2e8', '18474894-7e95-5458-8fea-a54b13cc2cea', '3639ec96-9d24-56d6-af88-9a6ce62ea66a', 'CSL-UI-2026-112', 'active'::public.pass_status, '2026-03-28'::timestamptz)
on conflict (session_id, student_id) do nothing;
insert into public.entry_passes (id, session_id, student_id, pass_code, status, issued_at)
values ('b1442954-61e1-552d-8aec-115358e1dd59', 'd4afaaf0-1eb3-5d46-96aa-4aaf8502f1e2', '3639ec96-9d24-56d6-af88-9a6ce62ea66a', 'DLI-UI-2026-001', 'past'::public.pass_status, '2026-01-12'::timestamptz)
on conflict (session_id, student_id) do nothing;
insert into public.entry_passes (id, session_id, student_id, pass_code, status, issued_at)
values ('f00edb35-2bf9-54bf-94f3-1e5da44ffcb6', '1f8cd95a-1804-5171-b8fe-7d43276b585c', '3639ec96-9d24-56d6-af88-9a6ce62ea66a', 'SAB-UI-2025-088', 'past'::public.pass_status, '2025-12-05'::timestamptz)
on conflict (session_id, student_id) do nothing;

insert into public.attendance_records (id, session_id, student_id, status, method, check_in_time, marked_by)
values ('b8f197b2-a78f-5980-a0d8-40aca5f1e8bd', 'a535ab2b-d9fa-5d7a-84e8-fb10f01d8ea0', '03b70a2c-70d5-538f-8c6c-474b2633fe0b', 'present'::public.attendance_status,
        'qr'::public.attendance_method, '2026-02-28T09:55:00Z', 'd2aabb89-7202-55bb-bec8-1ac21ed47a51')
on conflict (session_id, student_id) do nothing;
insert into public.attendance_records (id, session_id, student_id, status, method, check_in_time, marked_by)
values ('6560c973-a398-597b-afb5-8e4320bc6982', 'a535ab2b-d9fa-5d7a-84e8-fb10f01d8ea0', '63fb03c7-54ac-597b-8a36-70d65756dd74', 'present'::public.attendance_status,
        'qr'::public.attendance_method, '2026-02-28T10:02:00Z', 'd2aabb89-7202-55bb-bec8-1ac21ed47a51')
on conflict (session_id, student_id) do nothing;
insert into public.attendance_records (id, session_id, student_id, status, method, check_in_time, marked_by)
values ('096dc539-b664-5bb9-98fa-82e01d6030d7', 'a535ab2b-d9fa-5d7a-84e8-fb10f01d8ea0', 'ebd94036-72f2-5d8b-8711-2a9be4ad36ea', 'absent'::public.attendance_status,
        'manual'::public.attendance_method, null, 'd2aabb89-7202-55bb-bec8-1ac21ed47a51')
on conflict (session_id, student_id) do nothing;
insert into public.attendance_records (id, session_id, student_id, status, method, check_in_time, marked_by)
values ('751ee3dd-e425-52da-9ca8-9736af09a84f', 'a535ab2b-d9fa-5d7a-84e8-fb10f01d8ea0', '3d060f89-0b05-5c52-a2e1-bff3626a1659', 'present'::public.attendance_status,
        'manual'::public.attendance_method, '2026-02-28T10:05:00Z', 'd2aabb89-7202-55bb-bec8-1ac21ed47a51')
on conflict (session_id, student_id) do nothing;
insert into public.attendance_records (id, session_id, student_id, status, method, check_in_time, marked_by)
values ('b2f52546-1d40-532e-ae07-fa26169e2cf6', 'a535ab2b-d9fa-5d7a-84e8-fb10f01d8ea0', '72783d8a-6eb0-5adc-bd2a-262e3d750132', 'present'::public.attendance_status,
        'qr'::public.attendance_method, '2026-02-28T09:50:00Z', 'd2aabb89-7202-55bb-bec8-1ac21ed47a51')
on conflict (session_id, student_id) do nothing;
insert into public.attendance_records (id, session_id, student_id, status, method, check_in_time, marked_by)
values ('3896cc78-4886-5c55-89d5-ee57107f6f07', 'a535ab2b-d9fa-5d7a-84e8-fb10f01d8ea0', 'e9f3c827-bef8-52b0-9dbf-f5efa33710f0', 'excused'::public.attendance_status,
        'manual'::public.attendance_method, null, 'd2aabb89-7202-55bb-bec8-1ac21ed47a51')
on conflict (session_id, student_id) do nothing;
insert into public.attendance_records (id, session_id, student_id, status, method, check_in_time, marked_by)
values ('c07487eb-b266-585c-88d0-e280e02eb71c', 'dc028eed-ab12-53c0-87f6-232fefc7b35e', '03b70a2c-70d5-538f-8c6c-474b2633fe0b', 'present'::public.attendance_status,
        'qr'::public.attendance_method, '2026-02-27T13:55:00Z', 'd2aabb89-7202-55bb-bec8-1ac21ed47a51')
on conflict (session_id, student_id) do nothing;
insert into public.attendance_records (id, session_id, student_id, status, method, check_in_time, marked_by)
values ('db78c93f-c9bb-5203-ba7b-b7620a5b667d', 'dc028eed-ab12-53c0-87f6-232fefc7b35e', '63fb03c7-54ac-597b-8a36-70d65756dd74', 'absent'::public.attendance_status,
        'manual'::public.attendance_method, null, 'd2aabb89-7202-55bb-bec8-1ac21ed47a51')
on conflict (session_id, student_id) do nothing;
insert into public.attendance_records (id, session_id, student_id, status, method, check_in_time, marked_by)
values ('59a46ae5-89ea-52a8-9623-104090674cd3', 'dc028eed-ab12-53c0-87f6-232fefc7b35e', '3d060f89-0b05-5c52-a2e1-bff3626a1659', 'present'::public.attendance_status,
        'qr'::public.attendance_method, '2026-02-27T14:00:00Z', 'd2aabb89-7202-55bb-bec8-1ac21ed47a51')
on conflict (session_id, student_id) do nothing;
insert into public.attendance_records (id, session_id, student_id, status, method, check_in_time, marked_by)
values ('ac4b3b1f-ddb1-5a6e-a436-b15e38a41359', 'dc028eed-ab12-53c0-87f6-232fefc7b35e', '72783d8a-6eb0-5adc-bd2a-262e3d750132', 'present'::public.attendance_status,
        'qr'::public.attendance_method, '2026-02-27T13:58:00Z', 'd2aabb89-7202-55bb-bec8-1ac21ed47a51')
on conflict (session_id, student_id) do nothing;
insert into public.attendance_records (id, session_id, student_id, status, method, check_in_time, marked_by)
values ('e0f58aa2-6cbf-5d32-9bb8-1b32d6eae414', '9a218789-7dbf-5399-a817-7ed4af1c63aa', '03b70a2c-70d5-538f-8c6c-474b2633fe0b', 'present'::public.attendance_status,
        'qr'::public.attendance_method, '2026-02-26T08:50:00Z', 'a92a75c2-6729-50c6-944c-edac377f65bd')
on conflict (session_id, student_id) do nothing;
insert into public.attendance_records (id, session_id, student_id, status, method, check_in_time, marked_by)
values ('e870897d-1186-5bab-b90f-78038ff3f74a', '9a218789-7dbf-5399-a817-7ed4af1c63aa', 'e9f3c827-bef8-52b0-9dbf-f5efa33710f0', 'present'::public.attendance_status,
        'manual'::public.attendance_method, '2026-02-26T08:55:00Z', 'a92a75c2-6729-50c6-944c-edac377f65bd')
on conflict (session_id, student_id) do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- Waitlist
-- ────────────────────────────────────────────────────────────────────────────
insert into public.waitlist_entries (id, course_id, student_id, position, status, requested_at)
values ('39a318a9-4f28-5026-a04f-ea0819ecd492', 'a011cbb4-addf-58ac-b215-075d496c936f', '14579911-7e15-5947-b6d7-9060549f630d', 1, 'waiting', '2026-02-10'::timestamptz)
on conflict (course_id, student_id) do nothing;
insert into public.waitlist_entries (id, course_id, student_id, position, status, requested_at)
values ('0b5818cc-87b5-5704-a9c7-1a54b68c3f50', 'e56df1b0-d187-50bb-911c-a77deba8e2dd', '3d060f89-0b05-5c52-a2e1-bff3626a1659', 2, 'waiting', '2026-02-12'::timestamptz)
on conflict (course_id, student_id) do nothing;
insert into public.waitlist_entries (id, course_id, student_id, position, status, requested_at)
values ('dea6f13c-e98f-5c88-84c9-b4d200632213', 'b4584a3f-bcd0-5a1e-be81-2577f820cbfc', '72783d8a-6eb0-5adc-bd2a-262e3d750132', 3, 'waiting', '2026-02-14'::timestamptz)
on conflict (course_id, student_id) do nothing;
insert into public.waitlist_entries (id, course_id, student_id, position, status, requested_at)
values ('248bdb8a-9097-5c01-a7a4-28e23cb58b3d', '505771c5-aa1d-5a7b-9173-395eaee4fc14', 'e9f3c827-bef8-52b0-9dbf-f5efa33710f0', 4, 'waiting', '2026-02-15'::timestamptz)
on conflict (course_id, student_id) do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- Payments
-- ────────────────────────────────────────────────────────────────────────────
insert into public.payments (id, reference, student_id, course_id, amount, method, status, created_at, settled_at)
values ('775a28ce-3bd2-520e-b714-b260b2eaebb8', 'TRD-8F21A', '03b70a2c-70d5-538f-8c6c-474b2633fe0b',
        '577ea935-461d-53d4-b88b-52ee31473d1b', 15000000,
        'transfer'::public.payment_method, 'settled'::public.payment_status,
        '2026-02-28'::timestamptz, '2026-02-28'::timestamptz)
on conflict (reference) do nothing;
insert into public.payments (id, reference, student_id, course_id, amount, method, status, created_at, settled_at)
values ('abcfa3e6-6123-5234-b418-e600c2c6fded', 'TRD-4C90B', '63fb03c7-54ac-597b-8a36-70d65756dd74',
        'e56df1b0-d187-50bb-911c-a77deba8e2dd', 15000000,
        'card'::public.payment_method, 'settled'::public.payment_status,
        '2026-02-28'::timestamptz, '2026-02-28'::timestamptz)
on conflict (reference) do nothing;
insert into public.payments (id, reference, student_id, course_id, amount, method, status, created_at, settled_at)
values ('1123da92-7225-5c11-a1ed-f58f8b4faf54', 'TRD-2E17C', '14579911-7e15-5947-b6d7-9060549f630d',
        'a011cbb4-addf-58ac-b215-075d496c936f', 20000000,
        'transfer'::public.payment_method, 'pending'::public.payment_status,
        '2026-02-27'::timestamptz, null)
on conflict (reference) do nothing;
insert into public.payments (id, reference, student_id, course_id, amount, method, status, created_at, settled_at)
values ('f5545d0d-71fe-5f50-a714-2bdd978c90be', 'TRD-9B44D', '3d060f89-0b05-5c52-a2e1-bff3626a1659',
        'b4584a3f-bcd0-5a1e-be81-2577f820cbfc', 30000000,
        'card'::public.payment_method, 'settled'::public.payment_status,
        '2026-02-27'::timestamptz, '2026-02-27'::timestamptz)
on conflict (reference) do nothing;
insert into public.payments (id, reference, student_id, course_id, amount, method, status, created_at, settled_at)
values ('4ac508c4-334d-5f4b-ac2d-dfcd212e9c6f', 'TRD-7A03E', 'ebd94036-72f2-5d8b-8711-2a9be4ad36ea',
        '556e576c-a311-5e54-bf14-34d9d37c7184', 5000000,
        'ussd'::public.payment_method, 'failed'::public.payment_status,
        '2026-02-26'::timestamptz, null)
on conflict (reference) do nothing;
insert into public.payments (id, reference, student_id, course_id, amount, method, status, created_at, settled_at)
values ('fb6bdd9a-0022-594f-905c-6d0a9e0c4d00', 'TRD-1D65F', '72783d8a-6eb0-5adc-bd2a-262e3d750132',
        '505771c5-aa1d-5a7b-9173-395eaee4fc14', 30000000,
        'transfer'::public.payment_method, 'settled'::public.payment_status,
        '2026-02-26'::timestamptz, '2026-02-26'::timestamptz)
on conflict (reference) do nothing;
insert into public.payments (id, reference, student_id, course_id, amount, method, status, created_at, settled_at)
values ('830e35d9-7820-5640-af37-4bf7f8577c21', 'TRD-5G88H', 'e9f3c827-bef8-52b0-9dbf-f5efa33710f0',
        'e4df4b90-8a0a-5e3c-9e30-a7c0d053a927', 10000000,
        'card'::public.payment_method, 'refunded'::public.payment_status,
        '2026-02-25'::timestamptz, null)
on conflict (reference) do nothing;
insert into public.payments (id, reference, student_id, course_id, amount, method, status, created_at, settled_at)
values ('ffdecac8-03f9-5737-b4ef-dba30fe60e4a', 'TRD-3J12K', '3639ec96-9d24-56d6-af88-9a6ce62ea66a',
        '1296b991-4846-55c9-bed5-a9d8a3a31ad4', 30000000,
        'transfer'::public.payment_method, 'settled'::public.payment_status,
        '2026-02-25'::timestamptz, '2026-02-25'::timestamptz)
on conflict (reference) do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- Certificates
-- ────────────────────────────────────────────────────────────────────────────
insert into public.certificates (id, student_id, course_id, credential_id, issued_at)
values ('c80c277f-8d82-5c31-9cd0-dc21d22587ba', '3639ec96-9d24-56d6-af88-9a6ce62ea66a', '577ea935-461d-53d4-b88b-52ee31473d1b', 'APS-2026-001-892', '2026-01-12'::timestamptz)
on conflict (student_id, course_id) do nothing;
insert into public.certificates (id, student_id, course_id, credential_id, issued_at)
values ('c792fabe-1de0-5923-995a-01662b21213e', '3639ec96-9d24-56d6-af88-9a6ce62ea66a', 'e56df1b0-d187-50bb-911c-a77deba8e2dd', 'CSF-2026-045-112', '2026-02-05'::timestamptz)
on conflict (student_id, course_id) do nothing;
insert into public.certificates (id, student_id, course_id, credential_id, issued_at)
values ('3f86d1ab-e3cb-55f9-83b0-7613eb93e775', '3639ec96-9d24-56d6-af88-9a6ce62ea66a', '556e576c-a311-5e54-bf14-34d9d37c7184', 'WPE-2025-221-554', '2025-12-20'::timestamptz)
on conflict (student_id, course_id) do nothing;
insert into public.certificates (id, student_id, course_id, credential_id, issued_at)
values ('eecfda0b-f483-5488-856b-e9248e544d4e', '3639ec96-9d24-56d6-af88-9a6ce62ea66a', 'a011cbb4-addf-58ac-b215-075d496c936f', 'PM-2025-088-332', '2025-11-15'::timestamptz)
on conflict (student_id, course_id) do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- Notifications
-- ────────────────────────────────────────────────────────────────────────────
insert into public.notifications (id, user_id, type, title, message, is_read, created_at)
values ('447df215-fcc5-52ec-a55e-fb83096e6ec4', '3639ec96-9d24-56d6-af88-9a6ce62ea66a', 'course_update'::public.notification_type, 'Course Updated: Research Methods', 'Module 3 content has been updated with new reading materials.', false, now())
on conflict (id) do nothing;
insert into public.notifications (id, user_id, type, title, message, is_read, created_at)
values ('db109173-46b9-5381-97c6-0ab79e34fe0f', '3639ec96-9d24-56d6-af88-9a6ce62ea66a', 'new_class'::public.notification_type, 'New Class Schedule Available', 'Data Analysis & Reporting cohort 5 dates have been announced.', false, now())
on conflict (id) do nothing;
insert into public.notifications (id, user_id, type, title, message, is_read, created_at)
values ('6fea1698-a631-5783-b0f9-8257763e2bb3', '3639ec96-9d24-56d6-af88-9a6ce62ea66a', 'transaction'::public.notification_type, 'Payment Successful', 'Your payment of ₦25,000 for Health & Safety Compliance has been confirmed.', true, now())
on conflict (id) do nothing;
insert into public.notifications (id, user_id, type, title, message, is_read, created_at)
values ('00a91170-ba10-5e94-9d80-761dbc3cc8be', '3639ec96-9d24-56d6-af88-9a6ce62ea66a', 'system'::public.notification_type, 'Scheduled Maintenance', 'The platform will be undergoing maintenance on Saturday from 2 AM to 4 AM.', true, now())
on conflict (id) do nothing;
insert into public.notifications (id, user_id, type, title, message, is_read, created_at)
values ('c6dcc776-1dd7-5d45-ab7b-994683e691e0', '3639ec96-9d24-56d6-af88-9a6ce62ea66a', 'course_update'::public.notification_type, 'Certificate Issued', 'Congratulations! Your certificate for Leadership & Professional Dev is ready.', true, now())
on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- Audit trail and device sync logs
-- ────────────────────────────────────────────────────────────────────────────
insert into public.audit_logs (id, actor_id, actor_name, actor_role, action, target, details, created_at)
values ('25cfdb77-89d9-5dba-9134-b56b31a90a5b', 'dd8ca978-4697-5e0f-bf62-43a4f3ed3c5c', 'Prof. Eze Nwosu', 'admin'::public.user_role, 'Course Created', 'Generative AI', 'New course added to catalog with 1-month duration.', '2026-02-28T10:00:00Z')
on conflict (id) do nothing;
insert into public.audit_logs (id, actor_id, actor_name, actor_role, action, target, details, created_at)
values ('53edf81a-431d-583f-a226-8be1fbb0a597', 'dd8ca978-4697-5e0f-bf62-43a4f3ed3c5c', 'Prof. Eze Nwosu', 'admin'::public.user_role, 'User Role Changed', 'Oluwaseun Fadare', 'Role changed from Student to Instructor.', '2026-02-27T15:30:00Z')
on conflict (id) do nothing;
insert into public.audit_logs (id, actor_id, actor_name, actor_role, action, target, details, created_at)
values ('6db37333-628a-5fdf-8553-55df557f51c6', 'dd8ca978-4697-5e0f-bf62-43a4f3ed3c5c', 'Prof. Eze Nwosu', 'admin'::public.user_role, 'Waitlist Promoted', 'Amaka Eze → Web Development', 'Student promoted from waitlist position #1.', '2026-02-27T13:15:00Z')
on conflict (id) do nothing;
insert into public.audit_logs (id, actor_id, actor_name, actor_role, action, target, details, created_at)
values ('83167e33-b334-5dc1-8ee1-6cd9c5673cf7', 'd2aabb89-7202-55bb-bec8-1ac21ed47a51', 'Dr. Funke Akindele', 'instructor'::public.user_role, 'Attendance Override', 'Ibrahim Musa', 'Manual attendance marked as present for missed session.', '2026-02-26T17:00:00Z')
on conflict (id) do nothing;
insert into public.audit_logs (id, actor_id, actor_name, actor_role, action, target, details, created_at)
values ('ecc4dadf-6350-5f42-abb8-36e60ac7e991', 'dd8ca978-4697-5e0f-bf62-43a4f3ed3c5c', 'Prof. Eze Nwosu', 'admin'::public.user_role, 'Test Score Override', 'Halima Bello → Python Programming', 'Test score manually overridden from 65% to Pass.', '2026-02-26T14:00:00Z')
on conflict (id) do nothing;
insert into public.audit_logs (id, actor_id, actor_name, actor_role, action, target, details, created_at)
values ('8252b04b-f12d-55b5-8c20-3c14603b0e48', 'dd8ca978-4697-5e0f-bf62-43a4f3ed3c5c', 'Prof. Eze Nwosu', 'admin'::public.user_role, 'Course Updated', 'Cybersecurity', 'Capacity increased from 15 to 20 seats.', '2026-02-25T11:30:00Z')
on conflict (id) do nothing;
insert into public.audit_logs (id, actor_id, actor_name, actor_role, action, target, details, created_at)
values ('a8ce644c-b0db-531e-b716-dd483bc56e0e', 'dd8ca978-4697-5e0f-bf62-43a4f3ed3c5c', 'Prof. Eze Nwosu', 'admin'::public.user_role, 'User Suspended', 'Halima Bello', 'Account suspended for policy violation review.', '2026-02-24T09:00:00Z')
on conflict (id) do nothing;

insert into public.device_sync_logs (id, instructor_id, device_id, record_count, status, synced_at)
values ('597337f8-75d6-5221-bfa1-df3cf6720615', 'd2aabb89-7202-55bb-bec8-1ac21ed47a51', 'IPAD-001', 24, 'synced'::public.sync_status, '2026-02-28T14:45:00Z')
on conflict (id) do nothing;
insert into public.device_sync_logs (id, instructor_id, device_id, record_count, status, synced_at)
values ('6d7b55b2-6bd7-5eb9-9116-c88301c1ed2d', 'a92a75c2-6729-50c6-944c-edac377f65bd', 'TAB-003', 12, 'pending'::public.sync_status, '2026-02-28T13:30:00Z')
on conflict (id) do nothing;
insert into public.device_sync_logs (id, instructor_id, device_id, record_count, status, synced_at)
values ('d6f37285-d65a-5788-acff-3d4dd53691ad', 'd2aabb89-7202-55bb-bec8-1ac21ed47a51', 'IPAD-001', 18, 'synced'::public.sync_status, '2026-02-27T16:15:00Z')
on conflict (id) do nothing;
insert into public.device_sync_logs (id, instructor_id, device_id, record_count, status, synced_at)
values ('0c7a01a2-b749-5661-8f71-092ddcdfd5c3', 'a92a75c2-6729-50c6-944c-edac377f65bd', 'TAB-003', 8, 'failed'::public.sync_status, '2026-02-27T11:00:00Z')
on conflict (id) do nothing;
insert into public.device_sync_logs (id, instructor_id, device_id, record_count, status, synced_at)
values ('a59475c1-f9e0-516c-83b0-caf372d05492', 'd2aabb89-7202-55bb-bec8-1ac21ed47a51', 'IPAD-001', 30, 'synced'::public.sync_status, '2026-02-26T15:20:00Z')
on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- Derived state
-- ────────────────────────────────────────────────────────────────────────────
-- Progress is normally maintained by the lesson_progress trigger. The seed
-- has no per-item completion, so the mock percentages are applied directly.

update public.enrollments set progress = 68 where course_id = '577ea935-461d-53d4-b88b-52ee31473d1b' and student_id = '3639ec96-9d24-56d6-af88-9a6ce62ea66a';
update public.enrollments set progress = 0 where course_id = 'a011cbb4-addf-58ac-b215-075d496c936f' and student_id = '3639ec96-9d24-56d6-af88-9a6ce62ea66a';
update public.enrollments set progress = 12 where course_id = 'e56df1b0-d187-50bb-911c-a77deba8e2dd' and student_id = '3639ec96-9d24-56d6-af88-9a6ce62ea66a';

commit;
