export type ContentErrorCode =
  | "CONTENT_BLOCKED"
  | "RATE_LIMITED"
  | "DUPLICATE_CONTENT"
  | "ACCOUNT_MUTED"
  | "ACCOUNT_SUSPENDED"
  | "TARGET_UNAVAILABLE"
  | "EMPTY_CONTENT"
  | "CLASSIFIER_UNAVAILABLE"
  | "UNKNOWN";

export class ContentError extends Error {
  readonly code: ContentErrorCode;
  readonly userMessage: string;
  readonly reasons: string[];
  readonly retryAfterSeconds?: number;

  constructor(
    code: ContentErrorCode,
    userMessage: string,
    options: { reasons?: string[]; retryAfterSeconds?: number } = {},
  ) {
    super(userMessage);
    this.name = "ContentError";
    this.code = code;
    this.userMessage = userMessage;
    this.reasons = options.reasons ?? [];
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

function formatWait(seconds: number): string {
  if (seconds >= 3600) {
    const hours = Math.ceil(seconds / 3600);
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }

  if (seconds >= 60) {
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  }

  return `${Math.max(1, seconds)} second${seconds === 1 ? "" : "s"}`;
}

export function blockedMessage(reasons: string[]): string {
  if (reasons.includes("payment")) {
    return "For everyone's safety, remove GCash, Maya, bank transfer, deposit, or downpayment details. Meet up and pay in person.";
  }

  if (reasons.includes("phone")) {
    return "Remove phone numbers. Arrange your meetup inside IskoMart chat.";
  }

  if (reasons.includes("email")) {
    return "Remove email addresses. Keep the conversation inside IskoMart chat.";
  }

  if (reasons.includes("link")) {
    return "Remove links from public posts. Share links only in chat.";
  }

  if (reasons.includes("off_platform")) {
    return "Keep conversations on IskoMart. Remove other platform handles from public posts.";
  }

  if (reasons.includes("hate")) {
    return "This content violates our community rules and cannot be posted.";
  }

  if (reasons.includes("harassment")) {
    return "This content looks like harassment and cannot be posted.";
  }

  if (reasons.includes("impersonation")) {
    return "This profile name is reserved. Choose a different name.";
  }

  return "This content violates our community rules. Please edit it and try again.";
}

export function mapDbError(error: { message?: string } | null | undefined): ContentError {
  const message = error?.message ?? "";

  const rateLimit = message.match(/rate_limited:(\d+)/);
  if (rateLimit) {
    const seconds = Number(rateLimit[1]) || 60;
    return new ContentError(
      "RATE_LIMITED",
      `You're posting too fast. Try again in ${formatWait(seconds)}.`,
      { retryAfterSeconds: seconds },
    );
  }

  if (message.includes("duplicate_content")) {
    return new ContentError(
      "DUPLICATE_CONTENT",
      "You already posted this recently. Edit the original post instead.",
    );
  }

  if (message.startsWith("content_blocked") || message.includes("content_blocked:")) {
    const reasonText = message.split("content_blocked:")[1] ?? "";
    const reasons = reasonText.split(",").map((reason) => reason.trim()).filter(Boolean);
    return new ContentError("CONTENT_BLOCKED", blockedMessage(reasons), { reasons });
  }

  if (message.includes("account_muted")) {
    return new ContentError("ACCOUNT_MUTED", "Your account is temporarily muted. You can post again later.");
  }

  if (message.includes("account_suspended")) {
    return new ContentError("ACCOUNT_SUSPENDED", "Your account is suspended. Contact an IskoMart admin if you think this is a mistake.");
  }

  if (message.includes("target_not_found") || message.includes("TARGET_UNAVAILABLE")) {
    return new ContentError("TARGET_UNAVAILABLE", "That post is no longer available.");
  }

  if (message.includes("profile_field_forbidden")) {
    return new ContentError("UNKNOWN", "You cannot change that profile field.");
  }

  if (message.includes("duplicate key") || message.includes("23505")) {
    return new ContentError("DUPLICATE_CONTENT", "That action was already completed.");
  }

  return new ContentError("UNKNOWN", "Something went wrong. Please try again.");
}

export function toActionError(error: unknown): { error: string } {
  if (error instanceof ContentError) {
    return { error: error.userMessage };
  }

  return { error: "Something went wrong. Please try again." };
}
