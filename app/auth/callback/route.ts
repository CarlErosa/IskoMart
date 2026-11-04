import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedNext = url.searchParams.get("next");
  const next = requestedNext && /^\/(?![/\\])/.test(requestedNext)
    ? requestedNext
    : "/login?verified=1";
  const isReset = next.startsWith("/auth/reset-password");

  if (!code) {
    return NextResponse.redirect(
      new URL(isReset ? "/auth/reset?expired=1" : "/auth?error=missing-code", url.origin),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(isReset ? "/auth/reset?expired=1" : "/auth?error=verification-failed", url.origin),
    );
  }

  const { data } = await supabase.auth.getUser();
  if (data.user) {
    const displayName =
      typeof data.user.user_metadata.display_name === "string"
        ? data.user.user_metadata.display_name
        : data.user.email?.split("@")[0] ?? "Iskolar";
    const { error: profileError } = await supabase.rpc("ensure_profile", {
      p_display_name: displayName,
    });
    if (profileError) {
      return NextResponse.redirect(new URL("/auth?error=profile-creation-failed", url.origin));
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
