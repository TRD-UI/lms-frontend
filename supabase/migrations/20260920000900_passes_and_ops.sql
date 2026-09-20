-- ─────────────────────────────────────────────────────────────────────────────
-- Entry-pass gating, signed QR payloads, scanning, attendance sync,
-- certificates and waitlist promotion.
-- ─────────────────────────────────────────────────────────────────────────────

-- True when every published, entry-pass-gating assessment on the course has a
-- passing attempt from this student. Ports entryPassUnlocked() from
-- src/store/lms-store.tsx, which is the rule the UI already shows.
create or replace function public.entry_pass_unlocked(p_course_id uuid, p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
      from public.assessments a
     where a.course_id = p_course_id
       and a.gates_entry_pass
       and a.status = 'published'
       and not exists (
         select 1 from public.assessment_attempts att
          where att.assessment_id = a.id
            and att.student_id = p_student_id
            and att.passed
       )
  );
$$;

-- Which gating assessment is still outstanding, for the "locked pass" CTA.
create or replace function public.blocking_assessment(p_course_id uuid, p_student_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select a.id
    from public.assessments a
   where a.course_id = p_course_id
     and a.gates_entry_pass
     and a.status = 'published'
     and not exists (
       select 1 from public.assessment_attempts att
        where att.assessment_id = a.id
          and att.student_id = p_student_id
          and att.passed
     )
   order by a.created_at
   limit 1;
$$;

-- Issues (or revokes) passes for every upcoming session of a course, according
-- to enrollment state and gating. Called after a payment settles and after a
-- gating assessment is passed.
create or replace function public.sync_entry_passes(p_course_id uuid, p_student_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  s record;
  enrolled boolean;
  unlocked boolean;
begin
  select exists (
    select 1 from public.enrollments
     where course_id = p_course_id and student_id = p_student_id
       and status in ('active', 'completed')
  ) into enrolled;

  unlocked := public.entry_pass_unlocked(p_course_id, p_student_id);

  for s in
    select * from public.course_sessions
     where course_id = p_course_id and session_date >= current_date
  loop
    if enrolled and unlocked then
      insert into public.entry_passes (session_id, student_id, pass_code)
      values (
        s.id,
        p_student_id,
        upper(
          regexp_replace(substr(s.title, 1, 3), '[^a-zA-Z]', '', 'g') || '-' ||
          to_char(s.session_date, 'YYYY') || '-' ||
          substr(encode(extensions.gen_random_bytes(4), 'hex'), 1, 6)
        )
      )
      on conflict (session_id, student_id) do update
        set status = case when entry_passes.status = 'revoked' then 'active'
                          else entry_passes.status end;
    else
      update public.entry_passes
         set status = 'revoked'
       where session_id = s.id and student_id = p_student_id and status = 'active';
    end if;
  end loop;
end;
$$;

-- ─── Signed QR ───────────────────────────────────────────────────────────────
-- The scannable payload is TRD1.<pass id>.<hmac>. The pass code alone is not
-- sufficient to check anyone in: redeem_entry_pass() recomputes the HMAC from
-- the server-held secret and rejects a mismatch.

create or replace function public.entry_pass_signature(p_pass_id uuid, p_session_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public, private, extensions
as $$
declare
  secret text;
begin
  select value into secret from private.app_secrets where key = 'entry_pass_hmac';
  return substr(
    encode(extensions.hmac(p_pass_id::text || ':' || p_session_id::text, secret, 'sha256'), 'hex'),
    1, 32
  );
end;
$$;

-- Returns the payload to render as a QR, but only once the prerequisite is
-- cleared and only to the pass holder.
create or replace function public.entry_pass_qr(p_pass_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  p public.entry_passes;
  s public.course_sessions;
begin
  select * into p from public.entry_passes where id = p_pass_id;
  if p is null then
    raise exception 'Pass not found' using errcode = 'no_data_found';
  end if;
  if p.student_id <> auth.uid() and not public.is_staff() then
    raise exception 'Not your pass' using errcode = 'insufficient_privilege';
  end if;

  select * into s from public.course_sessions where id = p.session_id;

  if p.status <> 'active' or not public.entry_pass_unlocked(s.course_id, p.student_id) then
    return jsonb_build_object(
      'released', false,
      'blockingAssessmentId', public.blocking_assessment(s.course_id, p.student_id)
    );
  end if;

  return jsonb_build_object(
    'released', true,
    'payload', 'TRD1.' || p.id::text || '.' || public.entry_pass_signature(p.id, p.session_id),
    'passCode', p.pass_code
  );
end;
$$;

-- Instructor-side scan. Distinguishes unknown, forged, already-used and
-- wrong-session codes, which is what the scanner UI already renders.
create or replace function public.redeem_entry_pass(p_payload text, p_session_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  parts text[];
  pass_id uuid;
  p public.entry_passes;
  s public.course_sessions;
  student public.profiles;
begin
  if not public.is_staff() then
    raise exception 'Staff only' using errcode = 'insufficient_privilege';
  end if;

  parts := string_to_array(p_payload, '.');
  if array_length(parts, 1) <> 3 or parts[1] <> 'TRD1' then
    return jsonb_build_object('valid', false, 'reason', 'malformed',
                              'message', 'Unrecognised pass code. Verify the student''s enrollment.');
  end if;

  begin
    pass_id := parts[2]::uuid;
  exception when others then
    return jsonb_build_object('valid', false, 'reason', 'malformed',
                              'message', 'Unrecognised pass code.');
  end;

  select * into p from public.entry_passes where id = pass_id;
  if p is null then
    return jsonb_build_object('valid', false, 'reason', 'unknown',
                              'message', 'Invalid pass code. No matching entry found.');
  end if;

  if public.entry_pass_signature(p.id, p.session_id) <> parts[3] then
    return jsonb_build_object('valid', false, 'reason', 'bad_signature',
                              'message', 'Pass signature does not verify. Possible forgery.');
  end if;

  select * into s from public.course_sessions where id = p.session_id;
  select * into student from public.profiles where id = p.student_id;

  if p_session_id is not null and p.session_id <> p_session_id then
    return jsonb_build_object('valid', false, 'reason', 'wrong_session',
                              'studentName', student.name, 'passCode', p.pass_code,
                              'courseName', s.title,
                              'message', 'This pass is for a different session.');
  end if;

  if p.status = 'revoked' then
    return jsonb_build_object('valid', false, 'reason', 'revoked',
                              'studentName', student.name, 'passCode', p.pass_code,
                              'courseName', s.title,
                              'message', 'Pass revoked. Prerequisite not completed.');
  end if;

  if p.status = 'used' then
    return jsonb_build_object('valid', false, 'reason', 'already_used',
                              'studentName', student.name, 'passCode', p.pass_code,
                              'courseName', s.title,
                              'message', 'Pass already scanned at ' ||
                                         to_char(p.used_at, 'HH12:MI AM') || '.');
  end if;

  update public.entry_passes
     set status = 'used', used_at = now(), used_by = auth.uid()
   where id = p.id;

  insert into public.attendance_records (session_id, student_id, status, method, check_in_time, marked_by)
  values (p.session_id, p.student_id, 'present', 'qr', now(), auth.uid())
  on conflict (session_id, student_id) do update
    set status = 'present', method = 'qr', check_in_time = now(), marked_by = auth.uid();

  return jsonb_build_object('valid', true, 'studentName', student.name,
                            'passCode', p.pass_code, 'courseName', s.title,
                            'message', 'Entry pass verified. Prerequisite test: Passed.');
end;
$$;

-- ─── Offline attendance sync ─────────────────────────────────────────────────
-- Idempotent by (device_id, client_record_id): replaying a batch after a flaky
-- connection cannot double-count.

create or replace function public.sync_attendance(p_device_id text, p_records jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  rec jsonb;
  applied integer := 0;
begin
  if not public.is_staff() then
    raise exception 'Staff only' using errcode = 'insufficient_privilege';
  end if;

  for rec in select * from jsonb_array_elements(p_records)
  loop
    insert into public.attendance_records
      (session_id, student_id, status, method, check_in_time, marked_by, device_id, client_record_id)
    values (
      (rec ->> 'sessionId')::uuid,
      (rec ->> 'studentId')::uuid,
      (rec ->> 'status')::public.attendance_status,
      coalesce((rec ->> 'method')::public.attendance_method, 'manual'),
      nullif(rec ->> 'checkInTime', '')::timestamptz,
      auth.uid(),
      p_device_id,
      rec ->> 'clientRecordId'
    )
    -- Unqualified, because attendance_records also carries a
    -- unique (session_id, student_id): a learner already checked in by QR would
    -- otherwise raise instead of being skipped. FOUND counts real inserts, so a
    -- replayed batch reports 0 applied rather than inflating the log.
    on conflict do nothing;
    if found then
      applied := applied + 1;
    end if;
  end loop;

  insert into public.device_sync_logs (instructor_id, device_id, record_count, status)
  values (auth.uid(), p_device_id, applied, 'synced');

  return jsonb_build_object('applied', applied);
end;
$$;

-- ─── Waitlist ────────────────────────────────────────────────────────────────

create or replace function public.promote_from_waitlist(p_entry_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  w public.waitlist_entries;
  c public.courses;
  taken integer;
  e public.enrollments;
begin
  if not public.is_admin() then
    raise exception 'Admin only' using errcode = 'insufficient_privilege';
  end if;

  select * into w from public.waitlist_entries where id = p_entry_id for update;
  if w is null or w.status <> 'waiting' then
    raise exception 'Waitlist entry not available' using errcode = 'no_data_found';
  end if;

  select * into c from public.courses where id = w.course_id for update;
  select count(*) into taken from public.enrollments
   where course_id = w.course_id and status in ('active', 'completed');

  if c.seats_total > 0 and taken >= c.seats_total then
    raise exception 'Course is full' using errcode = 'check_violation';
  end if;

  insert into public.enrollments (course_id, student_id, status)
  values (w.course_id, w.student_id, 'active')
  on conflict (course_id, student_id) do update set status = 'active'
  returning * into e;

  update public.waitlist_entries set status = 'promoted' where id = p_entry_id;

  -- Close the gap behind them.
  update public.waitlist_entries
     set position = position - 1
   where course_id = w.course_id and status = 'waiting' and position > w.position;

  perform public.sync_entry_passes(w.course_id, w.student_id);
  perform public.log_audit('Waitlist Promoted',
                           (select name from public.profiles where id = w.student_id) || ' → ' || c.title,
                           'Student promoted from waitlist position #' || w.position || '.');

  return to_jsonb(e);
end;
$$;

-- ─── Certificates ────────────────────────────────────────────────────────────

-- Public: verifies a credential id without exposing the certificates table.
-- Granted to anon so an employer can check a certificate without an account.
create or replace function public.verify_certificate(p_credential_id text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
           'valid',        cert.revoked_at is null,
           'studentName',  pr.name,
           'courseTitle',  c.title,
           'issuedAt',     cert.issued_at,
           'credentialId', cert.credential_id
         )
    into result
    from public.certificates cert
    join public.profiles pr on pr.id = cert.student_id
    join public.courses  c  on c.id  = cert.course_id
   where cert.credential_id = p_credential_id;

  return coalesce(result, jsonb_build_object('valid', false));
end;
$$;

grant execute on function public.verify_certificate(text) to anon, authenticated;
