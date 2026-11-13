/**
 * Local content source for the learning journey.
 *
 * This module is the seam where a future backend (Supabase) integration plugs in:
 * pages read exclusively through `getLearningPaths()` / `getLearningPath(slug)`,
 * which today return this typed local data and can later become async fetchers
 * without changing the UI layer.
 */

export type LessonStatus = "planned" | "available";

export interface Lesson {
  slug: string;
  title: string;
  status: LessonStatus;
}

export interface CourseModule {
  slug: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export type LearningPathIcon = "alphabet" | "vocabulary";

export interface LearningPath {
  slug: string;
  title: string;
  summary: string;
  goal: string;
  icon: LearningPathIcon;
  modules: CourseModule[];
  /** Honest note shown when lesson content is still being prepared/validated. */
  contentNote: string;
}

const plannedLesson = (slug: string, title: string): Lesson => ({
  slug,
  title,
  status: "planned",
});

const alphabetLetters = [
  "A", "B", "C", "D", "E",
  "F", "G", "H", "I", "J",
  "K", "L", "M", "N", "O",
  "P", "Q", "R", "S", "T",
  "U", "V", "W", "X", "Y", "Z",
] as const;

const letterGroup = (
  slug: string,
  title: string,
  description: string,
  letters: readonly string[],
): CourseModule => ({
  slug,
  title,
  description,
  lessons: letters.map((letter) =>
    plannedLesson(`letra-${letter.toLowerCase()}`, `Letra ${letter}`),
  ),
});

export const learningPaths: LearningPath[] = [
  {
    slug: "alfabeto",
    title: "Alfabeto manual",
    summary:
      "A datilologia — a soletração de palavras com as mãos — é a porta de entrada para a Libras.",
    goal: "Reconhecer e praticar as 26 configurações de mão do alfabeto manual de Libras, passo a passo.",
    icon: "alphabet",
    contentNote:
      "As demonstrações visuais de cada letra estão em preparação e passarão por validação pedagógica antes de serem publicadas.",
    modules: [
      {
        slug: "primeiros-passos",
        title: "Primeiros passos",
        description:
          "O que é o alfabeto manual, quando ele é usado em Libras e como aproveitar melhor a trilha.",
        lessons: [
          plannedLesson("o-que-e", "O que é a datilologia"),
          plannedLesson("quando-usar", "Quando a soletração manual é usada"),
        ],
      },
      letterGroup(
        "letras-a-e",
        "Letras A–E",
        "Primeiro grupo de configurações de mão.",
        alphabetLetters.slice(0, 5),
      ),
      letterGroup(
        "letras-f-j",
        "Letras F–J",
        "Segundo grupo de configurações de mão.",
        alphabetLetters.slice(5, 10),
      ),
      letterGroup(
        "letras-k-o",
        "Letras K–O",
        "Terceiro grupo de configurações de mão.",
        alphabetLetters.slice(10, 15),
      ),
      letterGroup(
        "letras-p-t",
        "Letras P–T",
        "Quarto grupo de configurações de mão.",
        alphabetLetters.slice(15, 20),
      ),
      letterGroup(
        "letras-u-z",
        "Letras U–Z",
        "Último grupo de configurações de mão.",
        alphabetLetters.slice(20),
      ),
    ],
  },
  {
    slug: "vocabulario",
    title: "Vocabulário básico",
    summary:
      "Sinais do dia a dia organizados por tema, para usar em conversas reais desde o início.",
    goal: "Aprender sinais cotidianos em Libras por contexto: saudações, apresentações, família, números e perguntas básicas.",
    icon: "vocabulary",
    contentNote:
      "Os sinais de cada lição estão em preparação e passarão por validação pedagógica antes de serem publicados.",
    modules: [
      {
        slug: "saudacoes",
        title: "Saudações",
        description: "Cumprimentos e cortesias para iniciar e encerrar conversas.",
        lessons: [
          plannedLesson("ola", "Olá"),
          plannedLesson("bom-dia", "Bom dia"),
          plannedLesson("boa-tarde", "Boa tarde"),
          plannedLesson("boa-noite", "Boa noite"),
          plannedLesson("tudo-bem", "Tudo bem?"),
          plannedLesson("obrigado", "Obrigado(a)"),
          plannedLesson("por-favor", "Por favor"),
        ],
      },
      {
        slug: "apresentacoes",
        title: "Apresentações",
        description: "Se apresentar e conhecer outras pessoas.",
        lessons: [
          plannedLesson("meu-nome", "Meu nome é…"),
          plannedLesson("prazer", "Prazer em conhecer você"),
          plannedLesson("como-voce-esta", "Como você está?"),
          plannedLesson("de-onde-voce-e", "De onde você é?"),
        ],
      },
      {
        slug: "familia-e-pessoas",
        title: "Família e pessoas",
        description: "Sinais para falar de familiares e pessoas próximas.",
        lessons: [
          plannedLesson("mae", "Mãe"),
          plannedLesson("pai", "Pai"),
          plannedLesson("irmao-irma", "Irmão e irmã"),
          plannedLesson("familia", "Família"),
          plannedLesson("amigo", "Amigo(a)"),
        ],
      },
      {
        slug: "numeros",
        title: "Números",
        description: "Contar e expressar quantidades do dia a dia.",
        lessons: [
          plannedLesson("um-a-cinco", "Números de 1 a 5"),
          plannedLesson("seis-a-dez", "Números de 6 a 10"),
        ],
      },
      {
        slug: "expressoes-cotidianas",
        title: "Expressões cotidianas",
        description: "Respostas e pedidos frequentes no cotidiano.",
        lessons: [
          plannedLesson("sim", "Sim"),
          plannedLesson("nao", "Não"),
          plannedLesson("ajuda", "Ajuda"),
          plannedLesson("agua", "Água"),
          plannedLesson("comer", "Comer"),
        ],
      },
      {
        slug: "perguntas-basicas",
        title: "Perguntas básicas",
        description: "Palavras interrogativas para fazer perguntas simples.",
        lessons: [
          plannedLesson("o-que", "O quê?"),
          plannedLesson("onde", "Onde?"),
          plannedLesson("quando", "Quando?"),
          plannedLesson("quem", "Quem?"),
          plannedLesson("por-que", "Por quê?"),
        ],
      },
    ],
  },
];

export function getLearningPaths(): LearningPath[] {
  return learningPaths;
}

export function getLearningPath(slug: string): LearningPath | undefined {
  return learningPaths.find((path) => path.slug === slug);
}

export interface PathStats {
  moduleCount: number;
  lessonCount: number;
}

export function getPathStats(path: LearningPath): PathStats {
  return {
    moduleCount: path.modules.length,
    lessonCount: path.modules.reduce(
      (total, module) => total + module.lessons.length,
      0,
    ),
  };
}
