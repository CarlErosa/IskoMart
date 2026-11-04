"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { mapDbError, toActionError } from "@/lib/content/errors";
import { reportSchema } from "@/lib/content/schemas";

export type ReportActionState = { error?: string; success?: boolean };
export type BlockActionState = { error?: string; success?: boolean };

const blockSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(["block", "unblock"]),
});

export async function reportContent(
  _previousState: ReportActionState,
  formData: FormData,
): Promise<ReportActionState> {
  try {
    const parsed = reportSchema.safeParse({
      targetType: formData.get("targetType"),
      targetId: String(formData.get("targetId") ?? ""),
      reason: formData.get("reason"),
      details: String(formData.get("details") ?? "").trim() || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Check the report details." };
    }

    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      return { error: "You must be signed in to report content." };
    }

    const { error } = await supabase.from("content_reports").insert({
      reporter_id: data.user.id,
      target_type: parsed.data.targetType,
      target_id: parsed.data.targetId,
      reason: parsed.data.reason,
      details: parsed.data.details ?? null,
    });

    if (error) {
      if (error.code === "23505" || error.message.includes("duplicate key")) {
        return { error: "You already reported this." };
      }

      return toActionError(mapDbError(error));
    }

    revalidatePath("/account");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function toggleBlock(
  _previousState: BlockActionState,
  formData: FormData,
): Promise<BlockActionState> {
  try {
    const parsed = blockSchema.safeParse({
      userId: String(formData.get("userId") ?? ""),
      action: formData.get("action"),
    });

    if (!parsed.success) {
      return { error: "Choose a person to block." };
    }

    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      return { error: "You must be signed in to block someone." };
    }

    if (data.user.id === parsed.data.userId) {
      return { error: "You cannot block yourself." };
    }

    if (parsed.data.action === "unblock") {
      const { error } = await supabase
        .from("user_blocks")
        .delete()
        .eq("blocker_id", data.user.id)
        .eq("blocked_id", parsed.data.userId);
      if (error) return toActionError(mapDbError(error));
    } else {
      const { error } = await supabase.from("user_blocks").insert({
        blocker_id: data.user.id,
        blocked_id: parsed.data.userId,
      });
      if (error && error.code !== "23505") {
        return toActionError(mapDbError(error));
      }
    }

    revalidatePath("/account");
    revalidatePath("/messages");
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    return toActionError(error);
  }
}
