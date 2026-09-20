-- ─────────────────────────────────────────────────────────────────────────────
-- Row-level security.
--
-- Default posture: deny. Every table below has RLS enabled, and anything not
-- matched by a policy is refused. Mutations that carry business rules
-- (grading, seat allocation, pass release) have NO write policy at all — they
-- are reachable only through the SECURITY DEFINER functions, which is what
-- makes those rules impossible to bypass from the client.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.profiles            enable row level security;
alter table public.venues              enable row level security;
alter table public.courses             enable row level security;
alter table public.course_fee_tiers    enable row level security;
alter table public.course_modules      enable row level security;
alter table public.module_items        enable row level security;
alter table public.assessments         enable row level security;
alter table public.assessment_questions enable row level security;
alter table public.question_options    enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.attempt_answers     enable row level security;
alter table public.enrollments         enable row level security;
alter table public.lesson_progress     enable row level security;
alter table public.waitlist_entries    enable row level security;
alter table public.payments            enable row level security;
alter table public.course_sessions     enable row level security;
alter table public.entry_passes        enable row level security;
alter table public.attendance_records  enable row level security;
alter table public.subjective_grades   enable row level security;
alter table public.certificates        enable row level security;
alter table public.notifications       enable row level security;
alter table public.audit_logs          enable row level security;
alter table public.device_sync_logs    enable row level security;

-- ─── profiles ────────────────────────────────────────────────────────────────

create policy profiles_select_self_or_staff on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_staff());

create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy profiles_admin_all on public.profiles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- A user may edit their own name, avatar and phone — not their role or status.
-- RLS cannot express "this column may not change", so a trigger does it. It
-- exempts admins, who legitimately change both from the user management screen.
create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
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

create trigger profiles_guard_privileges
  before update on public.profiles
  for each row execute function public.guard_profile_privileges();

-- ─── venues ──────────────────────────────────────────────────────────────────

create policy venues_read on public.venues
  for select to authenticated using (true);

create policy venues_admin_write on public.venues
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ─── courses ─────────────────────────────────────────────────────────────────
-- The catalog and landing page are public, so anon may read published courses.

create policy courses_read_published on public.courses
  for select to anon, authenticated
  using (status = 'published');

create policy courses_read_own_drafts on public.courses
  for select to authenticated
  using (public.is_admin() or instructor_id = auth.uid());

create policy courses_insert_staff on public.courses
  for insert to authenticated
  with check (public.is_admin() or (public.is_staff() and instructor_id = auth.uid()));

create policy courses_update_owner on public.courses
  for update to authenticated
  using (public.owns_course(id)) with check (public.owns_course(id));

create policy courses_delete_owner on public.courses
  for delete to authenticated
  using (public.owns_course(id));

-- ─── course structure ────────────────────────────────────────────────────────
-- Readable whenever the parent course is readable; writable by its owner.

create policy fee_tiers_read on public.course_fee_tiers
  for select to anon, authenticated
  using (exists (select 1 from public.courses c
                  where c.id = course_id
                    and (c.status = 'published' or public.owns_course(c.id))));

create policy fee_tiers_write on public.course_fee_tiers
  for all to authenticated
  using (public.owns_course(course_id)) with check (public.owns_course(course_id));

create policy modules_read on public.course_modules
  for select to anon, authenticated
  using (exists (select 1 from public.courses c
                  where c.id = course_id
                    and (c.status = 'published' or public.owns_course(c.id))));

create policy modules_write on public.course_modules
  for all to authenticated
  using (public.owns_course(course_id)) with check (public.owns_course(course_id));

create policy module_items_read on public.module_items
  for select to anon, authenticated
  using (exists (select 1 from public.course_modules cm
                   join public.courses c on c.id = cm.course_id
                  where cm.id = module_id
                    and (c.status = 'published' or public.owns_course(c.id))));

create policy module_items_write on public.module_items
  for all to authenticated
  using (exists (select 1 from public.course_modules cm
                  where cm.id = module_id and public.owns_course(cm.course_id)))
  with check (exists (select 1 from public.course_modules cm
                       where cm.id = module_id and public.owns_course(cm.course_id)));

