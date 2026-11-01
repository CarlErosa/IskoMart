alter table public.profiles
  add column if not exists bio text
    check (bio is null or char_length(trim(bio)) between 1 and 280);
