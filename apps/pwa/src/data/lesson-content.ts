/**
 * Typed lesson content model.
 *
 * Lessons in `learning-paths.ts` describe structure and objectives only.
 * This module defines the blocks a lesson page can render once material is
 * validated — explanatory text and multiple-choice exercises — plus the seam
 * where a future backend integration plugs in.
 *
 * `demoLesson` is NOT Libras educational material: it is neutral content about
 * the lesson mechanics themselves, used by `/laboratorio/licao` to exercise the
 * interface end to end while real content awaits pedagogical/linguistic
 * validation. Its media step uses synthetic generated fixtures under
 * `public/media/fixtures/` — test-only assets, not sign demonstrations.
 */

export interface LessonTextBlock {
  kind: "text";
  heading: string;
  body: string;
}

export interface LessonExerciseOption {
  label: string;
  /** Short explanation shown when this option is selected. */
  feedback: string;
}

export interface LessonExercise {
  prompt: string;
  options: LessonExerciseOption[];
  correctIndex: number;
  /** Shown after the correct answer is selected. */
  explanation: string;
}

export interface LessonExerciseBlock {
  kind: "exercise";
  exercise: LessonExercise;
}

export interface LessonCaptionTrack {
  /** URL of a WebVTT (.vtt) caption file. */
  src: string;
  /** BCP-47 language tag, e.g. "pt-BR". */
  srclang: string;
  /** Label shown in the player's caption menu, e.g. "Português". */
  label: string;
}

export interface LessonVideoMedia {
  type: "video";
  src: string;
  /** Optional still shown before playback and while metadata loads. */
  poster?: string;
  /** Optional WebVTT caption track. */
  captions?: LessonCaptionTrack;
}

export interface LessonImageMedia {
  type: "image";
  src: string;
  /** Alternative text describing what the image shows. */
  alt: string;
}

export type LessonMedia = LessonVideoMedia | LessonImageMedia;

/**
 * Who made an asset and under what terms it may be used. `source` and
 * `license` are always required — a public URL is NOT permission to reuse,
 * so attribution/license can never be omitted silently.
 */
export interface LessonMediaAttribution {
  /** Author or institution that produced the asset. */
  source: string;
  /** Where the asset or its rights information lives. */
  sourceUrl?: string;
  /** License name, e.g. "CC BY 4.0", or "Produção própria". */
  license: string;
  licenseUrl?: string;
}

/**
 * A lesson step demonstrating a sign/concept through media. `title` is the
 * accessible name (step heading + video label); `description` must stand on
 * its own for anyone who cannot or does not play the media. Media steps
 * advance freely — watching is never required for completion.
 */
export interface LessonMediaBlock {
  kind: "media";
  title: string;
  description: string;
  media: LessonMedia;
  attribution: LessonMediaAttribution;
}

export type LessonBlock =
  | LessonTextBlock
  | LessonExerciseBlock
  | LessonMediaBlock;

export interface LessonContent {
  intro: string;
  blocks: LessonBlock[];
}

/**
 * Well-formedness rules the runner relies on to stay completable and
 * accessible. Returns a list of problems; an empty list means the content
 * is safe to publish. Registry tests run this on every entry so malformed
 * media/exercises cannot silently ship.
 */
export function validateLessonContent(content: LessonContent): string[] {
  const problems: string[] = [];
  if (!content.intro.trim()) problems.push("lesson: missing intro");
  if (content.blocks.length === 0) problems.push("lesson: no blocks");

  content.blocks.forEach((block, i) => {
    const at = `block ${i} (${block.kind})`;
    switch (block.kind) {
      case "text":
        if (!block.heading.trim()) problems.push(`${at}: missing heading`);
        if (!block.body.trim()) problems.push(`${at}: missing body`);
        break;
      case "exercise": {
        const { prompt, options, correctIndex, explanation } = block.exercise;
        if (!prompt.trim()) problems.push(`${at}: missing prompt`);
        if (options.length < 2)
          problems.push(`${at}: fewer than 2 options`);
        if (correctIndex < 0 || correctIndex >= options.length)
          problems.push(`${at}: correctIndex out of bounds`);
        if (!explanation.trim()) problems.push(`${at}: missing explanation`);
        options.forEach((option, j) => {
          if (!option.label.trim())
            problems.push(`${at}: option ${j} missing label`);
          if (!option.feedback.trim())
            problems.push(`${at}: option ${j} missing feedback`);
        });
        break;
      }
      case "media":
        problems.push(
          ...validateMediaBlock(block).map((problem) => `${at}: ${problem}`),
        );
        break;
    }
  });

  return problems;
}

