import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getLessonUrl } from "@/data/learning-paths";
import {
  lessonCatalog,
  type LessonCatalogEntry,
  type LessonReview,
} from "@/data/lesson-catalog";
import type { LessonContent } from "@/data/lesson-content";
import { getPathProgress, getResumeLesson } from "@/lib/progression";
import { lessonKey } from "@/lib/progress";

import { lessonCompletionVisible } from "./lesson-completion-badge";
import { lessonChipState, ModuleLessonChip } from "./module-lesson-chip";
import { PathProgressLineView } from "./path-progress-line";
import { ResumeCtaView } from "./resume-cta";

/**
 * Synthetic entries pushed by these tests are appended to the catalog and
 * rolled back after each test, so the live catalog is never mutated.
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

/** A catalog entry that satisfies every publication gate. */
function publishableEntry(key: string): LessonCatalogEntry {
  return {
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
}

describe("ModuleLessonChip", () => {
  // Synthetic key: the tests must not depend on the real catalog's
  // current eligibility state.
  const href = getLessonUrl("sintetico", "mod", "aula");
  const key = lessonKey("sintetico", "mod", "aula");

  it("links to the lesson page", () => {
    const html = renderToStaticMarkup(
      <ModuleLessonChip
        href={href}
        title="Letra A"
        status="available"
        lessonKey={key}
      />,
    );
    expect(html).toContain(`href="${href}"`);
    expect(html).toContain("Letra A");
  });

  it("marks planned lessons as in preparation in text and style", () => {
    const html = renderToStaticMarkup(
      <ModuleLessonChip
        href={href}
        title="Letra A"
        status="planned"
        lessonKey={key}
      />,
    );
    expect(html).toContain("(em preparação)");
    expect(html).toContain("border-dashed");
  });

  it("marks an 'available' lesson without publishable content as in preparation", () => {
    // The link stays informational — the lesson page explains the state —
    // but the chip must not look actionable without a completable lesson.
    const html = renderToStaticMarkup(
      <ModuleLessonChip
        href={href}
        title="Letra A"
        status="available"
        lessonKey={key}
      />,
    );
    expect(html).toContain("(em preparação)");
    expect(html).toContain("border-dashed");
  });

  it("renders a completable lesson as actionable", () => {
    lessonCatalog.push(publishableEntry(key));
    const html = renderToStaticMarkup(
      <ModuleLessonChip
        href={href}
        title="Letra A"
        status="available"
        lessonKey={key}
      />,
    );
    expect(html).not.toContain("(em preparação)");
    expect(html).not.toContain("border-dashed");
  });

  it("renders no completion check on the server (store is client-only)", () => {
    const html = renderToStaticMarkup(
      <ModuleLessonChip
        href={href}
        title="Letra A"
        status="available"
        lessonKey={key}
      />,
    );
    expect(html).not.toContain("(concluída)");
  });
});

describe("PathProgressLineView", () => {
  it("renders nothing when the path has no available lessons", () => {
    const path = {
      slug: "p",
      title: "p",
      summary: "",
      goal: "",
      icon: "alphabet" as const,
      contentNote: "",
      modules: [
        {
          slug: "m",
          title: "",
          description: "",
          lessons: [
            { slug: "l", title: "l", status: "planned" as const, objective: "" },
          ],
        },
      ],
    };
    const html = renderToStaticMarkup(
      <PathProgressLineView
        progress={getPathProgress(path, new Set())}
      />,
    );
    expect(html).toBe("");
  });

  it("shows completed-over-available without a misleading total", () => {
    const path = {
      slug: "p",
      title: "p",
      summary: "",
      goal: "",
      icon: "alphabet" as const,
      contentNote: "",
      modules: [
        {
          slug: "m",
          title: "",
          description: "",
          lessons: [
            { slug: "a", title: "a", status: "available" as const, objective: "" },
            { slug: "b", title: "b", status: "available" as const, objective: "" },
            { slug: "c", title: "c", status: "planned" as const, objective: "" },
          ],
        },
      ],
    };
    lessonCatalog.push(publishableEntry("p/m/a"), publishableEntry("p/m/b"));
    const completed = new Set([lessonKey("p", "m", "a")]);
    const html = renderToStaticMarkup(
      <PathProgressLineView progress={getPathProgress(path, completed)} />,
    );
    expect(html).toContain("1 de 2 atividades publicadas percorridas");
    expect(html).not.toContain("de 3");
  });
});

describe("ResumeCtaView", () => {
  it("offers the honest starting link when nothing is published", () => {
    const html = renderToStaticMarkup(
      <ResumeCtaView
        resume={undefined}
        availableCount={0}
        hasProgress={false}
        firstPathSlug="alfabeto"
      />,
    );
    expect(html).toContain('href="/trilhas/alfabeto"');
    expect(html).not.toContain("Experimentar o Sinaliza");
    expect(html).toContain("Ver alfabeto manual");
    expect(html).toContain("Nenhuma lição publicada ainda");
    expect(html).toContain("não registra progresso");
  });

  const pathWithLesson = {
    slug: "alfabeto",
    title: "Alfabeto",
    summary: "",
    goal: "",
    icon: "alphabet" as const,
    contentNote: "",
    modules: [
      {
        slug: "m",
        title: "",
        description: "",
        lessons: [
          {
            slug: "letra-a",
            title: "Letra A",
            status: "available" as const,
            objective: "",
          },
        ],
      },
    ],
  };

  it("says 'Começar' when the learner has no progress yet", () => {
    lessonCatalog.push(publishableEntry("alfabeto/m/letra-a"));
    const resume = getResumeLesson([pathWithLesson], new Set());
    const html = renderToStaticMarkup(
      <ResumeCtaView
        resume={resume}
        availableCount={1}
        hasProgress={false}
        firstPathSlug="alfabeto"
      />,
    );
    expect(html).toContain('href="/trilhas/alfabeto/m/letra-a"');
    expect(html).toContain("Começar:");
    expect(html).not.toContain("Continuar:");
    expect(html).toContain("Letra A");
  });

  it("says 'Continuar' once the learner has completed a lesson", () => {
    lessonCatalog.push(publishableEntry("alfabeto/m/letra-a"));
    const resume = getResumeLesson(
      [pathWithLesson],
      new Set([lessonKey("alfabeto", "m", "letra-b")]),
    );
    const html = renderToStaticMarkup(
      <ResumeCtaView
        resume={resume}
        availableCount={1}
        hasProgress={true}
        firstPathSlug="alfabeto"
      />,
    );
    expect(html).toContain("Continuar:");
    expect(html).toContain("Letra A");
  });

  it("shows the all-caught-up state when every available lesson is done", () => {
    const html = renderToStaticMarkup(
      <ResumeCtaView
        resume={undefined}
        availableCount={2}
        hasProgress={true}
        firstPathSlug="alfabeto"
      />,
    );
    expect(html).toContain("concluiu todas as lições disponíveis");
    expect(html).toContain('href="/trilhas"');
  });
});

describe("eligibility-precedes-completion rule", () => {
  // Same rule for the module chip and the individual completion badge:
  // stored completions are never erased, only hidden while the lesson is
  // not completable. Pure predicates — the record itself is untouched.
  it("eligible and not completed: actionable chip, no badge", () => {
    expect(lessonChipState(true, false)).toBe("actionable");
    expect(lessonCompletionVisible(true, false)).toBe(false);
  });

  it("eligible and completed: completed chip and visible badge", () => {
    expect(lessonChipState(true, true)).toBe("completed");
    expect(lessonCompletionVisible(true, true)).toBe(true);
  });

  it("planned lesson with an old completion: preparation prevails", () => {
    expect(lessonChipState(false, true)).toBe("pending");
    expect(lessonCompletionVisible(false, true)).toBe(false);
  });

  it("available-but-not-publishable with an old completion: preparation prevails", () => {
    // Same branch as planned — non-completable means no "done" affordance
    // regardless of why eligibility is missing.
    expect(lessonChipState(false, true)).toBe("pending");
    expect(lessonCompletionVisible(false, true)).toBe(false);
  });

  it("an eligibility change hides, never erases, the stored completion", () => {
    const completions = new Set(["p/m/a"]);
    const before = lessonChipState(true, completions.has("p/m/a"));
    const during = lessonChipState(false, completions.has("p/m/a"));
    const after = lessonChipState(true, completions.has("p/m/a"));
    expect(before).toBe("completed");
    expect(during).toBe("pending");
    expect(after).toBe("completed");
    expect(completions.has("p/m/a")).toBe(true);
  });

  it("stays coherent with aggregated progress: ineligible keys never count", () => {
    const path = {
      slug: "p",
      title: "p",
      summary: "",
      goal: "",
      icon: "alphabet" as const,
      contentNote: "",
      modules: [
        {
          slug: "m",
          title: "",
          description: "",
          lessons: [
            { slug: "a", title: "a", status: "planned" as const, objective: "" },
          ],
        },
      ],
    };
    // Old completion of a now-ineligible lesson: hidden in chip/badge and
    // excluded from the aggregate denominator/numerator alike.
    const completed = new Set([lessonKey("p", "m", "a")]);
    expect(lessonChipState(false, completed.has("p/m/a"))).toBe("pending");
    expect(lessonCompletionVisible(false, true)).toBe(false);
    const progress = getPathProgress(path, completed);
    expect(progress.completedCount).toBe(0);
    expect(progress.availableCount).toBe(0);
  });
});
