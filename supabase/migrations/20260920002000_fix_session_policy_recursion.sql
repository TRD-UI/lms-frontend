-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: infinite recursion between course_sessions and entry_passes.
--
-- sessions_read_pass_holder asked "is there a pass for this session?", and the
-- entry_passes policy answers by asking "which session is this, and do you own
-- its course?" — each policy evaluating the other, forever. Postgres aborts
-- with `infinite recursion detected in policy`, which took down every read and
-- write of course_sessions, not just the pass-holder case.
--
-- The policy was redundant anyway: a pass is only ever issued to an enrolled
-- learner, and sessions_read already covers enrolment.
-- ─────────────────────────────────────────────────────────────────────────────

drop policy if exists sessions_read_pass_holder on public.course_sessions;
