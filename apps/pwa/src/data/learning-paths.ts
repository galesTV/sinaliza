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
  /** What the lesson aims to teach — an objective, not the instructional content itself. */
  objective: string;
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

const plannedLesson = (slug: string, title: string, objective: string): Lesson => ({
  slug,
  title,
  status: "planned",
  objective,
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
    plannedLesson(
      `letra-${letter.toLowerCase()}`,
      `Letra ${letter}`,
      `Reconhecer e praticar a configuração de mão da letra ${letter} do alfabeto manual.`,
    ),
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
          plannedLesson(
            "o-que-e",
            "O que é a datilologia",
            "Entender o que é a datilologia e o papel dela dentro da Libras.",
          ),
          plannedLesson(
            "quando-usar",
            "Quando a soletração manual é usada",
            "Reconhecer situações do cotidiano em que a soletração manual aparece.",
          ),
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
          plannedLesson("ola", "Olá", "Aprender o sinal de “Olá” para iniciar uma conversa."),
          plannedLesson("bom-dia", "Bom dia", "Aprender a saudação “Bom dia”."),
          plannedLesson("boa-tarde", "Boa tarde", "Aprender a saudação “Boa tarde”."),
          plannedLesson("boa-noite", "Boa noite", "Aprender a saudação “Boa noite”."),
          plannedLesson("tudo-bem", "Tudo bem?", "Aprender a perguntar “Tudo bem?”."),
          plannedLesson("obrigado", "Obrigado(a)", "Aprender a agradecer em Libras."),
          plannedLesson("por-favor", "Por favor", "Aprender a pedir algo com “Por favor”."),
        ],
      },
      {
        slug: "apresentacoes",
        title: "Apresentações",
        description: "Se apresentar e conhecer outras pessoas.",
        lessons: [
          plannedLesson("meu-nome", "Meu nome é…", "Aprender a se apresentar dizendo o próprio nome."),
          plannedLesson("prazer", "Prazer em conhecer você", "Aprender a sinalizar “Prazer em conhecer você”."),
          plannedLesson("como-voce-esta", "Como você está?", "Aprender a perguntar “Como você está?”."),
          plannedLesson("de-onde-voce-e", "De onde você é?", "Aprender a perguntar “De onde você é?”."),
        ],
      },
      {
        slug: "familia-e-pessoas",
        title: "Família e pessoas",
        description: "Sinais para falar de familiares e pessoas próximas.",
        lessons: [
          plannedLesson("mae", "Mãe", "Aprender o sinal de “Mãe”."),
          plannedLesson("pai", "Pai", "Aprender o sinal de “Pai”."),
          plannedLesson("irmao-irma", "Irmão e irmã", "Aprender os sinais de “Irmão” e “Irmã”."),
          plannedLesson("familia", "Família", "Aprender o sinal de “Família”."),
          plannedLesson("amigo", "Amigo(a)", "Aprender os sinais de “Amigo” e “Amiga”."),
        ],
      },
      {
        slug: "numeros",
        title: "Números",
        description: "Contar e expressar quantidades do dia a dia.",
        lessons: [
          plannedLesson("um-a-cinco", "Números de 1 a 5", "Aprender a sinalizar os números de 1 a 5."),
          plannedLesson("seis-a-dez", "Números de 6 a 10", "Aprender a sinalizar os números de 6 a 10."),
        ],
      },
      {
        slug: "expressoes-cotidianas",
        title: "Expressões cotidianas",
        description: "Respostas e pedidos frequentes no cotidiano.",
        lessons: [
          plannedLesson("sim", "Sim", "Aprender o sinal de “Sim”."),
          plannedLesson("nao", "Não", "Aprender o sinal de “Não”."),
          plannedLesson("ajuda", "Ajuda", "Aprender a pedir ajuda."),
          plannedLesson("agua", "Água", "Aprender o sinal de “Água”."),
          plannedLesson("comer", "Comer", "Aprender o sinal de “Comer”."),
        ],
      },
      {
        slug: "perguntas-basicas",
        title: "Perguntas básicas",
        description: "Palavras interrogativas para fazer perguntas simples.",
        lessons: [
          plannedLesson("o-que", "O quê?", "Aprender a palavra interrogativa “O quê?”."),
          plannedLesson("onde", "Onde?", "Aprender a palavra interrogativa “Onde?”."),
          plannedLesson("quando", "Quando?", "Aprender a palavra interrogativa “Quando?”."),
          plannedLesson("quem", "Quem?", "Aprender a palavra interrogativa “Quem?”."),
          plannedLesson("por-que", "Por quê?", "Aprender a palavra interrogativa “Por quê?”."),
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

/** Stable lesson URL — single source for the nested route shape. */
export function getLessonUrl(
  pathSlug: string,
  moduleSlug: string,
  lessonSlug: string,
): string {
  return `/trilhas/${pathSlug}/${moduleSlug}/${lessonSlug}`;
}

export interface LessonContext {
  path: LearningPath;
  module: CourseModule;
  lesson: Lesson;
  /** 1-based position of the lesson inside its module. */
  position: number;
  lessonCount: number;
  previous: Lesson | undefined;
  next: Lesson | undefined;
}

export function getLessonContext(
  pathSlug: string,
  moduleSlug: string,
  lessonSlug: string,
): LessonContext | undefined {
  const path = getLearningPath(pathSlug);
  const courseModule = path?.modules.find((item) => item.slug === moduleSlug);
  const index =
    courseModule?.lessons.findIndex((item) => item.slug === lessonSlug) ?? -1;
  if (!path || !courseModule || index < 0) return undefined;

  return {
    path,
    module: courseModule,
    lesson: courseModule.lessons[index],
    position: index + 1,
    lessonCount: courseModule.lessons.length,
    previous: index > 0 ? courseModule.lessons[index - 1] : undefined,
    next:
      index < courseModule.lessons.length - 1
        ? courseModule.lessons[index + 1]
        : undefined,
  };
}
