-- Sign-in must not rewrite the profile. The previous upsert replaced edited
-- display names with the signup metadata name and fired the 10-second profile
-- update rate limit, so a quick sign-out/sign-in failed.
create or replace function public.ensure_profile(p_display_name text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_display_name text := btrim(p_display_name);
begin
  if v_user_id is null then
    raise exception 'profile_auth_required' using errcode = '42501';
  end if;

  if char_length(v_display_name) < 2 or char_length(v_display_name) > 80 then
    raise exception 'profile_display_name_invalid' using errcode = '22023';
  end if;

  insert into public.profiles (id, display_name)
  values (v_user_id, v_display_name)
  on conflict (id) do nothing;
end;
$$;

revoke all on function public.ensure_profile(text) from public;
grant execute on function public.ensure_profile(text) to authenticated;
