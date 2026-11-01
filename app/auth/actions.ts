"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const authSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.")
    .refine((email) => email.endsWith("@iskolarngbayan.pup.edu.ph"), {
      message: "Use your PUP webmail address ending in @iskolarngbayan.pup.edu.ph.",
    }),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const signupSchema = authSchema.extend({
  displayName: z
    .string()
    .trim()
    .min(2, "Enter your name.")
    .max(80, "Name must be 80 characters or fewer."),
});

export type AuthActionState = {
  error?: string;
};

function getField(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

export async function signUp(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    email: getField(formData, "email"),
    password: getField(formData, "password"),
    displayName: getField(formData, "displayName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session && data.user) {
    await ensureProfile(supabase, data.user.id, parsed.data.displayName);
    redirect("/account");
  }

  redirect("/auth?check-email=1");
}

export async function signIn(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = authSchema.safeParse({
    email: getField(formData, "email"),
    password: getField(formData, "password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: error.message };
  }

  if (!data.user.email_confirmed_at) {
    return { error: "Confirm your PUP email before signing in." };
  }

  await ensureProfile(
    supabase,
    data.user.id,
    typeof data.user.user_metadata.display_name === "string"
      ? data.user.user_metadata.display_name
      : data.user.email?.split("@")[0] ?? "Iskolar",
  );
  redirect("/account");
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`Unable to sign out: ${error.message}`);
  }

  redirect("/");
}

async function ensureProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string,
  displayName: string,
) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id,
      display_name: displayName,
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(`Unable to create your profile: ${error.message}`);
  }
}
