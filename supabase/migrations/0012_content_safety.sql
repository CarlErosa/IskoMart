-- Content safety: normalization, classification, fingerprints, and visibility.
--
-- The database is the final gate. A client can call Supabase directly with the
-- public anon key and a user session, so the same rules must run in triggers.

alter table public.listings
  add column if not exists moderation_status text not null default 'visible'
    check (moderation_status in ('visible', 'flagged', 'hidden', 'removed')),
  add column if not exists moderation_reasons text[] not null default '{}',
  add column if not exists content_fingerprint text,
  add column if not exists moderated_at timestamptz,
  add column if not exists moderated_by uuid references public.profiles(id) on delete set null;

alter table public.need_posts
  add column if not exists moderation_status text not null default 'visible'
    check (moderation_status in ('visible', 'flagged', 'hidden', 'removed')),
  add column if not exists moderation_reasons text[] not null default '{}',
  add column if not exists content_fingerprint text,
  add column if not exists moderated_at timestamptz,
  add column if not exists moderated_by uuid references public.profiles(id) on delete set null;

alter table public.post_comments
  add column if not exists moderation_status text not null default 'visible'
    check (moderation_status in ('visible', 'flagged', 'hidden', 'removed')),
  add column if not exists moderation_reasons text[] not null default '{}',
  add column if not exists content_fingerprint text,
  add column if not exists moderated_at timestamptz,
  add column if not exists moderated_by uuid references public.profiles(id) on delete set null;

alter table public.reviews
  add column if not exists moderation_status text not null default 'visible'
    check (moderation_status in ('visible', 'flagged', 'hidden', 'removed')),
  add column if not exists moderation_reasons text[] not null default '{}',
  add column if not exists content_fingerprint text,
  add column if not exists moderated_at timestamptz,
  add column if not exists moderated_by uuid references public.profiles(id) on delete set null;

alter table public.messages
  add column if not exists moderation_status text not null default 'visible'
    check (moderation_status in ('visible', 'flagged', 'hidden', 'removed')),
  add column if not exists moderation_reasons text[] not null default '{}',
  add column if not exists content_fingerprint text,
  add column if not exists moderated_at timestamptz,
  add column if not exists moderated_by uuid references public.profiles(id) on delete set null;

create index if not exists listings_moderation_status_created_at_idx
  on public.listings (moderation_status, created_at desc)
  where moderation_status <> 'visible';

create index if not exists need_posts_moderation_status_created_at_idx
  on public.need_posts (moderation_status, created_at desc)
  where moderation_status <> 'visible';

create index if not exists post_comments_moderation_status_created_at_idx
  on public.post_comments (moderation_status, created_at desc)
  where moderation_status <> 'visible';

create index if not exists reviews_moderation_status_created_at_idx
  on public.reviews (moderation_status, created_at desc)
  where moderation_status <> 'visible';

create index if not exists messages_moderation_status_created_at_idx
  on public.messages (moderation_status, created_at desc)
  where moderation_status <> 'visible';

-- Term list used by classify_content(). Only security-definer functions read it.
create table if not exists public.moderation_terms (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  severity text not null check (severity in ('block', 'flag')),
  reason text not null,
  surfaces text[] not null default '{listing,need_post,comment,review,profile,message}',
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (term, severity, reason)
);

alter table public.moderation_terms enable row level security;
revoke all on public.moderation_terms from anon, authenticated;