-- ─── assessments ─────────────────────────────────────────────────────────────
-- Learners read metadata only. Questions and options are staff-only at the
-- table level: a learner receives them exclusively through start_attempt() and
-- attempt_result(), which strip or reveal the key as appropriate.

create policy assessments_read_enrolled on public.assessments
  for select to authenticated
  using (
    public.owns_course(course_id)
    or (status = 'published' and exists (
          select 1 from public.enrollments e
           where e.course_id = assessments.course_id
             and e.student_id = auth.uid()
             and e.status in ('active', 'completed')))
  );

create policy assessments_write_owner on public.assessments
  for all to authenticated
  using (public.owns_course(course_id)) with check (public.owns_course(course_id));

create policy questions_staff_only on public.assessment_questions
  for all to authenticated
  using (exists (select 1 from public.assessments a
                  where a.id = assessment_id and public.owns_course(a.course_id)))
  with check (exists (select 1 from public.assessments a
                       where a.id = assessment_id and public.owns_course(a.course_id)));

create policy options_staff_only on public.question_options
  for all to authenticated
  using (exists (select 1 from public.assessment_questions q
                   join public.assessments a on a.id = q.assessment_id
                  where q.id = question_id and public.owns_course(a.course_id)))
  with check (exists (select 1 from public.assessment_questions q
                        join public.assessments a on a.id = q.assessment_id
                       where q.id = question_id and public.owns_course(a.course_id)));

-- Attempts are readable by the owner and the course's staff. There is
-- deliberately no insert or update policy: only start_attempt() and
-- submit_attempt() may write, so attempt caps, time limits and the score
-- itself cannot be forged from the client.
create policy attempts_read on public.assessment_attempts
  for select to authenticated
  using (student_id = auth.uid() or public.owns_course(course_id));

create policy attempt_answers_read on public.attempt_answers
  for select to authenticated
  using (exists (select 1 from public.assessment_attempts att
                  where att.id = attempt_id
                    and (att.student_id = auth.uid() or public.owns_course(att.course_id))));

-- ─── enrollment ──────────────────────────────────────────────────────────────

create policy enrollments_read on public.enrollments
  for select to authenticated
  using (student_id = auth.uid() or public.owns_course(course_id));

create policy enrollments_admin_write on public.enrollments
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy lesson_progress_read on public.lesson_progress
  for select to authenticated
  using (exists (select 1 from public.enrollments e
                  where e.id = enrollment_id
                    and (e.student_id = auth.uid() or public.owns_course(e.course_id))));

create policy waitlist_read on public.waitlist_entries
  for select to authenticated
  using (student_id = auth.uid() or public.is_admin());

create policy waitlist_admin_write on public.waitlist_entries
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy waitlist_leave on public.waitlist_entries
  for delete to authenticated
  using (student_id = auth.uid());

create policy payments_read on public.payments
  for select to authenticated
  using (student_id = auth.uid() or public.is_admin());

create policy payments_admin_write on public.payments
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ─── sessions, passes, attendance ────────────────────────────────────────────

create policy sessions_read on public.course_sessions
  for select to authenticated
  using (
    public.owns_course(course_id)
    or exists (select 1 from public.enrollments e
                where e.course_id = course_sessions.course_id
                  and e.student_id = auth.uid()
                  and e.status in ('active', 'completed'))
  );

create policy sessions_write_owner on public.course_sessions
  for all to authenticated
  using (public.owns_course(course_id)) with check (public.owns_course(course_id));

-- Passes are issued by sync_entry_passes() and consumed by redeem_entry_pass().
-- Read-only from the client.
create policy passes_read on public.entry_passes
  for select to authenticated
  using (
    student_id = auth.uid()
    or exists (select 1 from public.course_sessions s
                where s.id = session_id and public.owns_course(s.course_id))
  );

create policy attendance_read on public.attendance_records
  for select to authenticated
  using (
    student_id = auth.uid()
    or exists (select 1 from public.course_sessions s
                where s.id = session_id and public.owns_course(s.course_id))
  );

