export const THEME_PREFERENCE_STORAGE_KEY = "sinaliza.theme-preference.v1";

export const THEME_PREFERENCES = ["light", "dark", "system"] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];
export type ResolvedTheme = "light" | "dark";

export const DEFAULT_THEME_PREFERENCE: ThemePreference = "dark";

export const THEME_COLORS: Record<ResolvedTheme, string> = {
  light: "#F6FAF9",
  dark: "#10172b",
};

export function isThemePreference(value: unknown): value is ThemePreference {
  return (
    value === "light" || value === "dark" || value === "system"
  );
}

export function normalizeThemePreference(value: unknown): ThemePreference {
  return isThemePreference(value) ? value : DEFAULT_THEME_PREFERENCE;
}

export function resolveTheme(
  preference: ThemePreference,
  systemTheme: ResolvedTheme,
): ResolvedTheme {
  return preference === "system" ? systemTheme : preference;
}

/**
 * Synchronous pre-paint bootstrap. Keep this logic equivalent to
 * theme-store.ts; theme.test.ts exercises both against the same matrix.
 * If a strict CSP is introduced, this inline script will need a nonce or hash.
 */
export const THEME_INIT_SCRIPT = `(function(){var root=document.documentElement;var preference=${JSON.stringify(DEFAULT_THEME_PREFERENCE)};try{var stored=window.localStorage.getItem(${JSON.stringify(THEME_PREFERENCE_STORAGE_KEY)});if(stored==="light"||stored==="dark"||stored==="system"){preference=stored}}catch(e){}var system="dark";try{system=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch(e){}var resolved=preference==="system"?system:preference;root.setAttribute("data-theme",resolved);root.style.colorScheme=resolved;var meta=document.querySelector('meta[name="theme-color"]');if(meta){meta.setAttribute("content",resolved==="light"?${JSON.stringify(THEME_COLORS.light)}:${JSON.stringify(THEME_COLORS.dark)})}})()`;
