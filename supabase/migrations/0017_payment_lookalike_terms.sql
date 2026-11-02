-- Payment-app typos and scam phrases were slipping through because the hard
-- rule only matched exact words like `gcash`. The moderation_terms loop uses
-- term_pattern(), which tolerates separators ("g cash") and repeated letters
-- ("gcashh"), so common misspellings can be added as data instead of growing
-- the classify_content() regex.
--
-- Public surfaces block these terms; messages and profiles keep the existing
-- policy of allowing payment/contact details but flagging them for review.

insert into public.moderation_terms (term, severity, reason, surfaces)
select terms.term, scopes.severity, 'payment', scopes.surfaces
from (
  values
    ('gcash'),
    ('cashg'),
    ('cgash'),
    ('gacsh'),
    ('gcsh'),
    ('gcas'),
    ('maya'),
    ('paymaya'),
    ('paypal'),
    ('bdo'),
    ('bpi'),
    ('unionbank'),
    ('downpayment'),
    ('reservation fee'),
    ('reserve fee'),
    ('shipping fee'),
    ('advance payment'),
    ('payment first'),
    ('pay first')
) as terms(term)
cross join (
  values
    ('block', '{listing,need_post,comment,review}'::text[]),
    ('flag', '{message,profile}'::text[])
) as scopes(severity, surfaces)
on conflict do nothing;
