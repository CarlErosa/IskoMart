create table public.post_comments (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  need_post_id uuid references public.need_posts(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 500),
  created_at timestamptz not null default now(),
  check ((listing_id is not null) <> (need_post_id is not null))
);

create index post_comments_listing_created_at_idx on public.post_comments (listing_id, created_at);
create index post_comments_need_created_at_idx on public.post_comments (need_post_id, created_at);

create table public.social_reposts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  need_post_id uuid references public.need_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  check ((listing_id is not null) <> (need_post_id is not null)),
  unique (user_id, listing_id),
  unique (user_id, need_post_id)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  created_at timestamptz not null default now(),
  check (buyer_id <> seller_id)
);

create index conversations_buyer_id_idx on public.conversations (buyer_id, created_at desc);
create index conversations_seller_id_idx on public.conversations (seller_id, created_at desc);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index messages_conversation_created_at_idx on public.messages (conversation_id, created_at);

alter table public.post_comments enable row level security;
alter table public.social_reposts enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "Authenticated students read comments" on public.post_comments for select using (auth.uid() is not null);
create policy "Students create their own comments" on public.post_comments for insert with check (auth.uid() = author_id);
create policy "Students delete their own comments" on public.post_comments for delete using (auth.uid() = author_id);

create policy "Authenticated students read reposts" on public.social_reposts for select using (auth.uid() is not null);
create policy "Students create their own reposts" on public.social_reposts for insert with check (auth.uid() = user_id);
create policy "Students remove their own reposts" on public.social_reposts for delete using (auth.uid() = user_id);

create policy "Participants read conversations" on public.conversations for select using (auth.uid() in (buyer_id, seller_id));
create policy "Buyers create conversations" on public.conversations for insert with check (auth.uid() = buyer_id);
create policy "Participants read messages" on public.messages for select using (
  exists (select 1 from public.conversations c where c.id = conversation_id and auth.uid() in (c.buyer_id, c.seller_id))
);
create policy "Participants send messages" on public.messages for insert with check (
  auth.uid() = sender_id
  and exists (select 1 from public.conversations c where c.id = conversation_id and auth.uid() in (c.buyer_id, c.seller_id))
);

create policy "Authenticated students read likes" on public.social_likes for select using (auth.uid() is not null);
