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

/**
 * Review evidence each status requires. The lifecycle is sequential —
 * `expert-validated` demands the whole chain (research + technical +
 * expert), not just the expert sign-off.
 */
export const REQUIRED_REVIEWS: Record<
  LessonValidationStatus,
  readonly LessonReview["type"][]
> = {
  draft: [],
  "research-reviewed": ["research"],
  "technical-reviewed": ["research", "technical"],
  "expert-validated": ["research", "technical", "expert"],
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
  /**
   * Current content version, e.g. "draft-1". Bump it whenever the content
   * changes: a review only counts toward publication while its `version`
   * matches this field — stale reviews never validate new content.
   */
  version: string;
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

const COMMON_REFERENCES = {
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
        ...COMMON_REFERENCES.lei10436,
        purpose:
          "Base legal do reconhecimento da Libras (art. 1º): meio legal de comunicação e expressão, sistema linguístico de natureza visual-motora com estrutura gramatical própria.",
      },
      {
        ...COMMON_REFERENCES.inesGramatica,
        purpose:
          "Referência institucional sobre a estrutura gramatical da Libras e os parâmetros de formação dos sinais.",
      },
      {
        ...COMMON_REFERENCES.ufscGramatica,
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
    version: "draft-2",
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
          body: "A Libras tem gramática própria, com organização de frases diferente do português. Sinalizar uma frase em português palavra por palavra não é falar Libras. E assim como há muitas línguas orais, há muitas línguas de sinais diferentes no mundo — a Libras é a língua das comunidades surdas do Brasil, que também apresenta variações regionais de sinais.",
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
                  "Na verdade, existem muitas línguas de sinais diferentes no mundo — a Libras é a língua das comunidades surdas do Brasil.",
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
                  "Pela combinação de configuração de mãos, ponto de articulação, movimento, direção e expressões",
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
        ...COMMON_REFERENCES.inesGramatica,
        purpose:
          "Base para situar a datilologia como recurso dentro da língua, e não como a língua em si.",
      },
      {
        ...COMMON_REFERENCES.ufscGramatica,
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
    version: "draft-1",
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
          body: "A datilologia é a soletração manual: cada letra do alfabeto é representada por uma configuração de mão, permitindo soletrar palavras visualmente, letra por letra. O alfabeto manual de Libras tem uma configuração de mão para cada uma das 26 letras.",
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
                  "Exato: soletrar representa letras do alfabeto escrito por configurações de mão; sinalizar usa o léxico e a gramática próprios da língua.",
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
  {
    id: "primeiras-letras",
    lessonKey: lessonKey("alfabeto", "primeiros-passos", "primeiras-letras"),
    title: "Primeiras letras do alfabeto manual",
    objective:
      "Identificar, a partir de descrições, características das configurações de mão das letras B, L, A e I, preparando-se para reconhecê-las em demonstrações visuais.",
    references: [
      {
        institution:
          "Instituto Nacional de Educação de Surdos (INES) — Alfabeto de Libras e Configuração de Mãos",
        url: "https://www.gov.br/ines/pt-br/central-de-conteudos/publicacoes-1/todas-as-publicacoes/alfabeto-manual-e-configuracao-de-maos",
        purpose:
          "Referência institucional primária para a configuração de mão de cada letra do alfabeto manual.",
        consultedAt: CONSULTED_AT,
      },
      {
        institution:
          "Universidade Federal do Recôncavo da Bahia (UFRB) — Dicionário de Configurações das Mãos em Libras (Charles Lary Marques Ferraz)",
        url: "https://www1.ufrb.edu.br/editora/component/phocadownload/category/2-e-books",
        purpose:
          "Dicionário organizado por configuração de mão; usa as letras do alfabeto manual como nome das configurações e documenta os parâmetros de produção dos sinais (configuração, ponto de articulação, movimento, orientação e expressão).",
        consultedAt: CONSULTED_AT,
      },
      {
        ...COMMON_REFERENCES.ufscGramatica,
        purpose:
          "Fundamentação dos parâmetros de formação dos sinais, incluindo a orientação da mão como traço distintivo de cada configuração.",
      },
    ],
    plannedOutline: [
      "Introdução: por que começar com poucas letras",
      "Explicação: como observar uma configuração de mão",
      "Explicação: letra B — mão aberta e plana",
      "Explicação: letra L — indicador e polegar formando um 'L' (cuidado: letra G)",
      "Explicação: letra A — punho fechado (cuidado: letra S)",
      "Explicação: letra I — só o dedo mínimo estendido (cuidado: letra J)",
      "Exercício: identificar a configuração da letra B pela descrição",
      "Exercício: o que observar primeiro em uma demonstração",
      "Exercício: identificar a letra do dedo mínimo estendido",
    ],
    validationStatus: "draft",
    version: "draft-3",
    reviews: [],
    mediaPlan: {
      summary:
        "Demonstrações visuais das letras B, L, A e I são essenciais para a lição. Candidatas em curadoria: série 'Alfabeto em Língua Brasileira de Sinais (Libras)' do acervo Fiocruz Imagens (autoria de Mauro Campello, licença declarada 'Uso não comercial (by-nc)', direito patrimonial da Fundação Oswaldo Cruz). As imagens não foram incorporadas nem autorizadas — aguardam aprovação separada da curadoria e validação da especialista. Alternativa planejada: produção própria com autorização de imagem por escrito.",
    },
    draft: {
      intro:
        "Nesta lição, você vai dar os primeiros passos no alfabeto manual de Libras conhecendo quatro letras — B, L, A e I — observando a forma de cada configuração de mão e os cuidados para não confundir letras parecidas.",
      blocks: [
        {
          kind: "text",
          heading: "Como observar uma configuração de mão",
          body: "Cada letra do alfabeto manual é uma configuração de mão: a posição dos dedos e do polegar e a orientação em que a mão é apresentada. Ao ver uma demonstração, repare primeiro na forma dos dedos e depois observe para onde a palma e os dedos apontam — cada letra tem a sua orientação própria.",
        },
        {
          kind: "text",
          heading: "Letra B — mão aberta e plana",
          body: "Na letra B, a mão fica aberta e estendida, com os quatro dedos juntos e o polegar dobrado sobre a palma. Observe a mão bem aberta: essa forma de 'mão estendida' aparece em muitos sinais da Libras.",
        },
        {
          kind: "text",
          heading: "Letra L — indicador e polegar em 'L'",
          body: "Na letra L, o dedo indicador aponta para cima e o polegar se abre para o lado, enquanto os demais dedos ficam dobrados. A forma lembra a letra 'L' escrita. Cuidado: outras letras, como a G, também usam o indicador estendido — a posição do polegar e a orientação da mão são pontos de atenção a confirmar nas demonstrações.",
        },
        {
          kind: "text",
          heading: "Letra A — punho fechado",
          body: "Na letra A, a mão fecha em um punho, com os quatro dedos dobrados e o polegar apoiado ao lado deles, por fora. Cuidado: a letra S tem uma forma muito parecida — a posição do polegar é um ponto de atenção a confirmar nas demonstrações.",
        },
        {
          kind: "text",
          heading: "Letra I — só o dedo mínimo estendido",
          body: "Na letra I, apenas o dedo mínimo fica estendido; os outros dedos e o polegar ficam dobrados. Cuidado: a letra J usa uma forma parecida — um ponto de atenção é que ela costuma envolver movimento, enquanto o I é estático.",
        },
        {
          kind: "exercise",
          exercise: {
            prompt: "Qual descrição corresponde à configuração da letra B?",
            options: [
              {
                label:
                  "Mão aberta e estendida, quatro dedos juntos e polegar dobrado sobre a palma",
                feedback:
                  "Isso mesmo: a letra B usa a mão aberta e plana, com os dedos unidos.",
              },
              {
                label: "Indicador estendido e polegar aberto, formando um 'L'",
                feedback:
                  "Essa é a letra L — no B, os quatro dedos ficam estendidos juntos.",
              },
              {
                label:
                  "Mão fechada em punho, com o polegar apoiado ao lado dos dedos",
                feedback:
                  "Essa é a letra A — no B, a mão permanece aberta.",
              },
            ],
            correctIndex: 0,
            explanation:
              "Este exercício verifica o entendimento da descrição da letra B — o reconhecimento visual se desenvolve observando as demonstrações de cada configuração.",
          },
        },
        {
          kind: "exercise",
          exercise: {
            prompt:
              "Ao observar a demonstração de uma letra do alfabeto manual pela primeira vez, o que merece atenção primeiro?",
            options: [
              {
                label:
                  "A forma dos dedos e do polegar e a orientação em que a mão é apresentada",
                feedback:
                  "Isso: a forma dos dedos e a orientação da mão são traços centrais para distinguir uma letra da outra — em letras com movimento, como a J, o movimento também diferencia.",
              },
              {
                label: "A velocidade com que a mão se move",
                feedback:
                  "As letras que você viu até aqui são estáticas — o que importa primeiro é a forma e a orientação da mão.",
              },
              {
                label: "O tamanho da mão de quem demonstra",
                feedback:
                  "O tamanho da mão não muda a letra — a posição dos dedos e a orientação, sim.",
              },
            ],
            correctIndex: 0,
            explanation:
              "Observar a forma dos dedos e a orientação da mão é o caminho para distinguir letras parecidas, como A e S ou L e G.",
          },
        },
        {
          kind: "exercise",
          exercise: {
            prompt:
              "Qual destas letras usa somente o dedo mínimo estendido?",
            options: [
              {
                label: "Letra B",
                feedback:
                  "Não: na letra B, os quatro dedos ficam estendidos juntos, com o polegar dobrado sobre a palma.",
              },
              {
                label: "Letra L",
                feedback:
                  "Não: na letra L, quem fica estendido é o dedo indicador, junto com o polegar aberto.",
              },
              {
                label: "Letra I",
                feedback:
                  "Isso mesmo: na letra I, só o dedo mínimo fica estendido e os demais dedos ficam dobrados.",
              },
            ],
            correctIndex: 2,
            explanation:
              "Este exercício verifica o entendimento da descrição da letra I — a identificação visual das letras se desenvolve com a observação das demonstrações.",
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

/** A review counts as evidence only when complete and covering the
 * entry's current content version. */
export function isValidReview(review: LessonReview): boolean {
  return (
    review.reviewer.trim().length > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(review.date) &&
    review.version.trim().length > 0
  );
}

export function hasCurrentReview(
  reviews: LessonReview[],
  version: string,
  type: LessonReview["type"],
): boolean {
  return reviews.some(
    (review) =>
      review.type === type &&
      isValidReview(review) &&
      review.version === version,
  );
}

/**
 * A draft is publishable into `lessonContents` only when the entry reached
 * `expert-validated` AND the full review chain (research, technical, expert)
 * covers the current content version — a bare status or a stale review is
 * never enough. The draft itself must exist and be well-formed.
 */
export function isPublishable(entry: LessonCatalogEntry): boolean {
  return (
    entry.validationStatus === "expert-validated" &&
    REQUIRED_REVIEWS[entry.validationStatus].every((type) =>
      hasCurrentReview(entry.reviews, entry.version, type),
    ) &&
    Boolean(entry.draft) &&
    validateLessonContent(entry.draft!).length === 0
  );
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

  if (!entry.version.trim()) problems.push("entry: missing version");

  if (!VALIDATION_STATUS_ORDER.includes(entry.validationStatus)) {
    problems.push(`entry: unknown status "${entry.validationStatus}"`);
  }

  for (const type of REQUIRED_REVIEWS[entry.validationStatus]) {
    const matching = entry.reviews.filter((review) => review.type === type);
    if (matching.length === 0) {
      problems.push(
        `entry: status "${entry.validationStatus}" requires a ${type} review`,
      );
    } else if (!matching.some((review) => isValidReview(review))) {
      problems.push(`entry: ${type} review is incomplete`);
    } else if (
      !matching.some(
        (review) => isValidReview(review) && review.version === entry.version,
      )
    ) {
      problems.push(
        `entry: ${type} review covers an outdated content version`,
      );
    }
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
