"use client";

import Link from "next/link";

import type { LearningPath } from "@/data/learning-paths";
import {
  allInPreparation,
  CONSTELLATION_HIT_RADIUS,
  CONSTELLATION_WIDE_CAPACITY,
  constellationDust,
  projectConstellation,
  STAR_PENDING_LABEL,
  STAR_STATE_LABEL,
  type ConstellationGroup,
  type ConstellationStar,
} from "@/lib/constellation";
import type { ModuleState } from "@/lib/progression";

import { useAtlasProgress } from "./atlas-progress";

export const CONSTELLATION_EMPTY_NOTE =
  "Sua constelação já está tomando forma. As estrelas ganharão novos estados conforme atividades forem disponibilizadas e percorridas.";
export const CONSTELLATION_TEXT_TOGGLE = "Ver a constelação em texto";
export const CONSTELLATION_LEGEND_TITLE = "Legenda";
export const CONSTELLATION_LOADING_NOTE = "Carregando seu progresso…";
export const CONSTELLATION_SKIP_LABEL = "Pular a constelação";

/** One projected path: compact figure, plus an optional wider desktop layout. */
export interface ConstellationEntry {
  group: ConstellationGroup;
  wide?: ConstellationGroup;
}

function starAccessibleName(star: ConstellationStar, pathTitle: string): string {
  return star.pending
    ? `${star.title}, trilha ${pathTitle} — ${STAR_PENDING_LABEL}`
    : `${star.title}, trilha ${pathTitle} — ${STAR_STATE_LABEL[star.state]}`;
}

/**
 * The star's drawn signature: each state has its own shape + radius +
 * stroke + ring — never color alone (MASTER.md §8).
 */
