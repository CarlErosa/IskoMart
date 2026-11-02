import type { SupabaseClient } from "@supabase/supabase-js";
import { ContentError } from "./errors";
import { softSignals } from "./heuristics";

export type ContentSurface = "listing" | "need_post" | "comment" | "message" | "review" | "profile";

export type Classification = {
  severity: "allow" | "flag" | "block";
  reasons: string[];
};

/**
 * Ask the database classifier for hard rules, then add local soft signals.
 * The database trigger runs the same hard-rule function on insert.
 */
export async function classifyContent(
  supabase: SupabaseClient,
  text: string,
  surface: ContentSurface,
): Promise<Classification> {
  const { data, error } = await supabase.rpc("classify_content", {
    p_text: text,
    p_surface: surface,
  });

  if (error) {
    throw new ContentError(
      "CLASSIFIER_UNAVAILABLE",
      "We couldn't check that content right now. Please try again.",
    );
  }

  const row = Array.isArray(data) ? data[0] : data;
  const hardReasons: string[] = Array.isArray(row?.reasons) ? row.reasons : [];
  const hardSeverity: Classification["severity"] =
    row?.severity === "block" ? "block" : row?.severity === "flag" ? "flag" : "allow";

  const reasons = [...new Set([...hardReasons, ...softSignals(text)])];

  return {
    severity: hardSeverity === "block" ? "block" : reasons.length > 0 ? "flag" : "allow",
    reasons,
  };
}
