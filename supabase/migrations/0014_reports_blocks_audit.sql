-- User reports, blocks, and an immutable moderation audit trail.

create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null
    check (target_type in ('listing', 'need_post', 'comment', 'message', 'review', 'profile')),
  target_id uuid not null,
  reason text not null
    check (reason in ('spam', 'harassment', 'hate', 'scam', 'impersonation', 'other')),
  details text
    check (details is null or char_length(trim(details)) between 1 and 500),
  snapshot text,
  status text not null default 'open'
    check (status in ('open', 'actioned', 'dismissed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  unique (reporter_id, target_type, target_id)
);

create index if not exists content_reports_status_created_at_idx
  on public.content_reports (status, created_at desc);

create index if not exists content_reports_target_idx
  on public.content_reports (target_type, target_id);

alter table public.content_reports enable row level security;

create policy "Users create their own reports"
  on public.content_reports for insert
  with check (auth.uid() = reporter_id);

create policy "Users read their own reports"
  on public.content_reports for select
  using (auth.uid() = reporter_id or public.is_admin());

create policy "Admins update reports"
  on public.content_reports for update
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.prepare_content_report()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- Reports are created by users, so ignore any client-supplied snapshot or
  -- workflow fields and rebuild them from the stored target.
  new.snapshot := null;
  new.status := 'open';
  new.reviewed_at := null;
  new.reviewed_by := null;

  if new.target_type = 'listing' then
    select left(title || E'\n\n' || description, 1000)
    into new.snapshot
    from public.listings
    where id = new.target_id
      and (
        moderation_status in ('visible', 'flagged')
        or seller_id = auth.uid()
        or public.is_admin()
      );
  elsif new.target_type = 'need_post' then
    select left(body, 1000)
    into new.snapshot
    from public.need_posts
    where id = new.target_id
      and (
        moderation_status in ('visible', 'flagged')
        or requester_id = auth.uid()
        or public.is_admin()
      );
  elsif new.target_type = 'comment' then
    select left(body, 1000)
    into new.snapshot
    from public.post_comments
    where id = new.target_id
      and (
        moderation_status in ('visible', 'flagged')
        or author_id = auth.uid()
        or public.is_admin()
      );
  elsif new.target_type = 'review' then
    select left(coalesce(body, ''), 1000)
    into new.snapshot
    from public.reviews
    where id = new.target_id
      and (
        moderation_status in ('visible', 'flagged')
        or reviewer_id = auth.uid()
        or public.is_admin()
      );
  elsif new.target_type = 'message' then
    select left(m.body, 1000)
    into new.snapshot
    from public.messages m
    join public.conversations c on c.id = m.conversation_id
    where m.id = new.target_id
      and auth.uid() in (c.buyer_id, c.seller_id);
  elsif new.target_type = 'profile' then
    select left(display_name || E'\n\n' || coalesce(bio, ''), 1000)
    into new.snapshot
    from public.profiles
    where id = new.target_id;
  end if;

  if new.snapshot is null then
    raise exception 'target_not_found' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

revoke all on function public.prepare_content_report() from public;
grant execute on function public.prepare_content_report() to authenticated;

drop trigger if exists content_reports_prepare on public.content_reports;
create trigger content_reports_prepare
  before insert on public.content_reports
  for each row execute function public.prepare_content_report();

create or replace function public.auto_hide_reported_content()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer;
begin
  if new.target_type <> 'comment' then
    return new;
  end if;

  select count(distinct reporter_id)
  into v_count
  from public.content_reports
  where target_type = 'comment'
    and target_id = new.target_id
    and status = 'open';

  if v_count >= 3 then
    update public.post_comments
    set moderation_status = 'hidden',
        moderation_reasons = (
          select array_agg(distinct reason)
          from unnest(array_append(moderation_reasons, 'user_report')) as reason
        ),
        moderated_at = now()
    where id = new.target_id
      and moderation_status in ('visible', 'flagged');
  end if;

  return new;
end;
$$;

revoke all on function public.auto_hide_reported_content() from public;
grant execute on function public.auto_hide_reported_content() to authenticated;

drop trigger if exists content_reports_auto_hide on public.content_reports;
create trigger content_reports_auto_hide
  after insert on public.content_reports
  for each row execute function public.auto_hide_reported_content();

create table if not exists public.user_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create index if not exists user_blocks_blocked_id_idx
  on public.user_blocks (blocked_id);

alter table public.user_blocks enable row level security;

create policy "Users manage their own blocks"
  on public.user_blocks for all
  using (auth.uid() = blocker_id)
  with check (auth.uid() = blocker_id);

-- Blocking hides the other person's public content from the blocker.
drop policy if exists "Blocked listings are hidden" on public.listings;
create policy "Blocked listings are hidden"
  on public.listings as restrictive for select
  using (
    public.is_admin()
    or not exists (
      select 1 from public.user_blocks b
      where b.blocker_id = auth.uid()
        and b.blocked_id = listings.seller_id
    )
  );

drop policy if exists "Blocked need posts are hidden" on public.need_posts;
create policy "Blocked need posts are hidden"
  on public.need_posts as restrictive for select
  using (
    public.is_admin()
    or not exists (
      select 1 from public.user_blocks b
      where b.blocker_id = auth.uid()
        and b.blocked_id = need_posts.requester_id
    )
  );

drop policy if exists "Blocked comments are hidden" on public.post_comments;
create policy "Blocked comments are hidden"
  on public.post_comments as restrictive for select
  using (
    public.is_admin()
    or not exists (
      select 1 from public.user_blocks b
      where b.blocker_id = auth.uid()
        and b.blocked_id = post_comments.author_id
    )
  );

drop policy if exists "Blocked reviews are hidden" on public.reviews;
create policy "Blocked reviews are hidden"
  on public.reviews as restrictive for select
  using (
    public.is_admin()
    or not exists (
      select 1 from public.user_blocks b
      where b.blocker_id = auth.uid()
        and b.blocked_id = reviews.reviewer_id
    )
  );

create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles(id) on delete set null,
  target_type text not null
    check (target_type in ('listing', 'need_post', 'comment', 'review', 'message', 'profile', 'report')),
  target_id uuid not null,
  action text not null
    check (action in (
      'hide', 'remove', 'restore', 'delete',
      'mute', 'suspend', 'reinstate',
      'actioned_report', 'dismiss_report'
    )),
  reason text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists moderation_actions_created_at_idx
  on public.moderation_actions (created_at desc);

create index if not exists moderation_actions_target_idx
  on public.moderation_actions (target_type, target_id);

alter table public.moderation_actions enable row level security;

create policy "Admins read moderation actions"
  on public.moderation_actions for select
  using (public.is_admin());

create policy "Admins create moderation actions"
  on public.moderation_actions for insert
  with check (public.is_admin() and admin_id = auth.uid());
