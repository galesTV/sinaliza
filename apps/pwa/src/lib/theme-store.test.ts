// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";

import { THEME_COLORS, THEME_PREFERENCE_STORAGE_KEY } from "./theme";
import { applyResolvedTheme, createThemeStore } from "./theme-store";

function installMatchMedia(initial: boolean) {
  let matches = initial;
  const listeners = new Set<() => void>();
  const media = {
    get matches() {
      return matches;
    },
    media: "(prefers-color-scheme: dark)",
    addEventListener: vi.fn((_type: string, listener: () => void) => {
      listeners.add(listener);
    }),
    removeEventListener: vi.fn((_type: string, listener: () => void) => {
      listeners.delete(listener);
    }),
    addListener: vi.fn((listener: () => void) => listeners.add(listener)),
    removeListener: vi.fn((listener: () => void) => listeners.delete(listener)),
    dispatch: (next: boolean) => {
      matches = next;
      listeners.forEach((listener) => listener());
    },
    listenerCount: () => listeners.size,
  };
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => media),
  });
  return media;
}

function resetDom() {
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.style.colorScheme = "";
  document.head
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((meta) => meta.remove());
}

afterEach(() => {
  resetDom();
  vi.restoreAllMocks();
});

describe("theme store", () => {
  it("defaults to dark without a stored preference", () => {
    installMatchMedia(true);
    const store = createThemeStore(window);
    expect(store.getSnapshot()).toMatchObject({
      preference: "dark",
      resolvedTheme: "dark",
      systemTheme: "dark",
      storageAvailable: true,
    });
    store.destroy();
  });

  it("reads valid stored preferences strictly", () => {
    installMatchMedia(false);
    for (const preference of ["light", "dark", "system"] as const) {
      window.localStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, preference);
      const store = createThemeStore(window);
      expect(store.getSnapshot().preference).toBe(preference);
      store.destroy();
    }
  });

  it("treats invalid stored values as absent and keeps the dark default", () => {
    installMatchMedia(false);
    window.localStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, "blue");
    const store = createThemeStore(window);
    expect(store.getSnapshot()).toMatchObject({
      preference: "dark",
      resolvedTheme: "dark",
    });
    store.destroy();
  });

  it("resolves system dynamically and cleans up its listener", () => {
    const media = installMatchMedia(false);
    window.localStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, "system");
    const store = createThemeStore(window);
    expect(store.getSnapshot().resolvedTheme).toBe("light");

    media.dispatch(true);
    expect(store.getSnapshot().systemTheme).toBe("dark");
    expect(store.getSnapshot().resolvedTheme).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    media.dispatch(false);
    expect(store.getSnapshot().resolvedTheme).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    expect(media.listenerCount()).toBe(1);
    store.destroy();
    expect(media.listenerCount()).toBe(0);
  });

  it("keeps explicit preferences unchanged when the system theme changes", () => {
    const media = installMatchMedia(false);
    const store = createThemeStore(window);
    store.setPreference("dark");
    media.dispatch(true);
    media.dispatch(false);
    expect(store.getSnapshot()).toMatchObject({
      preference: "dark",
      resolvedTheme: "dark",
    });
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    store.destroy();
  });

  it("persists writes and a new store instance reads them after reload", () => {
    installMatchMedia(true);
    const first = createThemeStore(window);
    first.setPreference("light");
    expect(window.localStorage.getItem(THEME_PREFERENCE_STORAGE_KEY)).toBe("light");
    first.destroy();

    const second = createThemeStore(window);
    expect(second.getSnapshot()).toMatchObject({
      preference: "light",
      resolvedTheme: "light",
    });
    second.destroy();
  });

  it("falls back to memory when storage reads fail", () => {
    installMatchMedia(true);
    const original = Object.getOwnPropertyDescriptor(window, "localStorage");
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("blocked", "SecurityError");
      },
    });

    const store = createThemeStore(window);
    expect(store.getSnapshot().storageAvailable).toBe(false);
    store.setPreference("light");
    expect(store.getSnapshot()).toMatchObject({
      preference: "light",
      resolvedTheme: "light",
      storageAvailable: false,
    });
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    store.destroy();

    delete (window as { localStorage?: Storage }).localStorage;
    if (original) Object.defineProperty(window, "localStorage", original);
  });

  it("keeps the in-memory preference when storage writes fail", () => {
    installMatchMedia(true);
    const store = createThemeStore(window);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    store.setPreference("system");
    expect(store.getSnapshot()).toMatchObject({
      preference: "system",
      storageAvailable: false,
    });
    store.destroy();
  });

  it("applies data-theme, color-scheme and every theme-color meta", () => {
    const first = document.createElement("meta");
    first.name = "theme-color";
    const second = document.createElement("meta");
    second.name = "theme-color";
    document.head.append(first, second);

    applyResolvedTheme(window, "light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
    for (const meta of [first, second]) {
      expect(meta.getAttribute("content")).toBe(THEME_COLORS.light);
    }

    applyResolvedTheme(window, "dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    for (const meta of [first, second]) {
      expect(meta.getAttribute("content")).toBe(THEME_COLORS.dark);
    }
  });
});
