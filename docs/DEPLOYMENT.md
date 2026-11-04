# Deployment Checklist

## Vercel environment

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` — the exact public origin, no trailing slash. Auth emails build
  verification and password-reset links from this value. The app throws in production instead
  of falling back to localhost, so a missing value fails visibly.
- `SUPABASE_SERVICE_ROLE_KEY` — server-only tooling; never expose or prefix it with `NEXT_PUBLIC_`.
- `TZ=Asia/Manila` so server-rendered dates match campus time.

## Supabase Auth

- Add `https://<your-domain>/auth/callback` to the redirect allowlist, plus the localhost URL
  for development.
- Configure custom SMTP before opening signups. Supabase's built-in sender is rate-limited and
  not intended for production; verification and password reset both depend on it.
- Apply migrations `0001` through `0022` in order.
- Enable daily backups or point-in-time recovery if the plan offers it.

## Housekeeping

- Schedule `select public.cleanup_write_events();` with pg_cron (daily) so rate-limit rows do
  not grow forever.
- After launch, watch Supabase logs and Vercel function logs for failed auth and write errors.
