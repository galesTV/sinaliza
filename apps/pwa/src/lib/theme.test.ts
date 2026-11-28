import { describe, expect, it } from "vitest";

import {
  DEFAULT_THEME_PREFERENCE,
  THEME_INIT_SCRIPT,
  THEME_PREFERENCE_STORAGE_KEY,
  isThemePreference,
  normalizeThemePreference,
  resolveTheme,
} from "./theme";

describe("theme primitives", () => {
  it("keeps dark as the default preference", () => {
    expect(DEFAULT_THEME_PREFERENCE).toBe("dark");
    expect(normalizeThemePreference(undefined)).toBe("dark");
  });

  it("accepts only the three documented preferences", () => {
    for (const value of ["light", "dark", "system"]) {
      expect(isThemePreference(value)).toBe(true);
      expect(normalizeThemePreference(value)).toBe(value);
    }
    for (const value of ["", "blue", "LIGHT", null, 0, {}]) {
      expect(isThemePreference(value)).toBe(false);
      expect(normalizeThemePreference(value)).toBe("dark");
    }
  });

  it("resolves explicit preferences directly and system through the OS theme", () => {
    expect(resolveTheme("light", "dark")).toBe("light");
    expect(resolveTheme("light", "light")).toBe("light");
    expect(resolveTheme("dark", "light")).toBe("dark");
    expect(resolveTheme("dark", "dark")).toBe("dark");
    expect(resolveTheme("system", "light")).toBe("light");
    expect(resolveTheme("system", "dark")).toBe("dark");
  });

  it("embeds the versioned key, strict values and pre-paint theme application", () => {
    expect(THEME_INIT_SCRIPT).toContain(THEME_PREFERENCE_STORAGE_KEY);
    expect(THEME_INIT_SCRIPT).toContain('stored==="light"');
    expect(THEME_INIT_SCRIPT).toContain('stored==="dark"');
    expect(THEME_INIT_SCRIPT).toContain('stored==="system"');
    expect(THEME_INIT_SCRIPT).toContain('setAttribute("data-theme",resolved)');
    expect(THEME_INIT_SCRIPT).toContain('meta[name="theme-color"]');
  });
});
