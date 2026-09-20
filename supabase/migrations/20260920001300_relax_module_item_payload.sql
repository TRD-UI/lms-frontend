-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: module_items_payload was stricter than the product.
--
-- The original constraint required every non-quiz item to carry a
-- storage_path or an external_url. That makes the coming content editor
-- awkward — an instructor adds "Responsive Patterns" to a module and uploads
-- the file afterwards — and it is not what the player expects: MediaViewer
-- already renders a "content not available" state for a sourceless item.
--
-- The quiz half of the rule stays: a quiz item without an assessment has
-- nothing to open.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.module_items drop constraint module_items_payload;

alter table public.module_items
  add constraint module_items_payload
  check (type <> 'quiz' or assessment_id is not null);

comment on column public.module_items.storage_path is
  'Object path in the course-content bucket. NULL until content is uploaded.';
