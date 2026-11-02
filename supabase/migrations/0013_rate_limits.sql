-- Rate limiting lives in the database so a direct PostgREST call cannot bypass it.
-- Limits are intentionally conservative for a small campus marketplace.

create table if not exists public.moderation_limits (
  action text primary key,
  max_count integer not null check (max_count > 0),
  window_seconds integer not null check (window_seconds > 0),
  daily_max_count integer not null check (daily_max_count > 0),
  min_interval_seconds integer not null default 0 check (min_interval_seconds >= 0),
  enabled boolean not null default true
);

alter table public.moderation_limits enable row level security;
revoke all on public.moderation_limits from anon, authenticated;

insert into public.moderation_limits
  (action, max_count, window_seconds, daily_max_count, min_interval_seconds)
values
  ('listing', 5, 3600, 15, 60),
  ('need_post', 3, 3600, 10, 30),
  ('comment', 10, 600, 40, 3),
  ('message', 20, 600, 150, 1),
  ('review', 3, 3600, 5, 60),
  ('profile_update', 5, 3600, 20, 10),
  ('like', 60, 3600, 300, 0),
  ('repost', 60, 3600, 300, 0)
on conflict (action) do nothing;

create table if not exists public.write_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  created_at timestamptz not null default now()
);

create index if not exists write_events_user_action_created_at_idx
  on public.write_events (user_id, action, created_at desc);

alter table public.write_events enable row level security;
revoke all on public.write_events from anon, authenticated;

create or replace function public.enforce_write_limit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_action text := tg_argv[0];
  v_limit record;
  v_count integer;
  v_daily_count integer;
  v_oldest timestamptz;
  v_last timestamptz;
  v_retry integer;
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.account_state = 'suspended'
  ) then
    raise exception 'account_suspended' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.account_state = 'muted'
      and (p.muted_until is null or p.muted_until > now())
  ) then
    raise exception 'account_muted' using errcode = 'P0001';
  end if;

  select * into v_limit
  from public.moderation_limits
  where action = v_action and enabled = true;

  if not found then
    return new;
  end if;

  select count(*), min(created_at), max(created_at)
  into v_count, v_oldest, v_last
  from public.write_events
  where user_id = auth.uid()
    and action = v_action
    and created_at > now() - make_interval(secs => v_limit.window_seconds);

  if v_limit.min_interval_seconds > 0
    and v_last is not null
    and v_last > now() - make_interval(secs => v_limit.min_interval_seconds) then
    v_retry := greatest(
      ceil(extract(epoch from (v_last + make_interval(secs => v_limit.min_interval_seconds) - now())))::integer,
      1
    );
    raise exception 'rate_limited:%', v_retry using errcode = 'P0001';
  end if;

  if v_count >= v_limit.max_count then
    v_retry := greatest(
      ceil(extract(epoch from (v_oldest + make_interval(secs => v_limit.window_seconds) - now())))::integer,
      1
    );
    raise exception 'rate_limited:%', v_retry using errcode = 'P0001';
  end if;

  select count(*)
  into v_daily_count
  from public.write_events
  where user_id = auth.uid()
    and action = v_action
    and created_at > now() - interval '1 day';

  if v_daily_count >= v_limit.daily_max_count then
    raise exception 'rate_limited:%', 86400 using errcode = 'P0001';
  end if;

  insert into public.write_events (user_id, action)
  values (auth.uid(), v_action);

  return new;
end;
$$;

revoke all on function public.enforce_write_limit() from public;
grant execute on function public.enforce_write_limit() to authenticated;

create or replace function public.cleanup_write_events()
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  delete from public.write_events where created_at < now() - interval '7 days';
$$;

revoke all on function public.cleanup_write_events() from public;

drop trigger if exists listings_rate_limit on public.listings;
create trigger listings_rate_limit
  before insert on public.listings
  for each row execute function public.enforce_write_limit('listing');

drop trigger if exists need_posts_rate_limit on public.need_posts;
create trigger need_posts_rate_limit
  before insert on public.need_posts
  for each row execute function public.enforce_write_limit('need_post');

drop trigger if exists post_comments_rate_limit on public.post_comments;
create trigger post_comments_rate_limit
  before insert on public.post_comments
  for each row execute function public.enforce_write_limit('comment');

drop trigger if exists reviews_rate_limit on public.reviews;
create trigger reviews_rate_limit
  before insert on public.reviews
  for each row execute function public.enforce_write_limit('review');

drop trigger if exists messages_rate_limit on public.messages;
create trigger messages_rate_limit
  before insert on public.messages
  for each row execute function public.enforce_write_limit('message');

drop trigger if exists social_likes_rate_limit on public.social_likes;
create trigger social_likes_rate_limit
  before insert on public.social_likes
  for each row execute function public.enforce_write_limit('like');

drop trigger if exists social_reposts_rate_limit on public.social_reposts;
create trigger social_reposts_rate_limit
  before insert on public.social_reposts
  for each row execute function public.enforce_write_limit('repost');

drop trigger if exists profiles_rate_limit on public.profiles;
create trigger profiles_rate_limit
  before update on public.profiles
  for each row execute function public.enforce_write_limit('profile_update');
