/**
 * Pedagogical catalog — the traceable registry of lesson material.
 *
 * Every lesson planned for production gets a catalog entry recording what it
 * teaches, which sources ground it, what media it intends to reuse, and how
 * far validation has progressed. The catalog tracks the whole lifecycle —
 * including drafts that may be previewed but must never be presented as
 * validated — and is also the single source of published content: once an
 * entry is publishable, the lesson page renders its `draft` directly, so
 * what the learner sees is by construction the reviewed version.
 *
 * Promotion rule (enforced by `lesson-catalog.test.ts`): an entry only
 * publishes — its draft rendered by the lesson page — after reaching
 * `"expert-validated"` with the full review chain on the current version.
 * Technical integrity is not linguistic validation.
 */

import type {
  LessonContent,
  LessonImageMedia,
  LessonMediaAttribution,
} from "./lesson-content";
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
  /** `trilha/modulo/licao` key shared with progress. */
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
   * routes under `/laboratorio/licoes`; rendered by the lesson page itself
   * only once the entry is `expert-validated` and publishable.
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

/**
 * Candidate items of the "Alfabeto em Libras" photo series in the Fiocruz
 * Imagens collection (author Mauro Campello, patrimonial rights Fundação
 * Oswaldo Cruz, declared license "Uso não comercial (by-nc)"), recorded in
 * `docs/curadoria-midia-fiocruz.md`. Approval pending: nothing here grants
 * reuse permission. The `url` fields are the activation reference for the
 * curation decision — they are deliberately NOT passed to `attribution`
 * (see `pendingLetterMedia`), so learner-facing UI never links to an
 * unlicensed candidate photo.
 */
const FIOCRUZ_CANDIDATES: Record<
  "A" | "B" | "I" | "L",
  { item: string; url: string }
> = {
  A: {
    item: "127847",
    url: "https://www.fiocruzimagens.fiocruz.br/s/fiocruzimagens/item/127847",
  },
  B: {
    item: "127848",
    url: "https://www.fiocruzimagens.fiocruz.br/s/fiocruzimagens/item/127848",
  },
  I: {
    item: "127856",
    url: "https://www.fiocruzimagens.fiocruz.br/s/fiocruzimagens/item/127856",
  },
  L: {
    item: "127859",
    url: "https://www.fiocruzimagens.fiocruz.br/s/fiocruzimagens/item/127859",
  },
};

/**
 * Planned media slot for one letter demonstration. The path follows the
 * `public/media/<trilha>/<modulo>/` convention but the file intentionally
 * does not exist yet, and `permissionEvidence` is deliberately absent —
 * so the fail-closed display gate keeps the slot in the honest "em
 * produção" state and exercises fall back to their description variants.
 * The attribution names the curation candidate for traceability; it is
 * marked "candidato em curadoria" so the credit line can never read as
 * the provenance of a displayed demonstration, and no `sourceUrl` is
 * exposed — a learner must not be linked through to an unlicensed,
 * unvalidated photo from inside a lesson.
 */
