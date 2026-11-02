-- Fix: classify_content() failed at runtime with
--   column reference "severity" is ambiguous
-- because the RETURNS TABLE output column `severity` collided with
-- public.moderation_terms.severity inside the term loop. Qualifying the table
-- column resolves the ambiguity for all surfaces, including need posts.
--
-- Forward-only replacement: the original function in 0012 is left untouched.

create or replace function public.classify_content(p_text text, p_surface text)
returns table (severity text, reasons text[])
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_lower text := lower(coalesce(p_text, ''));
  v_leet text := translate(v_lower, '013457@$!|', 'oieastasii');
  v_compact text := regexp_replace(v_lower, '[[:space:]().-]', '', 'g');
  v_severity text := 'allow';
  v_reasons text[] := '{}';
  v_term record;
begin
  if p_surface in ('listing', 'need_post', 'comment', 'review') then
    if v_lower ~ '(https?://|www\.)' then
      v_severity := 'block';
      v_reasons := array_append(v_reasons, 'link');
    end if;

    if v_lower ~ '[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}' then
      v_severity := 'block';
      v_reasons := array_append(v_reasons, 'email');
    end if;

    if v_compact ~ '(^|[^0-9])(\+?63|0)9[0-9]{9}([^0-9]|$)' then
      v_severity := 'block';
      v_reasons := array_append(v_reasons, 'phone');
    end if;

    if v_lower ~ '\m(gcash|maya|paymaya|paypal|bdo|bpi|unionbank|deposit|downpayment)\M'
      or v_lower ~ 'bank[[:space:]]*transfer' then
      v_severity := 'block';
      v_reasons := array_append(v_reasons, 'payment');
    end if;

    if v_lower ~ '\m(facebook|fb|instagram|ig|tiktok|telegram|whatsapp|viber)\M' then
      if v_severity = 'allow' then
        v_severity := 'flag';
      end if;
      v_reasons := array_append(v_reasons, 'off_platform');
    end if;
  elsif p_surface in ('message', 'profile') then
    if v_lower ~ '(https?://|www\.)' then
      if v_severity = 'allow' then v_severity := 'flag'; end if;
      v_reasons := array_append(v_reasons, 'link');
    end if;

    if v_lower ~ '[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}' then
      if v_severity = 'allow' then v_severity := 'flag'; end if;
      v_reasons := array_append(v_reasons, 'email');
    end if;

    if v_compact ~ '(^|[^0-9])(\+?63|0)9[0-9]{9}([^0-9]|$)' then
      if v_severity = 'allow' then v_severity := 'flag'; end if;
      v_reasons := array_append(v_reasons, 'phone');
    end if;

    if v_lower ~ '\m(gcash|maya|paymaya|paypal|bdo|bpi|unionbank|deposit|downpayment)\M'
      or v_lower ~ 'bank[[:space:]]*transfer' then
      if v_severity = 'allow' then v_severity := 'flag'; end if;
      v_reasons := array_append(v_reasons, 'payment');
    end if;

    if v_lower ~ '\m(facebook|fb|instagram|ig|tiktok|telegram|whatsapp|viber)\M' then
      if v_severity = 'allow' then v_severity := 'flag'; end if;
      v_reasons := array_append(v_reasons, 'off_platform');
    end if;
  end if;

  for v_term in
    select m.term, m.severity as term_severity, m.reason
    from public.moderation_terms as m
    where m.enabled = true
      and p_surface = any(m.surfaces)
  loop
    if v_leet ~ public.term_pattern(v_term.term) then
      v_reasons := array_append(v_reasons, v_term.reason);

      if v_term.term_severity = 'block' then
        v_severity := 'block';
      elsif v_severity <> 'block' then
        v_severity := 'flag';
      end if;
    end if;
  end loop;

  select coalesce(array_agg(distinct reason), '{}'::text[])
  into v_reasons
  from unnest(v_reasons) as reason;

  return query select v_severity, v_reasons;
end;
$$;

revoke all on function public.classify_content(text, text) from public;
grant execute on function public.classify_content(text, text) to anon, authenticated;
