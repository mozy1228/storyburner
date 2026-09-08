-- STORYBURNER production schema: safe reads and atomic anonymous submissions.
alter table public.story_entries add column if not exists visitor_id uuid;
create unique index if not exists story_entries_one_per_visitor_per_day on public.story_entries (story_date, visitor_id) where visitor_id is not null;
create index if not exists story_entries_story_date_position_idx on public.story_entries (story_date, position);

alter table public.story_entries enable row level security;
revoke insert, update, delete on public.story_entries from anon, authenticated;
grant select on public.story_entries to anon;
drop policy if exists "public can read approved entries" on public.story_entries;
drop policy if exists "public can submit entries" on public.story_entries;
drop policy if exists "public can submit pending entries" on public.story_entries;
create policy "public can read today's approved entries"
  on public.story_entries for select to anon
  using (status = 'approved' and story_date = (now() at time zone 'Asia/Taipei')::date);

create or replace function public.submit_story_entry(p_content text, p_visitor_id uuid)
returns table (entry_position integer)
language plpgsql security definer set search_path = public
as $$
declare
  v_date date := (now() at time zone 'Asia/Taipei')::date;
  v_content text := trim(p_content);
  v_normalized text;
  v_position integer;
begin
  if p_visitor_id is null then raise exception 'visitor id is required'; end if;
  if char_length(v_content) not between 1 and 100 then raise exception 'content must be 1 to 100 characters'; end if;
  v_normalized := regexp_replace(lower(v_content), '[[:space:]]+', '', 'g');
  if v_normalized ~ '(幹|媽的|他媽|操|靠北|靠夭|雞巴|王八蛋|智障|白痴|fuck|shit|bitch|asshole)' then raise exception 'content contains banned language'; end if;
  perform pg_advisory_xact_lock(hashtext(v_date::text));
  if exists (select 1 from public.story_entries where story_date = v_date and visitor_id = p_visitor_id) then raise exception 'already submitted today'; end if;
  select coalesce(max(position), 0) + 1 into v_position from public.story_entries where story_date = v_date;
  if v_position > 100 then raise exception 'story is full'; end if;
  insert into public.story_entries (story_date, position, content, status, visitor_id) values (v_date, v_position, v_content, 'approved', p_visitor_id);
  return query select v_position;
end;
$$;
revoke all on function public.submit_story_entry(text, uuid) from public;
grant execute on function public.submit_story_entry(text, uuid) to anon;

create or replace function public.purge_expired_story_entries()
returns void language sql security definer set search_path = public
as $$ delete from public.story_entries where story_date < (now() at time zone 'Asia/Taipei')::date; $$;
revoke all on function public.purge_expired_story_entries() from public;

-- Enable pg_cron in Supabase Dashboard > Integrations > Cron before this block can schedule the purge.
-- 16:00 UTC equals 00:00 in Taiwan (UTC+8).
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    execute 'select cron.unschedule(jobid) from cron.job where jobname = ''storyburner-midnight-purge''';
    execute 'select cron.schedule(''storyburner-midnight-purge'', ''0 16 * * *'', ''select public.purge_expired_story_entries();'')';
  end if;
end $$;
