-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: an attempt could record a score with no answers behind it.
--
-- The seed inserted attempts with points_earned/score set but never wrote the
-- matching attempt_answers rows. attempt_result() left-joins those rows, so
-- every question came back `correct = null` while the header showed the stored
-- score — a results screen reading "100%" above "0 / 4 correct".
--
-- Two parts: repair the rows that exist, then make the state unreachable.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Repair ──────────────────────────────────────────────────────────────────
-- Synthesises answers consistent with the score already recorded: questions are
-- marked correct in order until the recorded points are accounted for, the rest
-- wrong. Exposed as a function so seed.sql can call it too.

create or replace function public.backfill_attempt_answers()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  att record;
  q record;
  remaining integer;
  correct_ids uuid[];
  wrong_id uuid;
  repaired integer := 0;
begin
  for att in
    select a.id, a.assessment_id, coalesce(a.points_earned, 0) as earned
      from public.assessment_attempts a
     where a.submitted_at is not null
       and not exists (select 1 from public.attempt_answers aa where aa.attempt_id = a.id)
  loop
    remaining := att.earned;

    for q in
      select id, points from public.assessment_questions
       where assessment_id = att.assessment_id
       order by position
    loop
      select coalesce(array_agg(o.id), '{}') into correct_ids
        from public.question_options o
       where o.question_id = q.id and o.is_correct;

      if remaining >= q.points and array_length(correct_ids, 1) is not null then
        insert into public.attempt_answers (attempt_id, question_id, selected_option_ids, correct, points_earned)
        values (att.id, q.id, correct_ids, true, q.points);
        remaining := remaining - q.points;
      else
        -- A wrong pick, so the review screen shows a real selection rather
        -- than a blank row.
        select o.id into wrong_id
          from public.question_options o
         where o.question_id = q.id and not o.is_correct
         order by o.position
         limit 1;

        insert into public.attempt_answers (attempt_id, question_id, selected_option_ids, correct, points_earned)
        values (att.id, q.id, case when wrong_id is null then '{}'::uuid[] else array[wrong_id] end, false, 0);
      end if;
    end loop;

    repaired := repaired + 1;
  end loop;

  return repaired;
end;
$$;

revoke execute on function public.backfill_attempt_answers() from anon, authenticated;

do $$
declare n integer;
begin
  n := public.backfill_attempt_answers();
  raise notice 'Repaired % attempt(s) that had a score but no answers', n;
end;
$$;

-- ─── Prevent ─────────────────────────────────────────────────────────────────
-- A submitted attempt's headline numbers must equal what its answers add up to.
-- submit_attempt() writes the answers first and the attempt last, so by the time
-- this fires the rows are in place.

create or replace function public.check_attempt_consistency()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  answer_points integer;
  answer_count integer;
  question_count integer;
begin
  if new.submitted_at is null then
    return new;
  end if;

  select coalesce(sum(points_earned), 0), count(*)
    into answer_points, answer_count
    from public.attempt_answers
   where attempt_id = new.id;

  select count(*) into question_count
    from public.assessment_questions
   where assessment_id = new.assessment_id;

  if answer_count <> question_count then
    raise exception
      'Attempt % records % answers but the assessment has % questions',
      new.id, answer_count, question_count
      using errcode = 'check_violation';
  end if;

  if coalesce(new.points_earned, -1) <> answer_points then
    raise exception
      'Attempt % records % points but its answers total %',
      new.id, new.points_earned, answer_points
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create constraint trigger assessment_attempts_consistent
  after insert or update on public.assessment_attempts
  deferrable initially deferred
  for each row execute function public.check_attempt_consistency();

revoke execute on function public.check_attempt_consistency() from anon, authenticated;
