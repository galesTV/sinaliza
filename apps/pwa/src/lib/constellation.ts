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
  /** Wrapped label lines (at most two), always inside the viewBox via labelX. */
  labelLines: string[];
  /** Label anchor x — clamped so the widest line never leaves the viewBox. */
  labelX: number;
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
  /** Deterministic silhouette variant derived from the path slug (0 or 1). */
  variant: 0 | 1;
  stars: ConstellationStar[];
  edges: ConstellationEdge[];
  width: number;
  height: number;
  /** True while at least one eligible star withholds its personal state. */
  hasPending: boolean;
}

/** Accessible status label per state — legend and aria names share it. */
export const STAR_STATE_LABEL: Record<ModuleState, string> = {
  preparation: "em preparação",
  available: "disponível",
  in_progress: "em andamento",
  walked: "percorrida",
};

/** Accessible label shown while a star's personal state is resolving. */
export const STAR_PENDING_LABEL = "carregando progresso";

/**
 * Geometry constants. The serpentine chain packs up to `capacity` stars
 * per row and reverses direction on each new row, so the figure works
 * for zero, one, odd, or many modules — nothing is fixed to the current
 * catalog. The compact figure (three stars per row, ~174 units wide) is
 * what a 320px viewport card can render at ≥44px hit targets; a wider
 * capacity is offered to single-constellation layouts on larger screens.
 *
 * Touch targets: stars sit STAR_SPACING units apart and carry a
 * HIT_RADIUS transparent hit circle. With a 174-unit viewBox rendered at
 * ~224px (a card's content width on a 320px viewport), 27 units ≈ 35px →
 * a ~70px CSS target; the 58-unit spacing keeps adjacent circles apart.
 * Rendered sizes must be re-verified if these constants change.
 */
const STAR_SPACING = 58;
const DEFAULT_CAPACITY = 3;
const WIDE_CAPACITY = 6;
const ROW_BASE_Y = 72;
const ROW_HEIGHT = 104;
const STAR_AMPLITUDE = 13;
const FIGURE_BOTTOM_PAD = 64;
const LABEL_SIDE_MARGIN = 4;
/** Estimated em-width of a 9px label character, in viewBox units. */
const LABEL_CHAR_WIDTH = 5.6;
const LABEL_MAX_CHARS = 14;

export const CONSTELLATION_HIT_RADIUS = 27;
export const CONSTELLATION_STAR_SPACING = STAR_SPACING;
export const CONSTELLATION_COMPACT_CAPACITY = DEFAULT_CAPACITY;
export const CONSTELLATION_WIDE_CAPACITY = WIDE_CAPACITY;

/** viewBox size for a figure with `starCount` stars. */
export function constellationSize(
  starCount: number,
  capacity: number = DEFAULT_CAPACITY,
): { width: number; height: number } {
  const cols = Math.max(Math.min(starCount, capacity), 1);
  const rows = Math.max(Math.ceil(starCount / capacity), 1);
  return {
    width: cols * STAR_SPACING,
    height: ROW_BASE_Y + (rows - 1) * ROW_HEIGHT + FIGURE_BOTTOM_PAD,
  };
}

/**
 * Deterministic per-trail silhouette variant: a tiny hash of the path
 * slug flips the wave's starting phase, so sibling constellations share
 * the same language without sharing the same silhouette. No randomness.
 */
export function trailVariant(pathSlug: string): 0 | 1 {
  let hash = 0;
  for (const char of pathSlug) hash = (hash + char.charCodeAt(0)) % 4;
  return (hash % 2) as 0 | 1;
}

/** Position of star `index` in a serpentine chain inside `width` units. */
export function starPosition(
  index: number,
  width: number,
  capacity: number = DEFAULT_CAPACITY,
  variant: 0 | 1 = 0,
): { x: number; y: number; labelAbove: boolean } {
  const row = Math.floor(index / capacity);
  const col = index % capacity;
  const x =
    row % 2 === 0
      ? STAR_SPACING * (col + 0.5)
      : width - STAR_SPACING * (col + 0.5);
  const up = (index + variant) % 2 === 0;
  const y = ROW_BASE_Y + row * ROW_HEIGHT + (up ? -1 : 1) * STAR_AMPLITUDE;
  return { x, y, labelAbove: up };
}

