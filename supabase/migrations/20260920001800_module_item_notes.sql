-- ─────────────────────────────────────────────────────────────────────────────
-- Lesson notes.
--
-- The player renders rich-text notes under a lesson's media and the authoring
-- dialog writes them, but the column was never added — so every note would
-- have been silently dropped on save.
--
-- Stored as sanitised HTML. Sanitising happens client-side on the way in and
-- again on the way out, so a row that predates the sanitiser, or one written by
-- some other client, still cannot inject markup into the player.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.module_items
  add column if not exists notes text;

comment on column public.module_items.notes is
  'Sanitised rich-text HTML shown beneath the lesson media in the player.';
