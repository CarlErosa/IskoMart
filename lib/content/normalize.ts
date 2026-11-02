const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;
const INVISIBLE_CHARACTERS = /[\u00AD\u061C\u180E\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g;

/**
 * Normalize user text before validation and storage.
 *
 * This strips control and bidirectional characters, converts compatibility
 * characters (fullwidth letters, for example), and collapses whitespace. It
 * does not rewrite words: content rules decide whether to reject or flag.
 */
export function normalizeText(input: string): string {
  return input
    .normalize("NFKC")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u2028\u2029]/g, "\n")
    .replace(/\t/g, " ")
    .replace(CONTROL_CHARACTERS, "")
    .replace(INVISIBLE_CHARACTERS, "")
    .replace(/\u00A0/g, " ")
    .split("\n")
    .map((line) => line.replace(/ {2,}/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
