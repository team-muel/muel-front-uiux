alter table if exists public.research_preset_audit
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists idx_research_preset_audit_metadata_gin
  on public.research_preset_audit using gin (metadata);