function validateMediaBlock(block: LessonMediaBlock): string[] {
  const problems: string[] = [];
  if (!block.title.trim()) problems.push("missing title");
  if (!block.description.trim()) problems.push("missing description");
  if (!block.attribution.source.trim())
    problems.push("missing attribution.source");
  if (!block.attribution.license.trim())
    problems.push("missing attribution.license");

  const { media } = block;
  if (!media.src.trim()) problems.push("missing media src");
  if (media.type === "image" && !media.alt.trim())
    problems.push("image: missing alt text");
  if (media.type === "video" && media.captions) {
    const { src, srclang, label } = media.captions;
    if (!src.trim() || !src.endsWith(".vtt"))
      problems.push("captions: src must be a .vtt file");
    if (!srclang.trim()) problems.push("captions: missing srclang");
    if (!label.trim()) problems.push("captions: missing label");
  }
  return problems;
}

/**
 * Registry of validated lesson material, keyed by the same
 * `trilha/modulo/licao` identifier the progress store uses.
 *
 * Empty today: no lesson material has passed pedagogical/linguistic
 * validation yet. Publishing a lesson is a data change only — add its
 * `LessonContent` here and flip its `LessonStatus` to `"available"` in
 * `learning-paths.ts`; the lesson page then renders the runner and records
 * real completion automatically. `lesson-content.test.ts` guards that
 * entries here only point at real, available lessons and that every
 * exercise is well-formed enough to be completable.
 */
export const lessonContents: Record<string, LessonContent> = {};

/**
 * Content seam, mirroring `getLessonContext` in `learning-paths.ts`: pages
 * read through this getter so the local registry can later become a backend
 * fetch without touching the UI layer.
 */
export function getLessonContent(
  pathSlug: string,
  moduleSlug: string,
  lessonSlug: string,
): LessonContent | undefined {
  return lessonContents[`${pathSlug}/${moduleSlug}/${lessonSlug}`];
}

export const demoLesson: LessonContent = {
  intro:
    "Esta demonstração mostra como uma lição do Sinaliza funciona: passos de explicação, exercícios de múltipla escolha com retorno imediato e um estado de conclusão. O conteúdo fala sobre a própria interface — não é material educacional de Libras.",
  blocks: [
    {
      kind: "text",
      heading: "Como uma lição é organizada",
      body: "Uma lição mistura blocos de explicação, como este, com exercícios interativos. Você avança no seu ritmo: blocos de texto têm um botão para continuar, e exercícios só liberam o avanço depois de uma resposta correta.",
    },
    {
      kind: "exercise",
      exercise: {
        prompt:
          "Nesta interface, quando você pode avançar depois de responder um exercício?",
        options: [
          {
            label: "Imediatamente, antes de escolher qualquer opção",
            feedback:
              "Não é isso: o avanço só aparece depois de você responder — a lição precisa saber como você foi.",
          },
          {
            label: "Somente depois de acertar a resposta",
            feedback:
              "Exato: uma resposta incorreta mostra o porquê e permite tentar de novo; o avanço só é liberado após o acerto.",
          },
          {
            label: "Depois de responder errado três vezes",
            feedback:
              "Não há limite de tentativas: você pode repetir o exercício até acertar.",
          },
        ],
        correctIndex: 1,
        explanation:
          "Respostas erradas são parte do aprendizado: o retorno explica o erro e libera uma nova tentativa, sem penalidade.",
      },
    },
    {
      kind: "media",
      title: "Demonstração visual (ativo sintético de teste)",
      description:
        "Este passo mostra como uma demonstração em vídeo aparece dentro de uma lição: o player tem controles nativos, legendas opcionais e nunca inicia sozinho. O arquivo é um padrão sintético gerado para testar a interface — não é uma demonstração de sinal.",
      media: {
        type: "video",
        src: "/media/fixtures/demo-pulse.mp4",
        poster: "/media/fixtures/demo-poster.png",
        captions: {
          src: "/media/fixtures/demo-captions.vtt",
          srclang: "pt-BR",
          label: "Português",
        },
      },
      attribution: {
        source: "Sinaliza — ativo sintético gerado para testes",
        license: "Uso interno em testes de interface",
      },
    },
    {
      kind: "text",
      heading: "O que o retorno mostra",
      body: "Cada opção traz uma explicação curta. Ao acertar, você vê uma síntese do conceito antes de seguir — o objetivo é reforçar o entendimento, não apenas marcar certo ou errado.",
    },
    {
      kind: "exercise",
      exercise: {
        prompt:
          "O que acontece com o progresso desta demonstração quando você sai da página?",
        options: [
          {
            label: "Ela conclui uma lição de verdade na sua trilha",
            feedback:
              "Não: demonstrações do laboratório ficam separadas e nunca contam como lições concluídas.",
          },
          {
            label: "É enviado para um servidor do Sinaliza",
            feedback:
              "Não: nada sai do seu navegador, e a demonstração nem sequer é salva localmente.",
          },
          {
            label: "Nada é registrado — a demo não afeta seu progresso real",
            feedback:
              "Correto: o laboratório é isolado. O progresso de lições reais usa uma área própria e nunca mistura atividade de demonstração.",
          },
        ],
        correctIndex: 2,
        explanation:
          "O progresso real é guardado apenas para lições validadas das trilhas; atividade do laboratório não entra nas suas estatísticas.",
      },
    },
  ],
};
