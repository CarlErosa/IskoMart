"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const moderationTargetSchema = z.object({
  listingId: z.string().uuid().optional(),
  needPostId: z.string().uuid().optional(),
  commentId: z.string().uuid().optional(),
}).refine(
  (value) => [value.listingId, value.needPostId, value.commentId].filter(Boolean).length === 1,
  "Choose one moderation target.",
);

async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("You must be signed in as an admin.");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", data.user.id)
    .maybeSingle();
  if (error || !profile?.is_admin) throw new Error("You do not have moderation access.");

  return supabase;
}

export async function deleteModerationItem(formData: FormData) {
  const parsed = moderationTargetSchema.safeParse({
    listingId: String(formData.get("listingId") ?? "") || undefined,
    needPostId: String(formData.get("needPostId") ?? "") || undefined,
    commentId: String(formData.get("commentId") ?? "") || undefined,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Unable to moderate this item.");

  const supabase = await requireAdmin();

  if (parsed.data.listingId) {
    const { data: images, error: imagesError } = await supabase
      .from("listing_images")
      .select("storage_path")
      .eq("listing_id", parsed.data.listingId);
    if (imagesError) throw new Error(`Unable to prepare listing deletion: ${imagesError.message}`);

    const paths = (images ?? []).map((image) => image.storage_path);
    if (paths.length > 0) {
      const { error: storageError } = await supabase.storage.from("listing-images").remove(paths);
      if (storageError) throw new Error(`Unable to delete listing images: ${storageError.message}`);
    }

    const { error } = await supabase.from("listings").delete().eq("id", parsed.data.listingId);
    if (error) throw new Error(`Unable to delete listing: ${error.message}`);
  } else if (parsed.data.needPostId) {
    const { error } = await supabase.from("need_posts").delete().eq("id", parsed.data.needPostId);
    if (error) throw new Error(`Unable to delete request: ${error.message}`);
  } else if (parsed.data.commentId) {
    const { error } = await supabase.from("post_comments").delete().eq("id", parsed.data.commentId);
    if (error) throw new Error(`Unable to delete comment: ${error.message}`);
  }

  revalidatePath("/admin");
  revalidatePath("/account");
  revalidatePath("/profile");
}
