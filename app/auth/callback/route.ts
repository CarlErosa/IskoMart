import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/auth?error=missing-code", url.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/auth?error=verification-failed", url.origin));
  }

  const { data } = await supabase.auth.getUser();
  if (data.user) {
    const displayName =
      typeof data.user.user_metadata.display_name === "string"
        ? data.user.user_metadata.display_name
        : data.user.email?.split("@")[0] ?? "Iskolar";
    const { error: profileError } = await supabase.from("profiles").upsert(
      { id: data.user.id, display_name: displayName },
      { onConflict: "id" },
    );
    if (profileError) {
      return NextResponse.redirect(new URL("/auth?error=profile-creation-failed", url.origin));
    }
  }

  return NextResponse.redirect(new URL("/login?verified=1", url.origin));
}
