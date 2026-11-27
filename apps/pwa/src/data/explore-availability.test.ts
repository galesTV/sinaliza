import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  publicEntries: [] as object[],
}));

vi.mock("./cultural-public", () => ({
  getPublicCulturalEntries: () => mocks.publicEntries,
}));

import { isExploreNavigationAvailable } from "./explore-availability";

const ORIGINAL = process.env.SINALIZA_EXPLORE_LAUNCHED;

beforeEach(() => {
  mocks.publicEntries = [];
});

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.SINALIZA_EXPLORE_LAUNCHED;
  else process.env.SINALIZA_EXPLORE_LAUNCHED = ORIGINAL;
});

describe("explore navigation availability", () => {
  it("is closed by default and when the explicit launch flag is absent", () => {
    delete process.env.SINALIZA_EXPLORE_LAUNCHED;
    expect(isExploreNavigationAvailable()).toBe(false);
  });

  it("stays closed without an exact true value", () => {
    process.env.SINALIZA_EXPLORE_LAUNCHED = "1";
    expect(isExploreNavigationAvailable()).toBe(false);
    process.env.SINALIZA_EXPLORE_LAUNCHED = "false";
    expect(isExploreNavigationAvailable()).toBe(false);
  });

  it("stays closed while the catalog has no publishable records", () => {
    process.env.SINALIZA_EXPLORE_LAUNCHED = "true";
    expect(isExploreNavigationAvailable()).toBe(false);
  });

  it("opens with explicit authorization and at least one publishable record", () => {
    process.env.SINALIZA_EXPLORE_LAUNCHED = "true";
    mocks.publicEntries = [{ id: "public-fixture" }];
    expect(isExploreNavigationAvailable()).toBe(true);
  });
});
