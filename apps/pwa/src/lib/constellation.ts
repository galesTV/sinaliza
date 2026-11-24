/**
 * Deterministic projection of the learning catalog into constellation
 * geometry — pure functions, no React, no storage, no I/O.
 *
 * Each learning path is an independent constellation; each module is a
 * star; edges connect consecutive modules in the catalog's editorial
 * order (a reading sequence, never prerequisites). Star states reuse the
 * existing progression derivations (`getModuleProgress` +
 * `deriveModuleState`), so the figure can never show progress the rest
 * of the Atlas disagrees with — including the eligibility-precedes-
 * completion rule already enforced by `isLessonCompletable` inside
 * `getModuleProgress`.
 *
 * `pending` is a presentation-only condition (identity/hydration in
 * flight on an eligible module), not a fifth domain state: `preparation`
 * is a catalog fact and renders even while loading, but a personal
 * state (available/in_progress/walked) may never be claimed before the
 * active identity's completions resolve.
 */

import type { LearningPath } from "@/data/learning-paths";

import {
  deriveModuleState,
  getModuleProgress,
  type ModuleState,
} from "./progression";

export interface ConstellationStar {
  /** Stable identity: `pathSlug/moduleSlug`. */
  key: string;
  moduleSlug: string;
  title: string;
  href: string;
  state: ModuleState;
  /** Personal state withheld while the identity resolves (never claimed). */
  pending: boolean;
  x: number;
  y: number;
  /** Label block goes above the star for "up" stars of the wave, below otherwise. */
  labelAbove: boolean;
}

export interface ConstellationEdge {
  from: number;
  to: number;
  /** Cyan highlight — only between two adjacent walked modules. */
  walked: boolean;
}

export interface ConstellationGroup {
  pathSlug: string;
  pathTitle: string;
  pathHref: string;
  stars: ConstellationStar[];
  edges: ConstellationEdge[];
  width: number;
  height: number;
}

/** Accessible status label per state — legend and aria names share it. */
export const STAR_STATE_LABEL: Record<ModuleState, string> = {
  preparation: "em preparação",
  available: "disponível",
  in_progress: "em andamento",
  walked: "percorrida",
};

/**
 * Geometry constants. The serpentine chain packs up to ROW_CAPACITY
 * stars per row and reverses direction on each new row, so the figure
 * works for zero, one, odd, or many modules — nothing is fixed to the
 * current catalog. Three stars per row keeps the figure ~174 units wide,
 * which is what a 320px viewport card can render at ≥44px hit targets.
 *
 * Touch targets: stars sit STAR_SPACING units apart and carry a
 * HIT_RADIUS transparent hit circle. With a 174-unit viewBox rendered at
 * ~224px (a card's content width on a 320px viewport), 27 units ≈ 35px →
 * a ~70px CSS target; the 58-unit spacing keeps adjacent circles apart.
 * Rendered sizes must be re-verified if these constants change.
 */
const STAR_SPACING = 58;
const ROW_CAPACITY = 3;
const ROW_BASE_Y = 78;
const ROW_HEIGHT = 118;
const STAR_AMPLITUDE = 13;
const FIGURE_BOTTOM_PAD = 71;

export const CONSTELLATION_HIT_RADIUS = 27;
export const CONSTELLATION_STAR_SPACING = STAR_SPACING;

/** viewBox size for a figure with `starCount` stars. */
export function constellationSize(starCount: number): {
  width: number;
  height: number;
} {
  const cols = Math.max(Math.min(starCount, ROW_CAPACITY), 1);
  const rows = Math.max(Math.ceil(starCount / ROW_CAPACITY), 1);
  return {
    width: cols * STAR_SPACING,
    height: ROW_BASE_Y + (rows - 1) * ROW_HEIGHT + FIGURE_BOTTOM_PAD,
  };
}

/** Position of star `index` in a serpentine chain inside `width` units. */
export function starPosition(
  index: number,
  width: number,
): { x: number; y: number; labelAbove: boolean } {
  const row = Math.floor(index / ROW_CAPACITY);
  const col = index % ROW_CAPACITY;
  const x =
    row % 2 === 0
      ? STAR_SPACING * (col + 0.5)
      : width - STAR_SPACING * (col + 0.5);
  const up = index % 2 === 0;
  const y = ROW_BASE_Y + row * ROW_HEIGHT + (up ? -1 : 1) * STAR_AMPLITUDE;
  return { x, y, labelAbove: up };
}

/**
 * Wrap a module title into at most two short lines for SVG labels.
 * Longer titles keep their first two wrapped lines; a leftover tail is
 * marked with an ellipsis on the second line.
 */
export function wrapStarLabel(title: string, maxChars = 15): string[] {
  const words = title.split(/\s+/).filter(Boolean);
  const lines: string[] = [""];
  for (const word of words) {
    const current = lines[lines.length - 1];
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      lines[lines.length - 1] = candidate;
    } else {
      lines.push(word);
    }
  }
  if (lines.length > 2) {
    return [lines[0], `${lines[1]}…`];
  }
  return lines;
}

/**
 * Project one learning path into a constellation group. `loading` maps
 * to the presentation-only `pending` flag on eligible stars; it never
 * fabricates or hides catalog structure.
 */
export function projectConstellation(
  path: LearningPath,
  completed: ReadonlySet<string>,
  loading: boolean,
): ConstellationGroup {
  const { width, height } = constellationSize(path.modules.length);

  const stars: ConstellationStar[] = path.modules.map((courseModule, index) => {
    const state = deriveModuleState(
      getModuleProgress(path, courseModule, completed),
    );
    const { x, y, labelAbove } = starPosition(index, width);
    return {
      key: `${path.slug}/${courseModule.slug}`,
      moduleSlug: courseModule.slug,
      title: courseModule.title,
      href: `/trilhas/${path.slug}#${courseModule.slug}`,
      state,
      pending: loading && state !== "preparation",
      x,
      y,
      labelAbove,
    };
  });

  const edges: ConstellationEdge[] = stars.slice(1).map((_, index) => ({
    from: index,
    to: index + 1,
    walked:
      !loading &&
      stars[index].state === "walked" &&
      stars[index + 1].state === "walked",
  }));

  return {
    pathSlug: path.slug,
    pathTitle: path.title,
    pathHref: `/trilhas/${path.slug}`,
    stars,
    edges,
    width,
    height,
  };
}

/** True when every star is in preparation — the honest "still forming" case. */
export function allInPreparation(group: ConstellationGroup): boolean {
  return group.stars.every((star) => star.state === "preparation");
}
