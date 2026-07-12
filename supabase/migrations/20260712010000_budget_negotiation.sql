-- Adds negotiation offer history per creator, and a per-user campaign budget.

alter table public.creators add column if not exists negotiation_log jsonb not null default '[]'::jsonb;

create table if not exists public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  budget numeric not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

drop policy if exists "settings_select" on public.settings;
drop policy if exists "settings_insert" on public.settings;
drop policy if exists "settings_update" on public.settings;

create policy "settings_select" on public.settings
  for select to authenticated using (auth.uid() = user_id);

create policy "settings_insert" on public.settings
  for insert to authenticated with check (auth.uid() = user_id);

create policy "settings_update" on public.settings
  for update to authenticated using (auth.uid() = user_id);
