alter table public.profiles
  add column if not exists is_admin boolean not null default false;

create index if not exists profiles_is_admin_idx on public.profiles (is_admin)
  where is_admin = true;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.is_admin = true
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create policy "Admins read unavailable listings"
  on public.listings for select
  using (public.is_admin());

create policy "Admins delete listings"
  on public.listings for delete
  using (public.is_admin());

create policy "Admins read hidden listing images"
  on public.listing_images for select
  using (public.is_admin());

create policy "Admins delete listing images"
  on public.listing_images for delete
  using (public.is_admin());

create policy "Admins read all need posts"
  on public.need_posts for select
  using (public.is_admin());

create policy "Admins delete need posts"
  on public.need_posts for delete
  using (public.is_admin());

create policy "Admins read all comments"
  on public.post_comments for select
  using (public.is_admin());

create policy "Admins delete comments"
  on public.post_comments for delete
  using (public.is_admin());

create policy "Admins delete reposts"
  on public.social_reposts for delete
  using (public.is_admin());

create policy "Admins delete reviews"
  on public.reviews for delete
  using (public.is_admin());

create policy "Admins delete listing image files"
  on storage.objects for delete
  using (
    bucket_id = 'listing-images'
    and public.is_admin()
  );
