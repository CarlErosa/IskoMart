create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 2 and 80),
  campus text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(trim(name)) between 2 and 50),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  title text not null check (char_length(trim(title)) between 3 and 120),
  description text not null check (char_length(trim(description)) between 1 and 5000),
  price numeric(12, 2) not null check (price >= 0),
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  storage_path text not null unique,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete restrict,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  body text check (body is null or char_length(trim(body)) between 1 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, reviewer_id),
  check (seller_id <> reviewer_id)
);

create index listings_seller_id_idx on public.listings (seller_id);
create index listings_category_id_idx on public.listings (category_id);
create index listings_available_created_at_idx on public.listings (is_available, created_at desc);
create index listing_images_listing_id_sort_order_idx
  on public.listing_images (listing_id, sort_order);
create index reviews_seller_id_created_at_idx on public.reviews (seller_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.reviews enable row level security;

-- Profiles are public for storefronts; only the owner may create or change their profile.
create policy "Profiles are publicly readable"
  on public.profiles for select using (true);
create policy "Users create their own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Users update their own profile"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Categories are catalog metadata and are readable by everyone; writes are server-managed.
create policy "Categories are publicly readable"
  on public.categories for select using (true);

-- Anyone may browse available listings; sellers own all listing mutations.
create policy "Available listings are publicly readable"
  on public.listings for select using (is_available or auth.uid() = seller_id);
create policy "Sellers create their own listings"
  on public.listings for insert with check (auth.uid() = seller_id);
create policy "Sellers update their own listings"
  on public.listings for update using (auth.uid() = seller_id) with check (auth.uid() = seller_id);
create policy "Sellers delete their own listings"
  on public.listings for delete using (auth.uid() = seller_id);

-- Images follow their listing visibility, and only the listing owner may mutate them.
create policy "Listing images follow listing visibility"
  on public.listing_images for select using (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id
        and (listings.is_available or listings.seller_id = auth.uid())
    )
  );
create policy "Sellers add images to their listings"
  on public.listing_images for insert with check (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id and listings.seller_id = auth.uid()
    )
  );
create policy "Sellers update their listing images"
  on public.listing_images for update using (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id and listings.seller_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id and listings.seller_id = auth.uid()
    )
  );
create policy "Sellers delete their listing images"
  on public.listing_images for delete using (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id and listings.seller_id = auth.uid()
    )
  );

-- Reviews are public; an authenticated student may review another seller once per listing.
create policy "Reviews are publicly readable"
  on public.reviews for select using (true);
create policy "Students create their own reviews"
  on public.reviews for insert with check (
    auth.uid() = reviewer_id
    and seller_id <> auth.uid()
    and exists (
      select 1 from public.listings
      where listings.id = reviews.listing_id and listings.seller_id = reviews.seller_id
    )
  );
create policy "Reviewers update their own reviews"
  on public.reviews for update using (auth.uid() = reviewer_id)
  with check (
    auth.uid() = reviewer_id
    and seller_id <> auth.uid()
    and exists (
      select 1 from public.listings
      where listings.id = reviews.listing_id and listings.seller_id = reviews.seller_id
    )
  );
create policy "Reviewers delete their own reviews"
  on public.reviews for delete using (auth.uid() = reviewer_id);
