"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { mapDbError } from "@/lib/content/errors";

export async function toggleLike(formData: FormData) {
  const listingId = String(formData.get("listingId") ?? "").trim();
  const needPostId = String(formData.get("needPostId") ?? "").trim();
  if ((!listingId && !needPostId) || (listingId && needPostId)) {
    throw new Error("A like must target one post.");
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("You must be signed in to like a post.");

  const filterColumn = listingId ? "listing_id" : "need_post_id";
  const filterValue = listingId || needPostId;
  const { data: existing, error: lookupError } = await supabase
    .from("social_likes")
    .select("id")
    .eq("user_id", userData.user.id)
    .eq(filterColumn, filterValue)
    .maybeSingle();

  if (lookupError) throw new Error("Unable to check that like. Please try again.");

  if (existing) {
    const { error } = await supabase.from("social_likes").delete().eq("id", existing.id);
    if (error) throw new Error(mapDbError(error).userMessage);
  } else {
    const { error } = await supabase.from("social_likes").insert({
      user_id: userData.user.id,
      listing_id: listingId || null,
      need_post_id: needPostId || null,
    });
    if (error) throw new Error(mapDbError(error).userMessage);
  }

  revalidatePath("/account");
  revalidatePath("/profile");
}
