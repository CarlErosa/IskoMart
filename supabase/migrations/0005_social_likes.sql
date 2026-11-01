create table public.social_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  need_post_id uuid references public.need_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  check ((listing_id is not null) <> (need_post_id is not null)),
  unique (user_id, listing_id),
  unique (user_id, need_post_id)
);

create index social_likes_user_id_created_at_idx
  on public.social_likes (user_id, created_at desc);

alter table public.social_likes enable row level security;

create policy "Students read their own likes"
  on public.social_likes for select
  using (auth.uid() = user_id);

create policy "Students create their own likes"
  on public.social_likes for insert
  with check (auth.uid() = user_id);

create policy "Students remove their own likes"
  on public.social_likes for delete
  using (auth.uid() = user_id);