insert into public.moderation_terms (term, severity, reason, surfaces) values
  ('nigger', 'block', 'hate', '{listing,need_post,comment,review,profile,message}'),
  ('nigga', 'block', 'hate', '{listing,need_post,comment,review,profile,message}'),
  ('faggot', 'block', 'hate', '{listing,need_post,comment,review,profile,message}'),
  ('fag', 'block', 'hate', '{listing,need_post,comment,review,profile,message}'),
  ('tranny', 'block', 'hate', '{listing,need_post,comment,review,profile,message}'),
  ('retard', 'block', 'hate', '{listing,need_post,comment,review,profile,message}'),
  ('kike', 'block', 'hate', '{listing,need_post,comment,review,profile,message}'),
  ('spic', 'block', 'hate', '{listing,need_post,comment,review,profile,message}'),
  ('chink', 'block', 'hate', '{listing,need_post,comment,review,profile,message}'),
  ('wetback', 'block', 'hate', '{listing,need_post,comment,review,profile,message}'),
  ('coon', 'block', 'hate', '{listing,need_post,comment,review,profile,message}'),
  ('dyke', 'block', 'hate', '{listing,need_post,comment,review,profile,message}'),
  ('iskomart', 'block', 'impersonation', '{profile}'),
  ('iskomart admin', 'block', 'impersonation', '{profile}'),
  ('iskomart support', 'block', 'impersonation', '{profile}'),
  ('iskomart official', 'block', 'impersonation', '{profile}'),
  ('admin', 'flag', 'impersonation', '{profile}'),
  ('fuck', 'flag', 'profanity', '{listing,need_post,comment,review,profile,message}'),
  ('shit', 'flag', 'profanity', '{listing,need_post,comment,review,profile,message}'),
  ('bitch', 'flag', 'harassment', '{listing,need_post,comment,review,profile,message}'),
  ('asshole', 'flag', 'harassment', '{listing,need_post,comment,review,profile,message}'),
  ('bastard', 'flag', 'harassment', '{listing,need_post,comment,review,profile,message}'),
  ('dick', 'flag', 'profanity', '{listing,need_post,comment,review,profile,message}'),
  ('pussy', 'flag', 'profanity', '{listing,need_post,comment,review,profile,message}'),
  ('cunt', 'flag', 'profanity', '{listing,need_post,comment,review,profile,message}'),
  ('whore', 'flag', 'harassment', '{listing,need_post,comment,review,profile,message}'),
  ('slut', 'flag', 'harassment', '{listing,need_post,comment,review,profile,message}'),
  ('putangina', 'flag', 'profanity', '{listing,need_post,comment,review,profile,message}'),
  ('putang ina', 'flag', 'profanity', '{listing,need_post,comment,review,profile,message}'),
  ('tangina', 'flag', 'profanity', '{listing,need_post,comment,review,profile,message}'),
  ('kingina', 'flag', 'profanity', '{listing,need_post,comment,review,profile,message}'),
  ('gago', 'flag', 'harassment', '{listing,need_post,comment,review,profile,message}'),
  ('tanga', 'flag', 'harassment', '{listing,need_post,comment,review,profile,message}'),
  ('bobo', 'flag', 'harassment', '{listing,need_post,comment,review,profile,message}'),
  ('ulol', 'flag', 'harassment', '{listing,need_post,comment,review,profile,message}'),
  ('lintik', 'flag', 'profanity', '{listing,need_post,comment,review,profile,message}'),
  ('hayop', 'flag', 'harassment', '{listing,need_post,comment,review,profile,message}'),
  ('tarantado', 'flag', 'harassment', '{listing,need_post,comment,review,profile,message}'),
  ('punyeta', 'flag', 'profanity', '{listing,need_post,comment,review,profile,message}'),
  ('leche', 'flag', 'profanity', '{listing,need_post,comment,review,profile,message}'),
  ('puta', 'flag', 'profanity', '{listing,need_post,comment,review,profile,message}'),
  ('pakyu', 'flag', 'profanity', '{listing,need_post,comment,review,profile,message}'),
  ('bwisit', 'flag', 'profanity', '{listing,need_post,comment,review,profile,message}'),
  ('hinayupak', 'flag', 'harassment', '{listing,need_post,comment,review,profile,message}')
on conflict do nothing;

-- A term pattern that tolerates separators and repeated letters, while still
-- respecting word boundaries ("ass" should not match "class").
create or replace function public.term_pattern(p_term text)
returns text
language sql
immutable
as $$
  select '\m' || coalesce(
    (
      select string_agg(ch || '+', '[\W_]*' order by ord)
      from regexp_split_to_table(lower(p_term), '') with ordinality as t(ch, ord)
      where ch ~ '[a-z0-9]'
    ),
    ''
  ) || '\M';
$$;

create or replace function public.normalize_content(p_text text)
returns text
language sql
immutable
as $$
  select regexp_replace(
    regexp_replace(lower(coalesce(p_text, '')), '[^a-z0-9]+', '', 'g'),
    '(.)\1{2,}',
    '\1',
    'g'
  );
$$;

