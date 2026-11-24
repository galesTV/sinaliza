import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  lessonCatalog,
  type LessonCatalogEntry,
  type LessonReview,
} from "@/data/lesson-catalog";
import type { LessonContent } from "@/data/lesson-content";
import { getLessonContext } from "@/data/learning-paths";

import DraftPreviewPage from "../app/laboratorio/licoes/[...key]/page";
import {
  LessonContentArea,
  LessonStatusBadge,
} from "./lesson-availability";
import { LessonPager } from "./lesson-pager";
import { LessonRunner } from "./lesson-runner";

/**
 * Catalog fixtures pushed for the duration of a test. `lessonCatalog` is a
 * mutable registry: each test snapshots its length and `afterEach` truncates
 * back, restoring the original state even when a test fails midway.
 */
let catalogLength = lessonCatalog.length;
beforeEach(() => {
  catalogLength = lessonCatalog.length;
});
afterEach(() => {
  lessonCatalog.length = catalogLength;
});

const TEST_LESSON_KEY = "trilha/modulo/licao";

const testContent: LessonContent = {
  intro: "Introdução da lição.",
  blocks: [{ kind: "text", heading: "Passo único", body: "texto" }],
};

function makeCatalogEntry(
  overrides: Partial<LessonCatalogEntry> = {},
): LessonCatalogEntry {
  return {
    id: "teste-runtime-guard",
    lessonKey: TEST_LESSON_KEY,
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
    validationStatus: "draft",
    version: "draft-1",
    reviews: [],
    ...overrides,
  };
}

function makeReview(
  type: LessonReview["type"],
  overrides: Partial<LessonReview> = {},
): LessonReview {
  return {
    reviewer: `Revisor ${type}`,
    type,
    date: "2026-11-18",
    version: "draft-1",
    ...overrides,
  };
}

const FULL_REVIEW_CHAIN: LessonReview[] = [
  makeReview("research"),
  makeReview("technical"),
  makeReview("expert"),
];

function publishableEntry(
  overrides: Partial<LessonCatalogEntry> = {},
): LessonCatalogEntry {
  return makeCatalogEntry({
    validationStatus: "expert-validated",
    reviews: [...FULL_REVIEW_CHAIN],
    draft: testContent,
    ...overrides,
  });
}

/** The honest fallback means no runner mounted: the content is absent and
 * `lessonKey` never reaches a component that could record progress. */
function expectUnavailableFallback(html: string) {
  expect(html).toContain("Conteúdo indisponível no momento");
  expect(html).toContain("Nenhum progresso é registrado");
  expect(html).not.toContain("Passo único");
  expect(html).not.toContain("Passo 1 de");
}

/** Finds the first element of a given component type in a rendered tree. */
function findElement(node: ReactNode, type: unknown): ReactElement | null {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findElement(child, type);
      if (found) return found;
    }
    return null;
  }
  if (!isValidElement(node)) return null;
  if (node.type === type) return node;
  const children = (node.props as { children?: ReactNode }).children;
  return findElement(children, type);
}

describe("LessonStatusBadge", () => {
  it("renders 'Em breve' for planned lessons", () => {
    expect(
      renderToStaticMarkup(
        <LessonStatusBadge status="planned" lessonKey={TEST_LESSON_KEY} />,
      ),
    ).toContain("Em breve");
  });

  it("never shows 'Disponível' for an available lesson without a catalog entry", () => {
    // status "available" without a publishable catalog entry: the badge
    // must not promise the learnability the content area will refuse.
    const html = renderToStaticMarkup(
      <LessonStatusBadge status="available" lessonKey={TEST_LESSON_KEY} />,
    );
    expect(html).not.toContain("Disponível");
    expect(html).toContain("Em breve");
  });

  it("never shows 'Disponível' for an available lesson with a non-publishable entry", () => {
    lessonCatalog.push(makeCatalogEntry({ draft: testContent }));
    const html = renderToStaticMarkup(
      <LessonStatusBadge status="available" lessonKey={TEST_LESSON_KEY} />,
    );
    expect(html).not.toContain("Disponível");
    expect(html).toContain("Em breve");
  });

  it("shows 'Disponível' only when the lesson is completable", () => {
    lessonCatalog.push(publishableEntry());
    const html = renderToStaticMarkup(
      <LessonStatusBadge status="available" lessonKey={TEST_LESSON_KEY} />,
    );
    expect(html).toContain("Disponível");
  });
});

