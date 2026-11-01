# IskoMart Copilot Instructions

Follow the complete project rules in [AGENTS.md](../AGENTS.md).

- Use Next.js App Router, strict TypeScript, Tailwind CSS, Supabase, pnpm, and Vercel.
- Default to server components and server-side validated writes; use client components only
  for required interactivity.
- Never expose the Supabase service-role key. Every database table must enable RLS and have
  explicit policies. Verify ownership and validate all input server-side.
- Follow the repository layout, naming conventions, commands, and definition-of-done checklist
  in `AGENTS.md`.
