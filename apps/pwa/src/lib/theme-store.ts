import {
  DEFAULT_THEME_PREFERENCE,
  THEME_COLORS,
  THEME_PREFERENCE_STORAGE_KEY,
  isThemePreference,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from "./theme";

export interface ThemeSnapshot {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  systemTheme: ResolvedTheme;
  storageAvailable: boolean;
}

export interface ThemeStore {
  getSnapshot: () => ThemeSnapshot;
  subscribe: (listener: () => void) => () => void;
  setPreference: (preference: ThemePreference) => void;
  reapply: () => void;
  destroy: () => void;
}

export function readSystemTheme(win: Window): ResolvedTheme {
  try {
    return typeof win.matchMedia === "function" &&
      win.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "dark";
  }
}

export function applyResolvedTheme(win: Window, theme: ResolvedTheme): void {
  const root = win.document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
  win.document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((meta) => meta.setAttribute("content", THEME_COLORS[theme]));
}

/**
 * Browser-local source of truth for theme preference. A mirror in memory is
 * intentional: accessing or writing localStorage can throw SecurityError, and
 * the preference must keep working for the current session either way.
 */
export function createThemeStore(win: Window): ThemeStore {
  let storage: Storage | undefined;
  let storageAvailable = true;
  try {
    storage = win.localStorage;
  } catch {
    storage = undefined;
    storageAvailable = false;
  }

  let memoryPreference = DEFAULT_THEME_PREFERENCE;

  function readPreference(): ThemePreference {
    if (!storage) return memoryPreference;
    try {
      const stored = storage.getItem(THEME_PREFERENCE_STORAGE_KEY);
      if (isThemePreference(stored)) {
        memoryPreference = stored;
        return stored;
      }
      return memoryPreference;
    } catch {
      storageAvailable = false;
      return memoryPreference;
    }
  }

  let preference = readPreference();
  let systemTheme = readSystemTheme(win);
  let snapshot: ThemeSnapshot = {
    preference,
    systemTheme,
    resolvedTheme: resolveTheme(preference, systemTheme),
    storageAvailable,
  };

  const listeners = new Set<() => void>();

  function emit() {
    snapshot = {
      preference,
      systemTheme,
      resolvedTheme: resolveTheme(preference, systemTheme),
      storageAvailable,
    };
    listeners.forEach((listener) => listener());
  }

  function handleSystemChange() {
    const nextSystemTheme = readSystemTheme(win);
    if (nextSystemTheme === systemTheme) return;
    systemTheme = nextSystemTheme;
    if (preference === "system") {
      applyResolvedTheme(win, resolveTheme(preference, systemTheme));
    }
    emit();
  }

  let media: MediaQueryList | undefined;
  try {
    media =
      typeof win.matchMedia === "function"
        ? win.matchMedia("(prefers-color-scheme: dark)")
        : undefined;
  } catch {
    media = undefined;
  }
  media?.addEventListener?.("change", handleSystemChange);
  if (media && !media.addEventListener) {
    media.addListener(handleSystemChange);
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setPreference(nextPreference) {
      preference = nextPreference;
      memoryPreference = nextPreference;
      if (storage) {
        try {
          storage.setItem(THEME_PREFERENCE_STORAGE_KEY, nextPreference);
          storageAvailable = true;
        } catch {
          storageAvailable = false;
        }
      }
      applyResolvedTheme(win, resolveTheme(preference, systemTheme));
      emit();
    },
    reapply() {
      applyResolvedTheme(win, resolveTheme(preference, systemTheme));
    },
    destroy() {
      media?.removeEventListener?.("change", handleSystemChange);
      if (media && !media.removeEventListener) {
        media.removeListener(handleSystemChange);
      }
      listeners.clear();
    },
  };
}

let browserStore: ThemeStore | null = null;

export function getBrowserThemeStore(): ThemeStore | null {
  if (typeof window === "undefined") return null;
  browserStore ??= createThemeStore(window);
  return browserStore;
}
