# Supabase setup

Everything the backend needs lives in `supabase/`. This is Phase 1: schema, RLS,
storage, seed data and real authentication. The rest of the app still reads from
the in-memory mock store — see **What is still on mocks** at the bottom.

---

## 1. One-time setup

```bash
# 1. CLI
brew install supabase/tap/supabase
supabase login

# 2. Initialise the project directory.
#    Keep the existing supabase/migrations and supabase/seed.sql when prompted.
supabase init

# 3. Link to your hosted project (ref is in the dashboard URL).
supabase link --project-ref <your-project-ref>
```

## 2. Environment

```bash
cp .env.example .env.local
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from
**Project Settings → API**. `.env.local` is gitignored. The app throws a clear
error on startup if either is missing, rather than failing later in a fetch.

## 3. Apply the schema

**Docker is not required.** It is only needed for `supabase start` / `db reset`,
which run a local Postgres. Pushing to a hosted project never touches it.

```bash
supabase db push                  # migrations only
supabase db push --include-seed   # migrations + supabase/seed.sql
```

Then confirm it actually works:

```bash
npm run verify:supabase
```

That signs in as the seeded users through the anon key — the same path the
browser takes — and asserts the security properties the schema is meant to
guarantee: the answer key is unreachable, scores cannot be forged or rewritten,
learners cannot see each other, the audit log is admin-only. 22 assertions.
Run it after any migration touching RLS, grants or the assessment functions.

> The seed creates real auth users. Do not run it against a database that has
> real people in it.

## 4. Auth configuration

In **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:5000` for development.
- **Redirect URLs**: add `http://localhost:5000/reset-password` and
  `http://localhost:5000/login`, plus the production equivalents.

Password reset and email confirmation both bounce through these; if they are not
allow-listed the links silently fail.

Email confirmation is on by default. The signup screen handles both cases — with
it on the user sees a check-your-inbox screen, with it off they go straight in.

## 5. Regenerating types

`src/types/database.ts` is currently hand-written to match the migrations. Once
the project is linked, replace it from the live schema:

```bash
npm run types:gen
```

---

## Demo accounts

Every seeded account uses the password **`Password123!`**.

| Role | Email | Portal |
|---|---|---|
| Student | `cyber.smith@example.com` | `/dashboard` |
| Instructor | `funke.a@trd.edu` | `/instructor` |
| Instructor | `seun.f@trd.edu` | `/instructor` |
| Admin | `eze.n@trd.edu` | `/admin` |

Seven more learner accounts exist (`adewale.j@`, `chinedu.o@`, `halima.b@` …) —
see `src/data/admin.ts`. `halima.b@trd.edu` is suspended on purpose, so you can
check that the suspension path signs the user straight back out.

## Regenerating the seed

`supabase/seed.sql` is generated, not hand-edited:

```bash
npm run seed:gen
```

It compiles `src/data/*.ts` with esbuild and emits SQL. Short mock ids (`"1"`,
`"as-3"`, `"u-7"`) become deterministic UUID v5 values, so regenerating produces
identical output and the file stays safe to re-apply.

---

## Schema

| Migration | Contents |
|---|---|
| `…000100_extensions_and_enums` | pgcrypto, uuid-ossp, 18 enums mirroring the TS union types |
| `…000200_identity` | `profiles`, the `auth.users` provisioning trigger, role helpers |
| `…000300_catalog` | `courses`, fee tiers, modules, items, venues, `owns_course()` |
| `…000400_assessments` | assessments, questions, options, attempts + **answer-key column revoke** |
| `…000500_enrollment` | enrollments, lesson progress, waitlist, payments, progress trigger |
| `…000600_sessions` | physical sessions, entry passes, attendance, the HMAC secret |
| `…000700_platform` | certificates, notifications, audit trail, device sync logs |
| `…000800_functions` | grading, attempts, enrollment, checkout |
| `…000900_passes_and_ops` | pass gating, signed QR, scanning, sync, waitlist, verification |
| `…001000_rls` | RLS on all 23 tables, 54 policies, grants |
| `…001100_storage` | three buckets and their policies |
| `…001200_fix_profile_guard` | the role guard rejected trusted server-side writes |
| `…001300_relax_module_item_payload` | allow content items that have no file attached yet |
| `…001400_fix_seeded_auth_user_tokens` | NULL GoTrue token columns broke every login |
| `…001500_pin_function_search_paths` | pin `search_path` on the last two functions |

