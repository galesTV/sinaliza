import { describe, expect, it } from "vitest";

import { parseLessonKey } from "@/lib/progress";

import {
  getCatalogEntry,
  getCatalogEntryById,
  getLessonDraft,
  getLessonDraftUrl,
  isPublishable,
  lessonCatalog,
  validateCatalogEntry,
  VALIDATION_STATUS_ORDER,
  type LessonCatalogEntry,
} from "./lesson-catalog";
import { lessonContents } from "./lesson-content";
import { getLessonContext } from "./learning-paths";

function makeEntry(
  overrides: Partial<LessonCatalogEntry> = {},
): LessonCatalogEntry {
  return {
    id: "teste",
    lessonKey: "alfabeto/primeiros-passos/o-que-e",
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
    reviews: [],
    ...overrides,
  };
}

describe("lessonCatalog", () => {
  it("registers every entry as well-formed and traceable", () => {
    for (const entry of lessonCatalog) {
      expect(validateCatalogEntry(entry), entry.id).toEqual([]);
    }
  });

  it("has unique ids and lesson keys", () => {
    const ids = lessonCatalog.map((entry) => entry.id);
    const keys = lessonCatalog.map((entry) => entry.lessonKey);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("points every key at a real, existing lesson", () => {
    for (const entry of lessonCatalog) {
      const parsed = parseLessonKey(entry.lessonKey);
      expect(parsed, entry.lessonKey).not.toBeNull();
      expect(
        getLessonContext(
          parsed!.pathSlug,
          parsed!.moduleSlug,
          parsed!.lessonSlug,
        ),
        entry.lessonKey,
      ).toBeDefined();
    }
  });

  it("registers the two foundational concept lessons as drafts", () => {
    const lingua = getCatalogEntry(
      "alfabeto/primeiros-passos/libras-e-uma-lingua",
    );
    const datilologia = getCatalogEntry("alfabeto/primeiros-passos/o-que-e");
    expect(lingua?.draft).toBeDefined();
    expect(datilologia?.draft).toBeDefined();
    for (const entry of [lingua, datilologia]) {
      expect(entry?.validationStatus).toBe("draft");
      expect(isPublishable(entry!)).toBe(false);
    }
  });
});

describe("publication safety", () => {
  it("keeps provisional content out of the published registry", () => {
    // Nothing in lessonContents may be backed by an unvalidated entry, and
    // no unvalidated entry may point at an already-published lesson.
    for (const entry of lessonCatalog) {
      const published = lessonContents[entry.lessonKey];
      if (published) {
        expect(
          entry.validationStatus,
          `"${entry.lessonKey}" is published but its catalog entry is "${entry.validationStatus}"`,
        ).toBe("expert-validated");
      }
      if (entry.draft && entry.validationStatus !== "expert-validated") {
        expect(
          lessonContents[entry.lessonKey],
          `provisional draft "${entry.lessonKey}" leaked into lessonContents`,
        ).toBeUndefined();
      }
    }
  });

  it("marks non-validated statuses as not publishable", () => {
    for (const status of VALIDATION_STATUS_ORDER) {
      const entry = makeEntry({ validationStatus: status });
      expect(isPublishable(entry)).toBe(status === "expert-validated");
    }
  });
});

describe("validateCatalogEntry", () => {
  it("rejects expert-validated without an expert review on record", () => {
    const problems = validateCatalogEntry(
      makeEntry({ validationStatus: "expert-validated" }),
    );
    expect(problems.join()).toContain("expert-validated");
  });

  it("accepts expert-validated when the expert review is recorded", () => {
    const problems = validateCatalogEntry(
      makeEntry({
        validationStatus: "expert-validated",
        reviews: [
          {
            reviewer: "Especialista em Libras",
            type: "expert",
            date: "2026-11-18",
            version: "draft-1",
          },
        ],
      }),
    );
    expect(problems).toEqual([]);
  });

  it("rejects intermediate statuses without the matching review", () => {
    expect(
      validateCatalogEntry(
        makeEntry({ validationStatus: "research-reviewed" }),
      ).join(),
    ).toContain("research");
    expect(
      validateCatalogEntry(
        makeEntry({
          validationStatus: "technical-reviewed",
          reviews: [
            {
              reviewer: "Pesquisador",
              type: "research",
              date: "2026-11-18",
              version: "draft-1",
            },
          ],
        }),
      ).join(),
    ).toContain("technical");
  });

  it("flags malformed keys, references and reviews", () => {
    const problems = validateCatalogEntry(
      makeEntry({
        lessonKey: "chave-invalida",
        references: [
          {
            institution: "",
            url: "nao-e-url",
            purpose: "",
            consultedAt: "18/11/2026",
          },
        ],
        reviews: [{ reviewer: "", type: "expert", date: "hoje", version: "" }],
      }),
    );
    expect(problems.join()).toContain("malformed lessonKey");
    expect(problems.join()).toContain("missing institution");
    expect(problems.join()).toContain("not http(s)");
    expect(problems.join()).toContain("missing purpose");
    expect(problems.join()).toContain("YYYY-MM-DD");
  });

  it("flags malformed draft content", () => {
    const problems = validateCatalogEntry(
      makeEntry({ draft: { intro: "", blocks: [] } }),
    );
    expect(problems.join()).toContain("draft:");
  });
});

describe("draft accessors", () => {
  it("resolves entries by key and id", () => {
    const entry = lessonCatalog[0];
    expect(getCatalogEntry(entry.lessonKey)).toBe(entry);
    expect(getCatalogEntryById(entry.id)).toBe(entry);
  });

  it("returns draft content only for entries that have one", () => {
    for (const entry of lessonCatalog) {
      expect(getLessonDraft(entry.lessonKey)).toBe(entry.draft);
    }
    expect(getLessonDraft("nao/existe/aqui")).toBeUndefined();
  });

  it("builds the laboratory preview route", () => {
    expect(getLessonDraftUrl("alfabeto/primeiros-passos/o-que-e")).toBe(
      "/laboratorio/licoes/alfabeto/primeiros-passos/o-que-e",
    );
  });
});
