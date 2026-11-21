import { describe, expect, it } from "vitest";

import { getLearningPaths } from "./learning-paths";
import { getPathPublicationSummary } from "./path-publication";

describe("getPathPublicationSummary", () => {
  it("accounts for every lesson in each path", () => {
    for (const path of getLearningPaths()) {
      const summary = getPathPublicationSummary(path);
      const expected = path.modules.reduce(
        (total, mod) => total + mod.lessons.length,
        0,
      );
      expect(summary.total).toBe(expected);
      expect(
        summary.published + summary.inReview + summary.planned,
      ).toBe(summary.total);
    }
  });

  it("reflects the current catalog state without hardcoding", () => {
    // No lesson has completed expert validation yet: published must be
    // derived as zero, never asserted by hand.
    for (const path of getLearningPaths()) {
      const summary = getPathPublicationSummary(path);
      expect(summary.published).toBe(0);
      expect(summary.planned + summary.inReview).toBe(summary.total);
    }

    const alfabeto = getLearningPaths().find((p) => p.slug === "alfabeto")!;
    const summary = getPathPublicationSummary(alfabeto);
    // The catalog currently holds draft material for the first module.
    expect(summary.inReview).toBeGreaterThan(0);
    expect(summary.planned).toBe(summary.total - summary.inReview);
  });
});
