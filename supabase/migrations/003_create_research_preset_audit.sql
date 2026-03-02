create table if not exists public.research_preset_audit (
  id uuid primary key default gen_random_uuid(),
  preset_key text not null,
  actor_user_id text not null,
  actor_username text not null,
  source text not null default 'supabase',
  payload jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_research_preset_audit_preset_key_created_at
  on public.research_preset_audit (preset_key, created_at desc);
