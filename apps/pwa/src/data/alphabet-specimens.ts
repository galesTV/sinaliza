/**
 * Visual specimen catalog: one typed record per letter of the Libras
 * manual alphabet considered for media curation.
 *
 * A specimen tracks the demonstration asset (or its honest absence),
 * licensing evidence and the same review lifecycle as lesson content —
 * a letter can be catalogued with no media at all, and nothing is ever
 * presented as validated before the full research → technical → expert
 * review chain covers the current version.
 */
import { getLessonContext } from "./learning-paths";
import {
  REQUIRED_REVIEWS,
  hasCurrentReview,
  isValidReview,
  licensedLetterMedia,
  type LessonReference,
  type LessonReview,
  type LessonValidationStatus,
} from "./lesson-catalog";
import {
  hasMediaDisplayPermission,
  validateLessonMedia,
  type LessonMedia,
  type LessonMediaAttribution,
} from "./lesson-content";
import { parseLessonKey } from "@/lib/progress";

export interface SpecimenAttribution extends LessonMediaAttribution {
  /**
   * Evidence that reuse is permitted (license URL, authorization record,
   * own-production note). Required before media can ship — an empty field
   * means permission is still unverified.
   */
  permissionEvidence?: string;
}

export interface AlphabetSpecimen {
  /** Stable catalog identifier, e.g. "letra-a". */
  id: string;
  /** `trilha/modulo/licao` key of the letter lesson this specimen serves. */
  lessonKey: string;
  /** The letter demonstrated, e.g. "A". */
  letter: string;
  title: string;
  /**
   * Textual description of the hand configuration. Recorded only once it
   * is grounded in the references and reviewed — never invented.
   */
  description?: string;
  /**
   * Demonstration media (video or image). Absent while no licensed asset
   * exists: viewers render the honest "in production" state instead of a
   * placeholder, generic picture or invented demonstration.
   */
  media?: LessonMedia;
  /** Authorship/license of `media`. Required whenever `media` is present. */
  attribution?: SpecimenAttribution;
  references: LessonReference[];
  validationStatus: LessonValidationStatus;
  /** Content version — reviews count only while they cover this version. */
  version: string;
  reviews: LessonReview[];
}

const CONSULTED_AT = "2026-11-18";

const SHARED_REFERENCES = {
  inesAlphabet: {
    institution: "Instituto Nacional de Educação de Surdos (INES)",
    url: "https://www.gov.br/ines/pt-br/central-de-conteudos/publicacoes-1/todas-as-publicacoes/alfabeto-manual-e-configuracao-de-maos",
    consultedAt: CONSULTED_AT,
  },
  inesGramatica: {
    institution: "Instituto Nacional de Educação de Surdos (INES)",
    url: "https://www.gov.br/ines/pt-br/central-de-conteudos/publicacoes-1/todas-as-publicacoes/gramatica-da-libras-volume-1",
    consultedAt: CONSULTED_AT,
  },
  ufscGramatica: {
    institution: "Universidade Federal de Santa Catarina (UFSC)",
    url: "https://repositorio.ufsc.br/handle/123456789/262318",
    consultedAt: CONSULTED_AT,
  },
} as const;

const DEFAULT_REFERENCES: LessonReference[] = [
  {
    ...SHARED_REFERENCES.inesAlphabet,
    purpose:
      "Fonte institucional primária para a configuração de mão da letra (alfabeto manual de Libras). Direitos de uso da mídia não confirmados.",
  },
  {
    ...SHARED_REFERENCES.inesGramatica,
    purpose:
      "Fundamentação linguística dos parâmetros de formação (configuração de mão, orientação, localização).",
  },
  {
    ...SHARED_REFERENCES.ufscGramatica,
    purpose:
      "Descrição fonológica acadêmica das configurações de mão do alfabeto manual.",
  },
];

/**
 * Candidate set agreed for the first curation round (spec §4): static
 * hand configurations with distinct shapes, reasonable MediaPipe
 * landmark separability and a beginner-friendly progression. Any change
 * to this set needs owner approval.
 */
export const alphabetSpecimens: AlphabetSpecimen[] = [
  {
    id: "letra-a",
    lessonKey: "alfabeto/letras-a-e/letra-a",
    letter: "A",
    title: "Letra A",
    ...licensedLetterMedia("A"),
    references: [...DEFAULT_REFERENCES],
    validationStatus: "draft",
    version: "draft-2",
    reviews: [],
  },
  {
    id: "letra-b",
    lessonKey: "alfabeto/letras-a-e/letra-b",
    letter: "B",
    title: "Letra B",
    ...licensedLetterMedia("B"),
    references: [...DEFAULT_REFERENCES],
    validationStatus: "draft",
    version: "draft-2",
    reviews: [],
  },
  {
    id: "letra-c",
    lessonKey: "alfabeto/letras-a-e/letra-c",
    letter: "C",
    title: "Letra C",
    references: [...DEFAULT_REFERENCES],
    validationStatus: "draft",
    version: "draft-1",
    reviews: [],
  },
  {
    id: "letra-i",
    lessonKey: "alfabeto/letras-f-j/letra-i",
    letter: "I",
    title: "Letra I",
    ...licensedLetterMedia("I"),
    references: [...DEFAULT_REFERENCES],
    validationStatus: "draft",
    version: "draft-2",
    reviews: [],
  },
  {
    id: "letra-l",
    lessonKey: "alfabeto/letras-k-o/letra-l",
    letter: "L",
    title: "Letra L",
    ...licensedLetterMedia("L"),
    references: [...DEFAULT_REFERENCES],
    validationStatus: "draft",
    version: "draft-2",
    reviews: [],
  },
];

