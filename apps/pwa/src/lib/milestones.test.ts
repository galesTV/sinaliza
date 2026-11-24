import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type {
  CourseModule,
  LearningPath,
  Lesson,
} from "@/data/learning-paths";
import { getLearningPaths } from "@/data/learning-paths";
import {
  lessonCatalog,
  type LessonCatalogEntry,
  type LessonReview,
} from "@/data/lesson-catalog";
import type { LessonContent } from "@/data/lesson-content";
import { lessonKey } from "@/lib/progress";

import { deriveMilestones, summarizeMilestones } from "./milestones";

/**
 * Synthetic catalog entries are appended before each scenario and rolled
 * back after it, so the live catalog is never mutated — the same fixture
 * pattern `progression.test.ts` uses.
 */
let catalogLength = lessonCatalog.length;
beforeEach(() => {
  catalogLength = lessonCatalog.length;
});
afterEach(() => {
  lessonCatalog.length = catalogLength;
});

const testContent: LessonContent = {
  intro: "Introdução da lição.",
  blocks: [{ kind: "text", heading: "Passo único", body: "texto" }],
};

function makeReview(type: LessonReview["type"]): LessonReview {
  return {
    reviewer: `Revisor ${type}`,
    type,
    date: "2026-11-18",
    version: "draft-1",
  };
}

function publishableEntry(key: string): void {
  const entry: LessonCatalogEntry = {
    id: `teste-${key}`,
    lessonKey: key,
    title: "Lição de teste",
    objective: "Objetivo de teste",
    references: [
      {
        institution: "Instituição de teste",
        url: "https://example.org/fonte",
        purpose: "Testar",
        consultedAt: "2026-11-18",
      },
    ],
    plannedOutline: ["passo"],
    validationStatus: "expert-validated",
    version: "draft-1",
    reviews: [
      makeReview("research"),
      makeReview("technical"),
      makeReview("expert"),
    ],
    draft: testContent,
  };
  lessonCatalog.push(entry);
}

function draftEntry(key: string): void {
  lessonCatalog.push({
    id: `teste-${key}`,
    lessonKey: key,
    title: "Lição de teste",
    objective: "Objetivo de teste",
    references: [],
    plannedOutline: ["passo"],
    validationStatus: "draft",
    version: "draft-1",
    reviews: [],
    draft: testContent,
  });
}

function lesson(slug: string, status: Lesson["status"] = "available"): Lesson {
  return { slug, title: `Lição ${slug}`, status, objective: "Objetivo" };
}

function makeModule(
  slug: string,
  lessons: readonly Lesson[],
): CourseModule {
  return { slug, title: `Módulo ${slug}`, description: "Desc", lessons: [...lessons] };
}

function makePath(
  slug: string,
  modules: readonly CourseModule[],
): LearningPath {
  return {
    slug,
    title: `Trilha ${slug}`,
    summary: "Resumo",
    goal: "Objetivo",
    icon: "alphabet",
    modules: [...modules],
    contentNote: "Nota",
  };
}

function keyOf(path: string, module: string, lessonSlug: string): string {
  return lessonKey(path, module, lessonSlug);
}

function byId(milestones: ReturnType<typeof deriveMilestones>, id: string) {
  const milestone = milestones.find((m) => m.id === id);
  if (!milestone) throw new Error(`missing milestone ${id}`);
  return milestone;
}

function statuses(milestones: ReturnType<typeof deriveMilestones>) {
  return milestones.map((m) => `${m.id}:${m.status}`);
}

