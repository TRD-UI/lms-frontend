# Roles, Features & Endpoints

Backend contract required by the current frontend. All routes prefixed `/api/v1`.
Auth: `Authorization: Bearer <jwt>`. Role enforced server-side per section.

---

## Roles

| Role | Portal | Scope |
|---|---|---|
| `student` | `/dashboard` | Own enrollments, attempts, passes, certificates |
| `instructor` | `/instructor` | Own courses, their assessments, own cohorts |
| `admin` | `/admin` | Everything, plus users, payments, system |

---

## Shared — Auth & Identity

| Feature | EP | What it does |
|---|---|---|
| Student login | `POST /auth/login` | Validates email + password, returns a JWT and profile. Rejects staff accounts so the two login surfaces stay separate. |
| Staff login (instructor/admin) | `POST /auth/staff-login` | Same for staff, returning the role so the client routes to the right portal. Room for a second factor later. |
| Signup | `POST /auth/signup` | Creates the account, sends verification, returns a session. `409` on duplicate email. |
| Forgot / reset password | `POST /auth/forgot-password` · `POST /auth/reset-password` | Emails a single-use, time-boxed token; the second consumes it. Always answer `200` on request so it can't enumerate accounts. |
| Refresh session | `POST /auth/refresh` | Exchanges a refresh token for a new access token, rotating the refresh token each call. |
| Logout | `POST /auth/logout` | Revokes the current refresh token server-side. |
| Current user | `GET /me` | Returns id, name, email, role, avatar — drives the portal headers and role scoping. |
| Update profile | `PATCH /me` | Updates the caller's own name, avatar, phone. Role and status are not writable here. |
| Notifications | `GET /me/notifications` · `PATCH /me/notifications/:id/read` | Lists notifications newest-first with an unread count for the header badge; PATCH marks one read. |
| Global search | `GET /search?q=` | Cross-entity typeahead scoped to the caller's role — courses and assessments, plus users for admin. |

---

## Student

### Catalog & Enrollment
| Feature | EP | What it does |
|---|---|---|
| Browse catalog | `GET /courses?category=&q=` | Published courses with seats, fees and category. Powers the My Learning grid and its filter. |
| Course details | `GET /courses/:courseId` | Full record plus the caller's enrollment state, so the client knows to show "Enroll" or "Continue". |
| My enrolled courses | `GET /me/enrollments` | The caller's courses with progress and payment status — the list treated as unlocked. |
| Enroll / apply | `POST /courses/:courseId/enroll` | Creates the enrollment once payment clears, decrementing seats atomically. `409` when full. |
| Join waitlist | `POST /courses/:courseId/waitlist` | Queues the caller for a full course and returns their position. |
| Pay fee | `POST /payments/checkout` · `GET /payments/:reference` | Initialises the transaction and returns an authorization URL; the GET verifies on redirect and activates the enrollment. |

### Learning
| Feature | EP | What it does |
|---|---|---|
| Course modules & items | `GET /courses/:courseId/modules` | Ordered modules and items (video, pdf, document, quiz) with per-item completion. Drives the player sidebar. |
| Player item | `GET /courses/:courseId/modules/:moduleId/items/:itemId` | One item's payload — a signed expiring media URL, or the linked `assessmentId` for a quiz item. |
| Mark item complete | `POST /me/progress` | Records completion and recomputes course progress. Idempotent per item. |
| Course progress | `GET /me/enrollments/:courseId/progress` | Percent complete, items done and last-viewed item for "resume where you left off". |

### Assessments
| Feature | EP | What it does |
|---|---|---|
| My assessments | `GET /me/assessments` | Every published assessment across enrolled courses with best score and attempts left. Backs the Tests hub and its filters. |
| Assessment metadata | `GET /assessments/:assessmentId` | Title, kind, pass mark, time limit, attempt cap, question count. No questions, no answers. |
| Start attempt | `POST /assessments/:assessmentId/attempts` | Opens an attempt and returns questions **without the answer key**. `403` when the cap is exhausted; `startedAt` anchors the time limit. |
| Submit attempt | `POST /assessments/:assessmentId/attempts/:attemptId/submit` | Grades server-side and returns score, pass/fail, points. Rejects or auto-submits a late submission. |
| Attempt result | `GET /attempts/:attemptId` | Per-question correctness, correct options and explanations. Readable only after submission, by the owner, their instructor or an admin. |
| Remediation | `GET /attempts/:attemptId/remediation` | The modules mapped to missed questions, so results can link straight back into the right lessons. |
| My attempt history | `GET /me/attempts?assessmentId=` | The caller's attempts newest-first, for "best score" and "attempts left". |

> Grading, the time limit and `maxAttempts` are server-authoritative. The answer key must never appear in the start-attempt payload.

