-- The sign-up form restricts accounts to @gmail.com, but the anon key is
-- public, so a direct Supabase Auth call could create any email. Reject
-- non-Gmail accounts in the same trigger that records the canonical identity.
create or replace function public.record_gmail_identity()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.email is null or lower(new.email) not like '%@gmail.com' then
    raise exception 'gmail_required' using errcode = 'P0001';
  end if;

  insert into public.gmail_identities (canonical, user_id, email)
  values (
    lower(
      regexp_replace(
        split_part(split_part(new.email, '@', 1), '+', 1),
        '\.',
        '',
        'g'
      )
    ),
    new.id,
    new.email
  )
  on conflict (user_id) do update
    set canonical = excluded.canonical,
        email = excluded.email;

  return new;
end;
$$;

revoke all on function public.record_gmail_identity() from public;
