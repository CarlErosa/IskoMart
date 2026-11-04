"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  contentStatusSchema,
  moderationTargetSchema,
  reportResolutionSchema,
  userStateSchema,
} from "@/lib/content/schemas";

const contentTables = {
  listing: "listings",
  need_post: "need_posts",
  comment: "post_comments",
  review: "reviews",
} as const;

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

  return { supabase, adminId: data.user.id };
}

async function logAction(
  supabase: Awaited<ReturnType<typeof createClient>>,
  adminId: string,
  targetType: string,
  targetId: string,
  action: string,
  reason?: string,
) {
  const { error } = await supabase.from("moderation_actions").insert({
    admin_id: adminId,
    target_type: targetType,
    target_id: targetId,
    action,
    reason: reason ?? null,
  });

  if (error) throw new Error("Unable to record the moderation action.");
}

function revalidateModerationPaths() {
  revalidatePath("/admin");
  revalidatePath("/account");
  revalidatePath("/profile");
}

export async function deleteModerationItem(formData: FormData) {
  const parsed = moderationTargetSchema.safeParse({
    listingId: String(formData.get("listingId") ?? "") || undefined,
    needPostId: String(formData.get("needPostId") ?? "") || undefined,
    commentId: String(formData.get("commentId") ?? "") || undefined,
    reviewId: String(formData.get("reviewId") ?? "") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Unable to moderate this item.");
  }

  const { supabase, adminId } = await requireAdmin();

  if (parsed.data.listingId) {
    const { data: images, error: imagesError } = await supabase
      .from("listing_images")
      .select("storage_path")
      .eq("listing_id", parsed.data.listingId);
    if (imagesError) throw new Error("Unable to prepare the listing deletion.");

    const paths = (images ?? []).map((image) => image.storage_path);
    if (paths.length > 0) {
      const { error: storageError } = await supabase.storage.from("listing-images").remove(paths);
      if (storageError) throw new Error("Unable to delete the listing images.");
    }

    const { error } = await supabase.from("listings").delete().eq("id", parsed.data.listingId);
    if (error) throw new Error("Unable to delete the listing.");
    await logAction(supabase, adminId, "listing", parsed.data.listingId, "delete");
  } else if (parsed.data.needPostId) {
    const { error } = await supabase.from("need_posts").delete().eq("id", parsed.data.needPostId);
    if (error) throw new Error("Unable to delete the request.");
    await logAction(supabase, adminId, "need_post", parsed.data.needPostId, "delete");
  } else if (parsed.data.commentId) {
    const { error } = await supabase.from("post_comments").delete().eq("id", parsed.data.commentId);
    if (error) throw new Error("Unable to delete the comment.");
    await logAction(supabase, adminId, "comment", parsed.data.commentId, "delete");
  } else if (parsed.data.reviewId) {
    const { error } = await supabase.from("reviews").delete().eq("id", parsed.data.reviewId);
    if (error) throw new Error("Unable to delete the review.");
    await logAction(supabase, adminId, "review", parsed.data.reviewId, "delete");
  }

  revalidateModerationPaths();
  if (formData.get("returnToAccount") === "1") redirect("/account");
}

export async function setContentStatus(formData: FormData) {
  const parsed = contentStatusSchema.safeParse({
    targetType: formData.get("targetType"),
    targetId: String(formData.get("targetId") ?? ""),
    status: formData.get("status"),
    reason: String(formData.get("reason") ?? "").trim() || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Unable to update this content.");
  }

  const { supabase, adminId } = await requireAdmin();
  const table = contentTables[parsed.data.targetType];

  const { error } = await supabase
    .from(table)
    .update({
      moderation_status: parsed.data.status,
      moderation_reasons: parsed.data.status === "visible"
        ? []
        : [parsed.data.status === "hidden" ? "admin_hidden" : "admin_removed"],
      moderated_at: new Date().toISOString(),
      moderated_by: adminId,
    })
    .eq("id", parsed.data.targetId);

  if (error) throw new Error("Unable to update the content status.");

  const action = parsed.data.status === "visible"
    ? "restore"
    : parsed.data.status === "hidden"
      ? "hide"
      : "remove";

  await logAction(
    supabase,
    adminId,
    parsed.data.targetType,
    parsed.data.targetId,
    action,
    parsed.data.reason,
  );

  revalidateModerationPaths();
}

export async function setUserState(formData: FormData) {
  const parsed = userStateSchema.safeParse({
    userId: String(formData.get("userId") ?? ""),
    action: formData.get("action"),
    reason: String(formData.get("reason") ?? "").trim() || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Unable to update this account.");
  }

  const { supabase, adminId } = await requireAdmin();

  const update = parsed.data.action === "mute"
    ? {
      account_state: "muted",
      muted_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      suspended_at: null,
    }
    : parsed.data.action === "suspend"
      ? {
        account_state: "suspended",
        suspended_at: new Date().toISOString(),
        muted_until: null,
      }
      : {
        account_state: "active",
        muted_until: null,
        suspended_at: null,
      };

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", parsed.data.userId);

  if (error) throw new Error("Unable to update the account state.");

  await logAction(
    supabase,
    adminId,
    "profile",
    parsed.data.userId,
    parsed.data.action === "mute" ? "mute" : parsed.data.action === "suspend" ? "suspend" : "reinstate",
    parsed.data.reason,
  );

  revalidateModerationPaths();
}

export async function resolveReport(formData: FormData) {
  const parsed = reportResolutionSchema.safeParse({
    reportId: String(formData.get("reportId") ?? ""),
    status: formData.get("status"),
    notes: String(formData.get("notes") ?? "").trim() || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Unable to resolve this report.");
  }

  const { supabase, adminId } = await requireAdmin();

  const { error } = await supabase
    .from("content_reports")
    .update({
      status: parsed.data.status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminId,
    })
    .eq("id", parsed.data.reportId);

  if (error) throw new Error("Unable to resolve the report.");

  await logAction(
    supabase,
    adminId,
    "report",
    parsed.data.reportId,
    parsed.data.status === "actioned" ? "actioned_report" : "dismiss_report",
    parsed.data.notes,
  );

  revalidatePath("/admin");
}
