import { describe, expect, it } from "vitest";
import { normalizeText } from "./normalize";

describe("normalizeText", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeText("  hello   world  ")).toBe("hello world");
  });

  it("collapses runs of blank lines", () => {
    expect(normalizeText("one\n\n\n\ntwo")).toBe("one\n\ntwo");
  });

  it("removes zero-width and control characters", () => {
    expect(normalizeText("he\u200Bllo\u0007")).toBe("hello");
  });

  it("normalizes compatibility characters", () => {
    expect(normalizeText("\uFF28\uFF45\uFF4C\uFF4C\uFF4F")).toBe("Hello");
  });

  it("converts non-breaking spaces and tabs to spaces", () => {
    expect(normalizeText("a\u00A0b\tc")).toBe("a b c");
  });

  it("returns an empty string for blank input", () => {
    expect(normalizeText(" \n\t ")).toBe("");
  });
});