create or replace function public.classify_content(p_text text, p_surface text)
returns table (severity text, reasons text[])
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_lower text := lower(coalesce(p_text, ''));
  v_leet text := translate(v_lower, '013457@$!|', 'oieastasii');
  v_compact text := regexp_replace(v_lower, '[[:space:]().-]', '', 'g');
  v_severity text := 'allow';
  v_reasons text[] := '{}';
  v_term record;
begin
  if p_surface in ('listing', 'need_post', 'comment', 'review') then
    if v_lower ~ '(https?://|www\.)' then
      v_severity := 'block';
      v_reasons := array_append(v_reasons, 'link');
    end if;

    if v_lower ~ '[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}' then
      v_severity := 'block';
      v_reasons := array_append(v_reasons, 'email');
    end if;

    if v_compact ~ '(^|[^0-9])(\+?63|0)9[0-9]{9}([^0-9]|$)' then
      v_severity := 'block';
      v_reasons := array_append(v_reasons, 'phone');
    end if;

    if v_lower ~ '\m(gcash|maya|paymaya|paypal|bdo|bpi|unionbank|deposit|downpayment)\M'
      or v_lower ~ 'bank[[:space:]]*transfer' then
      v_severity := 'block';
      v_reasons := array_append(v_reasons, 'payment');
    end if;

    if v_lower ~ '\m(facebook|fb|instagram|ig|tiktok|telegram|whatsapp|viber)\M' then
      if v_severity = 'allow' then
        v_severity := 'flag';
      end if;
      v_reasons := array_append(v_reasons, 'off_platform');
    end if;
  elsif p_surface in ('message', 'profile') then
    if v_lower ~ '(https?://|www\.)' then
      if v_severity = 'allow' then v_severity := 'flag'; end if;
      v_reasons := array_append(v_reasons, 'link');
    end if;

    if v_lower ~ '[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}' then
      if v_severity = 'allow' then v_severity := 'flag'; end if;
      v_reasons := array_append(v_reasons, 'email');
    end if;

    if v_compact ~ '(^|[^0-9])(\+?63|0)9[0-9]{9}([^0-9]|$)' then
      if v_severity = 'allow' then v_severity := 'flag'; end if;
      v_reasons := array_append(v_reasons, 'phone');
    end if;

    if v_lower ~ '\m(gcash|maya|paymaya|paypal|bdo|bpi|unionbank|deposit|downpayment)\M'
      or v_lower ~ 'bank[[:space:]]*transfer' then
      if v_severity = 'allow' then v_severity := 'flag'; end if;
      v_reasons := array_append(v_reasons, 'payment');
    end if;

    if v_lower ~ '\m(facebook|fb|instagram|ig|tiktok|telegram|whatsapp|viber)\M' then
      if v_severity = 'allow' then v_severity := 'flag'; end if;
      v_reasons := array_append(v_reasons, 'off_platform');
    end if;
  end if;

  for v_term in
    select term, severity as term_severity, reason
    from public.moderation_terms
    where enabled = true
      and p_surface = any(surfaces)
  loop
    if v_leet ~ public.term_pattern(v_term.term) then
      v_reasons := array_append(v_reasons, v_term.reason);

      if v_term.term_severity = 'block' then
        v_severity := 'block';
      elsif v_severity <> 'block' then
        v_severity := 'flag';
      end if;
    end if;
  end loop;

  select coalesce(array_agg(distinct reason), '{}'::text[])
  into v_reasons
  from unnest(v_reasons) as reason;

  return query select v_severity, v_reasons;
end;
$$;

revoke all on function public.classify_content(text, text) from public;
grant execute on function public.classify_content(text, text) to anon, authenticated;

-- Classify inserts and updates, set the fingerprint, enforce account state, and
-- reject exact duplicates. Admins can override the status for review decisions.
create or replace function public.apply_content_moderation()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_surface text := tg_argv[0];
  v_col1 text := tg_argv[1];
  v_col2 text := nullif(tg_argv[2], '');
  v_col3 text := nullif(tg_argv[3], '');
  v_owner_col text := tg_argv[4];
  v_window integer := coalesce(nullif(tg_argv[5], '')::integer, 0);
  v_text text;
  v_old_text text;
  v_text_changed boolean := true;
  v_result record;
  v_fingerprint text;
  v_duplicate boolean := false;
  v_admin boolean := public.is_admin();
