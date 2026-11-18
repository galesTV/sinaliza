/**
 * Pedagogical catalog — the traceable registry of lesson material.
 *
 * Every lesson planned for production gets a catalog entry recording what it
 * teaches, which sources ground it, what media it intends to reuse, and how
 * far validation has progressed. The catalog is separate from
 * `lessonContents` in `lesson-content.ts`: that registry only holds material
 * that has been published (lesson `status: "available"`), while the catalog
 * tracks the whole lifecycle — including drafts that may be previewed but
 * must never be presented as validated.
 *
 * Promotion rule (enforced by `lesson-catalog.test.ts`): a lesson may only
 * enter `lessonContents` after its catalog entry reaches
 * `"expert-validated"` — and that status is only legitimate when an expert
 * review is recorded. Technical integrity is not linguistic validation.
 */

import type { LessonContent } from "./lesson-content";
import { validateLessonContent } from "./lesson-content";
import { getLessonContext } from "./learning-paths";
import { lessonKey, parseLessonKey } from "@/lib/progress";

export type LessonValidationStatus =
  | "draft"
  | "research-reviewed"
  | "technical-reviewed"
  | "expert-validated";

/** Lifecycle order — a status claims every earlier stage was completed. */
export const VALIDATION_STATUS_ORDER: readonly LessonValidationStatus[] = [
  "draft",
  "research-reviewed",
  "technical-reviewed",
  "expert-validated",
];

/** Which review type evidence a status requires (draft requires none). */
const STATUS_REVIEW_REQUIREMENT: Record<
  LessonValidationStatus,
  LessonReview["type"] | null
> = {
  draft: null,
  "research-reviewed": "research",
  "technical-reviewed": "technical",
  "expert-validated": "expert",
};

export interface LessonReference {
  /** Institution or author responsible for the source. */
  institution: string;
  url: string;
  /** What the lesson takes from this source. */
  purpose: string;
  /** ISO date (YYYY-MM-DD) the source was last consulted. */
  consultedAt: string;
}

export interface LessonReview {
  /** Who performed the review (person or body — never "the team"). */
  reviewer: string;
  type: "research" | "technical" | "expert";
  /** ISO date (YYYY-MM-DD) the review happened. */
  date: string;
  /** Content version the review covered, e.g. "draft-1". */
  version: string;
  notes?: string;
}

export interface LessonMediaPlan {
  /** Which media the lesson intends to use and under which reuse terms. */
  summary: string;
  /**
   * Evidence that reuse is permitted (license URL, authorization record).
   * Absent means permission is still unverified — the asset must not ship.
   */
  permissionEvidence?: string;
}

export interface LessonCatalogEntry {
  /** Stable catalog identifier, independent of slugs. */
  id: string;
  /** `trilha/modulo/licao` key shared with progress and `lessonContents`. */
  lessonKey: string;
  title: string;
  objective: string;
  references: LessonReference[];
  /**
   * Planned instructions and exercises, in authoring order — the outline the
   * draft implements and reviewers check against.
   */
  plannedOutline: string[];
  validationStatus: LessonValidationStatus;
  reviews: LessonReview[];
  mediaPlan?: LessonMediaPlan;
  /**
   * Prepared content awaiting validation. Previewable through the draft
   * routes under `/laboratorio/licoes`; never copied into `lessonContents`
   * while the entry is not `expert-validated`.
   */
  draft?: LessonContent;
}

const CONSULTED_AT = "2026-11-18";

