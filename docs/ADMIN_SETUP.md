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

The dashboard can remove listings, need posts, and comments. Listing image files are removed before the listing record. Private conversations and messages are intentionally excluded from moderation views.