### Passes & Certificates
| Feature | EP | What it does |
|---|---|---|
| My entry passes | `GET /me/passes` | Passes split active/past, each flagged locked or released. A locked pass carries the blocking assessment for the CTA. |
| Single pass + QR | `GET /me/passes/:passId` | One pass plus the signed QR payload used at the door. Returns the QR only once the prerequisite is cleared. |
| Pass eligibility | `GET /me/passes/:passId/eligibility` | Whether every gating assessment on that course is passed, and which one is outstanding if not. |
| My certificates | `GET /me/certificates` | Certificates earned, with course, issue date and verification code. |
| Download certificate | `GET /me/certificates/:id/download` | Streams the PDF — should be a short-lived signed URL, not a raw file. |

---

## Instructor

### Dashboard
| Feature | EP | What it does |
|---|---|---|
| Home metrics | `GET /instructor/stats` | Courses taught, learners, assessments (and drafts), attendance rate — all scoped to the caller. |
| Enrollment per course | `GET /instructor/analytics/enrollment` | Enrolled vs capacity per owned course, for the horizontal bar chart. |
| Attendance per session | `GET /instructor/analytics/attendance` | Present/absent counts per session, for the stacked attendance chart. |
| Course readiness | `GET /instructor/analytics/course-readiness` | Per-course scores 0–100 across seats filled, content depth, assessments, published share, engagement, pass rate — the radar's six axes. |

### Courses
| Feature | EP | What it does |
|---|---|---|
| My courses | `GET /instructor/courses` | Courses where the caller is the assigned instructor, with module and assessment counts. |
| Create course | `POST /courses` | Creates a draft with the caller as instructor. Returns the id so the client navigates straight in. |
| Update course | `PATCH /courses/:courseId` | Partial update of title, description, category, duration, venue, seats or fees. |
| Publish / unpublish | `PATCH /courses/:courseId` `{status}` | Flips visibility to learners. A draft never appears in the catalog. |
| Duplicate course | `POST /courses/:courseId/duplicate` | Deep-copies the course and modules as a new draft with zero enrollments. |
| Delete course | `DELETE /courses/:courseId` | Removes the course and cascades to its assessments. Should refuse, or need a force flag, while learners are enrolled. |
| Manage modules | `POST\|PATCH\|DELETE /courses/:courseId/modules[/:moduleId]` | Create, rename, reorder and remove modules. Reorder takes an explicit position so player sequence stays stable. |
| Manage module items | `POST\|PATCH\|DELETE /courses/:courseId/modules/:moduleId/items[/:itemId]` | Manage items in a module. A `quiz` item carries an `assessmentId`; others carry a media reference. |
| Upload media | `POST /uploads` | Accepts a video, PDF or document and returns a stored asset id and URL for use as a module item. |

### Assessments
| Feature | EP | What it does |
|---|---|---|
| Assessments on a course | `GET /courses/:courseId/assessments` | Each assessment with question count, attempt count and pass rate. Backs the per-course list in both portals. |
| Create assessment | `POST /courses/:courseId/assessments` | Creates a draft with kind, pass mark, time limit, attempt cap and gating flag — no questions yet. |
| Update settings | `PATCH /assessments/:assessmentId` | Updates settings. Only a `prerequisite` assessment may set `gatesEntryPass`. |
| Publish / unpublish | `PATCH /assessments/:assessmentId` `{status}` | Controls learner visibility. Unpublishing hides it without deleting attempts. |
| Duplicate | `POST /assessments/:assessmentId/duplicate` | Copies the assessment and its questions as a new draft. |
| Delete | `DELETE /assessments/:assessmentId` | Deletes the assessment and questions, retaining historical attempts for reporting. |
| Add question | `POST /assessments/:assessmentId/questions` | Adds prompt, type (single/multiple/boolean), options, answer key, difficulty, points, tags, optional remedial module. |
| Update question | `PATCH /assessments/:assessmentId/questions/:questionId` | Edits in place. Changing the key must not retro-grade already-submitted attempts. |
| Delete question | `DELETE /assessments/:assessmentId/questions/:questionId` | Removes the question from the assessment. |
| Attempts on an assessment | `GET /assessments/:assessmentId/attempts?page=&limit=` | Paginated submissions with score, outcome, attempt number and timestamp, for the Attempts tab. |

### Attendance
| Feature | EP | What it does |
|---|---|---|
| My cohorts | `GET /instructor/cohorts` | The caller's sessions with date, venue and present/absent totals. |
| Cohort roster | `GET /instructor/cohorts/:cohortId/students` | The roster with each learner's attendance status and any subjective grade. |
| Scan QR pass | `POST /instructor/scan` | Validates a scanned pass code and checks the learner in. Distinct reasons for unknown, already-used and wrong-session codes. |
| Mark attendance | `PATCH /instructor/cohorts/:cohortId/attendance/:studentId` | Sets present, absent or excused — the manual override behind the row menu. |
| Subjective grade | `POST /instructor/cohorts/:cohortId/grades/:studentId` | Records a grade and note for a learner in that session. |
| Offline sync push | `POST /instructor/attendance/sync` | Accepts records captured offline. Must be idempotent by device and record id or a retry double-counts. |

---

## Admin

