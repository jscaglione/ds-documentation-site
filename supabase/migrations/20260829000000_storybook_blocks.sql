-- Storybook story embeds on component pages (same save/discard model as figma_blocks).
alter table public.doc_state
  add column if not exists storybook_blocks jsonb not null default '[]'::jsonb;