const REFERENCIAS_COMUNS = {
  lei10436: {
    institution: "Presidência da República — Portal da Legislação",
    url: "https://www.planalto.gov.br/ccivil_03/leis/2002/l10436.htm",
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

export const lessonCatalog: LessonCatalogEntry[] = [
  {
    id: "libras-e-uma-lingua",
    lessonKey: lessonKey("alfabeto", "primeiros-passos", "libras-e-uma-lingua"),
    title: "Libras é uma língua",
    objective:
      "Reconhecer a Libras como língua visual-espacial com estrutura gramatical própria, distinta do português e dos gestos comuns.",
    references: [
      {
        ...REFERENCIAS_COMUNS.lei10436,
        purpose:
          "Base legal do reconhecimento da Libras (art. 1º): meio legal de comunicação e expressão, sistema linguístico de natureza visual-motora com estrutura gramatical própria.",
      },
      {
        ...REFERENCIAS_COMUNS.inesGramatica,
        purpose:
          "Referência institucional sobre a estrutura gramatical da Libras e os parâmetros de formação dos sinais.",
      },
      {
        ...REFERENCIAS_COMUNS.ufscGramatica,
        purpose:
          "Fonte acadêmica da descrição linguística da Libras (fonologia, morfologia e sintaxe da língua).",
      },
    ],
    plannedOutline: [
      "Introdução: por que chamar a Libras de língua, e não de gestos",
      "Explicação: o reconhecimento legal da Libras (Lei nº 10.436/2002, art. 1º)",
      "Explicação: a modalidade visual-espacial e os parâmetros dos sinais",
      "Explicação: Libras não é português sinalizado nem uma língua universal",
      "Exercício: por que a Libras é uma língua completa",
      "Exercício: como os sinais são produzidos e percebidos",
    ],
    validationStatus: "draft",
    reviews: [],
    mediaPlan: {
      summary:
        "Lição conceitual sem mídia nesta versão. Ilustrações de parâmetros dos sinais ficam para iteração futura, apenas com produção própria ou licença confirmada.",
    },
    draft: {
      intro:
        "Nesta lição, você vai entender por que a Libras é uma língua completa — com estrutura gramatical própria — e não apenas um conjunto de gestos ou uma tradução sinalizada do português.",
      blocks: [
        {
          kind: "text",
          heading: "Uma língua reconhecida por lei",
          body: "A Libras — Língua Brasileira de Sinais — é reconhecida pela Lei nº 10.436/2002 como meio legal de comunicação e expressão. A lei a define como um sistema linguístico de natureza visual-motora, com estrutura gramatical própria, usado pelas comunidades surdas do Brasil.",
        },
        {
          kind: "text",
          heading: "Modalidade visual-espacial",
          body: "Diferente das línguas orais, a Libras é produzida pelo corpo e percebida pela visão. Cada sinal combina elementos como a configuração das mãos, o lugar do corpo ou do espaço onde é produzido, o movimento e as expressões faciais e corporais. É essa combinação — e não gestos soltos — que forma a língua.",
        },
        {
          kind: "text",
          heading: "Não é português sinalizado — e não é universal",
          body: "A Libras tem gramática própria, com organização de frases diferente do português. Sinalizar uma frase em português palavra por palavra não é falar Libras. Assim como as línguas orais, as línguas de sinais variam entre países: existe a língua de sinais americana, a francesa, e assim por diante — e no Brasil há ainda variações regionais de sinais.",
        },
        {
          kind: "exercise",
          exercise: {
            prompt: "Por que a Libras é considerada uma língua completa?",
            options: [
              {
                label: "Porque traduz o português palavra por palavra em sinais",
                feedback:
                  "Não é isso: a Libras tem estrutura própria e não segue a ordem nem a gramática do português.",
              },
              {
                label:
                  "Porque possui estrutura gramatical própria, reconhecida em lei",
                feedback:
                  "Isso mesmo: a Lei nº 10.436/2002 reconhece a Libras como sistema linguístico com gramática própria.",
              },
              {
                label:
                  "Porque é a mesma língua de sinais usada em todos os países",
                feedback:
                  "Na verdade, cada país tem sua língua de sinais — a Libras é específica das comunidades surdas do Brasil.",
              },
            ],
            correctIndex: 1,
            explanation:
              "Uma língua tem gramática, comunidade de usuários e cultura próprias. A Libras atende a esses critérios e é reconhecida legalmente desde 2002.",
          },
        },
        {
          kind: "exercise",
          exercise: {
            prompt: "Como os sinais da Libras são formados?",
            options: [
              {
                label:
                  "Pela combinação de configuração de mãos, ponto de articulação, movimento e expressões",
                feedback:
                  "Correto: esses parâmetros se combinam para formar cada sinal — mudar um deles pode mudar o significado.",
              },
              {
                label: "Somente pela posição das mãos em frente ao corpo",
                feedback:
                  "A posição das mãos é só um dos parâmetros. Movimento, expressões e ponto de articulação também constroem o sinal.",
              },
              {
                label: "Por gestos livres que cada pessoa inventa",
                feedback:
                  "Sinais não são improviso: são formas convencionadas da língua, aprendidas e compartilhadas pela comunidade.",
              },
            ],
            correctIndex: 0,
            explanation:
              "Os parâmetros de formação dos sinais são estudados pela gramática da Libras — a língua tem regras de produção tão precisas quanto qualquer língua oral.",
          },
        },
      ],
    },
  },
  {
    id: "o-que-e-datilologia",
    lessonKey: lessonKey("alfabeto", "primeiros-passos", "o-que-e"),
    title: "O que é a datilologia",
    objective:
      "Compreender a função da soletração manual dentro da Libras e distingui-la dos sinais lexicais.",
    references: [
      {
        institution:
          "Instituto Nacional de Educação de Surdos (INES) — Alfabeto de Libras e Configuração de Mãos",
        url: "https://www.gov.br/ines/pt-br/central-de-conteudos/publicacoes-1/todas-as-publicacoes/alfabeto-manual-e-configuracao-de-maos",
        purpose:
          "Referência institucional para o alfabeto manual de Libras e as configurações de mão de cada letra.",
        consultedAt: CONSULTED_AT,
      },
      {
        ...REFERENCIAS_COMUNS.inesGramatica,
        purpose:
          "Base para situar a datilologia como recurso dentro da língua, e não como a língua em si.",
      },
      {
        ...REFERENCIAS_COMUNS.ufscGramatica,
        purpose:
          "Fundamentação linguística sobre o papel da soletração manual e a distinção entre datilologia e sinais lexicais.",
      },
    ],
    plannedOutline: [
      "Introdução: o que é a soletração manual",
      "Explicação: o alfabeto manual de Libras e as 26 letras",
      "Explicação: quando a datilologia é usada no dia a dia",
      "Explicação: datilologia é um recurso, não a língua inteira",
      "Exercício: diferenciar soletração de sinais lexicais",
      "Exercício: situações de uso da datilologia",
    ],
    validationStatus: "draft",
    reviews: [],
    mediaPlan: {
      summary:
        "Lição conceitual sem mídia nesta versão. As demonstrações visuais das configurações de mão de cada letra dependem de produção própria ou licença confirmada e não foram habilitadas.",
    },
    draft: {
      intro:
        "Nesta lição, você vai conhecer a datilologia — a soletração de palavras com as mãos — e entender qual é o papel dela dentro da Libras.",
      blocks: [
        {
          kind: "text",
          heading: "O que é a datilologia",
          body: "A datilologia é a soletração manual: cada letra do alfabeto é representada por uma configuração de mão, permitindo escrever palavras letra por letra. O alfabeto manual de Libras tem uma configuração de mão para cada uma das 26 letras.",
        },
        {
          kind: "text",
          heading: "Quando a soletração manual é usada",
          body: "A datilologia aparece quando não existe um sinal convencionado ou quando é preciso ser exato: nomes próprios de pessoas e lugares, termos técnicos, siglas e palavras de outras línguas. É uma ponte entre a Libras e o português escrito.",
        },
        {
          kind: "text",
          heading: "Datilologia é um recurso — não a língua inteira",
          body: "Soletrar uma frase inteira letra por letra não é conversar em Libras. A língua é feita de sinais lexicais — formas próprias com significado — organizados pela gramática da Libras. A datilologia é um recurso que a língua usa em momentos específicos.",
        },
        {
          kind: "exercise",
          exercise: {
            prompt: "O que diferencia a datilologia dos sinais da Libras?",
            options: [
              {
                label:
                  "A datilologia representa letras; os sinais são unidades da língua com significado próprio",
                feedback:
                  "Exato: soletrar é escrever com as mãos; sinalizar é usar o léxico e a gramática da língua.",
              },
              {
                label:
                  "A datilologia é usada só por iniciantes; os sinais, só por fluentes",
                feedback:
                  "Não é uma questão de nível: pessoas fluentes usam a datilologia em situações específicas, como nomes próprios.",
              },
              {
                label:
                  "São a mesma coisa: soletrar uma frase letra a letra é falar Libras",
                feedback:
                  "Cuidado: soletrar palavra por palavra segue a ordem do português escrito, não a gramática da Libras.",
              },
            ],
            correctIndex: 0,
            explanation:
              "A datilologia empresta as letras do alfabeto escrito; os sinais pertencem à própria língua, com estrutura e uso próprios.",
          },
        },
        {
          kind: "exercise",
          exercise: {
            prompt:
              "Em qual situação a soletração manual costuma ser usada?",
            options: [
              {
                label: "Para todas as frases do dia a dia",
                feedback:
                  "Não: para conversas comuns, usam-se os sinais lexicais organizados pela gramática da Libras.",
              },
              {
                label:
                  "Para nomes próprios e palavras sem sinal convencionado",
                feedback:
                  "Isso mesmo: é o uso mais comum — nomes de pessoas, lugares, siglas e termos técnicos.",
              },
              {
                label: "Apenas em contextos jurídicos e oficiais",
                feedback:
                  "A datilologia aparece no cotidiano, sempre que é preciso precisão na escrita de uma palavra.",
              },
            ],
            correctIndex: 1,
            explanation:
              "A soletração manual resolve a necessidade de transcrever palavras com exatidão — especialmente nomes e termos sem sinal próprio.",
          },
        },
      ],
    },
  },
];

export function getCatalogEntry(
  key: string,
): LessonCatalogEntry | undefined {
  return lessonCatalog.find((entry) => entry.lessonKey === key);
}

export function getCatalogEntryById(
  id: string,
): LessonCatalogEntry | undefined {
  return lessonCatalog.find((entry) => entry.id === id);
}

export function getLessonDraft(key: string): LessonContent | undefined {
  return getCatalogEntry(key)?.draft;
}

export function getLessonDraftUrl(key: string): string {
  return `/laboratorio/licoes/${key}`;
}

/**
 * A draft is publishable into `lessonContents` only when the entry reached
 * `expert-validated` — i.e., a specialist review is on record.
 */
export function isPublishable(entry: LessonCatalogEntry): boolean {
  return entry.validationStatus === "expert-validated";
}

/**
 * Well-formedness + provenance rules for a catalog entry. Empty list means
 * the entry is sound; the test suite runs this on every registry entry.
 */
export function validateCatalogEntry(entry: LessonCatalogEntry): string[] {
  const problems: string[] = [];

  if (!entry.id.trim()) problems.push("entry: missing id");
  if (!entry.title.trim()) problems.push("entry: missing title");
  if (!entry.objective.trim()) problems.push("entry: missing objective");
  if (entry.references.length === 0)
    problems.push("entry: no references");
  if (entry.plannedOutline.length === 0)
    problems.push("entry: no planned outline");

  const parsed = parseLessonKey(entry.lessonKey);
  if (!parsed) {
    problems.push(`entry: malformed lessonKey "${entry.lessonKey}"`);
  } else if (
    !getLessonContext(parsed.pathSlug, parsed.moduleSlug, parsed.lessonSlug)
  ) {
    problems.push(`entry: no lesson matches "${entry.lessonKey}"`);
  }

  entry.references.forEach((reference, i) => {
    const at = `reference ${i}`;
    if (!reference.institution.trim())
      problems.push(`${at}: missing institution`);
    if (!/^https?:\/\//.test(reference.url))
      problems.push(`${at}: url is not http(s)`);
    if (!reference.purpose.trim()) problems.push(`${at}: missing purpose`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(reference.consultedAt))
      problems.push(`${at}: consultedAt must be YYYY-MM-DD`);
  });

  if (!VALIDATION_STATUS_ORDER.includes(entry.validationStatus)) {
    problems.push(`entry: unknown status "${entry.validationStatus}"`);
  }

  const required = STATUS_REVIEW_REQUIREMENT[entry.validationStatus];
  if (required && !entry.reviews.some((review) => review.type === required)) {
    problems.push(
      `entry: status "${entry.validationStatus}" requires a ${required} review`,
    );
  }

  entry.reviews.forEach((review, i) => {
    const at = `review ${i}`;
    if (!review.reviewer.trim()) problems.push(`${at}: missing reviewer`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(review.date))
      problems.push(`${at}: date must be YYYY-MM-DD`);
    if (!review.version.trim()) problems.push(`${at}: missing version`);
  });

  if (entry.draft) {
    problems.push(
      ...validateLessonContent(entry.draft).map(
        (problem) => `draft: ${problem}`,
      ),
    );
  }

  return problems;
}
