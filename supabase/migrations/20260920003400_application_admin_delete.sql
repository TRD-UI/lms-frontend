-- ─────────────────────────────────────────────────────────────────────────────
-- An admin can remove an application record.
--
-- The table was created with a select policy and nothing else, on the grounds
-- that every state change should go through a function. That is right for
-- deciding one, but it left no way to remove a record at all — a duplicate, a
-- spam submission, or an erasure request. Deletes from the client were simply
-- refused, silently, because a blocked delete affects zero rows rather than
-- raising.
--
-- Restricted to admins: an applicant withdraws (which keeps the audit trail)
-- and an instructor decides, but neither erases.
-- ─────────────────────────────────────────────────────────────────────────────

create policy course_applications_admin_delete on public.course_applications
  for delete to authenticated
  using (public.is_admin());
