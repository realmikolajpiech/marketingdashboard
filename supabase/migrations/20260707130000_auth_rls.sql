-- Secure tables with per-user row level security (run after 20260707120000_initial.sql)

alter table public.creators add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.payments add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Remove legacy rows created before auth (no owner)
delete from public.payments where user_id is null;
delete from public.creators where user_id is null;

create index if not exists creators_user_id_idx on public.creators(user_id);
create index if not exists payments_user_id_idx on public.payments(user_id);

-- Remove public anon access
drop policy if exists "creators_select" on public.creators;
drop policy if exists "creators_insert" on public.creators;
drop policy if exists "creators_update" on public.creators;
drop policy if exists "creators_delete" on public.creators;
drop policy if exists "payments_select" on public.payments;
drop policy if exists "payments_insert" on public.payments;
drop policy if exists "payments_update" on public.payments;
drop policy if exists "payments_delete" on public.payments;

-- Authenticated users can only access their own rows
create policy "creators_select" on public.creators
  for select to authenticated using (auth.uid() = user_id);

create policy "creators_insert" on public.creators
  for insert to authenticated with check (auth.uid() = user_id);

create policy "creators_update" on public.creators
  for update to authenticated using (auth.uid() = user_id);

create policy "creators_delete" on public.creators
  for delete to authenticated using (auth.uid() = user_id);

create policy "payments_select" on public.payments
  for select to authenticated using (auth.uid() = user_id);

create policy "payments_insert" on public.payments
  for insert to authenticated with check (auth.uid() = user_id);

create policy "payments_update" on public.payments
  for update to authenticated using (auth.uid() = user_id);

create policy "payments_delete" on public.payments
  for delete to authenticated using (auth.uid() = user_id);
