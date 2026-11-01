"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  displayName: z.string().trim().min(2, "Username must be at least 2 characters.").max(80, "Username must be 80 characters or fewer."),
  avatarUrl: z.string().url().nullable(),
  headerUrl: z.string().url().nullable(),
  bio: z.string().trim().max(280, "Bio must be 280 characters or fewer.").nullable(),
});

export type ProfileActionState = { error?: string };

export async function updateProfile(_previousState: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  const avatar = String(formData.get("avatarUrl") ?? "").trim();
  const header = String(formData.get("headerUrl") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    avatarUrl: avatar || null,
    headerUrl: header || null,
    bio: bio || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your profile details." };

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "Your session has expired. Please sign in again." };

  const { error } = await supabase.from("profiles").update({
    display_name: parsed.data.displayName,
    avatar_url: parsed.data.avatarUrl,
    header_url: parsed.data.headerUrl,
    bio: parsed.data.bio,
    updated_at: new Date().toISOString(),
  }).eq("id", data.user.id);
  if (error) return { error: `Unable to save your profile: ${error.message}` };

  revalidatePath("/");
  revalidatePath("/account");
  redirect("/account");
}
