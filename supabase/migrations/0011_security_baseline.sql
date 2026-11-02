-- Security baseline for moderation.
--
-- 1. Keep privileged profile columns out of the hands of regular users.
-- 2. Make sure comments, likes, and reposts can only target content the user can see.
-- 3. Allow admins to update profile moderation state without granting them a service key.

alter table public.profiles
  add column if not exists account_state text not null default 'active'
    check (account_state in ('active', 'muted', 'suspended')),
  add column if not exists muted_until timestamptz,
  add column if not exists suspended_at timestamptz,
  add column if not exists strike_count integer not null default 0
    check (strike_count >= 0);

-- Profile pictures must live in the public avatars bucket. The application
-- checks the host as well; this constraint stops direct writes from storing
-- arbitrary or executable URLs.
alter table public.profiles
  drop constraint if exists profiles_avatar_url_format,
  add constraint profiles_avatar_url_format
    check (
      avatar_url is null
      or avatar_url ~ '^https?://[^/]+/storage/v1/object/public/avatars/'
    ),
  drop constraint if exists profiles_header_url_format,
  add constraint profiles_header_url_format
    check (
      header_url is null
      or header_url ~ '^https?://[^/]+/storage/v1/object/public/avatars/'
    );

create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- Service-role and SQL-editor sessions have no auth.uid(); admins are trusted.
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.is_admin then
      raise exception 'profile_field_forbidden:is_admin' using errcode = '42501';
    end if;

    new.account_state := 'active';
    new.muted_until := null;
    new.suspended_at := null;
    new.strike_count := 0;
  else
    if new.is_admin is distinct from old.is_admin
      or new.account_state is distinct from old.account_state
      or new.muted_until is distinct from old.muted_until
      or new.suspended_at is distinct from old.suspended_at
      or new.strike_count is distinct from old.strike_count then
      raise exception 'profile_field_forbidden' using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.protect_profile_fields() from public;
grant execute on function public.protect_profile_fields() to authenticated;

drop trigger if exists profiles_protect_fields on public.profiles;
create trigger profiles_protect_fields
  before insert or update on public.profiles
  for each row execute function public.protect_profile_fields();

-- Column-level grants keep is_admin out of client writes. Non-admin attempts to
-- change the moderation columns are rejected by the trigger above.
revoke insert, update on public.profiles from anon, authenticated;
grant insert (id, display_name, campus, avatar_url, header_url, bio, created_at, updated_at)
  on public.profiles to authenticated;
grant update (
  display_name,
  campus,
  avatar_url,
  header_url,
  bio,
  updated_at,
  account_state,
  muted_until,
  suspended_at,
  strike_count
) on public.profiles to authenticated;

drop policy if exists "Admins update profiles" on public.profiles;
create policy "Admins update profiles"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- Likes, comments, and reposts must point at content the actor can currently see.
drop policy if exists "Students create their own likes" on public.social_likes;
create policy "Students create their own likes"
  on public.social_likes for insert
  with check (
    auth.uid() = user_id
    and (
      (
        listing_id is not null
        and exists (
          select 1 from public.listings l
          where l.id = social_likes.listing_id
            and (l.is_available or l.seller_id = auth.uid())
        )
      )
      or (
        need_post_id is not null
        and exists (
          select 1 from public.need_posts n
          where n.id = social_likes.need_post_id
        )
      )
    )
  );

drop policy if exists "Students create their own comments" on public.post_comments;
create policy "Students create their own comments"
  on public.post_comments for insert
  with check (
    auth.uid() = author_id
    and (
      (
        listing_id is not null
        and exists (
          select 1 from public.listings l
          where l.id = post_comments.listing_id
            and (l.is_available or l.seller_id = auth.uid())
        )
      )
      or (
        need_post_id is not null
        and exists (
          select 1 from public.need_posts n
          where n.id = post_comments.need_post_id
        )
      )
    )
  );

drop policy if exists "Students create their own reposts" on public.social_reposts;
create policy "Students create their own reposts"
  on public.social_reposts for insert
  with check (
    auth.uid() = user_id
    and (
      (
        listing_id is not null
        and exists (
          select 1 from public.listings l
          where l.id = social_reposts.listing_id
            and (l.is_available or l.seller_id = auth.uid())
        )
      )
      or (
        need_post_id is not null
        and exists (
          select 1 from public.need_posts n
          where n.id = social_reposts.need_post_id
        )
      )
    )
  );
