"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const targetSchema = z.object({
  listingId: z.string().uuid().optional(),
  needPostId: z.string().uuid().optional(),
}).refine((value) => Boolean(value.listingId) !== Boolean(value.needPostId), "Choose one post.");

export async function updatePost(formData: FormData) {
  const parsed = targetSchema.safeParse({
    listingId: String(formData.get("listingId") ?? "") || undefined,
    needPostId: String(formData.get("needPostId") ?? "") || undefined,
  });
  const body = z.string().trim().min(3).max(5000).safeParse(String(formData.get("body") ?? ""));
  if (!parsed.success || !body.success) throw new Error("Enter valid post content.");
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("You must be signed in to edit a post.");
  const result = parsed.data.listingId
    ? await supabase.from("listings").update({ description: body.data }).eq("id", parsed.data.listingId).eq("seller_id", data.user.id)
    : await supabase.from("need_posts").update({ body: body.data }).eq("id", parsed.data.needPostId).eq("requester_id", data.user.id);
  if (result.error) throw new Error(`Unable to update post: ${result.error.message}`);
  revalidatePath("/account");
  revalidatePath("/profile");
}

export async function deletePost(formData: FormData) {
  const parsed = targetSchema.safeParse({
    listingId: String(formData.get("listingId") ?? "") || undefined,
    needPostId: String(formData.get("needPostId") ?? "") || undefined,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Unable to delete post.");

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("You must be signed in to delete a post.");

  if (parsed.data.listingId) {
    const { data: images, error: imagesError } = await supabase
      .from("listing_images")
      .select("storage_path, listings!inner(seller_id)")
      .eq("listing_id", parsed.data.listingId)
      .eq("listings.seller_id", data.user.id);
    if (imagesError) throw new Error(`Unable to prepare listing deletion: ${imagesError.message}`);

    const paths = (images ?? []).map((image) => image.storage_path);
    if (paths.length > 0) {
      const { error: storageError } = await supabase.storage.from("listing-images").remove(paths);
      if (storageError) throw new Error(`Unable to delete listing images: ${storageError.message}`);
    }

    const { error } = await supabase.from("listings").delete().eq("id", parsed.data.listingId).eq("seller_id", data.user.id);
    if (error) throw new Error(`Unable to delete listing: ${error.message}`);
  } else {
    const { error } = await supabase.from("need_posts").delete().eq("id", parsed.data.needPostId).eq("requester_id", data.user.id);
    if (error) throw new Error(`Unable to delete request: ${error.message}`);
  }

  revalidatePath("/account");
  revalidatePath("/profile");
}

export async function addComment(formData: FormData) {
  const parsed = targetSchema.extend({ body: z.string().trim().min(1).max(500) }).safeParse({
    listingId: String(formData.get("listingId") ?? "") || undefined,
    needPostId: String(formData.get("needPostId") ?? "") || undefined,
    body: String(formData.get("body") ?? ""),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Unable to add comment.");
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("You must be signed in to comment.");
  const { error } = await supabase.from("post_comments").insert({
    author_id: data.user.id,
    listing_id: parsed.data.listingId ?? null,
    need_post_id: parsed.data.needPostId ?? null,
    body: parsed.data.body,
  });
  if (error) throw new Error(`Unable to add comment: ${error.message}`);
  revalidatePath("/account");
}

export async function toggleRepost(formData: FormData) {
  const parsed = targetSchema.safeParse({
    listingId: String(formData.get("listingId") ?? "") || undefined,
    needPostId: String(formData.get("needPostId") ?? "") || undefined,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Unable to repost.");
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("You must be signed in to repost.");
  const column = parsed.data.listingId ? "listing_id" : "need_post_id";
  const value = parsed.data.listingId ?? parsed.data.needPostId;
  const { data: existing, error: lookupError } = await supabase.from("social_reposts").select("id").eq("user_id", data.user.id).eq(column, value).maybeSingle();
  if (lookupError) throw new Error(`Unable to check repost: ${lookupError.message}`);
  const result = existing
    ? await supabase.from("social_reposts").delete().eq("id", existing.id)
    : await supabase.from("social_reposts").insert({ user_id: data.user.id, listing_id: parsed.data.listingId ?? null, need_post_id: parsed.data.needPostId ?? null });
  if (result.error) throw new Error(`Unable to update repost: ${result.error.message}`);
  revalidatePath("/account");
}
