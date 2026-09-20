-- ─────────────────────────────────────────────────────────────────────────────
-- Two entry-pass problems.
--
-- 1. A pass was usable the moment the class was scheduled. A code that works
--    for three days before the door opens is a code that can be shared, and it
--    lets someone walk into the wrong session. Release is now same-day.
--
-- 2. Typing a pass code into the scanner always failed. redeem_entry_pass()
--    only understood the signed QR payload (TRD1.<id>.<hmac>), but the manual
--    fallback — the documented path for a learner with a flat battery — hands
--    it the human-readable code. It now accepts either.
-- ─────────────────────────────────────────────────────────────────────────────

/** True once the session is today. Passes are not valid in advance. */
create or replace function public.pass_is_releasable(p_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.course_sessions s
     where s.id = p_session_id
       and s.session_date = current_date
  );
$$;

grant execute on function public.pass_is_releasable(uuid) to authenticated;

-- ─── The QR is withheld until the day ────────────────────────────────────────

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

  -- The prerequisite gate comes first: a locked pass says what to go and do.
  if p.status = 'revoked' or not public.entry_pass_unlocked(s.course_id, p.student_id) then
    return jsonb_build_object(
      'released', false,
      'reason', 'gated',
      'blockingAssessmentId', public.blocking_assessment(s.course_id, p.student_id)
    );
  end if;

  if s.session_date > current_date then
    return jsonb_build_object(
      'released', false,
      'reason', 'not_yet',
      'availableOn', s.session_date
    );
  end if;

  if s.session_date < current_date then
    return jsonb_build_object('released', false, 'reason', 'expired');
  end if;

  return jsonb_build_object(
    'released', true,
    'payload', 'TRD1.' || p.id::text || '.' || public.entry_pass_signature(p.id, p.session_id),
    'passCode', p.pass_code
  );
end;
$$;

-- ─── Scanning accepts a signed payload or a typed code ───────────────────────

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
  manual boolean := false;
begin
  if not public.is_staff() then
    raise exception 'Staff only' using errcode = 'insufficient_privilege';
  end if;

  parts := string_to_array(trim(p_payload), '.');

  if array_length(parts, 1) = 3 and parts[1] = 'TRD1' then
    -- Scanned QR: the id is in the payload and the signature must verify.
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
  else
    -- Manual entry: look the code up directly. There is no signature to check,
    -- which is why it is the fallback and not the primary path.
    manual := true;
    select * into p from public.entry_passes
     where upper(pass_code) = upper(trim(p_payload));

    if p is null then
      return jsonb_build_object('valid', false, 'reason', 'unknown',
                                'message', 'No pass matches that code. Check the spelling, or look the learner up on the roster.');
    end if;
  end if;

  select * into s from public.course_sessions where id = p.session_id;
  select * into student from public.profiles where id = p.student_id;

  if p_session_id is not null and p.session_id <> p_session_id then
    return jsonb_build_object('valid', false, 'reason', 'wrong_session',
                              'studentName', student.name, 'passCode', p.pass_code,
                              'courseName', s.title,
                              'message', 'This pass is for a different session.');
  end if;

  if s.session_date > current_date then
    return jsonb_build_object('valid', false, 'reason', 'not_yet',
                              'studentName', student.name, 'passCode', p.pass_code,
                              'courseName', s.title,
                              'message', format('This class is on %s. The pass is not valid until then.',
                                                to_char(s.session_date, 'FMDay DD Mon')));
  end if;

  if s.session_date < current_date then
    return jsonb_build_object('valid', false, 'reason', 'expired',
                              'studentName', student.name, 'passCode', p.pass_code,
                              'courseName', s.title,
                              'message', 'This pass was for an earlier session.');
  end if;

  if p.status = 'revoked' or not public.entry_pass_unlocked(s.course_id, p.student_id) then
    return jsonb_build_object('valid', false, 'reason', 'gated',
                              'studentName', student.name, 'passCode', p.pass_code,
                              'courseName', s.title,
                              'message', 'Prerequisite not completed. Entry withheld.');
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

  insert into public.attendance_records
    (session_id, student_id, status, method, check_in_time, marked_by)
  values (p.session_id, p.student_id, 'present',
          case when manual then 'manual' else 'qr' end, now(), auth.uid())
  on conflict (session_id, student_id) do update
    set status = 'present',
        method = case when manual then 'manual' else 'qr' end,
        check_in_time = now(),
        marked_by = auth.uid();

  return jsonb_build_object('valid', true, 'studentName', student.name,
                            'passCode', p.pass_code, 'courseName', s.title,
                            'message', 'Entry pass verified. Prerequisite test: Passed.');
end;
$$;
