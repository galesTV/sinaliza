import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { LearningPath } from "@/data/learning-paths";
import { getLearningPaths } from "@/data/learning-paths";
import {
  projectConstellation,
  STAR_PENDING_LABEL,
  STAR_STATE_LABEL,
} from "@/lib/constellation";

import {
  CONSTELLATION_EMPTY_NOTE,
  CONSTELLATION_LOADING_NOTE,
  CONSTELLATION_SKIP_LABEL,
  CONSTELLATION_TEXT_TOGGLE,
  ConstellationLegendAndAlt,
  LearningConstellationView,
  type ConstellationEntry,
} from "./learning-constellation";

/**
 * Every fixture below is synthetic: assertions depend only on what the
 * fixture itself contains, never on the publication state of the real
 * catalog — nothing here breaks when a real activity is published.
 */
function syntheticPath(moduleTitles: [string, string][]): LearningPath {
  return {
    slug: "trilha-teste",
    title: "Trilha teste",
    summary: "",
    goal: "",
    icon: "alphabet",
    contentNote: "",
    modules: moduleTitles.map(([slug, title]) => ({
      slug,
      title,
      description: "",
      lessons: [],
    })),
  };
}

function entry(
  moduleTitles: [string, string][],
  {
    loading = false,
    wide = false,
    slug = "trilha-teste",
  }: { loading?: boolean; wide?: boolean; slug?: string } = {},
): ConstellationEntry {
  const path = { ...syntheticPath(moduleTitles), slug };
  const group = projectConstellation(path, new Set(), loading);
  // Empty-lesson modules are never completable → simulate states the
  // projection would derive for a published fixture by overriding only
  // presentation fields.
  const stars = group.stars.map((star, i) => ({
    ...star,
    state: (["walked", "in_progress", "available", "preparation"][i % 4] ??
      "preparation") as typeof star.state,
    pending: loading && i === 1,
  }));
  const patched = {
    ...group,
    stars,
    hasPending: stars.some((s) => s.pending),
  };
  return {
    group: patched,
    wide: wide
      ? projectConstellation(path, new Set(), loading, 6)
      : undefined,
  };
}

const THREE: [string, string][] = [
  ["m-um", "Módulo um"],
  ["m-dois", "Módulo dois"],
  ["m-tres", "Módulo três"],
];

describe("LearningConstellationView", () => {
  it("renders one accessible link per module — count follows the fixture", () => {
    const html = renderToStaticMarkup(
      <LearningConstellationView entries={[entry(THREE)]} />,
    );
    // Each module renders exactly two anchor links: one star in the
    // figure plus its mirror in the textual alternative.
    const starLinks = html.match(/<a href="\/trilhas\/trilha-teste#m-/g) ?? [];
    expect(starLinks.length).toBe(THREE.length * 2);
    expect(html).toContain("/trilhas/trilha-teste#m-um");
    expect(html).toContain("aria-label");
  });

  it("shows the honest note only when every star is in preparation", () => {
    const allPlanned: ConstellationEntry = {
      group: projectConstellation(
        syntheticPath(THREE),
        new Set(),
        false,
      ),
    };
    const plannedHtml = renderToStaticMarkup(
      <LearningConstellationView entries={[allPlanned]} />,
    );
    expect(plannedHtml).toContain(CONSTELLATION_EMPTY_NOTE);

    const mixedHtml = renderToStaticMarkup(
      <LearningConstellationView entries={[entry(THREE)]} />,
    );
    expect(mixedHtml).not.toContain(CONSTELLATION_EMPTY_NOTE);
  });

  it("shows a loading note when a star is pending, and never otherwise", () => {
    const loading = renderToStaticMarkup(
      <LearningConstellationView entries={[entry(THREE, { loading: true })]} />,
    );
    expect(loading).toContain(CONSTELLATION_LOADING_NOTE);
    expect(loading).toContain(STAR_PENDING_LABEL);

    const settled = renderToStaticMarkup(
      <LearningConstellationView entries={[entry(THREE)]} />,
    );
    expect(settled).not.toContain(CONSTELLATION_LOADING_NOTE);
  });

  it("renders a skip link per group pointing at a focusable sentinel", () => {
    const html = renderToStaticMarkup(
      <LearningConstellationView entries={[entry(THREE)]} />,
    );
    expect(html).toContain(CONSTELLATION_SKIP_LABEL);
    expect(html).toContain('href="#constellation-end-trilha-teste"');
    expect(html).toContain('id="constellation-end-trilha-teste"');
    expect(html).toContain('tabindex="-1"');
  });

  it("suppresses the rectangular outline on SVG links only", () => {
    const html = renderToStaticMarkup(
      <LearningConstellationView entries={[entry(THREE)]} />,
    );
    expect(html).toContain("focus-visible:outline-hidden");
  });

  it("hides the path title link on a single-path page (wide layout present)", () => {
    const html = renderToStaticMarkup(
      <LearningConstellationView entries={[entry(THREE, { wide: true })]} />,
    );
    // Single group → no redundant self-link title; wide figure on sm+.
    expect(html).not.toContain('uppercase tracking-[0.12em] text-accent');
    expect(html).toContain("sm:block");
    expect(html).toContain("sm:hidden");
  });

  it("shows path titles when several constellations are displayed", () => {
    const html = renderToStaticMarkup(
      <LearningConstellationView
        entries={[entry(THREE), entry(THREE, { slug: "outra" })]}
      />,
    );
    expect(html).toContain("grid gap-6 sm:grid-cols-2");
  });

  it("keeps the textual legend and a full textual alternative behind details", () => {
    const html = renderToStaticMarkup(
      <LearningConstellationView entries={[entry(THREE)]} />,
    );
    expect(html).toContain(CONSTELLATION_TEXT_TOGGLE);
    expect(html).toContain("<details");
    expect(html).toContain("<summary");
  });

  it("renders nothing when every group is empty", () => {
    const empty: ConstellationEntry = {
      group: projectConstellation(
        { ...syntheticPath([]), modules: [] },
        new Set(),
        false,
      ),
    };
    const html = renderToStaticMarkup(
      <LearningConstellationView entries={[empty]} />,
    );
    expect(html).toBe("");
  });
});

describe("ConstellationLegendAndAlt", () => {
  it("lists all four states with text labels", () => {
    const html = renderToStaticMarkup(
      <ConstellationLegendAndAlt groups={[entry(THREE).group]} />,
    );
    for (const label of Object.values(STAR_STATE_LABEL)) {
      expect(html).toContain(label);
    }
  });
});

describe("catalog invariants", () => {
  it("real paths render one link per module — never a fixed count", () => {
    const entries = getLearningPaths().map((path) => ({
      group: projectConstellation(path, new Set(), false),
    }));
    const html = renderToStaticMarkup(
      <LearningConstellationView entries={entries} />,
    );
    for (const path of getLearningPaths()) {
      const links =
        html.match(new RegExp(`<a href="/trilhas/${path.slug}#`, "g")) ?? [];
      // figure link + textual-alternative mirror per module.
      expect(links.length).toBe(path.modules.length * 2);
    }
  });
});
