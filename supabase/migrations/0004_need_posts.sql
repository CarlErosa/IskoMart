create table public.need_posts (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  body text not null check (char_length(trim(body)) between 3 and 500),
  created_at timestamptz not null default now()
);

create index need_posts_created_at_idx on public.need_posts (created_at desc);
create index need_posts_category_id_idx on public.need_posts (category_id);

alter table public.need_posts enable row level security;

create policy "Authenticated students read need posts"
  on public.need_posts for select
  using (auth.uid() is not null);

create policy "Students create their own need posts"
  on public.need_posts for insert
  with check (auth.uid() = requester_id);

create policy "Students update their own need posts"
  on public.need_posts for update
  using (auth.uid() = requester_id)
  with check (auth.uid() = requester_id);

create policy "Students delete their own need posts"
  on public.need_posts for delete
  using (auth.uid() = requester_id);