describe("LessonContentArea", () => {
  it("shows an honest pending panel for planned lessons", () => {
    const html = renderToStaticMarkup(<LessonContentArea status="planned" />);
    expect(html).toContain("Conteúdo em preparação");
    expect(html).toContain("validação pedagógica");
  });

  it("renders the lesson runner for a publishable catalog entry", () => {
    lessonCatalog.push(publishableEntry());
    const html = renderToStaticMarkup(
      <LessonContentArea status="available" lessonKey={TEST_LESSON_KEY} />,
    );
    expect(html).toContain("Passo único");
    expect(html).toContain("Passo 1 de 1");
  });

  it("renders the lesson introduction before the first block", () => {
    lessonCatalog.push(publishableEntry());
    const html = renderToStaticMarkup(
      <LessonContentArea status="available" lessonKey={TEST_LESSON_KEY} />,
    );
    expect(html).toContain("Introdução da lição.");
    // The intro is a lead-in, not a step: one block still means step 1 of 1.
    expect(html).toContain("Passo 1 de 1");
  });

  it("renders exactly the reviewed draft — no second content source", () => {
    // The runner receives `entry.draft` itself (object identity), so the
    // content a published lesson shows can never diverge from the version
    // the review chain covered.
    const entry = publishableEntry();
    lessonCatalog.push(entry);
    const element = LessonContentArea({
      status: "available",
      lessonKey: TEST_LESSON_KEY,
    });
    const runner = findElement(element, LessonRunner);
    expect(runner).not.toBeNull();
    expect((runner!.props as { content?: unknown }).content).toBe(
      entry.draft,
    );
    expect((runner!.props as { lessonKey?: string }).lessonKey).toBe(
      TEST_LESSON_KEY,
    );
  });

  it("shows an honest fallback for an available lesson without content", () => {
    const html = renderToStaticMarkup(<LessonContentArea status="available" />);
    expect(html).toContain("Conteúdo indisponível no momento");
    expect(html).not.toContain("Passo 1 de");
  });
});

describe("LessonContentArea publication guard", () => {
  it("blocks content for an available lesson with no catalog entry", () => {
    const html = renderToStaticMarkup(
      <LessonContentArea
        status="available"
        lessonKey="trilha/modulo/sem-catalogo"
      />,
    );
    expectUnavailableFallback(html);
  });

  it("blocks content when no lesson key reaches the area", () => {
    const html = renderToStaticMarkup(
      <LessonContentArea status="available" />,
    );
    expectUnavailableFallback(html);
  });

  it("blocks content whose catalog entry is still a draft", () => {
    lessonCatalog.push(makeCatalogEntry({ draft: testContent }));
    const html = renderToStaticMarkup(
      <LessonContentArea status="available" lessonKey={TEST_LESSON_KEY} />,
    );
    expectUnavailableFallback(html);
  });

  it("blocks an expert-validated entry without valid reviews", () => {
    lessonCatalog.push(
      makeCatalogEntry({
        validationStatus: "expert-validated",
        draft: testContent,
      }),
    );
    const html = renderToStaticMarkup(
      <LessonContentArea status="available" lessonKey={TEST_LESSON_KEY} />,
    );
    expectUnavailableFallback(html);
  });

  it("blocks reviews that cover an older content version", () => {
    lessonCatalog.push(
      makeCatalogEntry({
        validationStatus: "expert-validated",
        version: "draft-2",
        reviews: [...FULL_REVIEW_CHAIN],
        draft: testContent,
      }),
    );
    const html = renderToStaticMarkup(
      <LessonContentArea status="available" lessonKey={TEST_LESSON_KEY} />,
    );
    expectUnavailableFallback(html);
  });

  it("blocks a publishable-looking entry whose draft is malformed", () => {
    lessonCatalog.push(
      publishableEntry({ draft: { intro: "", blocks: [] } }),
    );
    const html = renderToStaticMarkup(
      <LessonContentArea status="available" lessonKey={TEST_LESSON_KEY} />,
    );
    expectUnavailableFallback(html);
  });

  it("renders the runner for a fully validated lesson", () => {
    lessonCatalog.push(publishableEntry());
    const html = renderToStaticMarkup(
      <LessonContentArea status="available" lessonKey={TEST_LESSON_KEY} />,
    );
    expect(html).toContain("Passo 1 de 1");
    expect(html).toContain("Finalizar lição");
  });
});

