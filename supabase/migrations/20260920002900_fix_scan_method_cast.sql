-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: a successful check-in failed with a type error.
--
-- `case when manual then 'manual' else 'qr' end` yields text, and
-- attendance_records.method is the attendance_method enum. Postgres refuses the
-- assignment, so redeem_entry_pass() aborted at the moment it mattered — the
-- pass was verified, the learner was standing there, and the call errored.
--
-- Only the success path touches attendance, which is why every rejection case
-- behaved correctly and this went unseen.
-- ─────────────────────────────────────────────────────────────────────────────

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
  check_in_method public.attendance_method;
begin
  if not public.is_staff() then
    raise exception 'Staff only' using errcode = 'insufficient_privilege';
  end if;

  parts := string_to_array(trim(p_payload), '.');

  if array_length(parts, 1) = 3 and parts[1] = 'TRD1' then
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
    manual := true;
    select * into p from public.entry_passes
     where upper(pass_code) = upper(trim(p_payload));

    if p is null then
      return jsonb_build_object('valid', false, 'reason', 'unknown',
                                'message', 'No pass matches that code. Check the spelling, or look the learner up on the roster.');
    end if;
  end if;

  check_in_method := case when manual then 'manual' else 'qr' end::public.attendance_method;

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
  values (p.session_id, p.student_id, 'present', check_in_method, now(), auth.uid())
  on conflict (session_id, student_id) do update
    set status = 'present',
        method = check_in_method,
        check_in_time = now(),
        marked_by = auth.uid();

  return jsonb_build_object('valid', true, 'studentName', student.name,
                            'passCode', p.pass_code, 'courseName', s.title,
                            'message', 'Entry pass verified. Checked in.');
end;
$$;
