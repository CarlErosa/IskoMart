/**
 * Soft signals are stored as flags rather than blocks. They are intentionally
 * conservative because flagged public content stays visible under the current
 * moderation policy.
 */
export function softSignals(text: string): string[] {
  const reasons = new Set<string>();

  const letters = text.replace(/[^A-Za-z]/g, "");
  const uppercase = letters.replace(/[^A-Z]/g, "").length;

  if (letters.length >= 20 && uppercase / letters.length > 0.7) {
    reasons.add("excessive_caps");
  }

  const emojiCount = text.match(/\p{Extended_Pictographic}/gu)?.length ?? 0;
  if (emojiCount > 6) {
    reasons.add("emoji_flood");
  }

  if (/(.)\1{5,}/u.test(text)) {
    reasons.add("repeated_characters");
  }

  const mentions = text.match(/@[a-z0-9_]{2,}/gi) ?? [];
  if (mentions.length > 2) {
    reasons.add("mention_flood");
  }

  return [...reasons];
}