describe("deriveMilestones", () => {
  it("marks every milestone unavailable when the catalog has no eligible lessons", () => {
    const paths = [makePath("t1", [makeModule("m1", [lesson("l1", "planned")])])];
    const milestones = deriveMilestones(paths, new Set());
    expect(milestones.every((m) => m.status === "unavailable")).toBe(true);
    expect(milestones.every((m) => m.progress === undefined)).toBe(true);
  });

  it("marks every reachable milestone available with empty progress", () => {
    const paths = [
      makePath("t1", [
        makeModule("m1", [lesson("l1"), lesson("l2"), lesson("l3")]),
        makeModule("m2", [lesson("l4"), lesson("l5"), lesson("l6")]),
      ]),
    ];
    for (const k of ["l1", "l2", "l3"]) publishableEntry(keyOf("t1", "m1", k));
    for (const k of ["l4", "l5", "l6"]) publishableEntry(keyOf("t1", "m2", k));

    const milestones = deriveMilestones(paths, new Set());
    expect(statuses(milestones)).toEqual([
      "primeiro-passo:available",
      "base:available",
      "novos-caminhos:available",
      "etapa-percorrida:available",
      "caminho-percorrido:available",
    ]);
    expect(byId(milestones, "base").progress).toEqual({ current: 0, target: 5 });
  });

  it("achieves primeiro-passo with one eligible completion", () => {
    const paths = [makePath("t1", [makeModule("m1", [lesson("l1")])])];
    publishableEntry(keyOf("t1", "m1", "l1"));
    const milestones = deriveMilestones(paths, new Set([keyOf("t1", "m1", "l1")]));
    expect(byId(milestones, "primeiro-passo").status).toBe("achieved");
  });

  it("tracks Construindo uma base across four and five completions", () => {
    const slugs = ["l1", "l2", "l3", "l4", "l5"];
    const paths = [makePath("t1", [makeModule("m1", slugs.map((s) => lesson(s)))])];
    for (const s of slugs) publishableEntry(keyOf("t1", "m1", s));
    const completed = new Set(slugs.slice(0, 4).map((s) => keyOf("t1", "m1", s)));

    let milestones = deriveMilestones(paths, completed);
    expect(byId(milestones, "base")).toMatchObject({
      status: "available",
      progress: { current: 4, target: 5 },
    });

    completed.add(keyOf("t1", "m1", "l5"));
    milestones = deriveMilestones(paths, completed);
    expect(byId(milestones, "base").status).toBe("achieved");
    expect(byId(milestones, "base").progress).toBeUndefined();
  });

  it("counts a recorded key once (the completion set deduplicates)", () => {
    const paths = [makePath("t1", [makeModule("m1", [lesson("l1")])])];
    publishableEntry(keyOf("t1", "m1", "l1"));
    // Enqueue-style duplicates collapse into the same Set key: one record.
    const completed = new Set<string>();
    completed.add(keyOf("t1", "m1", "l1"));
    completed.add(keyOf("t1", "m1", "l1"));
    const milestones = deriveMilestones(paths, completed);
    expect(byId(milestones, "base").status).toBe("unavailable");
    // The single recorded key counts once: m1/path t1 are fully walked.
    expect(summarizeMilestones(milestones)).toEqual({ reachable: 3, achieved: 3 });
  });

  it("ignores unknown completion keys", () => {
    const paths = [makePath("t1", [makeModule("m1", [lesson("l1")])])];
    publishableEntry(keyOf("t1", "m1", "l1"));
    const milestones = deriveMilestones(
      paths,
      new Set(["fantasma/mod/licao", "t1/m1/licao-inexistente"]),
    );
    expect(byId(milestones, "primeiro-passo").status).toBe("available");
  });

  it("ignores planned lessons even when their key was recorded", () => {
    const paths = [
      makePath("t1", [makeModule("m1", [lesson("l1", "planned")])]),
    ];
    // No catalog entry is published; a stale recorded key cannot count.
    const milestones = deriveMilestones(paths, new Set([keyOf("t1", "m1", "l1")]));
    expect(byId(milestones, "primeiro-passo").status).toBe("unavailable");
  });

  it("ignores available lessons whose catalog entry is not publishable", () => {
    const paths = [makePath("t1", [makeModule("m1", [lesson("l1"), lesson("l2")])])];
    draftEntry(keyOf("t1", "m1", "l1")); // entry exists but still a draft
    // l2 has no catalog entry at all.
    const completed = new Set([keyOf("t1", "m1", "l1"), keyOf("t1", "m1", "l2")]);
    const milestones = deriveMilestones(paths, completed);
    expect(byId(milestones, "primeiro-passo").status).toBe("unavailable");
  });

  it("keeps Novos caminhos pending when completions live in a single module", () => {
    const paths = [
      makePath("t1", [
        makeModule("m1", [lesson("l1"), lesson("l2")]),
        makeModule("m2", [lesson("l3")]),
      ]),
    ];
    for (const [m, s] of [["m1", "l1"], ["m1", "l2"], ["m2", "l3"]] as const) {
      publishableEntry(keyOf("t1", m, s));
    }
    const completed = new Set([keyOf("t1", "m1", "l1"), keyOf("t1", "m1", "l2")]);
    const milestone = byId(deriveMilestones(paths, completed), "novos-caminhos");
    expect(milestone).toMatchObject({
      status: "available",
      progress: { current: 1, target: 2 },
    });
  });

  it("achieves Novos caminhos with completions in two distinct modules", () => {
    const paths = [
      makePath("t1", [
        makeModule("m1", [lesson("l1")]),
        makeModule("m2", [lesson("l2")]),
      ]),
    ];
    publishableEntry(keyOf("t1", "m1", "l1"));
    publishableEntry(keyOf("t1", "m2", "l2"));
    const completed = new Set([keyOf("t1", "m1", "l1"), keyOf("t1", "m2", "l2")]);
    expect(byId(deriveMilestones(paths, completed), "novos-caminhos").status).toBe(
      "achieved",
    );
  });

  it("identifies modules by (path, module) pair, not module slug alone", () => {
    // Same module slug in two different paths must count as two modules.
    const paths = [
      makePath("t1", [makeModule("inicio", [lesson("l1")])]),
      makePath("t2", [makeModule("inicio", [lesson("l1")])]),
    ];
    publishableEntry(keyOf("t1", "inicio", "l1"));
    publishableEntry(keyOf("t2", "inicio", "l1"));
    const completed = new Set([
      keyOf("t1", "inicio", "l1"),
      keyOf("t2", "inicio", "l1"),
    ]);
    expect(byId(deriveMilestones(paths, completed), "novos-caminhos").status).toBe(
      "achieved",
    );
  });

  it("never treats a module without eligible lessons as percorrido", () => {
    const paths = [
      makePath("t1", [
        makeModule("m1", [lesson("l1", "planned")]),
        makeModule("m2", [lesson("l2")]),
      ]),
    ];
    publishableEntry(keyOf("t1", "m2", "l2"));
    const completed = new Set([keyOf("t1", "m1", "l1")]); // stale key on planned lesson
    const milestone = byId(deriveMilestones(paths, completed), "etapa-percorrida");
    expect(milestone.status).not.toBe("achieved");
  });

  it("reports closest-module progress for a partially walked module", () => {
    const paths = [
      makePath("t1", [
        makeModule("m1", [lesson("l1"), lesson("l2"), lesson("l3"), lesson("l4")]),
        makeModule("m2", [lesson("l5")]),
      ]),
    ];
    for (const s of ["l1", "l2", "l3", "l4"]) publishableEntry(keyOf("t1", "m1", s));
    publishableEntry(keyOf("t1", "m2", "l5"));
    const completed = new Set([
      keyOf("t1", "m1", "l1"),
      keyOf("t1", "m1", "l2"),
      keyOf("t1", "m1", "l3"),
      keyOf("t1", "m2", "l5"),
    ]);
    const milestone = byId(deriveMilestones(paths, completed), "etapa-percorrida");
    // m2 is fully walked -> achieved already; check a partial scenario:
    expect(milestone.status).toBe("achieved");

    const partial = new Set([keyOf("t1", "m1", "l1"), keyOf("t1", "m1", "l2")]);
    const partialMilestone = byId(
      deriveMilestones(paths, partial),
      "etapa-percorrida",
    );
    expect(partialMilestone).toMatchObject({
      status: "available",
      progress: { current: 2, target: 4 }, // o módulo mais próximo de fechar
    });
  });

  it("achieves Uma etapa percorrida only when an eligible module is fully walked", () => {
    const paths = [
      makePath("t1", [makeModule("m1", [lesson("l1"), lesson("l2")])]),
    ];
    publishableEntry(keyOf("t1", "m1", "l1"));
    publishableEntry(keyOf("t1", "m1", "l2"));
    const completed = new Set([keyOf("t1", "m1", "l1"), keyOf("t1", "m1", "l2")]);
    expect(byId(deriveMilestones(paths, completed), "etapa-percorrida").status).toBe(
      "achieved",
    );
  });

  it("never treats a path without eligible lessons as percorrido", () => {
    const paths = [
      makePath("t1", [makeModule("m1", [lesson("l1", "planned")])]),
      makePath("t2", [makeModule("m2", [lesson("l2")])]),
    ];
    publishableEntry(keyOf("t2", "m2", "l2"));
    const milestones = deriveMilestones(paths, new Set());
    expect(byId(milestones, "caminho-percorrido").status).toBe("available");
  });

  it("achieves Caminho percorrido when a path's eligible lessons are all done", () => {
    const paths = [
      makePath("t1", [makeModule("m1", [lesson("l1")])]),
      makePath("t2", [makeModule("m2", [lesson("l2"), lesson("l3")])]),
    ];
    publishableEntry(keyOf("t1", "m1", "l1"));
    publishableEntry(keyOf("t2", "m2", "l2"));
    publishableEntry(keyOf("t2", "m2", "l3"));
    const completed = new Set([keyOf("t1", "m1", "l1")]);
    const milestones = deriveMilestones(paths, completed);
    expect(byId(milestones, "caminho-percorrido").status).toBe("achieved");
    expect(byId(milestones, "caminho-percorrido").progress).toBeUndefined();
  });

  it("reacts to catalog eligibility changes (a projection, not a stored fact)", () => {
    const paths = [makePath("t1", [makeModule("m1", [lesson("l1")])])];
    const completed = new Set([keyOf("t1", "m1", "l1")]);

    // Recorded key with no published entry: nothing achieved yet.
    let milestones = deriveMilestones(paths, completed);
    expect(byId(milestones, "primeiro-passo").status).toBe("unavailable");

    // Publishing the lesson retroactively counts the recorded completion.
    publishableEntry(keyOf("t1", "m1", "l1"));
    milestones = deriveMilestones(paths, completed);
    expect(byId(milestones, "primeiro-passo").status).toBe("achieved");
  });

  it("marks milestones unreachable when the catalog cannot satisfy them", () => {
    const paths = [
      makePath("t1", [
        makeModule("m1", [lesson("l1"), lesson("l2"), lesson("l3"), lesson("l4")]),
      ]),
    ];
    for (const s of ["l1", "l2", "l3", "l4"]) publishableEntry(keyOf("t1", "m1", s));
    const milestones = deriveMilestones(paths, new Set());
    expect(byId(milestones, "base").status).toBe("unavailable"); // 4 < 5 elegíveis
    expect(byId(milestones, "novos-caminhos").status).toBe("unavailable"); // 1 módulo
    expect(byId(milestones, "etapa-percorrida").status).toBe("available");
    expect(byId(milestones, "caminho-percorrido").status).toBe("available");
  });

  it("omits progress on unavailable milestones", () => {
    const paths = [makePath("t1", [makeModule("m1", [lesson("l1")])])];
    publishableEntry(keyOf("t1", "m1", "l1"));
    const milestones = deriveMilestones(paths, new Set());
    for (const milestone of milestones) {
      if (milestone.status === "unavailable") {
        expect(milestone.progress).toBeUndefined();
      }
    }
    expect(byId(milestones, "base").status).toBe("unavailable");
    expect(byId(milestones, "base").progress).toBeUndefined();
  });

  it("keeps the milestone list in a stable order and never mutates inputs", () => {
    const paths = [
      makePath("t1", [
        makeModule("m1", [lesson("l1"), lesson("l2")]),
        makeModule("m2", [lesson("l3")]),
      ]),
    ];
    for (const [m, s] of [["m1", "l1"], ["m1", "l2"], ["m2", "l3"]] as const) {
      publishableEntry(keyOf("t1", m, s));
    }
    const completed = new Set([keyOf("t1", "m1", "l1")]);
    const pathsBefore = JSON.stringify(paths);
    const completedBefore = [...completed];

    const ids = deriveMilestones(paths, completed).map((m) => m.id);
    expect(ids).toEqual([
      "primeiro-passo",
      "base",
      "novos-caminhos",
      "etapa-percorrida",
      "caminho-percorrido",
    ]);
    expect(JSON.stringify(paths)).toBe(pathsBefore);
    expect([...completed]).toEqual(completedBefore);
  });

  it("describes participation, never proficiency or certification", () => {
    const milestones = deriveMilestones(getLearningPaths(), new Set());
    for (const { title, description } of milestones) {
      const text = `${title} ${description}`.toLowerCase();
      expect(text).not.toMatch(/dom[ií]nio|profici[eê]ncia|certifica|flu[eê]ncia/);
    }
  });

  it("derives the real initial state: the live catalog is fully planned", () => {
    const milestones = deriveMilestones(getLearningPaths(), new Set());
    expect(milestones.every((m) => m.status === "unavailable")).toBe(true);
    expect(summarizeMilestones(milestones)).toEqual({ reachable: 0, achieved: 0 });
  });
});