function pendingLetterMedia(letter: keyof typeof FIOCRUZ_CANDIDATES): {
  media: LessonImageMedia;
  attribution: LessonMediaAttribution;
} {
  const candidate = FIOCRUZ_CANDIDATES[letter];
  return {
    media: {
      type: "image",
      src: `/media/alfabeto/primeiros-passos/letra-${letter.toLowerCase()}.jpg`,
      alt: `Demonstração fotográfica da configuração de mão da letra ${letter} do alfabeto manual de Libras.`,
    },
    attribution: {
      source: `Candidato em curadoria — Mauro Campello, série "Alfabeto em Libras", Fiocruz Imagens / Fundação Oswaldo Cruz (item ${candidate.item})`,
      license: "\"Uso não comercial (by-nc)\", declarada pelo acervo — versão exata a confirmar",
      // No permissionEvidence on purpose: the candidate still awaits
      // curation approval and expert review, so the gate stays closed.
    },
  };
}

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
      "Identificar características das configurações de mão das letras B, L, A e I — pela descrição nesta versão e, quando houver mídia licenciada, por identificação visual da letra demonstrada.",
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
      "Introdução: como observar uma configuração de mão",
      "Letra B — explicação e slot de demonstração (mídia em produção)",
      "Letra L — explicação e slot de demonstração (cuidado: letra G)",
      "Letra A — explicação e slot de demonstração (cuidado: letra S)",
      "Letra I — explicação e slot de demonstração (cuidado: letra J)",
      "Comparação e revisão das quatro configurações",
      "Exercício visual: identificar a letra demonstrada (alternativa por descrição)",
      "Exercício visual: qual imagem mostra a letra I (alternativa por descrição)",
      "Exercício textual: o que observar primeiro em uma demonstração",
      "Recapitulação final",
      "Recursos complementares: links externos opcionais para estudo",
    ],
    validationStatus: "draft",
    version: "draft-5",
    reviews: [],
    mediaPlan: {
      summary:
        "O draft-5 mantém os slots de demonstração das letras B, L, A e I (`LessonMediaBlock`, caminhos planejados `/media/alfabeto/primeiros-passos/letra-*.jpg`) e os dois exercícios de identificação visual — todos sem `permissionEvidence`, portanto bloqueados pelo gate de exibição até haver licença confirmada — e adiciona a seção opcional 'Recursos complementares' (`LessonResourcesBlock`): apenas links externos https para INES e Unesp, sem mídia de terceiros incorporada, baixada ou embutida. Nenhum arquivo foi incorporado. Candidatas em curadoria: série 'Alfabeto em Língua Brasileira de Sinais (Libras)' do acervo Fiocruz Imagens (autoria de Mauro Campello, licença declarada 'Uso não comercial (by-nc)', itens 127847/127848/127856/127859), aguardando aprovação separada da curadoria e validação da especialista. Alternativa planejada: produção própria com autorização de imagem por escrito.",
    },
    draft: {
      intro:
        "Nesta lição, você vai dar os primeiros passos no alfabeto manual de Libras conhecendo quatro letras — B, L, A e I — observando a forma de cada configuração de mão e os cuidados para não confundir letras parecidas. As demonstrações visuais de cada letra estão em produção: enquanto elas não chegam, a descrição de cada passo cobre o conteúdo.",
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
          kind: "media",
          title: "Demonstração da letra B",
          description:
            "Demonstração visual da configuração da letra B: a mão aberta e estendida, com os quatro dedos juntos e o polegar dobrado sobre a palma. A imagem candidata está em curadoria e só será exibida quando houver licença confirmada e revisão especializada.",
          ...pendingLetterMedia("B"),
        },
        {
          kind: "text",
          heading: "Letra L — indicador e polegar em 'L'",
          body: "Na letra L, o dedo indicador aponta para cima e o polegar se abre para o lado, enquanto os demais dedos ficam dobrados. A forma lembra a letra 'L' escrita. Cuidado: outras letras, como a G, também usam o indicador estendido — a posição do polegar e a orientação da mão são pontos de atenção a confirmar nas demonstrações.",
        },
        {
          kind: "media",
          title: "Demonstração da letra L",
          description:
            "Demonstração visual da configuração da letra L: o dedo indicador estendido para cima e o polegar aberto para o lado, com os demais dedos dobrados. A imagem candidata está em curadoria e só será exibida quando houver licença confirmada e revisão especializada.",
          ...pendingLetterMedia("L"),
        },
        {
          kind: "text",
          heading: "Letra A — punho fechado",
          body: "Na letra A, a mão fecha em um punho, com os quatro dedos dobrados e o polegar apoiado ao lado deles, por fora. Cuidado: a letra S tem uma forma muito parecida — a posição do polegar é um ponto de atenção a confirmar nas demonstrações.",
        },
        {
          kind: "media",
          title: "Demonstração da letra A",
          description:
            "Demonstração visual da configuração da letra A: a mão fechada em punho, com os quatro dedos dobrados e o polegar apoiado ao lado deles, por fora. A imagem candidata está em curadoria e só será exibida quando houver licença confirmada e revisão especializada.",
          ...pendingLetterMedia("A"),
        },
        {
          kind: "text",
          heading: "Letra I — só o dedo mínimo estendido",
          body: "Na letra I, apenas o dedo mínimo fica estendido; os outros dedos e o polegar ficam dobrados. Cuidado: a letra J usa uma forma parecida — um ponto de atenção é que ela costuma envolver movimento, enquanto o I é estático.",
        },
        {
          kind: "media",
          title: "Demonstração da letra I",
          description:
            "Demonstração visual da configuração da letra I: apenas o dedo mínimo estendido, com os demais dedos e o polegar dobrados. A imagem candidata está em curadoria e só será exibida quando houver licença confirmada e revisão especializada.",
          ...pendingLetterMedia("I"),
        },
        {
          kind: "text",
          heading: "Comparando as quatro letras",
          body: "Recapitulando as formas: a letra B usa a mão aberta e plana, com os quatro dedos juntos; a letra L estende o indicador e abre o polegar; a letra A fecha a mão em punho; e a letra I estende somente o dedo mínimo. As quatro são configurações estáticas — nenhuma depende de movimento. As letras parecidas ficam como ponto de atenção: a letra S se aproxima da A, a G se aproxima da L e a J usa uma forma parecida com a I, mas costuma envolver movimento — as diferenças exatas serão confirmadas nas demonstrações e na revisão especializada.",
        },
        {
          kind: "exercise",
          exercise: {
            prompt:
              "Qual letra do alfabeto manual está sendo demonstrada na imagem?",
            promptMedia: pendingLetterMedia("B"),
            options: [
              {
                label: "Letra B",
                feedback:
                  "Isso mesmo: a imagem mostra a mão aberta e plana, com os quatro dedos juntos — a configuração da letra B.",
              },
              {
                label: "Letra L",
                feedback:
                  "Não: na letra L, o indicador fica estendido e o polegar aberto — a imagem mostra a mão aberta com os quatro dedos juntos.",
              },
              {
                label: "Letra A",
                feedback:
                  "Não: a letra A é um punho fechado — a imagem mostra a mão aberta.",
              },
              {
                label: "Letra I",
                feedback:
                  "Não: na letra I, só o dedo mínimo fica estendido — a imagem mostra os quatro dedos juntos.",
              },
            ],
            correctIndex: 0,
            explanation:
              "A letra B usa a mão aberta e plana: quatro dedos juntos e polegar dobrado sobre a palma.",
            descriptionVariant: {
              prompt:
                "Pela descrição: a demonstração mostra a mão aberta e estendida, com os quatro dedos juntos e o polegar dobrado sobre a palma. Qual letra é essa?",
              options: [
                {
                  label: "Letra B",
                  feedback:
                    "Correto: a descrição corresponde à configuração da letra B.",
                },
                {
                  label: "Letra L",
                  feedback:
                    "Não: a descrição da letra L tem o indicador estendido e o polegar aberto.",
                },
                {
                  label: "Letra A",
                  feedback:
                    "Não: a descrição da letra A é um punho fechado, não a mão aberta.",
                },
                {
                  label: "Letra I",
                  feedback:
                    "Não: na descrição da letra I, só o dedo mínimo fica estendido.",
                },
              ],
              correctIndex: 0,
              explanation:
                "Esta versão avalia a compreensão da descrição da letra B — não a identificação visual da configuração.",
            },
          },
        },
        {
          kind: "exercise",
          exercise: {
            prompt: "Qual destas imagens mostra a letra I?",
            options: [
              {
                label: "Imagem 1",
                feedback:
                  "Não: a imagem 1 mostra a mão aberta e plana — a configuração da letra B.",
                media: pendingLetterMedia("B"),
              },
              {
                label: "Imagem 2",
                feedback:
                  "Isso mesmo: a imagem 2 mostra somente o dedo mínimo estendido — a configuração da letra I.",
                media: pendingLetterMedia("I"),
              },
              {
                label: "Imagem 3",
                feedback:
                  "Não: a imagem 3 mostra o punho fechado — a configuração da letra A.",
                media: pendingLetterMedia("A"),
              },
            ],
            correctIndex: 1,
            explanation:
              "Na letra I, só o dedo mínimo fica estendido; os demais dedos e o polegar ficam dobrados.",
            descriptionVariant: {
              prompt:
                "Pela descrição: a imagem 1 mostra a mão aberta com os quatro dedos juntos; a imagem 2 mostra a mão fechada com apenas o dedo mínimo estendido; a imagem 3 mostra a mão fechada em punho com o polegar apoiado ao lado dos dedos. Qual imagem mostra a letra I?",
              options: [
                {
                  label: "Imagem 1",
                  feedback:
                    "Não: a imagem 1 descreve a configuração da letra B, a mão aberta e plana.",
                },
                {
                  label: "Imagem 2",
                  feedback:
                    "Correto: a imagem 2 descreve só o dedo mínimo estendido — a configuração da letra I.",
                },
                {
                  label: "Imagem 3",
                  feedback:
                    "Não: a imagem 3 descreve a configuração da letra A, o punho fechado.",
                },
              ],
              correctIndex: 1,
              explanation:
                "Esta versão avalia a compreensão das descrições das imagens — não a identificação visual das configurações.",
            },
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
          kind: "text",
          heading: "Recapitulando",
          body: "Você conheceu as configurações de mão de quatro letras do alfabeto manual — B, L, A e I — e aprendeu a observar a forma dos dedos e a orientação da mão. Quando as demonstrações visuais estiverem licenciadas, os exercícios de identificação passam a mostrar as imagens reais; até lá, a versão por descrição mantém a prática sem fingir avaliar o olhar.",
        },
        {
          kind: "resources",
          heading: "Recursos complementares",
          body: "Os links abaixo levam a sites externos de instituições que publicam materiais sobre o alfabeto manual de Libras. Eles são opcionais: servem para você continuar observando as configurações de mão depois da lição. Não são conteúdo do Sinaliza e ainda não passaram pela revisão da especialista — se um site estiver fora do ar, a lição continua completa sem ele.",
          items: [
            {
              title:
                "Alfabeto de Libras e Configuração de Mãos — publicação oficial",
              source: "Instituto Nacional de Educação de Surdos (INES) — gov.br",
              url: "https://www.gov.br/ines/pt-br/central-de-conteudos/publicacoes-1/todas-as-publicacoes/alfabeto-manual-e-configuracao-de-maos",
              description:
                "Página oficial do INES com a publicação do alfabeto manual: um cartaz com a configuração de mão de todas as letras, incluindo B, L, A e I, para consulta e revisão visual.",
            },
            {
              title:
                "Videoaula 1 — alfabeto, numerais e primeiros conteúdos de Libras",
              source:
                "Universidade Estadual Paulista (Unesp) — Acervo Digital / Univesp TV",
              url: "https://acervodigital.unesp.br/handle/unesp/222981",
              description:
                "Videoaula universitária aberta (CC BY-NC-SA 4.0) que apresenta o alfabeto de Libras junto de numerais, pronomes e parâmetros dos sinais — útil para ver as configurações de mão demonstradas com sinais e legendas.",
            },
          ],
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
 * An entry is publishable — its draft rendered by the lesson page — only
 * when it reached `expert-validated` AND the full review chain (research,
 * technical, expert) covers the current content version — a bare status or
 * a stale review is never enough. The draft itself must exist and be
 * well-formed.
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