The last four came out of applying the first eleven against the real project —
see **Applying this to a fresh project** below.

### Two rules the schema enforces that the client cannot

**The answer key never reaches a learner.** RLS filters rows, not columns, so
`question_options.is_correct` is removed from the `authenticated` grant
outright. Learners receive questions only from `start_attempt()` (which omits
the key) and `attempt_result()` (which reveals it after submission). Staff read
it through `assessment_authoring_payload()`, which checks `owns_course()` first.

**Grading, attempt caps and time limits are server-side.** `assessment_attempts`
has no insert or update policy at all. The only writers are `start_attempt()`
and `submit_attempt()`, both `SECURITY DEFINER`. A learner cannot post a score.

Entry passes follow the same pattern: the scannable payload is
`TRD1.<pass id>.<hmac>`, signed with a secret in the `private` schema that no
API role can read. The old flow built a QR from a plaintext pass code, which
anyone could forge once they had seen one.

---

## What is still on mocks

Phase 1 covered authentication. `LmsProvider` in `src/store/lms-store.tsx` still
serves courses, assessments and attempts from `src/data/`, so every portal page
reads mock data. Phases 2–5 replace that.

Still missing UI, unchanged by this phase:

- No checkout screen; `checkout_course()` exists and self-settles, but nothing calls it.
- No module/item editor or file upload — the storage buckets and policies are ready and unused.
- Course player has no mark-complete control, though `mark_item_complete()` is live.
- QR scanner still uses its mock lookup rather than `redeem_entry_pass()`.
- Admin role/status changes and attendance marking still only fire toasts.
- Header search inputs are still uncontrolled.
- `MediaViewer` renders PDFs through `docs.google.com/viewer`, which cannot read
  a private signed URL. That has to become a direct embed when content moves
  into the `course-content` bucket.


---

## Applying this to a fresh project

Four defects only surfaced when the migrations met a real Postgres. They are
already fixed in `…001200`–`…001500`, but they are the kind of thing that
recurs, so they are worth knowing.

**The role guard blocked its own seed.** `guard_profile_privileges()` stops a
user writing their own `role`, exempting admins. But `auth.uid()` is NULL on a
direct database connection, so `is_admin()` was false for migrations, the seed
and the service role — every trusted write was rejected with *"Role is not
self-assignable"*. A null `auth.uid()` now means "not an end user" and is
exempt. That is not a hole: `anon` also has a null `auth.uid()`, but every
update policy on `profiles` is granted `to authenticated` and requires
`id = auth.uid()`, so `anon` never reaches the trigger.

**A check constraint was stricter than the product.** `module_items_payload`
demanded every non-quiz item carry a file. One seeded item — "Responsive
Patterns" — has none, and more to the point an instructor will add an item
before uploading to it. `MediaViewer` already renders a "content not available"
state for exactly that. The quiz half of the rule stayed.

**Seeded `auth.users` rows broke every login.** GoTrue scans columns like
`confirmation_token` and `recovery_token` into non-nullable Go strings. They are
nullable in Postgres and default to NULL, so inserting a user without naming
them made GoTrue's row scan fail and *every* sign-in on the project — seeded or
not — returned `500 Database error querying schema`. The generator now writes
them as empty strings; `…001400` repairs rows already inserted.

**Two functions had a mutable `search_path`.** `touch_updated_at()` and
`safe_uuid()` missed the pin every other function had. Supabase's advisor flags
this as `function_search_path_mutable`.
