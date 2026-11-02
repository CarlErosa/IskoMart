-- Gmail ignores dots and treats "+tag" as an alias. Canonicalizing the local
-- part prevents one person from creating many accounts to evade moderation.
--
-- The mapping lives in public.gmail_identities so uniqueness is enforced by a
-- normal unique constraint. A trigger on auth.users records each new account;
-- a failing insert aborts the signup, which GoTrue reports as a database error
-- and the sign-up action maps to a friendly duplicate-account message.

create table if not exists public.gmail_identities (
  canonical text primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.gmail_identities enable row level security;
revoke all on public.gmail_identities from anon, authenticated;

-- Backfill existing accounts. Duplicate aliases abort with a clear message
-- instead of failing on an opaque constraint violation.
do $$
declare
  v_duplicate text;
begin
  select lower(
    regexp_replace(
      split_part(split_part(email, '@', 1), '+', 1),
      '\.',
      '',
      'g'
    )
  )
  into v_duplicate
  from auth.users
  where lower(email) like '%@gmail.com'
  group by lower(
    regexp_replace(
      split_part(split_part(email, '@', 1), '+', 1),
      '\.',
      '',
      'g'
    )
  )
  having count(*) > 1
  limit 1;

  if v_duplicate is not null then
    raise exception 'Duplicate canonical Gmail accounts exist (%). Resolve them before applying this migration.', v_duplicate;
  end if;
end;
$$;

insert into public.gmail_identities (canonical, user_id, email)
select
  lower(
    regexp_replace(
      split_part(split_part(email, '@', 1), '+', 1),
      '\.',
      '',
      'g'
    )
  ),
  id,
  email
from auth.users
where lower(email) like '%@gmail.com'
on conflict (user_id) do update
  set canonical = excluded.canonical,
      email = excluded.email;

create or replace function public.record_gmail_identity()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.email is null or lower(new.email) not like '%@gmail.com' then
    return new;
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

drop trigger if exists auth_users_record_gmail_identity on auth.users;
create trigger auth_users_record_gmail_identity
  after insert or update of email on auth.users
  for each row execute function public.record_gmail_identity();

create or replace function public.gmail_identity_taken(p_email text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.gmail_identities g
    where g.canonical = lower(
      regexp_replace(
        split_part(split_part(p_email, '@', 1), '+', 1),
        '\.',
        '',
        'g'
      )
    )
  );
$$;

revoke all on function public.gmail_identity_taken(text) from public;
grant execute on function public.gmail_identity_taken(text) to anon, authenticated;