begin
  v_text := coalesce(to_jsonb(new) ->> v_col1, '');
  if v_col2 is not null then
    v_text := v_text || ' ' || coalesce(to_jsonb(new) ->> v_col2, '');
  end if;
  if v_col3 is not null then
    v_text := v_text || ' ' || coalesce(to_jsonb(new) ->> v_col3, '');
  end if;

  if tg_op = 'UPDATE' then
    v_old_text := coalesce(to_jsonb(old) ->> v_col1, '');
    if v_col2 is not null then
      v_old_text := v_old_text || ' ' || coalesce(to_jsonb(old) ->> v_col2, '');
    end if;
    if v_col3 is not null then
      v_old_text := v_old_text || ' ' || coalesce(to_jsonb(old) ->> v_col3, '');
    end if;
    v_text_changed := v_text is distinct from v_old_text;
  end if;

  v_fingerprint := md5(public.normalize_content(v_text));

  -- Account state only gates content creation and edits, not status-only writes
  -- such as the report threshold hiding a comment.
  if auth.uid() is not null and not v_admin and v_text_changed then
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
  end if;

  if v_admin or auth.uid() is null then
    new.content_fingerprint := v_fingerprint;
    return new;
  end if;

  if tg_op = 'UPDATE' and not v_text_changed then
    -- Status-only writes keep the stored classification. Authors can hide their
    -- own content, but cannot restore or clear content hidden by a moderator or
    -- by the report threshold.
    new.content_fingerprint := v_fingerprint;
    if old.moderation_status in ('hidden', 'removed')
      or new.moderation_status in ('visible', 'flagged') then
      new.moderation_status := old.moderation_status;
      new.moderation_reasons := old.moderation_reasons;
    else
      new.moderation_reasons := (
        select coalesce(array_agg(distinct reason), '{}'::text[])
        from unnest(array_cat(old.moderation_reasons, new.moderation_reasons)) as reason
      );
    end if;
    new.moderated_at := old.moderated_at;
    new.moderated_by := old.moderated_by;
    return new;
  end if;

  select * into v_result from public.classify_content(v_text, v_surface);

  if v_result.severity = 'block' then
    raise exception 'content_blocked:%', array_to_string(v_result.reasons, ',') using errcode = 'P0001';
  end if;

  if tg_op = 'UPDATE' and old.moderation_status in ('hidden', 'removed') then
    -- Authors cannot restore content an admin hid or removed.
    new.moderation_status := old.moderation_status;
    new.moderation_reasons := old.moderation_reasons;
  elsif tg_op = 'UPDATE' and new.moderation_status in ('hidden', 'removed') then
    -- Authors may hide their own content, and the report threshold trigger uses
    -- this path to hide a comment without being overwritten by reclassification.
    new.moderation_reasons := (
      select coalesce(array_agg(distinct reason), '{}'::text[])
      from unnest(array_cat(old.moderation_reasons, new.moderation_reasons)) as reason
    );
  else
    new.moderation_status := case when v_result.severity = 'flag' then 'flagged' else 'visible' end;
    new.moderation_reasons := coalesce(v_result.reasons, '{}');
  end if;

  new.content_fingerprint := v_fingerprint;
  new.moderated_at := case when tg_op = 'UPDATE' then old.moderated_at else null end;
  new.moderated_by := case when tg_op = 'UPDATE' then old.moderated_by else null end;

  if tg_op = 'INSERT' and v_window > 0 and auth.uid() is not null then
    execute format(
      'select exists (select 1 from public.%I where %I = $1 and content_fingerprint = $2 and created_at > now() - make_interval(secs => $3) and id <> $4)',
      tg_table_name,
      v_owner_col
    )
    into v_duplicate
    using auth.uid(), v_fingerprint, v_window, new.id;

    if v_duplicate then
      raise exception 'duplicate_content' using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.apply_content_moderation() from public;
grant execute on function public.apply_content_moderation() to authenticated;

-- Profiles do not carry a moderation status, but their public text must still
-- respect hard blocks and account state.
create or replace function public.guard_profile_content()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_result record;
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

  select * into v_result
  from public.classify_content(coalesce(new.display_name, '') || ' ' || coalesce(new.bio, ''), 'profile');

  if v_result.severity = 'block' then
    raise exception 'content_blocked:%', array_to_string(v_result.reasons, ',') using errcode = 'P0001';
  end if;

  return new;
