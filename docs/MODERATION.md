# Moderation

IskoMart applies moderation at two layers: shared TypeScript helpers for fast feedback, and
database triggers that run on every write. The database is the final gate because a signed-in
client can call Supabase directly with the public anon key.

## What is blocked

Deterministic violations are rejected before they are stored:

- Links (`http://`, `https://`, `www.`)
- Email addresses
- Philippine mobile numbers
- Payment-app and deposit language (`GCash`, `Maya`, `bank transfer`, `deposit`, `downpayment`)
- Hard slurs and reserved impersonation names
- Exact duplicates of the same content within a short window

Public posts, requests, comments, and reviews block all of the above. Direct messages and
profiles allow links, contact details, and payment terms, but record them as flags. Mentioning
another social platform is a flag everywhere.

## What is flagged

Ambiguous content is stored with `moderation_status = 'flagged'` and stays visible. Examples
include profanity, harassment terms from the English and Tagalog/Taglish wordlist, excessive
caps, emoji floods, repeated characters, and mention floods.

Flagged content is surfaced in the admin queue. A comment is hidden automatically after three
distinct open reports.

## Where rules live

| Layer | Location | Purpose |
| --- | --- | --- |
| Hard rules and terms | `public.moderation_terms`, `public.classify_content()` | Binary block/flag decisions inside Postgres |
| Soft heuristics | `lib/content/heuristics.ts` | Client-friendly checks before insert |
| Validation | `lib/content/schemas.ts` | Zod schemas for every user-supplied field |
| Preflight | `lib/content/guard.ts` | Normalize and classify before the insert |
| Error messages | `lib/content/errors.ts` | Map database errors to safe user text |
| Rate limits | `public.moderation_limits`, `public.write_events` | Per-action windows and daily caps |

## Account sanctions

Admins can mute an account for 24 hours or suspend it. The state is stored on
`public.profiles.account_state` and enforced by triggers and RLS. No Supabase Auth admin access
or service-role key is required.

- `muted`: cannot create content until `muted_until` passes.
- `suspended`: cannot create content until an admin reinstates the account.

## Reports, blocks, and privacy

- Users can report listings, requests, comments, messages, reviews, and profiles.
- A report stores a snapshot of the reported content so moderators can review it without
  reading a full private conversation.
- Users can block another account; blocked accounts disappear from the blocker's feed, comments,
  reviews, conversations, and messages. Blocked accounts can be unblocked from the Blocked
  tab on your profile. Admin accounts are exempt so moderators still see reported content.
- Admins see reported message snapshots only. The `messages` table itself remains restricted
  to conversation participants.

## Admin workflow

`/admin` has four sections:

1. **Report queue** — open reports with snapshots and a resolve action.
2. **Flagged content** — listings, requests, comments, and reviews with hide/remove/restore and
   delete actions.
3. **Users** — recent accounts with mute, suspend, and reinstate actions.
4. **Audit log** — every moderation action with the admin, target, action, reason, and time.

Admins can also delete any listing or request from its post menu in the feed or on the post
page; that path writes the same audit entry.

Every admin action writes to `public.moderation_actions`.

## Adding terms

Insert a row into `public.moderation_terms`:

```sql
insert into public.moderation_terms (term, severity, reason, surfaces)
values ('sample-term', 'flag', 'harassment', '{listing,need_post,comment,review,profile,message}');
```

Use `severity = 'block'` only for content that should never be stored. Keep `reason` stable so
client error messages and audit queries stay meaningful.

## Gmail identity

Gmail treats dots and `+tags` as aliases of the same inbox. Migration `0015_gmail_identity.sql`
adds a unique index on the canonical Gmail local part and a `gmail_identity_taken` RPC that the
sign-up action calls before creating an account.
