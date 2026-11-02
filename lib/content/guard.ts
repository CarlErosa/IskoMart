import type { SupabaseClient } from "@supabase/supabase-js";
import { classifyContent, type Classification, type ContentSurface } from "./classify";
import { ContentError, blockedMessage } from "./errors";
import { normalizeText } from "./normalize";

export type ScreenedContent = {
  text: string;
  classification: Classification;
};

/**
 * Normalize and preflight user content. A block is returned to the user before
 * the insert; the database trigger repeats the hard checks for direct writes.
 */
export async function screenContent(
  supabase: SupabaseClient,
  input: { text: string; surface: ContentSurface },
): Promise<ScreenedContent> {
  const text = normalizeText(input.text);

  if (!text) {
    throw new ContentError("EMPTY_CONTENT", "Write something before posting.");
  }

  const classification = await classifyContent(supabase, text, input.surface);

  if (classification.severity === "block") {
    throw new ContentError("CONTENT_BLOCKED", blockedMessage(classification.reasons), {
      reasons: classification.reasons,
    });
  }

  return { text, classification };
}
