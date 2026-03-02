create table if not exists public.research_presets (
  preset_key text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_research_presets_updated_at
  on public.research_presets (updated_at desc);
