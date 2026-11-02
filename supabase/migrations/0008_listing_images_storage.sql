alter table public.listings
  add column if not exists condition text
    check (condition is null or condition in ('new', 'like_new', 'good', 'fair'));

alter table public.listings
  add column if not exists meetup_location text
    check (meetup_location is null or char_length(trim(meetup_location)) between 2 and 120);

insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do update set public = true;

create policy "Listing images are publicly readable"
  on storage.objects for select using (bucket_id = 'listing-images');

create policy "Users upload their own listing images"
  on storage.objects for insert with check (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users update their own listing images"
  on storage.objects for update using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete their own listing images"
  on storage.objects for delete using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
