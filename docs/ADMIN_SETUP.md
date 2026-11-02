# Admin Setup

Admin access is stored in `public.profiles.is_admin` and enforced by the database RLS policies and server actions. There is no self-service admin promotion flow.

After the account has signed up and its profile exists, run this in the Supabase SQL Editor, replacing the email with the exact admin account email:

```sql
update public.profiles
set is_admin = true
where id = (
  select id from auth.users
  where email = 'your-admin@gmail.com'
);
```

Sign out and back in after running the query. The **Admin** link will appear in the marketplace navigation and the moderation dashboard will be available at `/admin`.

## Migrations

Apply `0011` through `0015` before testing moderation. They add profile account state, content
classification, rate limits, report/block/audit tables, and Gmail identity checks.

If `0015_gmail_identity.sql` reports duplicate canonical Gmail accounts, resolve the duplicates
in Supabase Auth before rerunning the migration.

## Dashboard

The dashboard has four sections:

- **Report queue** — open reports with the reported snapshot and resolve actions.
- **Flagged content** — listings, requests, comments, and reviews with hide, remove, restore, and
  delete actions.
- **Users** — mute an account for 24 hours, suspend it, or reinstate it.
- **Audit log** — the latest moderation actions with the acting admin.

Moderators can read reported message snapshots, but not full private conversations. Listing
image files are removed before a listing is deleted.

Every admin action is recorded in `public.moderation_actions`. See `docs/MODERATION.md` for the
complete rule set.
