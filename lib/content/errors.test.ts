import { describe, expect, it } from "vitest";
import { ContentError, blockedMessage, mapDbError, toActionError } from "./errors";

describe("mapDbError", () => {
  it("maps rate limits with a retry delay", () => {
    const error = mapDbError({ message: "rate_limited:125" });
    expect(error.code).toBe("RATE_LIMITED");
    expect(error.retryAfterSeconds).toBe(125);
    expect(error.userMessage).toContain("3 minutes");
  });

  it("maps duplicate content", () => {
    expect(mapDbError({ message: "duplicate_content" }).code).toBe("DUPLICATE_CONTENT");
  });

  it("maps content blocks and keeps the reasons", () => {
    const error = mapDbError({ message: "content_blocked:phone,link" });
    expect(error.code).toBe("CONTENT_BLOCKED");
    expect(error.reasons).toEqual(["phone", "link"]);
    expect(error.userMessage).toContain("Remove phone numbers");
  });

  it("maps account states", () => {
    expect(mapDbError({ message: "account_muted" }).code).toBe("ACCOUNT_MUTED");
    expect(mapDbError({ message: "account_suspended" }).code).toBe("ACCOUNT_SUSPENDED");
  });

  it("maps missing report targets", () => {
    expect(mapDbError({ message: "target_not_found" }).code).toBe("TARGET_UNAVAILABLE");
  });

  it("falls back to a generic error", () => {
    expect(mapDbError({ message: "something unexpected" }).code).toBe("UNKNOWN");
  });
});

describe("blockedMessage", () => {
  it("prioritizes payment guidance", () => {
    expect(blockedMessage(["link", "payment"])).toContain("GCash");
  });

  it("handles hate speech without repeating the term", () => {
    expect(blockedMessage(["hate"])).toContain("community rules");
  });
});

describe("toActionError", () => {
  it("returns the user-facing message for content errors", () => {
    const error = new ContentError("ACCOUNT_MUTED", "You are muted.");
    expect(toActionError(error)).toEqual({ error: "You are muted." });
  });

  it("does not leak unexpected error details", () => {
    expect(toActionError(new Error("database exploded"))).toEqual({
      error: "Something went wrong. Please try again.",
    });
  });
});
