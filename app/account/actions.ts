"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { mapDbError, toActionError } from "@/lib/content/errors";
import { screenContent } from "@/lib/content/guard";
import { needPostSchema } from "@/lib/content/schemas";

export type NeedPostActionState = { error?: string; success?: boolean; flagged?: boolean };

export async function createNeedPost(
  _previousState: NeedPostActionState,
  formData: FormData,
): Promise<NeedPostActionState> {
  try {
    const categoryId = String(formData.get("categoryId") ?? "").trim();
    const parsed = needPostSchema.safeParse({
      body: String(formData.get("body") ?? ""),
      categoryId: categoryId || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Check your request." };
    }

    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return { error: "Your session has expired. Please sign in again." };
    }

    const screened = await screenContent(supabase, {
      text: parsed.data.body,
      surface: "need_post",
    });

    const { data: createdPost, error } = await supabase
      .from("need_posts")
      .insert({
        requester_id: userData.user.id,
        body: screened.text,
        category_id: parsed.data.categoryId ?? null,
      })
      .select("id, moderation_status")
      .single();

    if (error || !createdPost) {
      return toActionError(mapDbError(error));
    }

    revalidatePath("/account");
    return { success: true, flagged: createdPost.moderation_status === "flagged" };
  } catch (error) {
    return toActionError(error);
  }
}
