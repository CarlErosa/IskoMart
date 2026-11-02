"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { mapDbError, toActionError } from "@/lib/content/errors";
import { screenContent } from "@/lib/content/guard";
import {
  commentBodySchema,
  listingDescriptionSchema,
  needPostBodySchema,
} from "@/lib/content/schemas";

const targetSchema = z
  .object({
    listingId: z.string().uuid().optional(),
    needPostId: z.string().uuid().optional(),
  })
  .refine(
    (value) => Boolean(value.listingId) !== Boolean(value.needPostId),
    "Choose one post.",
  );

export type PostActionState = { error?: string; success?: boolean };
export type CommentActionState = { error?: string; success?: boolean; flagged?: boolean };

function readTarget(formData: FormData) {
  return targetSchema.safeParse({
    listingId: String(formData.get("listingId") ?? "") || undefined,
    needPostId: String(formData.get("needPostId") ?? "") || undefined,
  });
}

export async function updatePost(
  _previousState: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  try {
    const parsed = readTarget(formData);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Unable to edit this post." };
    }

    const contentSchema = parsed.data.listingId ? listingDescriptionSchema : needPostBodySchema;
    const body = contentSchema.safeParse(String(formData.get("body") ?? ""));
    if (!body.success) {
      return { error: body.error.issues[0]?.message ?? "Enter valid post content." };
    }

    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      return { error: "You must be signed in to edit a post." };
    }

    const screened = await screenContent(supabase, {
      text: body.data,
      surface: parsed.data.listingId ? "listing" : "need_post",
    });

    const result = parsed.data.listingId
      ? await supabase
        .from("listings")
        .update({ description: screened.text })
        .eq("id", parsed.data.listingId)
        .eq("seller_id", data.user.id)
      : await supabase
        .from("need_posts")
        .update({ body: screened.text })
        .eq("id", parsed.data.needPostId)
        .eq("requester_id", data.user.id);

    if (result.error) {
      return toActionError(mapDbError(result.error));
    }

    revalidatePath("/account");
    revalidatePath("/profile");
  } catch (error) {
    return toActionError(error);
  }

  redirect("/account");
}

export async function deletePost(formData: FormData) {
  const parsed = readTarget(formData);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Unable to delete this post.");
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    throw new Error("You must be signed in to delete a post.");
  }

  if (parsed.data.listingId) {
    const { data: images, error: imagesError } = await supabase
      .from("listing_images")
      .select("storage_path, listings!inner(seller_id)")
      .eq("listing_id", parsed.data.listingId)
      .eq("listings.seller_id", data.user.id);
    if (imagesError) {
      throw new Error("Unable to prepare the listing for deletion. Please try again.");
    }

    const paths = (images ?? []).map((image) => image.storage_path);
    if (paths.length > 0) {
      const { error: storageError } = await supabase.storage.from("listing-images").remove(paths);
      if (storageError) {
        throw new Error("Unable to delete the listing photos. Please try again.");
      }
    }

    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", parsed.data.listingId)
      .eq("seller_id", data.user.id);
    if (error) {
      throw new Error(mapDbError(error).userMessage);
    }
  } else {
    const { error } = await supabase
      .from("need_posts")
      .delete()
      .eq("id", parsed.data.needPostId)
      .eq("requester_id", data.user.id);
    if (error) {
      throw new Error(mapDbError(error).userMessage);
    }
  }

  revalidatePath("/account");
  revalidatePath("/profile");
}

export async function addComment(
  _previousState: CommentActionState,
  formData: FormData,
): Promise<CommentActionState> {
  try {
    const parsed = readTarget(formData);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Unable to add a comment." };
    }

    const body = commentBodySchema.safeParse(String(formData.get("body") ?? ""));
    if (!body.success) {
      return { error: body.error.issues[0]?.message ?? "Unable to add a comment." };
    }

    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      return { error: "You must be signed in to comment." };
    }

    const screened = await screenContent(supabase, {
      text: body.data,
      surface: "comment",
    });

    const { data: comment, error } = await supabase
      .from("post_comments")
      .insert({
        author_id: data.user.id,
        listing_id: parsed.data.listingId ?? null,
        need_post_id: parsed.data.needPostId ?? null,
        body: screened.text,
      })
      .select("id, moderation_status")
      .single();

    if (error || !comment) {
      return toActionError(mapDbError(error));
    }

    revalidatePath("/account");
    return { success: true, flagged: comment.moderation_status === "flagged" };
  } catch (error) {
    return toActionError(error);
  }
}

export async function toggleRepost(formData: FormData) {
  const parsed = readTarget(formData);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Unable to repost.");
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    throw new Error("You must be signed in to repost.");
  }

  const column = parsed.data.listingId ? "listing_id" : "need_post_id";
  const value = parsed.data.listingId ?? parsed.data.needPostId;
  const { data: existing, error: lookupError } = await supabase
    .from("social_reposts")
    .select("id")
    .eq("user_id", data.user.id)
    .eq(column, value)
    .maybeSingle();

  if (lookupError) {
    throw new Error("Unable to check that repost. Please try again.");
  }

  const result = existing
    ? await supabase.from("social_reposts").delete().eq("id", existing.id)
    : await supabase.from("social_reposts").insert({
      user_id: data.user.id,
      listing_id: parsed.data.listingId ?? null,
      need_post_id: parsed.data.needPostId ?? null,
    });

  if (result.error) {
    throw new Error(mapDbError(result.error).userMessage);
  }

  revalidatePath("/account");
}
