create table if not exists public.creators (
  id text primary key,
  name text not null,
  platform_profiles jsonb not null default '[]'::jsonb,
  status text not null,
  notes text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id text primary key,
  creator_id text not null references public.creators(id) on delete cascade,
  creator_name text not null,
  amount numeric not null,
  payment_date text not null,
  video_url text,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists payments_creator_id_idx on public.payments(creator_id);
create index if not exists creators_created_at_idx on public.creators(created_at desc);

alter table public.creators enable row level security;
alter table public.payments enable row level security;

drop policy if exists "creators_select" on public.creators;
drop policy if exists "creators_insert" on public.creators;
drop policy if exists "creators_update" on public.creators;
drop policy if exists "creators_delete" on public.creators;
drop policy if exists "payments_select" on public.payments;
drop policy if exists "payments_insert" on public.payments;
drop policy if exists "payments_update" on public.payments;
drop policy if exists "payments_delete" on public.payments;

create policy "creators_select" on public.creators for select to anon using (true);
create policy "creators_insert" on public.creators for insert to anon with check (true);
create policy "creators_update" on public.creators for update to anon using (true);
create policy "creators_delete" on public.creators for delete to anon using (true);

create policy "payments_select" on public.payments for select to anon using (true);
create policy "payments_insert" on public.payments for insert to anon with check (true);
create policy "payments_update" on public.payments for update to anon using (true);
create policy "payments_delete" on public.payments for delete to anon using (true);