describe("summarizeMilestones", () => {
  it("counts only reachable milestones in the denominator", () => {
    const paths = [
      makePath("t1", [
        makeModule("m1", [lesson("l1"), lesson("l2")]),
        makeModule("m2", [lesson("l3"), lesson("l4"), lesson("l5")]),
      ]),
    ];
    for (const [m, s] of [
      ["m1", "l1"],
      ["m1", "l2"],
      ["m2", "l3"],
      ["m2", "l4"],
      ["m2", "l5"],
    ] as const) {
      publishableEntry(keyOf("t1", m, s));
    }
    // 5 eligible in 2 modules of one path: base is reachable, everything
    // is reachable here; caminho reachable (path t1 has eligible).
    const completed = new Set([keyOf("t1", "m1", "l1")]);
    const summary = summarizeMilestones(deriveMilestones(paths, completed));
    expect(summary.reachable).toBe(5); // nenhum indisponível neste cenário
    expect(summary.achieved).toBe(1); // só primeiro-passo
  });

  it("excludes unavailable milestones from the denominator entirely", () => {
    const paths = [
      makePath("t1", [makeModule("m1", [lesson("l1"), lesson("l2")])]),
    ];
    publishableEntry(keyOf("t1", "m1", "l1"));
    publishableEntry(keyOf("t1", "m1", "l2"));
    const completed = new Set([keyOf("t1", "m1", "l1"), keyOf("t1", "m1", "l2")]);
    const summary = summarizeMilestones(deriveMilestones(paths, completed));
    // base (needs 5) and novos-caminhos (needs 2 modules) are unreachable.
    expect(summary).toEqual({ reachable: 3, achieved: 3 });
  });
});
