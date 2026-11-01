# IskoMart Architecture

## Folder Layout

```text
app/                    App Router routes, layouts, pages, and route handlers
components/             Shared UI and interactive client components
lib/                    Supabase clients, validation, types, and server utilities
supabase/migrations/    Forward-only database schema and RLS migrations
docs/                   Product and engineering documentation
.github/                Copilot instructions
```

## Data Flow

The browser requests a Next.js route. Server components load public catalog data through the
server Supabase client. Forms submit to server actions or route handlers, where input is
validated, the authenticated user is resolved, and Supabase performs the database operation.
Postgres constraints and RLS enforce the final authorization boundary. Listing photos are
uploaded to Supabase Storage only through an authorized server path, with metadata recorded
in `listing_images`.

Search and category filtering query `listings` joined to `categories`; storefront pages query
the seller's public `profiles`, listings, and aggregate engagement data. Comments and reposts
are authenticated mutations protected by RLS. Conversations and messages are scoped to their
two participants; the current chat screen uses server actions and can be extended with
Supabase Realtime later.

## Authentication Flow

1. A student signs up with a PUP email address.
2. Supabase Auth sends the verification email and establishes the authenticated session after
   confirmation.
3. A protected server action creates the matching `profiles` row from the authenticated user.
4. Protected server actions obtain the user from the server Supabase client, never from a
   client-provided user ID.
5. RLS policies use `auth.uid()` to enforce profile ownership and listing/review permissions.

The application must reject non-PUP email addresses at the server boundary and should also
configure the same restriction in the Supabase Auth policy or hook.

## Server vs Client

- Server components: page data loading, storefront/catalog queries, metadata, and auth-aware
  rendering.
- Server actions and route handlers: validation, mutations, authorization, uploads, and
  message operations.
- Client components: search/filter controls, image selection previews, forms requiring browser
  interaction, and chat updates.
- `lib/supabase/server.ts`: request-aware server client using secure cookies.
- `lib/supabase/browser.ts`: browser client using only public Supabase variables.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only operational tooling, never imported by client code.
