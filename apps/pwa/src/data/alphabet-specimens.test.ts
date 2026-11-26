import { describe, expect, it } from "vitest";

import { parseLessonKey } from "@/lib/progress";

import {
  alphabetSpecimens,
  getSpecimen,
  getSpecimenByLessonKey,
  getSpecimenUrl,
  hasDisplayPermission,
  isSpecimenPublishable,
  validateSpecimen,
  type AlphabetSpecimen,
} from "./alphabet-specimens";
import { getLessonContext } from "./learning-paths";

const CANDIDATE_LETTERS = ["A", "B", "C", "I", "L"];

function makeSpecimen(
  overrides: Partial<AlphabetSpecimen> = {},
): AlphabetSpecimen {
  return {
    id: "letra-x",
    lessonKey: "alfabeto/letras-u-z/letra-x",
    letter: "X",
    title: "Letra X",
    references: [
      {
        institution: "INES",
        url: "https://example.org/fonte",
        purpose: "Testar",
        consultedAt: "2026-11-18",
      },
    ],
    validationStatus: "draft",
    version: "draft-1",
    reviews: [],
    ...overrides,
  };
}

function makeReview(
  type: AlphabetSpecimen["reviews"][number]["type"],
): AlphabetSpecimen["reviews"][number] {
  return {
    reviewer: `Revisor ${type}`,
    type,
    date: "2026-11-18",
    version: "draft-1",
  };
}

const FULL_REVIEW_CHAIN = [
  makeReview("research"),
  makeReview("technical"),
  makeReview("expert"),
];

const LICENSED_MEDIA: Pick<
  AlphabetSpecimen,
  "media" | "attribution"
> = {
  media: {
    type: "image",
    src: "/media/alfabeto/letras-u-z/letra-x.jpg",
    alt: "Demonstração da configuração de mão da letra X.",
  },
  attribution: {
    source: "Equipe Sinaliza",
    license: "Produção própria",
    permissionEvidence: "Termo de autorização de imagem do intérprete.",
    publicationEvidence: "Termo de cessão para distribuição educacional do ativo.",
  },
};