/**
 * Wrap a module title into at most two short lines for SVG labels.
 * Words longer than `maxChars` are hard-broken so no single word can
 * overflow the figure; a leftover tail is marked with an ellipsis on
 * the second line. Never returns empty lines.
 */
export function wrapStarLabel(title: string, maxChars = LABEL_MAX_CHARS): string[] {
  const words = title.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  for (const word of words) {
    if (word.length <= maxChars) {
      chunks.push(word);
      continue;
    }
    // Hard-break words that can never fit on one line.
    for (let at = 0; at < word.length; at += maxChars) {
      chunks.push(word.slice(at, at + maxChars));
    }
  }

  const lines: string[] = [];
  let current = "";
  for (const chunk of chunks) {
    const candidate = current ? `${current} ${chunk}` : chunk;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = chunk;
    }
  }
  if (current) lines.push(current);

  const clipped = lines.slice(0, 2);
  if (lines.length > 2) clipped[1] = `${clipped[1]}…`;
  return clipped.filter(Boolean);
}

/**
 * Center x for a label whose widest line is `lineChars` characters, so
 * it stays inside `width` with a small side margin.
 */
export function clampLabelX(
  starX: number,
  lineChars: number,
  width: number,
): number {
  const half = (lineChars * LABEL_CHAR_WIDTH) / 2;
  return Math.min(
    Math.max(starX, half + LABEL_SIDE_MARGIN),
    width - half - LABEL_SIDE_MARGIN,
  );
}

/**
 * Deterministic spatial dust: a handful of faint background dots placed
 * at fixed fractional positions of the figure — texture, not content.
 * Skipped when a dot would sit inside a star's hit circle.
 */
export function constellationDust(
  group: Pick<ConstellationGroup, "width" | "height" | "stars">,
): { x: number; y: number; r: number }[] {
  const fractions = [
    [0.14, 0.16],
    [0.5, 0.09],
    [0.88, 0.2],
    [0.3, 0.52],
    [0.72, 0.48],
    [0.16, 0.86],
    [0.55, 0.92],
    [0.9, 0.8],
  ];
  return fractions
    .map(([fx, fy]) => ({
      x: Math.round(group.width * fx),
      y: Math.round(group.height * fy),
      r: 0.9,
    }))
    .filter(
      (dot) =>
        !group.stars.some(
          (star) =>
            Math.hypot(star.x - dot.x, star.y - dot.y) <
            CONSTELLATION_HIT_RADIUS + 4,
        ),
    );
}

/**
 * Project one learning path into a constellation group. `loading` maps
 * to the presentation-only `pending` flag on eligible stars; it never
 * fabricates or hides catalog structure. `capacity` widens the figure
 * for layouts that can afford a more horizontal silhouette.
 */
export function projectConstellation(
  path: LearningPath,
  completed: ReadonlySet<string>,
  loading: boolean,
  capacity: number = DEFAULT_CAPACITY,
): ConstellationGroup {
  const variant = trailVariant(path.slug);
  const { width, height } = constellationSize(path.modules.length, capacity);

  const stars: ConstellationStar[] = path.modules.map((courseModule, index) => {
    const state = deriveModuleState(
      getModuleProgress(path, courseModule, completed),
    );
    const { x, y, labelAbove } = starPosition(index, width, capacity, variant);
    const labelLines = wrapStarLabel(courseModule.title);
    const widest = Math.max(1, ...labelLines.map((line) => line.length));
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
      labelLines,
      labelX: clampLabelX(x, widest, width),
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
    variant,
    stars,
    edges,
    width,
    height,
    hasPending: stars.some((star) => star.pending),
  };
}

/** True when every star is in preparation — the honest "still forming" case. */
export function allInPreparation(group: ConstellationGroup): boolean {
  return group.stars.every((star) => star.state === "preparation");
}
