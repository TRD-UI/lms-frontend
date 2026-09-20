#!/usr/bin/env node
/**
 * Generates supabase/seed.sql from the TypeScript mock data in src/data.
 *
 * The mocks use short string ids ("1", "as-3", "u-7"). Those are turned into
 * deterministic UUID v5 values, so re-running this script produces byte-identical
 * SQL and the seed stays re-appliable. Run it with:
 *
 *   npm run seed:gen
 *
 * Money: the mocks hold naira; the schema holds kobo. Everything is multiplied
 * by 100 on the way in — see MONEY below.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");

// ─── Build the data bundle ───────────────────────────────────────────────────
const outDir = mkdtempSync(join(tmpdir(), "lms-seed-"));
const bundle = join(outDir, "seed-data.mjs");
execFileSync(
  join(ROOT, "node_modules/.bin/esbuild"),
  [
    join(ROOT, "scripts/seed-entry.ts"),
    "--bundle", "--format=esm", "--platform=node",
    `--alias:hugeicons-react=${join(ROOT, "scripts/stub-icons.cjs")}`,
    `--alias:@=${join(ROOT, "src")}`,
    `--outfile=${bundle}`,
  ],
  { stdio: ["ignore", "ignore", "inherit"] }
);
const D = await import(bundle);

// ─── UUID v5 ─────────────────────────────────────────────────────────────────
const NS = "9f8e7d6c-5b4a-4938-8271-6f5e4d3c2b1a";

function uuid5(name) {
  const nsBytes = Buffer.from(NS.replace(/-/g, ""), "hex");
  const hash = createHash("sha1").update(Buffer.concat([nsBytes, Buffer.from(name, "utf8")])).digest();
  const b = Buffer.from(hash.subarray(0, 16));
  b[6] = (b[6] & 0x0f) | 0x50; // version 5
  b[8] = (b[8] & 0x3f) | 0x80; // RFC 4122 variant
  const h = b.toString("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

const idFor = (kind, key) => uuid5(`${kind}:${key}`);

// ─── SQL helpers ─────────────────────────────────────────────────────────────
const MONEY = (naira) => Math.round(Number(naira || 0) * 100); // naira → kobo

const q = (v) => (v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const n = (v) => (v === null || v === undefined || v === "" ? "null" : String(v));
const arr = (values) =>
  values && values.length ? `array[${values.map((v) => q(v)).join(", ")}]::text[]` : `'{}'::text[]`;

const MONTHS = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };

/** "Jan 05, 2026" | "March 15, 2026" | "Feb 28, 2026, 2:45 PM" → ISO date. */
function parseDate(text) {
  if (!text) return null;
  const m = /([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/.exec(text);
  if (!m) return null;
  const month = MONTHS[m[1].slice(0, 3)];
  if (!month) return null;
  return `${m[3]}-${String(month).padStart(2, "0")}-${String(Number(m[2])).padStart(2, "0")}`;
}

/** "Feb 28, 2026, 2:45 PM" → ISO timestamp. */
function parseTimestamp(text) {
  const date = parseDate(text);
  if (!date) return null;
  const t = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(text);
  if (!t) return `${date}T00:00:00Z`;
  let hour = Number(t[1]) % 12;
  if (/pm/i.test(t[3])) hour += 12;
  return `${date}T${String(hour).padStart(2, "0")}:${t[2]}:00Z`;
}

/** "10:00 AM - 2:00 PM" → ["10:00:00", "14:00:00"]. */
function parseTimeRange(text) {
  const parts = [...String(text || "").matchAll(/(\d{1,2}):(\d{2})\s*(AM|PM)/gi)];
  const toTime = (m) => {
    let hour = Number(m[1]) % 12;
    if (/pm/i.test(m[3])) hour += 12;
    return `${String(hour).padStart(2, "0")}:${m[2]}:00`;
  };
  if (parts.length >= 2) return [toTime(parts[0]), toTime(parts[1])];
  if (parts.length === 1) return [toTime(parts[0]), "23:59:00"];
  return ["09:00:00", "12:00:00"];
}

const lines = [];
const out = (s = "") => lines.push(s);
const section = (title) => {
  out("");
  out(`-- ${"─".repeat(76)}`);
  out(`-- ${title}`);
  out(`-- ${"─".repeat(76)}`);
};

// ─── Password for every seeded account ───────────────────────────────────────
// Local/demo data only. These accounts exist so you can sign in to each portal
// immediately after `db reset`; do not run this seed against production.
const DEMO_PASSWORD = "Password123!";

const STUDENT = { id: "st-demo", name: "Cyber Smith", email: "cyber.smith@example.com", role: "student", status: "active", joinDate: "Jan 02, 2026", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=CyberSmith" };
const ALL_USERS = [STUDENT, ...D.adminUsers];

const userId = (key) => idFor("user", key);
const byName = new Map(ALL_USERS.map((u) => [u.name, u]));

out("-- GENERATED FILE — do not edit by hand.");
out("-- Regenerate with: npm run seed:gen");
out("--");
out("-- Source: src/data/*.ts. Short mock ids are mapped to deterministic UUID v5");
out("-- values, so this file is stable across regenerations and safe to re-apply.");
out("--");
out(`-- Every account's password is: ${DEMO_PASSWORD}`);
out("");
out("begin;");

// ─── Auth users ──────────────────────────────────────────────────────────────
section("Auth users and profiles");
out("-- Inserting into auth.users fires public.handle_new_user(), which creates the");
out("-- matching profiles row. Role and status are applied afterwards, because the");
out("-- trigger deliberately ignores client-supplied roles.");
out("");

for (const u of ALL_USERS) {
  const id = userId(u.id);
  const created = parseTimestamp(u.joinDate) ?? "2026-01-01T00:00:00Z";
  // The token columns are written explicitly as empty strings. They are
  // nullable in Postgres but GoTrue scans them into non-nullable Go strings, so
  // leaving them NULL makes every login on the project fail with a 500
  // "Database error querying schema".
  out(`insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000000', ${q(id)}, 'authenticated', 'authenticated',
  ${q(u.email)}, extensions.crypt(${q(DEMO_PASSWORD)}, extensions.gen_salt('bf')), ${q(created)},
  ${q(created)}, ${q(created)},
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('name', ${q(u.name)}, 'avatar_url', ${q(u.avatarUrl ?? null)}),
  false, false,
  '', '', '', '', '', '', '', ''
) on conflict (id) do nothing;`);
  out(`insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (${q(u.email)}, ${q(id)}, jsonb_build_object('sub', ${q(id)}, 'email', ${q(u.email)}, 'email_verified', true, 'phone_verified', false), 'email', ${q(created)}, ${q(created)}, ${q(created)})
on conflict (provider, provider_id) do nothing;`);
  out(`update public.profiles set name = ${q(u.name)}, role = ${q(u.role)}::public.user_role, status = ${q(u.status)}::public.user_status, avatar_url = ${q(u.avatarUrl ?? null)}, created_at = ${q(created)} where id = ${q(id)};`);
  out("");
}

// ─── Venues ──────────────────────────────────────────────────────────────────
section("Venues");
for (const v of D.venueUsage) {
  out(`insert into public.venues (id, name, capacity) values (${q(idFor("venue", v.venue))}, ${q(v.venue)}, ${n(v.capacity)}) on conflict (name) do nothing;`);
}

// ─── Courses ─────────────────────────────────────────────────────────────────
section("Courses, fee tiers, modules and items");
const appFee = D.courseMetadata?.applicationFee ?? 0;

for (const c of D.courses) {
  const cid = idFor("course", c.id);
  const tiered = c.fees?.type === "tiered";
  out(`insert into public.courses (id, title, description, duration, location, category, seats_total, fee_type, fee_amount, application_fee, status, instructor_id)
values (${q(cid)}, ${q(c.title)}, ${q(c.description)}, ${q(c.duration)}, ${q(c.location)}, ${q(c.category)}, ${n(c.seats?.total ?? 0)},
        ${q(tiered ? "tiered" : "flat")}::public.fee_type, ${tiered ? "null" : n(MONEY(c.fees?.amount))}, ${n(MONEY(appFee))},
        ${q(c.status ?? "draft")}::public.course_status, ${c.instructorId ? q(userId(c.instructorId)) : "null"})
on conflict (id) do nothing;`);

  if (tiered) {
    (c.fees.tiers ?? []).forEach((t, i) => {
      out(`insert into public.course_fee_tiers (id, course_id, name, amount, position) values (${q(idFor("tier", `${c.id}:${t.name}`))}, ${q(cid)}, ${q(t.name)}, ${n(MONEY(t.amount))}, ${i}) on conflict (course_id, name) do nothing;`);
    });
  }

  (c.modules ?? []).forEach((m, mi) => {
    out(`insert into public.course_modules (id, course_id, title, position) values (${q(idFor("module", m.id))}, ${q(cid)}, ${q(m.title)}, ${mi}) on conflict (id) do nothing;`);
  });
  out("");
}

// Module items are emitted after every assessment exists, because a quiz item
// carries an assessment_id foreign key.

// ─── Assessments ─────────────────────────────────────────────────────────────
section("Assessments, questions and options");
const optionId = (assessmentId, questionId, optId) => idFor("option", `${assessmentId}:${questionId}:${optId}`);

for (const a of D.assessments) {
  const aid = idFor("assessment", a.id);
  out(`insert into public.assessments (id, course_id, module_id, title, description, kind, status, passing_score, time_limit_minutes, max_attempts, gates_entry_pass, created_by, updated_at)
values (${q(aid)}, ${q(idFor("course", a.courseId))}, ${a.moduleId ? q(idFor("module", a.moduleId)) : "null"},
        ${q(a.title)}, ${q(a.description)}, ${q(a.kind)}::public.assessment_kind, ${q(a.status)}::public.assessment_status,
        ${n(a.passingScore)}, ${n(a.timeLimitMinutes)}, ${n(a.maxAttempts)}, ${a.gatesEntryPass ? "true" : "false"},
        ${a.createdBy && byName.has(a.createdBy) ? q(userId(byName.get(a.createdBy).id)) : "null"}, ${q(a.updatedAt ?? null)})
on conflict (id) do nothing;`);

  (a.questions ?? []).forEach((question, qi) => {
    const qid = idFor("question", `${a.id}:${question.id}`);
    out(`insert into public.assessment_questions (id, assessment_id, prompt, type, explanation, difficulty, points, tags, remedial_module_id, position)
values (${q(qid)}, ${q(aid)}, ${q(question.prompt)}, ${q(question.type)}::public.question_type, ${q(question.explanation ?? null)},
        ${q(question.difficulty)}::public.difficulty, ${n(question.points)}, ${arr(question.tags)},
        ${question.remedialModuleId ? q(idFor("module", question.remedialModuleId)) : "null"}, ${qi})
on conflict (id) do nothing;`);

    (question.options ?? []).forEach((opt, oi) => {
      const correct = (question.correctOptionIds ?? []).includes(opt.id);
      out(`insert into public.question_options (id, question_id, label, is_correct, position) values (${q(optionId(a.id, question.id, opt.id))}, ${q(qid)}, ${q(opt.label)}, ${correct}, ${oi}) on conflict (id) do nothing;`);
    });
  });
  out("");
}

// ─── Module items ────────────────────────────────────────────────────────────
section("Module items");
out("-- Emitted after assessments so quiz items can reference them.");
out("");
for (const c of D.courses) {
  for (const m of c.modules ?? []) {
    (m.items ?? []).forEach((item, ii) => {
      const isQuiz = item.type === "quiz";
      out(`insert into public.module_items (id, module_id, title, type, external_url, assessment_id, position)
values (${q(idFor("item", item.id))}, ${q(idFor("module", m.id))}, ${q(item.title)}, ${q(item.type)}::public.module_item_type,
        ${isQuiz ? "null" : q(item.url ?? null)}, ${isQuiz && item.assessmentId ? q(idFor("assessment", item.assessmentId)) : "null"}, ${ii})
on conflict (id) do nothing;`);
    });
  }
}

// ─── Enrollments ─────────────────────────────────────────────────────────────
section("Enrollments");
out("-- The demo student's paid courses come from purchasedCourseIds. Other");
out("-- learners get a deterministic spread so the admin analytics screens and");
out("-- instructor rosters are not empty.");
out("");

const enrollments = [];
for (const courseId of D.purchasedCourseIds) {
  enrollments.push({ student: STUDENT.id, course: courseId, status: "active" });
}
// Spread the remaining students across the published catalog, honouring the
// enrolledCourses count each mock user advertises.
const published = D.courses.filter((c) => c.status === "published");
let cursor = 0;
for (const u of D.adminUsers.filter((x) => x.role === "student")) {
  for (let i = 0; i < (u.enrolledCourses ?? 0); i++) {
    const course = published[cursor % published.length];
    cursor++;
    enrollments.push({ student: u.id, course: course.id, status: u.status === "active" ? "active" : "pending" });
  }
}

const seen = new Set();
for (const e of enrollments) {
  const key = `${e.student}:${e.course}`;
  if (seen.has(key)) continue;
  seen.add(key);
  out(`insert into public.enrollments (id, course_id, student_id, status) values (${q(idFor("enrollment", key))}, ${q(idFor("course", e.course))}, ${q(userId(e.student))}, ${q(e.status)}::public.enrollment_status) on conflict (course_id, student_id) do nothing;`);
}

// ─── Attempts ────────────────────────────────────────────────────────────────
section("Assessment attempts");
for (const at of D.seedAttempts) {
  out(`insert into public.assessment_attempts (id, assessment_id, course_id, student_id, attempt_number, score, points_earned, points_possible, passed, started_at, submitted_at, duration_seconds)
values (${q(idFor("attempt", at.id))}, ${q(idFor("assessment", at.assessmentId))}, ${q(idFor("course", at.courseId))}, ${q(userId(at.studentId))},
        ${n(at.attemptNumber)}, ${n(at.score)}, ${n(at.pointsEarned)}, ${n(at.pointsPossible)}, ${at.passed},
        ${q(at.submittedAt)}::timestamptz - make_interval(secs => ${n(at.durationSeconds)}), ${q(at.submittedAt)}, ${n(at.durationSeconds)})
on conflict (assessment_id, student_id, attempt_number) do nothing;`);
}

// ─── Sessions, passes, attendance ────────────────────────────────────────────
section("Physical sessions, entry passes and attendance");

// Cohorts carry a course title rather than an id, so the mapping is explicit.
const COHORT_COURSE = {
  "coh-1": "1",   // Physical Security Workshop 2026 → Tech Odyssey
  "coh-2": "3",   // Python Programming — Lab Session
  "coh-3": "4",   // Digital Literacy Induction
};

const sessionKeyFor = (title, date) => `${title}|${date}`;
const sessions = new Map();

// Sessions implied by the entry passes.
for (const p of D.entryPasses) {
  const date = parseDate(p.date);
  const [startsAt, endsAt] = parseTimeRange(p.time);
  const key = sessionKeyFor(p.eventTitle, date);
  if (!sessions.has(key)) {
    sessions.set(key, {
      id: idFor("session", key),
      courseId: p.courseId,
      title: p.eventTitle,
      date,
      startsAt,
      endsAt,
      venue: p.venue,
      room: p.roomNumber,
      instructorId: D.courses.find((c) => c.id === p.courseId)?.instructorId ?? null,
    });
  }
}

// Sessions implied by the instructor cohorts.
for (const coh of D.instructorCohorts) {
  const date = parseDate(coh.sessionDate);
  const [startsAt, endsAt] = parseTimeRange(coh.sessionTime);
  const courseId = COHORT_COURSE[coh.id];
  const key = sessionKeyFor(coh.courseTitle, date);
  if (!sessions.has(key)) {
    sessions.set(key, {
      id: idFor("session", key),
      courseId,
      title: coh.courseTitle,
      date,
      startsAt,
      endsAt,
      venue: coh.venue,
      room: "",
      instructorId: D.courses.find((c) => c.id === courseId)?.instructorId ?? null,
    });
  }
  coh.__sessionKey = key;
}

for (const s of sessions.values()) {
  out(`insert into public.course_sessions (id, course_id, title, session_date, starts_at, ends_at, venue_name, room_number, instructor_id)
values (${q(s.id)}, ${q(idFor("course", s.courseId))}, ${q(s.title)}, ${q(s.date)}::date, ${q(s.startsAt)}::time, ${q(s.endsAt)}::time,
        ${q(s.venue)}, ${q(s.room)}, ${s.instructorId ? q(userId(s.instructorId)) : "null"})
on conflict (id) do nothing;`);
}
out("");

// The demo student's passes, keeping the original human-readable codes.
for (const p of D.entryPasses) {
  const key = sessionKeyFor(p.eventTitle, parseDate(p.date));
  const session = sessions.get(key);
  if (!session) continue;
  const status = p.status === "past" ? "past" : "active";
  out(`insert into public.entry_passes (id, session_id, student_id, pass_code, status, issued_at)
values (${q(idFor("pass", p.id))}, ${q(session.id)}, ${q(userId(STUDENT.id))}, ${q(p.passCode)}, ${q(status)}::public.pass_status, ${q(session.date)}::timestamptz)
on conflict (session_id, student_id) do nothing;`);
}
out("");

for (const coh of D.instructorCohorts) {
  const session = sessions.get(coh.__sessionKey);
  if (!session) continue;
  for (const rec of coh.students ?? []) {
    const checkIn = rec.checkInTime
      ? `${session.date}T${parseTimeRange(rec.checkInTime)[0]}Z`
      : null;
    out(`insert into public.attendance_records (id, session_id, student_id, status, method, check_in_time, marked_by)
values (${q(idFor("attendance", rec.id))}, ${q(session.id)}, ${q(userId(rec.studentId))}, ${q(rec.status)}::public.attendance_status,
        ${q(rec.method)}::public.attendance_method, ${q(checkIn)}, ${session.instructorId ? q(userId(session.instructorId)) : "null"})
on conflict (session_id, student_id) do nothing;`);
  }
}

// ─── Waitlist ────────────────────────────────────────────────────────────────
section("Waitlist");
const WAITLIST_COURSE = {
  "Web Development": "2",
  "Training Lab 2 - Python": "3",
  "Cybersecurity": "14",
  "Data Science": "13",
};
for (const w of D.waitlistEntries) {
  const student = byName.get(w.studentName);
  const courseId = WAITLIST_COURSE[w.courseTitle];
  if (!student || !courseId) continue;
  out(`insert into public.waitlist_entries (id, course_id, student_id, position, status, requested_at)
values (${q(idFor("waitlist", w.id))}, ${q(idFor("course", courseId))}, ${q(userId(student.id))}, ${n(w.position)}, 'waiting', ${q(parseDate(w.requestDate))}::timestamptz)
on conflict (course_id, student_id) do nothing;`);
}

// ─── Payments ────────────────────────────────────────────────────────────────
section("Payments");
const METHOD = { Card: "card", Transfer: "transfer", USSD: "ussd", Cash: "cash", "Bank Transfer": "transfer" };
for (const t of D.transactions) {
  const student = byName.get(t.studentName);
  const course = D.courses.find((c) => c.title === t.courseTitle);
  out(`insert into public.payments (id, reference, student_id, course_id, amount, method, status, created_at, settled_at)
values (${q(idFor("payment", t.id))}, ${q(t.reference)}, ${student ? q(userId(student.id)) : q(userId(STUDENT.id))},
        ${course ? q(idFor("course", course.id)) : "null"}, ${n(MONEY(t.amount))},
        ${q(METHOD[t.method] ?? "card")}::public.payment_method, ${q(t.status)}::public.payment_status,
        ${q(parseDate(t.date))}::timestamptz, ${t.status === "settled" ? `${q(parseDate(t.date))}::timestamptz` : "null"})
on conflict (reference) do nothing;`);
}

// ─── Certificates ────────────────────────────────────────────────────────────
section("Certificates");
for (const cert of D.certificates) {
  const course = D.courses.find((c) => c.title === cert.courseTitle);
  if (!course) continue;
  out(`insert into public.certificates (id, student_id, course_id, credential_id, issued_at)
values (${q(idFor("certificate", cert.id))}, ${q(userId(STUDENT.id))}, ${q(idFor("course", course.id))}, ${q(cert.credentialId)}, ${q(parseDate(cert.issueDate))}::timestamptz)
on conflict (student_id, course_id) do nothing;`);
}

// ─── Notifications ───────────────────────────────────────────────────────────
section("Notifications");
for (const note of D.notifications) {
  out(`insert into public.notifications (id, user_id, type, title, message, is_read, created_at)
values (${q(idFor("notification", note.id))}, ${q(userId(STUDENT.id))}, ${q(note.type)}::public.notification_type, ${q(note.title)}, ${q(note.message)}, ${note.isRead ? "true" : "false"}, now())
on conflict (id) do nothing;`);
}

// ─── Audit and sync logs ─────────────────────────────────────────────────────
section("Audit trail and device sync logs");
for (const log of D.auditLogs) {
  const actor = byName.get(log.performedBy);
  out(`insert into public.audit_logs (id, actor_id, actor_name, actor_role, action, target, details, created_at)
values (${q(idFor("audit", log.id))}, ${actor ? q(userId(actor.id)) : "null"}, ${q(log.performedBy)}, ${q(log.role)}::public.user_role, ${q(log.action)}, ${q(log.target)}, ${q(log.details)}, ${q(parseTimestamp(log.timestamp))})
on conflict (id) do nothing;`);
}
out("");
for (const log of D.syncLogs) {
  const actor = byName.get(log.instructorName);
  out(`insert into public.device_sync_logs (id, instructor_id, device_id, record_count, status, synced_at)
values (${q(idFor("sync", log.id))}, ${actor ? q(userId(actor.id)) : "null"}, ${q(log.deviceId)}, ${n(log.recordCount)}, ${q(log.status)}::public.sync_status, ${q(parseTimestamp(log.timestamp))})
on conflict (id) do nothing;`);
}

// ─── Derived state ───────────────────────────────────────────────────────────
section("Derived state");
out("-- Progress is normally maintained by the lesson_progress trigger. The seed");
out("-- has no per-item completion, so the mock percentages are applied directly.");
out("");
for (const c of D.courses) {
  if (typeof c.progress !== "number") continue;
  out(`update public.enrollments set progress = ${n(c.progress)} where course_id = ${q(idFor("course", c.id))} and student_id = ${q(userId(STUDENT.id))};`);
}

// The seeded attempts carry a score but no per-question answers, which would
// make the results screen report every question wrong under a passing score.
// The repair function synthesises answers consistent with the recorded score.
section("Attempt integrity");
out("select public.backfill_attempt_answers();");

out("");
out("commit;");
out("");

writeFileSync(join(ROOT, "supabase/seed.sql"), lines.join("\n"), "utf8");
console.log(`supabase/seed.sql written — ${lines.length} lines`);