describe("alphabetSpecimens catalog", () => {
  it("catalogues every candidate letter as well-formed", () => {
    expect(alphabetSpecimens).toHaveLength(CANDIDATE_LETTERS.length);
    for (const letter of CANDIDATE_LETTERS) {
      expect(
        getSpecimen(letter),
        `candidate letter ${letter} missing`,
      ).toBeDefined();
    }
    for (const specimen of alphabetSpecimens) {
      expect(validateSpecimen(specimen), specimen.id).toEqual([]);
    }
  });

  it("keeps ids, letters and lesson keys unique", () => {
    const ids = alphabetSpecimens.map((specimen) => specimen.id);
    const letters = alphabetSpecimens.map((specimen) => specimen.letter);
    const keys = alphabetSpecimens.map((specimen) => specimen.lessonKey);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(letters).size).toBe(letters.length);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("points every specimen at a real, still-planned letter lesson", () => {
    for (const specimen of alphabetSpecimens) {
      const parsed = parseLessonKey(specimen.lessonKey);
      expect(parsed, specimen.lessonKey).not.toBeNull();
      const context = getLessonContext(
        parsed!.pathSlug,
        parsed!.moduleSlug,
        parsed!.lessonSlug,
      );
      expect(context, specimen.lessonKey).toBeDefined();
      expect(
        context!.lesson.status,
        `"${specimen.lessonKey}" must stay planned until validation`,
      ).toBe("planned");
    }
  });

  it("gives every specimen traceable references", () => {
    for (const specimen of alphabetSpecimens) {
      for (const reference of specimen.references) {
        expect(reference.url).toMatch(/^https:\/\//);
        expect(reference.consultedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("keeps media state honest per specimen", () => {
    // Letters A, B, I and L carry the licensed Fiocruz photo; every other
    // catalogued letter stays without media rather than inventing one.
    const licensed = new Set(["letra-a", "letra-b", "letra-i", "letra-l"]);
    for (const specimen of alphabetSpecimens) {
      expect(specimen.validationStatus).toBe("draft");
      // The empty review chain keeps every specimen unpublishable,
      // licensed or not.
      expect(isSpecimenPublishable(specimen)).toBe(false);
      if (licensed.has(specimen.id)) {
        expect(specimen.media).toBeDefined();
        if (specimen.media?.type !== "image") throw new Error("fixture");
        expect(specimen.media.alt).toMatch(/mão|dedo|punho/);
        expect(specimen.attribution?.permissionEvidence?.trim()).toBeTruthy();
        expect(specimen.attribution?.displayScope).toBe("local-review");
        expect(specimen.attribution?.publicationEvidence).toBeUndefined();
        expect(hasDisplayPermission(specimen)).toBe(true);
      } else {
        expect(specimen.media).toBeUndefined();
        expect(specimen.attribution).toBeUndefined();
        expect(hasDisplayPermission(specimen)).toBe(false);
      }
    }
  });
});

describe("validateSpecimen", () => {
  it("flags media shown without full licensing evidence", () => {
    const noAttribution = validateSpecimen(
      makeSpecimen({
        media: {
          type: "image",
          src: "/media/x.jpg",
          alt: "Configuração de mão.",
        },
      }),
    );
    expect(noAttribution.join()).toContain("missing attribution");

    const noEvidence = validateSpecimen(
      makeSpecimen({
        media: {
          type: "image",
          src: "/media/x.jpg",
          alt: "Configuração de mão.",
        },
        attribution: {
          source: "Fonte externa",
          license: "Sem licença informada",
        },
      }),
    );
    expect(noEvidence.join()).toContain("missing permission evidence");

    const noAlt = validateSpecimen(
      makeSpecimen({
        media: { type: "image", src: "/media/x.jpg", alt: "  " },
        attribution: {
          source: "Fonte",
          license: "CC BY 4.0",
          permissionEvidence: "Declaração da fonte.",
        },
      }),
    );
    expect(noAlt.join()).toContain("alt text");
  });

  it("requires the review chain to cover the current version", () => {
    const stale = validateSpecimen(
      makeSpecimen({
        validationStatus: "expert-validated",
        version: "draft-2",
        reviews: [...FULL_REVIEW_CHAIN],
      }),
    );
    expect(stale.join()).toContain("outdated content version");

    const missing = validateSpecimen(
      makeSpecimen({
        validationStatus: "expert-validated",
        reviews: [makeReview("expert")],
      }),
    );
    expect(missing.join()).toContain("requires a research review");
    expect(missing.join()).toContain("requires a technical review");
  });
});

describe("isSpecimenPublishable", () => {
  it("never publishes a letter on status alone", () => {
    const bare = makeSpecimen({ validationStatus: "expert-validated" });
    expect(isSpecimenPublishable(bare)).toBe(false);

    const reviewedNoMedia = makeSpecimen({
      validationStatus: "expert-validated",
      reviews: [...FULL_REVIEW_CHAIN],
    });
    expect(isSpecimenPublishable(reviewedNoMedia)).toBe(false);

    const mediaNoLicense = makeSpecimen({
      validationStatus: "expert-validated",
      reviews: [...FULL_REVIEW_CHAIN],
      media: {
        type: "image",
        src: "/media/x.jpg",
        alt: "Configuração de mão.",
      },
      attribution: {
        source: "Fonte externa",
        license: "Sem licença informada",
      },
    });
    expect(isSpecimenPublishable(mediaNoLicense)).toBe(false);
  });

  it("publishes only with the full chain and media cleared for distribution", () => {
    const specimen = makeSpecimen({
      validationStatus: "expert-validated",
      reviews: [...FULL_REVIEW_CHAIN],
      ...LICENSED_MEDIA,
    });
    expect(isSpecimenPublishable(specimen)).toBe(true);

    // Display permission alone never suffices: local-review media needs
    // separate evidence that public redistribution is authorized.
    const displayOnly = makeSpecimen({
      validationStatus: "expert-validated",
      reviews: [...FULL_REVIEW_CHAIN],
      media: LICENSED_MEDIA.media,
      attribution: {
        ...LICENSED_MEDIA.attribution!,
        publicationEvidence: undefined,
      },
    });
    expect(hasDisplayPermission(displayOnly)).toBe(true);
    expect(isSpecimenPublishable(displayOnly)).toBe(false);
  });

  it("keeps licensed media displayable in preview but not publishable", () => {
    // Display permission and publishability are separate gates: licensed
    // media may be previewed while the review chain is still pending.
    const draftWithMedia = makeSpecimen({ ...LICENSED_MEDIA });
    expect(hasDisplayPermission(draftWithMedia)).toBe(true);
    expect(isSpecimenPublishable(draftWithMedia)).toBe(false);
  });

  it("rejects structurally invalid media even with the full chain", () => {
    const base = {
      validationStatus: "expert-validated" as const,
      reviews: [...FULL_REVIEW_CHAIN],
      attribution: LICENSED_MEDIA.attribution,
    };

    const emptySrc = makeSpecimen({
      ...base,
      media: { type: "image", src: "  ", alt: "Configuração de mão." },
    });
    expect(isSpecimenPublishable(emptySrc)).toBe(false);
    expect(validateSpecimen(emptySrc).join()).toContain("missing media src");

    const emptyAlt = makeSpecimen({
      ...base,
      media: { type: "image", src: "/media/x.jpg", alt: " " },
    });
    expect(isSpecimenPublishable(emptyAlt)).toBe(false);
    expect(validateSpecimen(emptyAlt).join()).toContain("alt text");

    const badCaptions = makeSpecimen({
      ...base,
      media: {
        type: "video",
        src: "/media/x.mp4",
        captions: { src: "/media/x.txt", srclang: "", label: "" },
      },
    });
    expect(isSpecimenPublishable(badCaptions)).toBe(false);
    expect(validateSpecimen(badCaptions).join()).toContain("captions");
  });
});

describe("specimen previews", () => {
  it("links previews inside the lab, never through the progress store", () => {
    // Preview URLs live under /laboratorio — outside the lesson runner and
    // its completion flow, so browsing a specimen records no progress.
    for (const specimen of alphabetSpecimens) {
      expect(getSpecimenUrl(specimen.letter)).toMatch(
        /^\/laboratorio\/alfabeto\//,
      );
      expect(getSpecimenByLessonKey(specimen.lessonKey)).toBe(specimen);
    }
  });
});
