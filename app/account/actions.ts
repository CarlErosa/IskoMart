"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const needPostSchema = z.object({
  body: z.string().trim().min(3, "Tell the community what you need.").max(500, "Keep your request under 500 characters."),
  categoryId: z.string().uuid().optional(),
});

export type NeedPostActionState = { error?: string; success?: boolean };

export async function createNeedPost(
  _previousState: NeedPostActionState,
  formData: FormData,
): Promise<NeedPostActionState> {
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

  const { data: createdPost, error } = await supabase.from("need_posts").insert({
    requester_id: userData.user.id,
    body: parsed.data.body,
    category_id: parsed.data.categoryId ?? null,
  }).select("id").single();

  if (error || !createdPost) {
    return { error: `Unable to publish your request: ${error?.message ?? "The post could not be created."}` };
  }

  revalidatePath("/account");
  return { success: true };
}