export function getSpecimen(letter: string): AlphabetSpecimen | undefined {
  const normalized = letter.trim().toUpperCase();
  return alphabetSpecimens.find((specimen) => specimen.letter === normalized);
}

export function getSpecimenById(id: string): AlphabetSpecimen | undefined {
  return alphabetSpecimens.find((specimen) => specimen.id === id);
}

export function getSpecimenByLessonKey(
  key: string,
): AlphabetSpecimen | undefined {
  return alphabetSpecimens.find((specimen) => specimen.lessonKey === key);
}

export function getSpecimenUrl(letter: string): string {
  return `/laboratorio/alfabeto/${letter.trim().toLowerCase()}`;
}

/**
 * Whether the specimen's media may be shown at all (previews included):
 * a present asset whose attribution records author, license and
 * non-empty permission evidence. Media without proven permission is
 * never displayed, however well-formed it is.
 */
export function hasDisplayPermission(
  specimen: AlphabetSpecimen,
): specimen is AlphabetSpecimen & {
  media: LessonMedia;
  attribution: SpecimenAttribution;
} {
  return (
    Boolean(specimen.media) &&
    hasMediaDisplayPermission(specimen.attribution)
  );
}

/**
 * A specimen may be presented as validated material only when the full
 * review chain covers the current version AND a structurally valid,
 * licensed demonstration asset exists — status alone, stale reviews or
 * media without permission evidence never qualify.
 */
export function isSpecimenPublishable(specimen: AlphabetSpecimen): boolean {
  return (
    specimen.validationStatus === "expert-validated" &&
    REQUIRED_REVIEWS[specimen.validationStatus].every((type) =>
      hasCurrentReview(specimen.reviews, specimen.version, type),
    ) &&
    hasDisplayPermission(specimen) &&
    validateLessonMedia(specimen.media!).length === 0
  );
}

/**
 * Well-formedness + provenance rules for a specimen. Empty list means the
 * entry is sound; the test suite runs this on every catalogued letter.
 */
export function validateSpecimen(specimen: AlphabetSpecimen): string[] {
  const problems: string[] = [];

  if (!specimen.id.trim()) problems.push("specimen: missing id");
  if (!/^[A-Z]$/.test(specimen.letter))
    problems.push("specimen: letter must be a single A–Z character");
  if (!specimen.title.trim()) problems.push("specimen: missing title");
  if (specimen.references.length === 0)
    problems.push("specimen: no references");
  if (!specimen.version.trim()) problems.push("specimen: missing version");

  const parsed = parseLessonKey(specimen.lessonKey);
  const context =
    parsed &&
    getLessonContext(parsed.pathSlug, parsed.moduleSlug, parsed.lessonSlug);
  if (!parsed || !context) {
    problems.push(`specimen: no lesson matches "${specimen.lessonKey}"`);
  } else if (
    context.lesson.status === "available" &&
    !isSpecimenPublishable(specimen)
  ) {
    problems.push(
      `specimen: lesson "${specimen.lessonKey}" is published without validation evidence`,
    );
  }

  specimen.references.forEach((reference, i) => {
    const at = `reference ${i}`;
    if (!reference.institution.trim())
      problems.push(`${at}: missing institution`);
    if (!/^https?:\/\//.test(reference.url))
      problems.push(`${at}: url is not http(s)`);
    if (!reference.purpose.trim()) problems.push(`${at}: missing purpose`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(reference.consultedAt))
      problems.push(`${at}: consultedAt must be YYYY-MM-DD`);
  });

  specimen.reviews.forEach((review, i) => {
    const at = `review ${i}`;
    if (!review.reviewer.trim()) problems.push(`${at}: missing reviewer`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(review.date))
      problems.push(`${at}: date must be YYYY-MM-DD`);
    if (!review.version.trim()) problems.push(`${at}: missing version`);
  });

  for (const type of REQUIRED_REVIEWS[specimen.validationStatus]) {
    const matching = specimen.reviews.filter(
      (review) => review.type === type,
    );
    if (matching.length === 0) {
      problems.push(
        `specimen: status "${specimen.validationStatus}" requires a ${type} review`,
      );
    } else if (!matching.some((review) => isValidReview(review))) {
      problems.push(`specimen: ${type} review is incomplete`);
    } else if (
      !matching.some(
        (review) =>
          isValidReview(review) && review.version === specimen.version,
      )
    ) {
      problems.push(
        `specimen: ${type} review covers an outdated content version`,
      );
    }
  }

  if (specimen.media) {
    problems.push(
      ...validateLessonMedia(specimen.media).map(
        (problem) => `media: ${problem}`,
      ),
    );
    if (!specimen.attribution) {
      problems.push("media: missing attribution");
    } else {
      const attribution = specimen.attribution;
      if (!attribution.source.trim())
        problems.push("attribution: missing source");
      if (!attribution.license.trim())
        problems.push("attribution: missing license");
      if (
        attribution.licenseUrl &&
        !/^https?:\/\//.test(attribution.licenseUrl)
      )
        problems.push("attribution: licenseUrl is not http(s)");
      if (!attribution.permissionEvidence?.trim())
        problems.push("attribution: missing permission evidence");
    }
  }

  return problems;
}
