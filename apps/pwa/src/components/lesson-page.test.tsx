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
  it("renders the availability state", () => {
    expect(renderToStaticMarkup(<LessonStatusBadge status="planned" />)).toContain(
      "Em breve",
    );
    expect(
      renderToStaticMarkup(<LessonStatusBadge status="available" />),
    ).toContain("Disponível");
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
      <LessonContentArea
        status="available"
        lessonKey={TEST_LESSON_KEY}
        content={testContent}
      />,
    );
    expect(html).toContain("Passo único");
    expect(html).toContain("Passo 1 de 1");
  });

  it("renders the lesson introduction before the first block", () => {
    lessonCatalog.push(publishableEntry());
    const html = renderToStaticMarkup(
      <LessonContentArea
        status="available"
        lessonKey={TEST_LESSON_KEY}
        content={testContent}
      />,
    );
    expect(html).toContain("Introdução da lição.");
    // The intro is a lead-in, not a step: one block still means step 1 of 1.
    expect(html).toContain("Passo 1 de 1");
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
        content={testContent}
      />,
    );
    expectUnavailableFallback(html);
  });

  it("blocks content when no lesson key reaches the area", () => {
    const html = renderToStaticMarkup(
      <LessonContentArea status="available" content={testContent} />,
    );
    expectUnavailableFallback(html);
  });

  it("blocks content whose catalog entry is still a draft", () => {
    lessonCatalog.push(makeCatalogEntry({ draft: testContent }));
    const html = renderToStaticMarkup(
      <LessonContentArea
        status="available"
        lessonKey={TEST_LESSON_KEY}
        content={testContent}
      />,
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
      <LessonContentArea
        status="available"
        lessonKey={TEST_LESSON_KEY}
        content={testContent}
      />,
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
      <LessonContentArea
        status="available"
        lessonKey={TEST_LESSON_KEY}
        content={testContent}
      />,
    );
    expectUnavailableFallback(html);
  });

  it("renders and can record progress for a fully validated lesson", () => {
    lessonCatalog.push(publishableEntry());
    const html = renderToStaticMarkup(
      <LessonContentArea
        status="available"
        lessonKey={TEST_LESSON_KEY}
        content={testContent}
      />,
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
    expect(html).toContain("Lição anterior");
    expect(html).toContain("Próxima lição");
  });

  it("renders no previous link on the first lesson and no next link on the last", () => {
    const first = getLessonContext(
      "alfabeto",
      "primeiros-passos",
      "libras-e-uma-lingua",
    )!;
    const firstHtml = renderToStaticMarkup(<LessonPager context={first} />);
    expect(firstHtml).not.toContain("Lição anterior");
    expect(firstHtml).toContain("/trilhas/alfabeto/primeiros-passos/o-que-e");

    const last = getLessonContext("alfabeto", "letras-u-z", "letra-z")!;
    const lastHtml = renderToStaticMarkup(<LessonPager context={last} />);
    expect(lastHtml).not.toContain("Próxima lição");
    expect(lastHtml).toContain("/trilhas/alfabeto/letras-u-z/letra-y");
  });
});
