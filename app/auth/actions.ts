"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { displayNameSchema } from "@/lib/content/schemas";
import { normalizeText } from "@/lib/content/normalize";
import { PRIVACY_NOTICE_VERSION } from "@/lib/legal/consent";

const authSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.")
    .refine((email) => email.endsWith("@gmail.com"), {
      message: "Use your personal Gmail address ending in @gmail.com.",
    }),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const signupSchema = authSchema.extend({
  displayName: displayNameSchema,
  privacyConsent: z
    .string()
    .refine((value) => value === "on", "Please accept the Privacy Policy to create an account."),
});

export type AuthActionState = {
  error?: string;
};

function getField(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

function isDuplicateAccountError(message: string): boolean {
  return /already registered|duplicate key|database error saving new user|user already exists/i.test(message);
}

export async function signUp(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    email: getField(formData, "email"),
    password: getField(formData, "password"),
    displayName: getField(formData, "displayName"),
    privacyConsent: getField(formData, "privacyConsent"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }

  const supabase = await createClient();

  const { data: identityTaken, error: identityError } = await supabase.rpc("gmail_identity_taken", {
    p_email: parsed.data.email,
  });

  if (!identityError && identityTaken === true) {
    return { error: "An account already exists for this Gmail address." };
  }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.displayName,
        privacy_notice_version: PRIVACY_NOTICE_VERSION,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.includes("privacy_consent_required")) {
      return { error: "Please accept the Privacy Policy to create an account." };
    }

    if (isDuplicateAccountError(error.message)) {
      return { error: "An account already exists for this Gmail address." };
    }

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
    return { error: "Confirm your Gmail address before signing in." };
  }

  const metadataName = typeof data.user.user_metadata.display_name === "string"
    ? data.user.user_metadata.display_name
    : "";

  const parsedName = displayNameSchema.safeParse(metadataName);
  const fallbackName = normalizeText(data.user.email?.split("@")[0] ?? "Iskolar");
  const displayName = parsedName.success
    ? parsedName.data
    : fallbackName.length >= 2
      ? displayNameSchema.safeParse(fallbackName).data ?? "Iskolar"
      : "Iskolar";

  await ensureProfile(supabase, data.user.id, displayName);
  redirect("/account");
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error("Unable to sign out. Please try again.");
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
    { onConflict: "id", ignoreDuplicates: true },
  );

  if (error) {
    throw new Error("Unable to create your profile. Please try again.");
  }
}
