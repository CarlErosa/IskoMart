# IskoMart Agent Guidelines

## Assumptions

- Package manager: pnpm.
- Deployment target: Vercel.
- PUP student verification uses an approved `@pup.edu.ph` email address.
- Seller contact is implemented as in-app chat.
- MVP transactions are meetup and payment in person; there are no online payments.
- The initial schema targets a single PUP marketplace, with no admin dashboard in the MVP.

## Stack

- Next.js App Router with strict TypeScript.
- Tailwind CSS for styling.
- Supabase for Postgres, Auth, Storage, and Row Level Security (RLS).
- Vercel for deployment.

## Repository Layout

- `app/`: App Router routes, layouts, pages, and route handlers.
- `components/`: reusable UI components; keep browser-only components explicitly client-side.
- `lib/`: server/client Supabase clients, validation, and shared utilities.
- `supabase/migrations/`: ordered SQL migrations.
- `docs/`: product and architecture documentation.
- `.github/`: repository AI-agent instructions.

## Conventions

- Use strict TypeScript; prefer inferred types and explicit domain types at boundaries.
- Use `PascalCase` for React components and types, `camelCase` for functions and variables,
  and `kebab-case` for route segments and migration filenames.
- Keep server components and server actions as the default. Add `"use client"` only when
  interactivity or browser APIs require it.
- Validate all external input with a schema at the server boundary before database writes.
- Keep database access in `lib/` or server-only route code; do not query Supabase directly
  from presentational components.
- Use accessible HTML and preserve responsive behavior.
- Keep migrations forward-only and safe to run in a clean Supabase project.

## Commands

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run the smallest relevant command for a change; run `pnpm lint`, `pnpm typecheck`, and
the relevant tests before considering a change complete. If a command is not yet defined,
add the script with the project setup rather than silently skipping validation.

## Security

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client code, browser bundles, or public env files.
- Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` may be public.
- Every table must have RLS enabled and explicit policies for each required operation.
- Treat RLS as a required defense, not a substitute for server-side authorization checks.
- Validate and constrain all input server-side; never trust hidden form fields or client roles.
- Use parameterized Supabase queries; never build SQL from user input.
- Verify ownership before modifying listings, images, profiles, or reviews.
- Do not log access tokens, passwords, service keys, private messages, or personal data.
- Store user-uploaded images in controlled buckets and validate type, size, and ownership.

## Definition of Done

- [ ] Scope matches the request and documented product decisions.
- [ ] Server-side validation and authorization cover every write path.
- [ ] RLS policies and migration constraints protect new data.
- [ ] Loading, empty, validation, and error states are handled explicitly.
- [ ] Relevant tests, lint, type-check, and build commands pass.
- [ ] Documentation and environment-variable examples are updated when behavior changes.
- [ ] No secrets, debug output, unrelated refactors, or placeholder implementations remain.
