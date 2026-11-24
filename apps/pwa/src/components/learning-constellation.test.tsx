import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { LearningPath } from "@/data/learning-paths";
import { getLearningPaths } from "@/data/learning-paths";
import { projectConstellation } from "@/lib/constellation";

import {
  CONSTELLATION_EMPTY_NOTE,
  CONSTELLATION_TEXT_TOGGLE,
  ConstellationLegendAndAlt,
  LearningConstellationView,
} from "./learning-constellation";

function realGroups(loading = false) {
  return getLearningPaths().map((path) =>
    projectConstellation(path, new Set(), loading),
  );
}

function syntheticPath(): LearningPath {
  return {
    slug: "trilha-teste",
    title: "Trilha teste",
    summary: "",
    goal: "",
    icon: "alphabet",
    contentNote: "",
    modules: [
      { slug: "mod-um", title: "Módulo um", description: "", lessons: [] },
      { slug: "mod-dois", title: "Módulo dois", description: "", lessons: [] },
    ],
  };
}

describe("LearningConstellationView", () => {
  it("renders one accessible link per module with trail + state in the name", () => {
    const html = renderToStaticMarkup(
      <LearningConstellationView groups={realGroups()} />,
    );
    expect(html.match(/<a /g)?.length ?? 0).toBeGreaterThanOrEqual(12 + 2);
    expect(html).toContain("/trilhas/alfabeto#primeiros-passos");
    expect(html).toContain("aria-label");
    expect(html).toContain("em preparação");
  });

  it("draws every star in preparation on the real catalog and shows the honest note", () => {
    const html = renderToStaticMarkup(
      <LearningConstellationView groups={realGroups()} />,
    );
    expect(html).toContain('stroke-dasharray="2.5 3"');
    expect(html).toContain(CONSTELLATION_EMPTY_NOTE);
  });

  it("marks eligible stars as pending during loading, never preparation", () => {
    const base = projectConstellation(syntheticPath(), new Set(), true);
    const groups = [
      {
        ...base,
        stars: base.stars.map((star) => ({
          ...star,
          state: "available" as const,
          pending: true,
        })),
      },
    ];
    const html = renderToStaticMarkup(
      <LearningConstellationView groups={groups} />,
    );
    expect(html).toContain("carregando progresso");
  });

  it("keeps the textual legend and a full textual alternative behind details", () => {
    const html = renderToStaticMarkup(
      <LearningConstellationView groups={realGroups()} />,
    );
    expect(html).toContain(CONSTELLATION_TEXT_TOGGLE);
    expect(html).toContain("<details");
    expect(html).toContain("<summary");
  });

  it("renders nothing when every group is empty", () => {
    const empty: LearningPath = { ...syntheticPath(), modules: [] };
    const html = renderToStaticMarkup(
      <LearningConstellationView
        groups={[projectConstellation(empty, new Set(), false)]}
      />,
    );
    expect(html).toBe("");
  });
});

describe("ConstellationLegendAndAlt", () => {
  it("lists all four states with text labels", () => {
    const html = renderToStaticMarkup(
      <ConstellationLegendAndAlt groups={realGroups()} />,
    );
    for (const label of [
      "em preparação",
      "disponível",
      "em andamento",
      "percorrida",
    ]) {
      expect(html).toContain(label);
    }
  });
});