end;
$$;

revoke all on function public.guard_profile_content() from public;
grant execute on function public.guard_profile_content() to authenticated;

drop trigger if exists profiles_guard_content on public.profiles;
create trigger profiles_guard_content
  before insert or update on public.profiles
  for each row execute function public.guard_profile_content();

-- Backfill fingerprints before the content triggers exist.
update public.listings
set content_fingerprint = md5(
  public.normalize_content(
    coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(meetup_location, '')
  )
);

update public.need_posts
set content_fingerprint = md5(public.normalize_content(coalesce(body, '')));

update public.post_comments
set content_fingerprint = md5(public.normalize_content(coalesce(body, '')));

update public.reviews
set content_fingerprint = md5(public.normalize_content(coalesce(body, '')));

update public.messages
set content_fingerprint = md5(public.normalize_content(coalesce(body, '')));

drop trigger if exists listings_apply_moderation on public.listings;
create trigger listings_apply_moderation
  before insert or update on public.listings
  for each row execute function public.apply_content_moderation(
    'listing', 'title', 'description', 'meetup_location', 'seller_id', '86400'
  );

drop trigger if exists need_posts_apply_moderation on public.need_posts;
create trigger need_posts_apply_moderation
  before insert or update on public.need_posts
  for each row execute function public.apply_content_moderation(
    'need_post', 'body', '', '', 'requester_id', '86400'
  );

drop trigger if exists post_comments_apply_moderation on public.post_comments;
create trigger post_comments_apply_moderation
  before insert or update on public.post_comments
  for each row execute function public.apply_content_moderation(
    'comment', 'body', '', '', 'author_id', '600'
  );

drop trigger if exists reviews_apply_moderation on public.reviews;
create trigger reviews_apply_moderation
  before insert or update on public.reviews
  for each row execute function public.apply_content_moderation(
    'review', 'body', '', '', 'reviewer_id', '0'
  );

drop trigger if exists messages_apply_moderation on public.messages;
create trigger messages_apply_moderation
  before insert or update on public.messages
  for each row execute function public.apply_content_moderation(
    'message', 'body', '', '', 'sender_id', '60'
  );

-- Public content is visible when it is visible or flagged. Hidden and removed
-- content remains available to its author and to admins.
drop policy if exists "Visible listings only" on public.listings;
create policy "Visible listings only"
  on public.listings as restrictive for select
  using (
    moderation_status in ('visible', 'flagged')
    or seller_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "Visible need posts only" on public.need_posts;
create policy "Visible need posts only"
  on public.need_posts as restrictive for select
  using (
    moderation_status in ('visible', 'flagged')
    or requester_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "Visible comments only" on public.post_comments;
create policy "Visible comments only"
  on public.post_comments as restrictive for select
  using (
    moderation_status in ('visible', 'flagged')
    or author_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "Visible reviews only" on public.reviews;
create policy "Visible reviews only"
  on public.reviews as restrictive for select
  using (
    moderation_status in ('visible', 'flagged')
    or reviewer_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "Visible messages only" on public.messages;
create policy "Visible messages only"
  on public.messages as restrictive for select
  using (
    moderation_status <> 'removed'
    or sender_id = auth.uid()
  );

drop policy if exists "Listing images follow moderation" on public.listing_images;
create policy "Listing images follow moderation"
  on public.listing_images as restrictive for select
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_images.listing_id
        and (
          l.moderation_status in ('visible', 'flagged')
          or l.seller_id = auth.uid()
          or public.is_admin()
        )
    )
  );

drop policy if exists "Admins read all reviews" on public.reviews;
create policy "Admins read all reviews"
  on public.reviews for select
  using (public.is_admin());

drop policy if exists "Admins update listings" on public.listings;
create policy "Admins update listings"
  on public.listings for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins update need posts" on public.need_posts;
create policy "Admins update need posts"
  on public.need_posts for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins update comments" on public.post_comments;
create policy "Admins update comments"
  on public.post_comments for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins update reviews" on public.reviews;
create policy "Admins update reviews"
  on public.reviews for update
  using (public.is_admin())
  with check (public.is_admin());