describe("laboratory draft preview", () => {
  it("runs the draft runner without a progress key", async () => {
    const page = await DraftPreviewPage({
      params: Promise.resolve({
        key: ["alfabeto", "primeiros-passos", "libras-e-uma-lingua"],
      }),
    });
    const runner = findElement(page, LessonRunner);
    expect(runner).not.toBeNull();
    expect(
      (runner!.props as { lessonKey?: string }).lessonKey,
    ).toBeUndefined();
  });
});

describe("LessonPager", () => {
  it("links previous and next lessons in module order", () => {
    const context = getLessonContext("vocabulario", "saudacoes", "boa-tarde")!;
    const html = renderToStaticMarkup(<LessonPager context={context} />);

    expect(html).toContain("/trilhas/vocabulario/saudacoes/bom-dia");
    expect(html).toContain("/trilhas/vocabulario/saudacoes/boa-noite");
    expect(html).toContain("Conteúdo anterior do percurso");
    expect(html).toContain("Próximo conteúdo do percurso");
  });

  it("labels non-completable destinations as 'Em preparação' instead of implying availability", () => {
    // Synthetic context: a planned destination carries the preparation
    // hint — the pager is editorial navigation, not the learning
    // recommendation — and the label must survive title truncation.
    const context = {
      path: { slug: "p", title: "P", summary: "", goal: "", icon: "alphabet" as const, contentNote: "", modules: [] },
      module: { slug: "m", title: "M", description: "", lessons: [] },
      lesson: { slug: "l", title: "L", status: "available" as const, objective: "" },
      position: 1,
      lessonCount: 3,
      previous: undefined,
      next: {
        slug: "titulo-bastante-longo-que-trunca-em-telas-pequenas",
        title: "Título bastante longo que trunca em telas pequenas",
        status: "planned" as const,
        objective: "",
      },
    };
    const html = renderToStaticMarkup(<LessonPager context={context} />);
    expect(html).toContain("Próximo conteúdo do percurso");
    expect(html).toContain("Em preparação");
    expect(html).toContain('class="truncate"');
    expect(html).toContain("whitespace-nowrap");
  });

  it("renders completable destinations without the preparation hint", () => {
    lessonCatalog.push(publishableEntry());
    const context = {
      path: { slug: "trilha", title: "P", summary: "", goal: "", icon: "alphabet" as const, contentNote: "", modules: [] },
      module: { slug: "modulo", title: "M", description: "", lessons: [] },
      lesson: { slug: "l", title: "L", status: "available" as const, objective: "" },
      position: 1,
      lessonCount: 3,
      previous: undefined,
      next: { slug: "licao", title: "Lição", status: "available" as const, objective: "" },
    };
    const html = renderToStaticMarkup(<LessonPager context={context} />);
    expect(html).not.toContain("Em preparação");
  });

  it("renders no previous link on the first lesson and no next link on the last", () => {
    const first = getLessonContext(
      "alfabeto",
      "primeiros-passos",
      "libras-e-uma-lingua",
    )!;
    const firstHtml = renderToStaticMarkup(<LessonPager context={first} />);
    expect(firstHtml).not.toContain("Conteúdo anterior do percurso");
    expect(firstHtml).toContain("/trilhas/alfabeto/primeiros-passos/o-que-e");

    const last = getLessonContext("alfabeto", "letras-u-z", "letra-z")!;
    const lastHtml = renderToStaticMarkup(<LessonPager context={last} />);
    expect(lastHtml).not.toContain("Próximo conteúdo do percurso");
    expect(lastHtml).toContain("/trilhas/alfabeto/letras-u-z/letra-y");
  });
});