### Global Analytics
| Feature | EP | What it does |
|---|---|---|
| Headline tiles | `GET /admin/analytics/overview` | Total revenue, active learners, average pass rate and retention, each with its period-over-period delta. |
| Revenue by month | `GET /admin/analytics/revenue?months=` | Tuition and application-fee totals per month for the stacked area chart. |
| Enrollment funnel | `GET /admin/analytics/funnel` | Stage counts from prospectus view through application, payment, prerequisite and certification. |
| Learner journey | `GET /admin/analytics/journey` | Nodes and weighted links describing flow from source to outcome — the Sankey payload. |
| Course health | `GET /admin/analytics/course-health` | Per-category scores across completion, attendance, pass rate, satisfaction, retention, punctuality, normalised 0–100. |
| Cohort retention | `GET /admin/analytics/retention` | Per-cohort retention by week since intake, plus cohort size, for the heat grid. |
| Assessment throughput | `GET /admin/analytics/assessment-throughput` | Attempts and passes per week across all published assessments. |
| Payment mix | `GET /admin/analytics/payment-mix` | Amount collected per method with its share of the total, for the donut. |
| Top courses | `GET /admin/analytics/top-courses` | Courses ranked by revenue with enrollment and pass rate alongside. |

### Payments
| Feature | EP | What it does |
|---|---|---|
| Transactions | `GET /admin/transactions?page=&limit=&status=` | Paginated ledger — reference, learner, course, amount, method, status, date. |
| Receipt | `GET /admin/transactions/:id/receipt` | The full receipt for one payment, for display or PDF export. |
| Retry settlement | `POST /admin/transactions/:id/retry` | Re-queues a failed settlement with the provider. Valid only while the transaction is `failed`. |
| Refund | `POST /admin/transactions/:id/refund` | Refunds a settled payment and moves it to `refunded`. Should also reconsider the linked enrollment. |

### Courses & Waitlist
| Feature | EP | What it does |
|---|---|---|
| All courses | `GET /admin/courses?page=&limit=&q=` | Every course regardless of owner or status, with instructor, capacity and assessment count. |
| Create / update / delete | `POST /courses` · `PATCH /courses/:id` · `DELETE /courses/:id` | Same operations as the instructor endpoints, unrestricted by ownership. |
| Assign instructor | `PATCH /courses/:id` `{instructorId}` | Reassigns the course, which re-scopes it across the instructor portal. |
| Waitlist | `GET /admin/waitlist?page=&limit=` | The queue ordered by position, with learner, course and request date. |
| Promote to enrolled | `POST /admin/waitlist/:entryId/promote` | Converts an entry into an enrollment, consuming a seat and resequencing positions. Fails when full. |
| Remove from waitlist | `DELETE /admin/waitlist/:entryId` | Drops the entry and closes the gap in the queue. |

### Assessments (course → assessment → detail)
| Feature | EP | What it does |
|---|---|---|
| Courses with counts | `GET /admin/assessments/summary` | One row per course: assessment count, published/draft split, question total, attempts, pass rate. The assessment home grid. |
| Assessments under a course | `GET /courses/:courseId/assessments` | The middle level of the drill-down. |
| Assessment detail | `GET /assessments/:assessmentId` | A single assessment with its questions and stats. |
| Full CRUD | *same EPs as Instructor § Assessments* | Identical operations without the ownership restriction. |

### Users
| Feature | EP | What it does |
|---|---|---|
| List users | `GET /admin/users?page=&limit=&role=&status=&q=` | Paginated directory filterable by role and status, with enrolled-course count and join date. |
| Create user | `POST /admin/users` | Creates a user with an assigned role and triggers an invitation email. |
| Change role | `PATCH /admin/users/:id/role` | Changes the role. Should refuse to strip the last remaining admin. |
| Suspend / activate | `PATCH /admin/users/:id/status` | Suspends or reactivates. A suspended user's tokens should be revoked immediately, not at next expiry. |
| Delete user | `DELETE /admin/users/:id` | Removes the account. Prefer a soft delete so attempt and payment history stays intact. |
| Email user | `POST /admin/users/:id/email` | Sends a direct message to the user from the admin console. |

### System
| Feature | EP | What it does |
|---|---|---|
| Health metrics | `GET /admin/system/health` | Service status, uptime and queue depth for the health tiles. |
| Device sync logs | `GET /admin/system/sync-logs?page=&limit=` | Paginated attendance-sync history per instructor device — timestamp, record count, status. |
| Retry a sync | `POST /admin/system/sync-logs/:id/retry` | Re-runs a failed device sync. |
| Audit trail | `GET /admin/system/audit?page=&limit=` | Paginated log of privileged actions: actor, role, action, target, timestamp. Append-only. |

---

## Conventions

- **Pagination** — `?page=1&limit=8`; response `{ data, meta: { page, limit, total, pageCount } }`.
- **Errors** — `{ error: { code, message, details? } }` with standard HTTP status.
- **Timestamps** — ISO-8601 UTC.
- **Money** — integer minor units (kobo), currency `NGN`.
- **Ownership** — instructor writes are rejected unless `course.instructorId === me.id`.
- **Idempotency** — `Idempotency-Key` header on payment and enrollment POSTs.
