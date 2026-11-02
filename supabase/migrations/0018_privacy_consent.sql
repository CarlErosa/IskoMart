-- Privacy consent records for RA 10173 (Data Privacy Act of 2012).
--
-- Consent is captured when auth.users is created, not when the profile is
-- created after email verification. That keeps the record tied to the signup
-- itself and means a direct Supabase Auth call cannot skip the checkbox: the
-- trigger raises unless the signup supplies a notice version in metadata.

create table if not exists public.privacy_consents (
  user_id uuid primary key references auth.users(id) on delete cascade,
  version text not null check (char_length(btrim(version)) between 1 and 50),
  accepted_at timestamptz not null default now()
);

comment on table public.privacy_consents is
  'Immutable record of the privacy notice version accepted when an account was created.';

alter table public.privacy_consents enable row level security;
revoke all on public.privacy_consents from anon, authenticated;
grant select on public.privacy_consents to authenticated;

drop policy if exists "Users read their own privacy consent" on public.privacy_consents;
create policy "Users read their own privacy consent"
  on public.privacy_consents for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

create or replace function public.record_privacy_consent()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_version text := nullif(btrim(new.raw_user_meta_data ->> 'privacy_notice_version'), '');
begin
  if v_version is null or v_version !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
    raise exception 'privacy_consent_required' using errcode = 'P0001';
  end if;

  insert into public.privacy_consents (user_id, version, accepted_at)
  values (new.id, v_version, now())
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke all on function public.record_privacy_consent() from public;

drop trigger if exists auth_users_record_privacy_consent on auth.users;
create trigger auth_users_record_privacy_consent
  after insert on auth.users
  for each row execute function public.record_privacy_consent();

-- Existing accounts are intentionally not backfilled: this records consent
-- only when a new account explicitly supplies the notice version at signup.