function StarGlyph({ state }: { state: ModuleState | "pending" }) {
  switch (state) {
    case "pending":
      // Presentation-only neutral: identity still resolving on an
      // eligible module — never dressed as available, in_progress or
      // walked. Not a fifth domain state.
      return (
        <>
          <circle
            r={6.5}
            fill="none"
            stroke="var(--color-muted)"
            strokeOpacity={0.55}
            strokeWidth={1}
          />
          <circle r={1.8} fill="var(--color-muted)" fillOpacity={0.4} />
        </>
      );
    case "preparation":
      return (
        <>
          <circle
            r={8}
            fill="none"
            stroke="var(--color-muted)"
            strokeOpacity={0.45}
            strokeWidth={1}
            strokeDasharray="2.5 3"
          />
          <circle r={4} fill="var(--color-muted)" fillOpacity={0.55} />
        </>
      );
    case "available":
      return (
        <>
          <circle r={11} fill="var(--color-primary-soft)" fillOpacity={0.12} />
          <circle r={5} fill="var(--color-primary-soft)" />
        </>
      );
    case "in_progress":
      return (
        <>
          <circle
            r={10.5}
            fill="none"
            stroke="var(--color-primary)"
            strokeOpacity={0.7}
            strokeWidth={1.2}
          />
          <circle r={5.5} fill="var(--color-primary)" />
        </>
      );
    case "walked":
      return (
        <>
          <circle
            r={10}
            fill="none"
            stroke="var(--color-accent)"
            strokeOpacity={0.55}
            strokeWidth={1}
          />
          <circle
            r={7}
            fill="none"
            stroke="var(--color-accent)"
            strokeOpacity={0.3}
            strokeWidth={1}
          />
          <circle r={5} fill="var(--color-accent)" />
          <path
            d="M-2.4 0 l1.7 1.7 3.1-3.1"
            fill="none"
            stroke="var(--color-background)"
            strokeWidth={1.3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );
  }
}

/**
 * A star: real link to the module's anchor on its path page, with an
 * expanded transparent hit area (≥44px CSS after viewBox scaling — see
 * constellation.ts), a drawn focus ring and an accessible name carrying
 * trail + module + state. The page's global rectangular focus outline
 * is suppressed on this link only — it clips on SVG geometry; the drawn
 * cyan ring remains the accessible indicator.
 */
function StarLink({
  star,
  pathTitle,
}: {
  star: ConstellationStar;
  pathTitle: string;
}) {
  const name = starAccessibleName(star, pathTitle);
  const labelY = star.labelAbove ? star.y - 22 : star.y + 28;

  return (
    <a
      href={star.href}
      aria-label={name}
      className="starlink focus-visible:outline-hidden"
    >
      <title>{name}</title>
      <circle
        cx={star.x}
        cy={star.y}
        r={CONSTELLATION_HIT_RADIUS}
        fill="transparent"
      />
      <circle
        cx={star.x}
        cy={star.y}
        r={13}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={1.4}
        strokeDasharray="3 3"
        className="opacity-0 transition-opacity duration-200 [.starlink:focus-visible_&]:opacity-100 [.starlink:hover_&]:opacity-60"
      />
      <g transform={`translate(${star.x} ${star.y})`}>
        <StarGlyph state={star.pending ? "pending" : star.state} />
      </g>
      <text
        x={star.labelX}
        y={labelY}
        textAnchor="middle"
        fontSize={9.5}
        fill="var(--color-muted)"
        aria-hidden="true"
      >
        {star.labelLines.map((line, i) => (
          <tspan key={i} x={star.labelX} dy={i === 0 ? 0 : 10.5}>
            {line}
          </tspan>
        ))}
      </text>
    </a>
  );
}

/**
 * One constellation = one learning path. Edges are the editorial
 * sequence; an edge lights cyan only when both adjacent modules are
 * walked (and never while the identity resolves).
 */
export function ConstellationFigureView({
  group,
  className,
}: {
  group: ConstellationGroup;
  className?: string;
}) {
  if (group.stars.length === 0) return null;

  return (
    <svg
      viewBox={`0 0 ${group.width} ${group.height}`}
      fill="none"
      role="group"
      aria-label={`Constelação da trilha ${group.pathTitle}`}
      className={className}
    >
      {constellationDust(group).map((dot, i) => (
        <circle
          key={i}
          cx={dot.x}
          cy={dot.y}
          r={dot.r}
          fill="var(--color-primary-soft)"
          fillOpacity={0.18}
        />
      ))}
      {group.edges.map((edge) => {
        const from = group.stars[edge.from];
        const to = group.stars[edge.to];
        return (
          <line
            key={`${edge.from}-${edge.to}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={
              edge.walked ? "var(--color-accent)" : "var(--color-primary-soft)"
            }
            strokeOpacity={edge.walked ? 0.7 : 0.32}
            strokeWidth={edge.walked ? 1.4 : 1.2}
          />
        );
      })}
      {group.stars.map((star) => (
        <StarLink key={star.key} star={star} pathTitle={group.pathTitle} />
      ))}
    </svg>
  );
}

/** Mini glyph for the legend — mirrors the figure's drawn states. */
function LegendGlyph({ state }: { state: ModuleState }) {
  return (
    <svg viewBox="-13 -13 26 26" width={22} height={22} aria-hidden="true">
      <StarGlyph state={state} />
    </svg>
  );
}

const LEGEND_STATES: readonly ModuleState[] = [
  "preparation",
  "available",
  "in_progress",
  "walked",
];

/**
 * Textual legend + full textual alternative. The <details> keeps the
 * mirrored links out of the tab order while closed, and guarantees the
 * constellation is never the only way to reach the modules.
 */
export function ConstellationLegendAndAlt({
  groups,
}: {
  groups: readonly ConstellationGroup[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          {CONSTELLATION_LEGEND_TITLE}
        </span>
        {LEGEND_STATES.map((state) => (
          <span key={state} className="flex items-center gap-1.5">
            <LegendGlyph state={state} />
            <span className="text-xs text-muted">{STAR_STATE_LABEL[state]}</span>
          </span>
        ))}
      </div>

      <details className="group">
        <summary className="flex min-h-11 w-fit cursor-pointer items-center text-xs font-medium text-muted underline decoration-border underline-offset-4 transition-colors duration-200 hover:text-foreground">
          {CONSTELLATION_TEXT_TOGGLE}
        </summary>
        <div className="mt-3 flex flex-col gap-4 rounded-xl border border-border bg-surface-elevated/50 p-5">
          {groups.map((group) => (
            <div key={group.pathSlug} className="flex flex-col gap-2">
              <Link
                href={group.pathHref}
                className="flex min-h-11 w-fit items-center text-sm font-semibold text-foreground transition-colors duration-200 hover:text-accent"
              >
                {group.pathTitle}
              </Link>
              <ul className="flex flex-col gap-2">
                {group.stars.map((star) => (
                  <li key={star.key}>
                    <a
                      href={star.href}
                      className="flex min-h-11 items-center text-sm text-muted transition-colors duration-200 hover:text-foreground"
                    >
                      {star.title}
                      <span className="text-muted/70">
                        {" "}
                        —{" "}
                        {star.pending
                          ? STAR_PENDING_LABEL
                          : STAR_STATE_LABEL[star.state]}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

/**
 * One path's block: title (link to the path — skipped on its own page),
 * skip link that surfaces on focus, the figure itself, and a textual
 * loading note while any eligible star withholds its state.
 */
function ConstellationBlock({
  entry,
  showTitle,
}: {
  entry: ConstellationEntry;
  showTitle: boolean;
}) {
  const { group, wide } = entry;
  const sentinelId = `constellation-end-${group.pathSlug}`;

  return (
    <div className="flex flex-col gap-2.5">
      {showTitle && (
        <Link
          href={group.pathHref}
          className="w-fit text-xs font-semibold uppercase tracking-[0.12em] text-accent transition-colors duration-200 hover:text-primary-soft"
        >
          {group.pathTitle}
        </Link>
      )}
      <a
        href={`#${sentinelId}`}
        className="sr-only rounded-lg bg-surface-elevated px-3 py-2 text-xs font-medium text-foreground focus:not-sr-only focus:w-fit"
      >
        {CONSTELLATION_SKIP_LABEL} — {group.pathTitle}
      </a>
      {wide ? (
        <>
          <ConstellationFigureView
            group={wide}
            className="mx-auto hidden h-auto w-full max-w-md sm:block"
          />
          <ConstellationFigureView
            group={group}
            className="mx-auto h-auto w-full max-w-64 sm:hidden"
          />
        </>
      ) : (
        <ConstellationFigureView
          group={group}
          className="mx-auto h-auto w-full max-w-64"
        />
      )}
      <div id={sentinelId} tabIndex={-1} className="outline-none" />
      {group.hasPending && (
        <p className="text-xs italic text-muted" aria-live="polite">
          {CONSTELLATION_LOADING_NOTE}
        </p>
      )}
    </div>
  );
}

/**
 * The constellation block: one SVG figure per learning path (stacked on
 * narrow screens, side by side when there is room), plus legend and the
 * textual alternative. Pure view — the identity-aware wrapper is below.
 */
export function LearningConstellationView({
  entries,
}: {
  entries: readonly ConstellationEntry[];
}) {
  if (entries.every((entry) => entry.group.stars.length === 0)) return null;

  const single = entries.length === 1;
  const forming = entries.every((entry) => allInPreparation(entry.group));

  return (
    <div className="flex flex-col gap-5">
      <div className={single ? "flex flex-col" : "grid gap-6 sm:grid-cols-2"}>
        {entries.map((entry) => (
          <ConstellationBlock
            key={entry.group.pathSlug}
            entry={entry}
            showTitle={!single}
          />
        ))}
      </div>
      {forming && (
        <p className="text-xs leading-relaxed text-muted">
          {CONSTELLATION_EMPTY_NOTE}
        </p>
      )}
      <ConstellationLegendAndAlt
        groups={entries.map((entry) => entry.group)}
      />
    </div>
  );
}

/**
 * Identity-aware wrapper: one shared progress read via the page's
 * AtlasProgressProvider (no new auth subscriptions), then a pure
 * projection of the catalog — the figure is deterministic given the
 * same inputs. A single-path page also projects a wider six-per-row
 * silhouette for desktop, where the panel has room for it.
 */
export function LearningConstellation({
  paths,
}: {
  paths: readonly LearningPath[];
}) {
  const { completed, loading } = useAtlasProgress();
  const single = paths.length === 1;
  const entries: ConstellationEntry[] = paths.map((path) => ({
    group: projectConstellation(path, completed, loading),
    wide: single
      ? projectConstellation(
          path,
          completed,
          loading,
          CONSTELLATION_WIDE_CAPACITY,
        )
      : undefined,
  }));
  return <LearningConstellationView entries={entries} />;
}
