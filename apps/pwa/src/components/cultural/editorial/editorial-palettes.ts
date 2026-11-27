import type { CSSProperties } from "react";

export const EDITORIAL_CATEGORIES = [
  "history",
  "curiosity",
  "personality",
  "library",
] as const;

export type EditorialCategory = (typeof EDITORIAL_CATEGORIES)[number];

export interface EditorialPalette {
  background: string;
  accent: string;
  foreground: string;
}

export const EDITORIAL_PALETTES: Record<EditorialCategory, EditorialPalette> = {
  history: {
    background: "#3B2B20",
    accent: "#F0A848",
    foreground: "#F2E4CB",
  },
  curiosity: {
    background: "#183B50",
    accent: "#35C9E8",
    foreground: "#D9F5FA",
  },
  personality: {
    background: "#30274F",
    accent: "#C7C0FF",
    foreground: "#F4F0FF",
  },
  library: {
    background: "#163E37",
    accent: "#83DFB8",
    foreground: "#E0F1E8",
  },
};

export function getEditorialPaletteStyle(
  category: EditorialCategory,
): CSSProperties {
  const palette = EDITORIAL_PALETTES[category];

  return {
    "--editorial-background": palette.background,
    "--editorial-accent": palette.accent,
    "--editorial-foreground": palette.foreground,
    "--editorial-spine":
      "color-mix(in srgb, var(--editorial-background) 76%, black)",
    "--editorial-muted":
      "color-mix(in srgb, var(--editorial-foreground) 82%, var(--editorial-background))",
    "--editorial-border":
      "color-mix(in srgb, var(--editorial-accent) 42%, transparent)",
  } as CSSProperties;
}
