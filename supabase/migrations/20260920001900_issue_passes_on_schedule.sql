-- ─────────────────────────────────────────────────────────────────────────────
-- Scheduling a class issues its entry passes.
--
-- sync_entry_passes() already reconciles a learner's passes across a course's
-- sessions, but nothing called it when a *new* session appeared — so a class
-- scheduled today left every enrolled learner without a pass until some other
-- event (a payment, a gating assessment) happened to trigger a sync.
--
-- Cancelling is handled by the existing cascade: entry_passes.session_id is
-- ON DELETE CASCADE, so removing a session removes its passes.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.issue_passes_for_session()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  learner uuid;
begin
  for learner in
    select student_id
      from public.enrollments
     where course_id = new.course_id
       and status in ('active', 'completed')
  loop
    perform public.sync_entry_passes(new.course_id, learner);
  end loop;
  return new;
end;
$$;

create trigger course_sessions_issue_passes
  after insert on public.course_sessions
  for each row execute function public.issue_passes_for_session();

revoke execute on function public.issue_passes_for_session() from anon, authenticated;

-- Learners need to see the session behind a pass, and staff need it for the
-- scanner. The existing sessions_read policy already covers enrolment; this
-- adds the pass holder, whose enrolment may since have lapsed.
create policy sessions_read_pass_holder on public.course_sessions
  for select to authenticated
  using (
    exists (
      select 1 from public.entry_passes p
       where p.session_id = course_sessions.id
         and p.student_id = auth.uid()
    )
  );
