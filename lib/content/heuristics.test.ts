import { describe, expect, it } from "vitest";
import { softSignals } from "./heuristics";

describe("softSignals", () => {
  it("flags long all-caps text", () => {
    expect(softSignals("SELLING MY OLD LAPTOP TODAY")).toContain("excessive_caps");
  });

  it("does not flag ordinary sentence casing", () => {
    expect(softSignals("Selling my old laptop today")).not.toContain("excessive_caps");
  });

  it("flags an emoji flood", () => {
    expect(softSignals("nice 😀😀😀😀😀😀😀")).toContain("emoji_flood");
  });

  it("allows a few emoji", () => {
    expect(softSignals("nice 😀😀")).not.toContain("emoji_flood");
  });

  it("flags repeated characters", () => {
    expect(softSignals("helloooooo")).toContain("repeated_characters");
  });

  it("flags mention floods", () => {
    expect(softSignals("@ana @ben @carla look")).toContain("mention_flood");
  });

  it("returns no reasons for a normal message", () => {
    expect(softSignals("Meet me at the PUP main gate at 3pm.")).toEqual([]);
  });
});
