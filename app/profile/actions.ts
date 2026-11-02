"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapDbError, toActionError } from "@/lib/content/errors";
import { screenContent } from "@/lib/content/guard";
import { profileSchema } from "@/lib/content/schemas";

export type ProfileActionState = { error?: string };

function isOwnedStorageUrl(value: string | null): boolean {
  if (!value) return true;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return false;

  try {
    const url = new URL(value);
    const storageBase = new URL(base);
    return url.origin === storageBase.origin
      && url.pathname.startsWith("/storage/v1/object/public/avatars/");
  } catch {
    return false;
  }
}

export async function updateProfile(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  try {
    const avatar = String(formData.get("avatarUrl") ?? "").trim();
    const header = String(formData.get("headerUrl") ?? "").trim();
    const bio = String(formData.get("bio") ?? "").trim();

    const parsed = profileSchema.safeParse({
      displayName: formData.get("displayName"),
      avatarUrl: avatar || null,
      headerUrl: header || null,
      bio: bio || null,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Check your profile details." };
    }

    if (!isOwnedStorageUrl(parsed.data.avatarUrl) || !isOwnedStorageUrl(parsed.data.headerUrl)) {
      return { error: "Upload your profile pictures again." };
    }

    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      return { error: "Your session has expired. Please sign in again." };
    }

    await screenContent(supabase, {
      text: `${parsed.data.displayName} ${parsed.data.bio ?? ""}`,
      surface: "profile",
    });

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: parsed.data.displayName,
        avatar_url: parsed.data.avatarUrl,
        header_url: parsed.data.headerUrl,
        bio: parsed.data.bio,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.user.id);

    if (error) {
      return toActionError(mapDbError(error));
    }
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/");
  revalidatePath("/account");
  redirect("/account");
}
