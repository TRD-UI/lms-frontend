-- ─────────────────────────────────────────────────────────────────────────────
-- Server-authoritative operations.
--
-- Anything a learner could cheat by editing the client lives here as a
-- SECURITY DEFINER function: grading, attempt caps, time limits, entry-pass
-- release, seat allocation. The client calls these via supabase.rpc().
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Audit helper ────────────────────────────────────────────────────────────

create or replace function public.log_audit(p_action text, p_target text, p_details text default '')
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.profiles;
begin
  select * into actor from public.profiles where id = auth.uid();
  insert into public.audit_logs (actor_id, actor_name, actor_role, action, target, details)
  values (auth.uid(), coalesce(actor.name, 'system'), actor.role, p_action, p_target, p_details);
end;
$$;

-- ─── Authoring: the answer key, for course owners only ───────────────────────

create or replace function public.assessment_authoring_payload(p_assessment_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_course_id uuid;
  result jsonb;
begin
  select course_id into v_course_id from public.assessments where id = p_assessment_id;
  if v_course_id is null then
    raise exception 'Assessment not found' using errcode = 'no_data_found';
  end if;

  if not public.owns_course(v_course_id) then
    raise exception 'Not authorised to view the answer key for this assessment'
      using errcode = 'insufficient_privilege';
  end if;

  select jsonb_agg(q order by q.position) into result
  from (
    select aq.id, aq.prompt, aq.type, aq.explanation, aq.difficulty, aq.points,
           aq.tags, aq.remedial_module_id, aq.position,
           (select jsonb_agg(jsonb_build_object(
                     'id', o.id, 'label', o.label,
                     'isCorrect', o.is_correct, 'position', o.position
                   ) order by o.position)
              from public.question_options o
             where o.question_id = aq.id) as options
      from public.assessment_questions aq
     where aq.assessment_id = p_assessment_id
  ) q;

  return coalesce(result, '[]'::jsonb);
end;
$$;

-- ─── Attempts ────────────────────────────────────────────────────────────────

-- Opens an attempt and returns the questions WITHOUT the answer key. Enforces
-- the attempt cap and stamps started_at, which anchors the time limit.
create or replace function public.start_attempt(p_assessment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  a           public.assessments;
  prior_count integer;
  open_attempt public.assessment_attempts;
  new_attempt public.assessment_attempts;
  questions   jsonb;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = 'insufficient_privilege';
  end if;

  select * into a from public.assessments where id = p_assessment_id;
  if a is null or a.status <> 'published' then
    raise exception 'Assessment not available' using errcode = 'no_data_found';
  end if;

  if not exists (
    select 1 from public.enrollments e
     where e.course_id = a.course_id
       and e.student_id = auth.uid()
       and e.status in ('active', 'completed')
  ) then
    raise exception 'You are not enrolled on this course' using errcode = 'insufficient_privilege';
  end if;

  -- Resume rather than burn an attempt if one is already open and still in time.
  select * into open_attempt
    from public.assessment_attempts
   where assessment_id = p_assessment_id
     and student_id = auth.uid()
     and submitted_at is null
   order by started_at desc
   limit 1;

  if open_attempt.id is not null
     and (a.time_limit_minutes = 0
          or open_attempt.started_at + make_interval(mins => a.time_limit_minutes) > now())
  then
    new_attempt := open_attempt;
  else
    select count(*) into prior_count
      from public.assessment_attempts
     where assessment_id = p_assessment_id
       and student_id = auth.uid()
       and submitted_at is not null;

    if a.max_attempts > 0 and prior_count >= a.max_attempts then
      raise exception 'No attempts remaining for this assessment'
        using errcode = 'insufficient_privilege';
    end if;

    insert into public.assessment_attempts
      (assessment_id, course_id, student_id, attempt_number, started_at)
    values
      (p_assessment_id, a.course_id, auth.uid(),
       coalesce((select max(attempt_number) from public.assessment_attempts
                  where assessment_id = p_assessment_id and student_id = auth.uid()), 0) + 1,
       now())
    returning * into new_attempt;
  end if;

  select coalesce(jsonb_agg(q order by q.position), '[]'::jsonb) into questions
  from (
    select aq.id, aq.prompt, aq.type, aq.difficulty, aq.points, aq.tags, aq.position,
           (select jsonb_agg(jsonb_build_object('id', o.id, 'label', o.label)
                             order by o.position)
              from public.question_options o
             where o.question_id = aq.id) as options
      from public.assessment_questions aq
     where aq.assessment_id = p_assessment_id
  ) q;

  return jsonb_build_object(
    'attemptId',        new_attempt.id,
    'attemptNumber',    new_attempt.attempt_number,
    'startedAt',        new_attempt.started_at,
    'timeLimitMinutes', a.time_limit_minutes,
    'passingScore',     a.passing_score,
    'questions',        questions
  );
end;
$$;

-- Grades server-side. p_answers is [{"questionId": uuid, "selectedOptionIds": [uuid]}].
-- A submission past the time limit is still graded (auto-submit) rather than
-- discarded, matching the QuizTimer's expire behaviour in the UI.
create or replace function public.submit_attempt(p_attempt_id uuid, p_answers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  att      public.assessment_attempts;
  a        public.assessments;
  q        record;
  selected uuid[];
  correct_ids uuid[];
  is_correct  boolean;
  earned   integer := 0;
  possible integer := 0;
  final_score integer;
begin
  select * into att from public.assessment_attempts where id = p_attempt_id;
  if att is null then
    raise exception 'Attempt not found' using errcode = 'no_data_found';
  end if;
  if att.student_id <> auth.uid() then
    raise exception 'Not your attempt' using errcode = 'insufficient_privilege';
  end if;
  if att.submitted_at is not null then
    raise exception 'Attempt already submitted' using errcode = 'unique_violation';
  end if;

  select * into a from public.assessments where id = att.assessment_id;

  for q in
    select aq.id, aq.points
      from public.assessment_questions aq
     where aq.assessment_id = att.assessment_id
     order by aq.position
  loop
    possible := possible + q.points;

    select coalesce(array_agg((value #>> '{}')::uuid), '{}')
      into selected
      from jsonb_array_elements(
             coalesce((select ans -> 'selectedOptionIds'
                         from jsonb_array_elements(p_answers) ans
                        where (ans ->> 'questionId')::uuid = q.id
                        limit 1), '[]'::jsonb)
           );

    select coalesce(array_agg(o.id), '{}')
      into correct_ids
      from public.question_options o
     where o.question_id = q.id and o.is_correct;

    -- Exact set match: every correct option selected, nothing extra.
    is_correct := (selected <@ correct_ids) and (correct_ids <@ selected)
                  and array_length(correct_ids, 1) is not null;

    if is_correct then
      earned := earned + q.points;
    end if;

    insert into public.attempt_answers (attempt_id, question_id, selected_option_ids, correct, points_earned)
    values (p_attempt_id, q.id, selected, is_correct, case when is_correct then q.points else 0 end)
    on conflict (attempt_id, question_id) do update
      set selected_option_ids = excluded.selected_option_ids,
          correct             = excluded.correct,
          points_earned       = excluded.points_earned;
  end loop;

  final_score := case when possible = 0 then 0
                      else round(earned::numeric * 100 / possible) end;

  update public.assessment_attempts
     set score            = final_score,
         points_earned    = earned,
         points_possible  = possible,
         passed           = final_score >= a.passing_score,
         submitted_at     = now(),
         duration_seconds = greatest(0, extract(epoch from now() - att.started_at)::integer)
   where id = p_attempt_id
   returning * into att;

  -- Passing a gating assessment may release an entry pass.
  if att.passed and a.gates_entry_pass then
    perform public.sync_entry_passes(a.course_id, auth.uid());
  end if;

  return jsonb_build_object(
    'attemptId',      att.id,
    'score',          att.score,
    'pointsEarned',   att.points_earned,
    'pointsPossible', att.points_possible,
    'passed',         att.passed,
    'attemptNumber',  att.attempt_number,
    'submittedAt',    att.submitted_at
  );
end;
$$;

-- Per-question correctness, the correct options and explanations. Readable only
-- after submission, and only by the owner, the course instructor or an admin.
create or replace function public.attempt_result(p_attempt_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  att public.assessment_attempts;
  graded jsonb;
begin
  select * into att from public.assessment_attempts where id = p_attempt_id;
  if att is null then
    raise exception 'Attempt not found' using errcode = 'no_data_found';
  end if;
  if att.submitted_at is null then
    raise exception 'Attempt has not been submitted' using errcode = 'insufficient_privilege';
  end if;
  if att.student_id <> auth.uid() and not public.owns_course(att.course_id) then
    raise exception 'Not authorised to view this attempt' using errcode = 'insufficient_privilege';
  end if;

  select coalesce(jsonb_agg(gq order by gq.position), '[]'::jsonb) into graded
  from (
    select aq.id, aq.prompt, aq.type, aq.explanation, aq.difficulty, aq.points,
           aq.tags, aq.remedial_module_id, aq.position,
           aa.correct, aa.points_earned,
           coalesce(aa.selected_option_ids, '{}') as selected_option_ids,
           (select jsonb_agg(jsonb_build_object(
                     'id', o.id, 'label', o.label, 'isCorrect', o.is_correct
                   ) order by o.position)
              from public.question_options o
             where o.question_id = aq.id) as options
      from public.assessment_questions aq
      left join public.attempt_answers aa
             on aa.question_id = aq.id and aa.attempt_id = p_attempt_id
     where aq.assessment_id = att.assessment_id
  ) gq;

  return jsonb_build_object(
    'attempt', to_jsonb(att),
    'graded',  graded
  );
end;
$$;

-- ─── Enrollment and progress ─────────────────────────────────────────────────

create or replace function public.enroll_in_course(p_course_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.courses;
  taken integer;
  e public.enrollments;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = 'insufficient_privilege';
  end if;

  -- Lock the course row so two concurrent enrollments cannot both see the last
  -- free seat.
  select * into c from public.courses where id = p_course_id for update;
  if c is null or c.status <> 'published' then
    raise exception 'Course not available' using errcode = 'no_data_found';
  end if;

  select count(*) into taken
    from public.enrollments
   where course_id = p_course_id and status in ('active', 'completed');

  if c.seats_total > 0 and taken >= c.seats_total then
    raise exception 'Course is full' using errcode = 'check_violation';
  end if;

  insert into public.enrollments (course_id, student_id, status)
  values (p_course_id, auth.uid(), 'pending')
  on conflict (course_id, student_id) do update set status = enrollments.status
  returning * into e;

  return to_jsonb(e);
end;
$$;

create or replace function public.join_waitlist(p_course_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  next_position integer;
  w public.waitlist_entries;
begin
  select coalesce(max(position), 0) + 1 into next_position
    from public.waitlist_entries
   where course_id = p_course_id and status = 'waiting';

  insert into public.waitlist_entries (course_id, student_id, position)
  values (p_course_id, auth.uid(), next_position)
  on conflict (course_id, student_id) do update set status = 'waiting'
  returning * into w;

  return to_jsonb(w);
end;
$$;

create or replace function public.mark_item_complete(p_item_id uuid, p_complete boolean default true)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_course_id uuid;
  e public.enrollments;
begin
  select cm.course_id into v_course_id
    from public.module_items mi
    join public.course_modules cm on cm.id = mi.module_id
   where mi.id = p_item_id;

  if v_course_id is null then
    raise exception 'Item not found' using errcode = 'no_data_found';
  end if;

  select * into e from public.enrollments
   where course_id = v_course_id and student_id = auth.uid();

  if e is null then
    raise exception 'You are not enrolled on this course' using errcode = 'insufficient_privilege';
  end if;

  if p_complete then
    insert into public.lesson_progress (enrollment_id, module_item_id)
    values (e.id, p_item_id)
    on conflict (enrollment_id, module_item_id) do nothing;
  else
    delete from public.lesson_progress
     where enrollment_id = e.id and module_item_id = p_item_id;
  end if;

  update public.enrollments set last_item_id = p_item_id where id = e.id;

  select * into e from public.enrollments where id = e.id;
  return to_jsonb(e);
end;
$$;

-- ─── Payments (provider-free stub) ───────────────────────────────────────────
-- Creates a pending payment and immediately settles it, activating the
-- enrollment. Replacing this with Paystack means: keep create_payment, drop the
-- self-settle, and have the gateway webhook call mark_payment_settled().

create or replace function public.checkout_course(p_course_id uuid, p_method public.payment_method default 'card')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.courses;
  e public.enrollments;
  amount_due integer;
  p public.payments;
begin
  perform public.enroll_in_course(p_course_id);

  select * into c from public.courses where id = p_course_id;
  select * into e from public.enrollments
   where course_id = p_course_id and student_id = auth.uid();

  amount_due := coalesce(c.fee_amount,
                         (select min(amount) from public.course_fee_tiers where course_id = p_course_id),
                         0) + coalesce(c.application_fee, 0);

  insert into public.payments (reference, student_id, course_id, enrollment_id, amount, method, status)
  values ('TRD-' || upper(substr(encode(extensions.gen_random_bytes(6), 'hex'), 1, 10)),
          auth.uid(), p_course_id, e.id, amount_due, p_method, 'pending')
  returning * into p;

  -- Stand-in for the gateway callback.
  perform public.mark_payment_settled(p.reference);

  select * into p from public.payments where id = p.id;
  return to_jsonb(p);
end;
$$;

create or replace function public.mark_payment_settled(p_reference text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  p public.payments;
begin
  update public.payments
     set status = 'settled', settled_at = now()
   where reference = p_reference and status = 'pending'
   returning * into p;

  if p.id is null then
    return;
  end if;

  update public.enrollments
     set status = 'active'
   where id = p.enrollment_id and status = 'pending';

  insert into public.notifications (user_id, type, title, message)
  values (p.student_id, 'transaction', 'Payment Successful',
          'Your payment of ₦' || to_char(p.amount / 100.0, 'FM999,999,990.00') ||
          ' has been confirmed.');

  perform public.sync_entry_passes(p.course_id, p.student_id);
end;
$$;