-- Manual marking from the cohort screen — the instructor override.
create policy attendance_write_staff on public.attendance_records
  for all to authenticated
  using (exists (select 1 from public.course_sessions s
                  where s.id = session_id and public.owns_course(s.course_id)))
  with check (exists (select 1 from public.course_sessions s
                       where s.id = session_id and public.owns_course(s.course_id)));

create policy grades_read on public.subjective_grades
  for select to authenticated
  using (
    student_id = auth.uid()
    or exists (select 1 from public.course_sessions s
                where s.id = session_id and public.owns_course(s.course_id))
  );

create policy grades_write_staff on public.subjective_grades
  for all to authenticated
  using (exists (select 1 from public.course_sessions s
                  where s.id = session_id and public.owns_course(s.course_id)))
  with check (exists (select 1 from public.course_sessions s
                       where s.id = session_id and public.owns_course(s.course_id)));

-- ─── credentials and platform ────────────────────────────────────────────────

create policy certificates_read on public.certificates
  for select to authenticated
  using (student_id = auth.uid() or public.is_staff());

create policy certificates_admin_write on public.certificates
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy notifications_read_own on public.notifications
  for select to authenticated using (user_id = auth.uid());

create policy notifications_update_own on public.notifications
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy notifications_admin_write on public.notifications
  for insert to authenticated with check (public.is_admin());

-- Append-only: admins may read, nobody may update or delete. Rows arrive only
-- through log_audit().
create policy audit_read_admin on public.audit_logs
  for select to authenticated using (public.is_admin());

create policy sync_logs_read on public.device_sync_logs
  for select to authenticated
  using (public.is_admin() or instructor_id = auth.uid());

-- ─── Grants ──────────────────────────────────────────────────────────────────
-- RLS only filters rows the role is already allowed to touch, so the table
-- grants still matter. question_options is omitted: its column-level grant was
-- set in the assessments migration and must not be widened back here.

grant usage on schema public to anon, authenticated;

grant select on public.courses, public.course_fee_tiers, public.course_modules,
               public.module_items, public.venues
  to anon, authenticated;

grant select, insert, update, delete on
  public.courses, public.course_fee_tiers, public.course_modules, public.module_items,
  public.assessments, public.assessment_questions, public.venues,
  public.attendance_records, public.subjective_grades, public.course_sessions,
  public.enrollments, public.waitlist_entries, public.payments,
  public.certificates, public.notifications, public.profiles
  to authenticated;

-- question_options had its SELECT narrowed to specific columns in the
-- assessments migration. Writes are unaffected and are granted explicitly here
-- so the authoring screens work regardless of default privileges.
grant insert, update, delete on public.question_options to authenticated;

grant select on
  public.assessment_attempts, public.attempt_answers, public.lesson_progress,
  public.entry_passes, public.audit_logs, public.device_sync_logs,
  public.course_seat_counts
  to authenticated;

grant select on public.course_seat_counts to anon;

-- RPCs the client calls directly.
grant execute on function
  public.start_attempt(uuid),
  public.submit_attempt(uuid, jsonb),
  public.attempt_result(uuid),
  public.assessment_authoring_payload(uuid),
  public.enroll_in_course(uuid),
  public.join_waitlist(uuid),
  public.checkout_course(uuid, public.payment_method),
  public.mark_item_complete(uuid, boolean),
  public.entry_pass_qr(uuid),
  public.entry_pass_unlocked(uuid, uuid),
  public.blocking_assessment(uuid, uuid),
  public.redeem_entry_pass(text, uuid),
  public.sync_attendance(text, jsonb),
  public.promote_from_waitlist(uuid),
  public.log_audit(text, text, text)
  to authenticated;

-- Internal only: never callable from a browser session.
revoke execute on function
  public.mark_payment_settled(text),
  public.sync_entry_passes(uuid, uuid),
  public.entry_pass_signature(uuid, uuid),
  public.recompute_enrollment_progress(),
  public.handle_new_user(),
  public.guard_profile_privileges()
  from anon, authenticated;
