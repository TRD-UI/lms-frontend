-- ─────────────────────────────────────────────────────────────────────────────
-- Assessments belong to the course's instructor, not to admins.
--
-- The original policies keyed off owns_course(), which returns true for any
-- admin. That let an admin author and delete assessments on somebody else's
-- course. The product rule is that the assigned instructor owns their course's
-- assessments; the admin portal is oversight and is now read-only to match.
--
-- Admins keep full read access, and keep write access to the course record
-- itself (including reassigning the instructor) — this migration narrows
-- assessment authoring only.
-- ─────────────────────────────────────────────────────────────────────────────

-- True only for the instructor actually assigned to the course.
create or replace function public.teaches_course(target_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.courses c
      join public.profiles p on p.id = auth.uid()
     where c.id = target_course_id
       and c.instructor_id = auth.uid()
       and p.role = 'instructor'
       and p.status = 'active'
  );
$$;

revoke all on function public.teaches_course(uuid) from public;
grant execute on function public.teaches_course(uuid) to authenticated;

-- ─── assessments ─────────────────────────────────────────────────────────────

drop policy if exists assessments_write_owner on public.assessments;

create policy assessments_write_instructor on public.assessments
  for all to authenticated
  using (public.teaches_course(course_id))
  with check (public.teaches_course(course_id));

-- Admin oversight: read every assessment, author none.
create policy assessments_read_admin on public.assessments
  for select to authenticated
  using (public.is_admin());

-- ─── questions ───────────────────────────────────────────────────────────────

drop policy if exists questions_staff_only on public.assessment_questions;

create policy questions_write_instructor on public.assessment_questions
  for all to authenticated
  using (exists (select 1 from public.assessments a
                  where a.id = assessment_id and public.teaches_course(a.course_id)))
  with check (exists (select 1 from public.assessments a
                       where a.id = assessment_id and public.teaches_course(a.course_id)));

create policy questions_read_admin on public.assessment_questions
  for select to authenticated
  using (public.is_admin());

-- ─── options ─────────────────────────────────────────────────────────────────
-- The answer-key column revoke from the assessments migration still stands:
-- neither an instructor nor an admin reads is_correct off the table directly.
-- Both go through assessment_authoring_payload().

drop policy if exists options_staff_only on public.question_options;

create policy options_write_instructor on public.question_options
  for all to authenticated
  using (exists (select 1 from public.assessment_questions q
                   join public.assessments a on a.id = q.assessment_id
                  where q.id = question_id and public.teaches_course(a.course_id)))
  with check (exists (select 1 from public.assessment_questions q
                        join public.assessments a on a.id = q.assessment_id
                       where q.id = question_id and public.teaches_course(a.course_id)));

create policy options_read_admin on public.question_options
  for select to authenticated
  using (public.is_admin());

-- ─── The authoring payload follows the same rule ─────────────────────────────
-- Admins may still read the key for oversight; only the instructor can write.

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

  if not (public.teaches_course(v_course_id) or public.is_admin()) then
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
