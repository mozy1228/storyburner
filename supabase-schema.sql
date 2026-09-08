-- STORYBURNER backend schema
create table if not exists public.story_entries (
  id bigint generated always as identity primary key,
  story_date date not null default current_date,
  position integer not null,
  content text not null check (char_length(content) between 1 and 100),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique (story_date, position)
);

alter table public.story_entries enable row level security;

grant select on public.story_entries to anon;
grant insert on public.story_entries to anon;

drop policy if exists "public can read approved entries" on public.story_entries;
create policy "public can read approved entries"
  on public.story_entries for select to anon
  using (status = 'approved' and story_date = current_date);

drop policy if exists "public can submit entries" on public.story_entries;
drop policy if exists "public can submit pending entries" on public.story_entries;
create policy "public can submit entries"
  on public.story_entries for insert to anon
  with check (status = 'approved' and story_date = current_date);

-- Admin review is intentionally not exposed to anon. Use the Supabase dashboard
-- or an authenticated admin panel for updates/rejections.
