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
  /**
   * Optional image that presents this option (e.g. a demonstration photo
   * for "which of these is the letter B?"). Image-only by type. Subject to
   * the same display gate as the prompt stimulus: an option whose media
   * cannot be shown makes the exercise non-answerable.
   */
  media?: LessonExerciseOptionMedia;
}

/**
 * Media attached to an exercise — a visual stimulus or an option
 * presentation — plus its authorship/licensing record. `description` is
 * shown beside the media and is also the standalone textual description
 * screen readers rely on when it serves as the stimulus description.
 */
export interface LessonExerciseMedia {
  media: LessonMedia;
  attribution: LessonMediaAttribution;
  /** Standalone description shown with the media. */
  description?: string;
}

/**
 * Option media is image-only: a video thumbnail inside a radio option has
 * no honest accessible form, so the type and the structural validation
 * both restrict it to `LessonImageMedia`.
 */
export interface LessonExerciseOptionMedia {
  media: LessonImageMedia;
  attribution: LessonMediaAttribution;
  /** Standalone description shown with the media. */
  description?: string;
}

/**
 * Description-based counterpart of a visual exercise, offered when the
 * stimulus cannot be displayed (permission gate or load failure) or when
 * the learner prefers reading to watching. It is a DIFFERENT assessment —
 * recognition from a verbal description, not visual identification — and
 * the UI labels it as such. Pedagogical equivalence is not claimed until
 * expert validation. The variant never carries media.
 */
export interface LessonDescriptionVariant {
  prompt: string;
  options: LessonExerciseOption[];
  correctIndex: number;
  explanation: string;
}

export interface LessonExercise {
  prompt: string;
  /**
   * Optional visual stimulus the question refers to (e.g. a hand
   * configuration photo). When present, it is essential: if it cannot be
   * displayed, the exercise cannot be answered — the description variant
   * is offered instead, or the exercise stays blocked.
   */
  promptMedia?: LessonExerciseMedia;
  /**
   * Text-only counterpart used when essential media is unavailable or
   * when the learner chooses to answer from a description instead of a
   * visual demonstration.
   */
  descriptionVariant?: LessonDescriptionVariant;
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
  /** Intrinsic dimensions reserve the correct layout box before the asset loads. */
  width?: number;
  height?: number;
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
  /**
   * Reference to the recorded proof that reuse is permitted — a license
   * URL, an authorization document, or an own-production note. The
   * display gate (`hasMediaDisplayPermission`) requires this field to be
   * non-empty before any asset is rendered.
   *
   * Limit of the technical gate: it verifies that evidence was
   * *recorded*, not that it is legally valid. A non-empty string is a
   * tripwire against publishing unlicensed media by omission — the human
   * review chain (research/technical/expert) is responsible for checking
   * that the referenced evidence actually authorizes the use.
   */
  permissionEvidence?: string;
  /**
   * Reference to the recorded proof that the asset may be distributed as
   * published lesson media. Display permission alone is not enough: review
   * assets can be authorized for local pedagogical evaluation while public
   * redistribution remains unresolved. Publishing is fail-closed without
   * this separate evidence.
   */
  publicationEvidence?: string;
  /**
   * Display scope of the recorded permission. `local-review` marks assets
   * that may appear only in non-public review environments; public
   * deployments must strip display permission before the media reaches the
   * learner-facing runtime.
   */
  displayScope?: "public" | "local-review";
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

/**
 * One link in a `LessonResourcesBlock`: an external website the learner
 * may visit for extra reference or practice. Links only — a lesson never
 * embeds, copies or depends on third-party media, and a resource being
 * unreachable must never affect the lesson.
 */
export interface LessonExternalResource {
  /** Descriptive link label that makes sense out of context. */
  title: string;
  /** Institution or site responsible for the resource. */
  source: string;
  /** External page the link opens — https required. */
  url: string;
  /** Why the resource may help with this lesson's content. */
  description: string;
}

/**
 * Optional block of complementary external resources. It frames a list of
 * outside links clearly as not-Sinaliza content, advances freely like a
 * text step, never blocks completion and records nothing — the runner
 * treats it as a non-exercise step.
 */
export interface LessonResourcesBlock {
  kind: "resources";
  heading: string;
  /** Framing paragraph: what these links are and what they are not. */
  body: string;
  items: LessonExternalResource[];
}

export type LessonBlock =
  | LessonTextBlock
  | LessonExerciseBlock
  | LessonMediaBlock
  | LessonResourcesBlock;

/**
 * Display gate shared by lesson media blocks and exercise media: an asset
 * may be rendered only when its attribution records author, license and a
 * non-empty permission evidence reference. Fail-closed — anything missing
 * means "not cleared", never "probably fine".
 *
 * What the gate does NOT prove: the legal validity of the evidence. A
 * recorded string claims permission exists; verifying it is a human
 * review task, not something the type system or this predicate can do.
 */
export function hasMediaDisplayPermission(
  attribution?: LessonMediaAttribution,
): boolean {
  return (
    Boolean(attribution) &&
    attribution!.source.trim().length > 0 &&
    attribution!.license.trim().length > 0 &&
    Boolean(attribution!.permissionEvidence?.trim())
  );
}

/**
 * Publication gate for lesson media. It is intentionally separate from
 * display permission: an asset can be cleared for a local review preview
 * while its public redistribution remains unresolved. Published lessons
 * require explicit distribution evidence for every media item, and a
 * `local-review` scope must be deliberately changed before publication.
 */
export function hasMediaPublicationPermission(
  attribution?: LessonMediaAttribution,
): boolean {
  return (
    hasMediaDisplayPermission(attribution) &&
    attribution!.displayScope !== "local-review" &&
    Boolean(attribution!.publicationEvidence?.trim())
  );
}

/** Every media declared by an exercise (stimulus plus option media). */
export function exerciseMediaList(
  exercise: LessonExercise,
): LessonExerciseMedia[] {
  return [
    ...(exercise.promptMedia ? [exercise.promptMedia] : []),
    ...exercise.options.flatMap((option) => (option.media ? [option.media] : [])),
  ];
}

/**
 * Whether every media the exercise depends on has recorded permission
 * evidence. A visual exercise with any unpermitted media cannot be
 * answered — the learner must not guess at a hidden stimulus.
 */
export function isExerciseVisuallyPermitted(exercise: LessonExercise): boolean {
  return exerciseMediaList(exercise).every((item) =>
    hasMediaDisplayPermission(item.attribution),
  );
}

export interface LessonContent {
  intro: string;
  blocks: LessonBlock[];
}

/** Every media item declared anywhere in lesson content. */
export function lessonMediaList(
  content: LessonContent,
): LessonExerciseMedia[] {
  return content.blocks.flatMap((block) => {
    if (block.kind === "media") {
      return [
        {
          media: block.media,
          attribution: block.attribution,
        },
      ];
    }
    if (block.kind === "exercise") return exerciseMediaList(block.exercise);
    return [];
  });
}

/** True while `src` is still an opaque local-review reference rather than a resolvable distributable media path or URL. */
export function isLocalReviewMediaReference(src: string): boolean {
  return src.startsWith("local-review:");
}

/** Media problems that make content ineligible for publication. */
export function validateLessonPublicationMedia(
  content: LessonContent,
): string[] {
  return lessonMediaList(content).flatMap((item, index) => {
    const problems: string[] = [];
    if (isLocalReviewMediaReference(item.media.src)) {
      problems.push(`media ${index}: unresolved local-review media reference`);
    }
    if (!hasMediaPublicationPermission(item.attribution)) {
      problems.push(`media ${index}: missing publication evidence`);
    }
    return problems;
  });
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
      case "exercise":
        problems.push(
          ...validateExercise(block.exercise).map(
            (problem) => `${at}: ${problem}`,
          ),
        );
        break;
      case "media":
        problems.push(
          ...validateMediaBlock(block).map((problem) => `${at}: ${problem}`),
        );
        break;
      case "resources":
        problems.push(
          ...validateResourcesBlock(block).map(
            (problem) => `${at}: ${problem}`,
          ),
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
  problems.push(...validateAttribution(block.attribution));
  problems.push(...validateLessonMedia(block.media));
  return problems;
}

function validateAttribution(attribution: LessonMediaAttribution): string[] {
  const problems: string[] = [];
  if (!attribution.source.trim()) problems.push("missing attribution.source");
  if (!attribution.license.trim()) problems.push("missing attribution.license");
  // `permissionEvidence` is intentionally NOT a structural problem: drafts
  // are expected to carry media blocks whose permission is still pending —
  // the runtime display gate (`hasMediaDisplayPermission`) is what stops
  // the asset from rendering. Validating the evidence itself is a human
  // review task anyway.
  return problems;
}

function validateResourcesBlock(block: LessonResourcesBlock): string[] {
  const problems: string[] = [];
  if (!block.heading.trim()) problems.push("missing heading");
  if (!block.body.trim()) problems.push("missing body");
  if (block.items.length === 0) problems.push("no resources");
  block.items.forEach((item, i) => {
    const at = `resource ${i}`;
    if (!item.title.trim()) problems.push(`${at}: missing title`);
    if (!item.source.trim()) problems.push(`${at}: missing source`);
    // Learner-facing external links must be absolute TLS URLs — a
    // relative path or insecure link can never ship as a resource.
    if (!/^https:\/\//.test(item.url))
      problems.push(`${at}: url must be an external https link`);
    if (!item.description.trim()) problems.push(`${at}: missing description`);
  });
  return problems;
}

function validateExerciseMedia(item: LessonExerciseMedia): string[] {
  return [
    ...validateAttribution(item.attribution),
    ...validateLessonMedia(item.media),
  ];
}

function validateExerciseCore(
  core: {
    prompt: string;
    options: LessonExerciseOption[];
    correctIndex: number;
    explanation: string;
  },
  allowOptionMedia: boolean,
): string[] {
  const problems: string[] = [];
  if (!core.prompt.trim()) problems.push("missing prompt");
  if (core.options.length < 2) problems.push("fewer than 2 options");
  if (core.correctIndex < 0 || core.correctIndex >= core.options.length)
    problems.push("correctIndex out of bounds");
  if (!core.explanation.trim()) problems.push("missing explanation");
  core.options.forEach((option, j) => {
    if (!option.label.trim()) problems.push(`option ${j} missing label`);
    if (!option.feedback.trim()) problems.push(`option ${j} missing feedback`);
    if (option.media) {
      if (!allowOptionMedia) {
        problems.push(`option ${j}: media not allowed in description variant`);
      } else {
        if (option.media.media.type !== "image") {
          problems.push(`option ${j} media: only image media is supported`);
        }
        problems.push(
          ...validateExerciseMedia(option.media).map(
            (problem) => `option ${j} media: ${problem}`,
          ),
        );
      }
    }
  });
  return problems;
}

function validateExercise(exercise: LessonExercise): string[] {
  const problems: string[] = [];
  const hasMedia =
    Boolean(exercise.promptMedia) ||
    exercise.options.some((option) => option.media);

  if (exercise.promptMedia) {
    problems.push(
      ...validateExerciseMedia(exercise.promptMedia).map(
        (problem) => `promptMedia: ${problem}`,
      ),
    );
  }
  problems.push(...validateExerciseCore(exercise, true));

  if (exercise.descriptionVariant) {
    // A description variant only makes sense as an alternative path for
    // media-dependent exercises; on a text-only exercise it is dead data.
    if (!hasMedia)
      problems.push(
        "descriptionVariant: requires promptMedia or option.media",
      );
    problems.push(
      ...validateExerciseCore(exercise.descriptionVariant, false).map(
        (problem) => `descriptionVariant: ${problem}`,
      ),
    );
  }
  return problems;
}

/**
 * Structural rules for a single media asset — empty means the asset is
 * well-formed. Shared by `validateMediaBlock` (published lesson content)
 * and the alphabet specimen catalog, so the same asset shape is enforced
 * wherever media can ship.
 */
export function validateLessonMedia(media: LessonMedia): string[] {
  const problems: string[] = [];
  if (!media.src.trim()) problems.push("missing media src");
  if (media.type === "image") {
    if (!media.alt.trim()) problems.push("image: missing alt text");
    if ((media.width == null) !== (media.height == null))
      problems.push("image: width and height must be recorded together");
    if (
      (media.width != null && (!Number.isInteger(media.width) || media.width <= 0)) ||
      (media.height != null &&
        (!Number.isInteger(media.height) || media.height <= 0))
    )
      problems.push("image: dimensions must be positive integers");
  }
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
 * Published lesson content has no dedicated registry by design: the
 * lesson page renders the catalog entry's own `draft` once the entry is
 * publishable (expert-validated with the full review chain covering the
 * current `version`), so the content shown to the learner is always the
 * exact draft the reviewers approved — a second source could diverge
 * unnoticed. Publishing a lesson is therefore a single data change:
 * flip its `LessonStatus` to `"available"` in `learning-paths.ts`.
 */

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
        permissionEvidence:
          "Ativo sintético produzido pelo próprio projeto Sinaliza para testes de interface; não reproduz conteúdo de terceiros.",
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

/**
 * Guided learning experience for `/laboratorio/experiencia` — the integrated
 * walkthrough of the full activity flow (objective → explanation → visual
 * demonstration → exercise → feedback → conclusion). Like `demoLesson`, it
 * is NOT Libras educational material: the content describes the platform
 * itself and points at the alphabet specimens catalogued for curation. Its
 * media step reuses the same synthetic fixture — a labeled test asset, not
 * a sign demonstration — because no licensed sign media exists yet.
 */
export const guidedExperience: LessonContent = {
  intro:
    "Esta experiência percorre o fluxo completo de uma atividade de aprendizagem do Sinaliza: objetivo, explicação, demonstração visual quando há mídia autorizada, exercícios com retorno imediato e conclusão. O conteúdo fala sobre a própria plataforma — não é material pedagógico validado de Libras.",
  blocks: [
    {
      kind: "text",
      heading: "O que você vai percorrer",
      body: "O objetivo desta atividade é mostrar como uma experiência de aprendizagem funciona do início ao fim: cada etapa aparece em sequência, você avança no seu ritmo e recebe retorno a cada exercício. Ao final, a experiência mostra onde estão os primeiros espécimes visuais do alfabeto manual, ainda em curadoria.",
    },
    {
      kind: "text",
      heading: "Como o conteúdo é organizado",
      body: "No Sinaliza, o aprendizado é organizado em trilhas, módulos e lições. Cada lição mistura explicações curtas, demonstrações visuais e exercícios de múltipla escolha. Antes de ser publicada, toda lição passa por revisão de pesquisa, revisão técnica e validação de um especialista — material em revisão fica no laboratório, marcado como rascunho.",
    },
    {
      kind: "media",
      title: "Demonstração visual (ativo sintético de teste)",
      description:
        "Este passo mostra como uma demonstração visual aparece dentro de uma experiência de aprendizagem. O arquivo é um padrão sintético gerado para testar a interface — não é uma demonstração de sinal. As demonstrações reais das letras ainda estão em produção e só serão exibidas com licença confirmada.",
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
        permissionEvidence:
          "Ativo sintético produzido pelo próprio projeto Sinaliza para testes de interface; não reproduz conteúdo de terceiros.",
      },
    },
    {
      kind: "exercise",
      exercise: {
        prompt:
          "O que esta experiência do laboratório registra no seu progresso?",
        options: [
          {
            label: "Marca uma lição da trilha do alfabeto como concluída",
            feedback:
              "Não: experiências do laboratório são separadas das trilhas e nunca marcam lições como concluídas.",
          },
          {
            label: "Nada — a atividade do laboratório não gera progresso",
            feedback:
              "Correto: o laboratório existe para experimentar a interface; o progresso só é registrado em lições validadas das trilhas.",
          },
          {
            label: "Desbloqueia os espécimes das letras A, B, C, I e L",
            feedback:
              "Não: os espécimes ficam visíveis no laboratório independentemente desta experiência, e nada aqui muda o estado deles.",
          },
        ],
        correctIndex: 1,
        explanation:
          "Laboratório e trilhas são áreas separadas: concluir esta experiência não grava progresso, não desbloqueia lições e não altera o estado de nenhum espécime.",
      },
    },
    {
      kind: "text",
      heading: "O alfabeto manual em curadoria",
      body: "As letras A, B, C, I e L já estão catalogadas como espécimes visuais — registros que acompanham referências, estado de validação e licença de mídia. Nenhuma delas tem demonstração publicada ainda: cada página mostra honestamente o estado em produção, sem imagens provisórias ou demonstrações inventadas.",
    },
    {
      kind: "exercise",
      exercise: {
        prompt:
          "Quando uma demonstração visual de uma letra pode aparecer em uma lição?",
        options: [
          {
            label: "Assim que qualquer vídeo da letra for encontrado na internet",
            feedback:
              "Não: um vídeo público não é permissão de uso. A mídia só entra quando há evidência de autorização registrada.",
          },
          {
            label:
              "Quando houver licença confirmada e a revisão especializada da versão atual",
            feedback:
              "Exato: exibição exige evidência de permissão, e publicação exige a cadeia completa de revisões sobre a versão atual do conteúdo.",
          },
          {
            label: "Quando a letra estiver catalogada no laboratório",
            feedback:
              "Estar catalogada é só o primeiro passo: o espécime continua em rascunho até passar por toda a revisão e ter mídia licenciada.",
          },
        ],
        correctIndex: 1,
        explanation:
          "Mídia sem licença comprovada nunca é exibida, e nenhuma lição é publicada sem a revisão completa — pesquisa, técnica e especialista — da versão atual.",
      },
    },
  ],
};

/**
 * Visual-exercise lab content for `/laboratorio/licao-visual` — exercises the
 * promptMedia/option.media extensions, the permission gate and the
 * description-based alternative path using synthetic shape fixtures. NOT
 * Libras content: shapes stand in for hand configurations so the mechanics
 * can be tested before licensed sign media exists.
 */
const syntheticAttribution: LessonMediaAttribution = {
  source: "Sinaliza — ativo sintético gerado para testes",
  license: "Uso interno em testes de interface",
  permissionEvidence:
    "Ativo sintético produzido pelo próprio projeto Sinaliza para testes de interface; não reproduz conteúdo de terceiros.",
};

const unlicensedAttribution: LessonMediaAttribution = {
  source: "Sinaliza — ativo sintético gerado para testes",
  license: "Uso interno em testes de interface",
  // No permissionEvidence on purpose: exercises the fail-closed gate.
};

export const visualExerciseDemo: LessonContent = {
  intro:
    "Esta demonstração testa exercícios com estímulo visual usando formas geométricas sintéticas: uma imagem autorizada, opções com imagem, um estímulo bloqueado por falta de permissão e um estímulo que falha ao carregar. O conteúdo não é material de Libras — serve para verificar a mecânica antes de existir mídia licenciada.",
  blocks: [
    {
      kind: "text",
      heading: "Como funciona um exercício visual",
      body: "Alguns exercícios apresentam uma imagem como estímulo — por exemplo, a demonstração de uma forma. Quando a imagem não pode ser exibida (sem permissão registrada ou falha de carregamento), o exercício não aceita palpite: ou uma versão alternativa baseada em descrição é oferecida, ou ele permanece bloqueado.",
    },
    {
      kind: "exercise",
      exercise: {
        prompt: "Qual forma geométrica aparece na imagem acima?",
        promptMedia: {
          media: {
            type: "image",
            src: "/media/fixtures/shape-circle.svg",
            alt: "Um círculo preenchido em azul sobre fundo claro.",
          },
          attribution: syntheticAttribution,
          description: "Imagem do estímulo: uma única forma geométrica azul.",
        },
        options: [
          {
            label: "Círculo",
            feedback: "Correto: a imagem mostra um círculo preenchido.",
          },
          {
            label: "Quadrado",
            feedback:
              "Não: um quadrado teria quatro lados retos e ângulos retos.",
          },
          {
            label: "Triângulo",
            feedback: "Não: um triângulo teria três lados e três vértices.",
          },
        ],
        correctIndex: 0,
        explanation:
          "O círculo é a única forma sem lados retos nem vértices entre as três opções.",
        // Present even though the stimulus is permitted: exercises the manual
        // "Responder por descrição" toggle path.
        descriptionVariant: {
          prompt:
            "Pela descrição: a forma não tem lados retos nem vértices e todos os seus pontos ficam à mesma distância do centro. Qual forma é essa?",
          options: [
            {
              label: "Círculo",
              feedback: "Correto: a descrição corresponde a um círculo.",
            },
            {
              label: "Quadrado",
              feedback: "Não: um quadrado tem quatro lados retos.",
            },
          ],
          correctIndex: 0,
          explanation:
            "Uma forma sem lados retos com pontos equidistantes do centro é um círculo.",
        },
      },
    },
    {
      kind: "exercise",
      exercise: {
        prompt: "Qual das imagens abaixo mostra um quadrado?",
        options: [
          {
            label: "Imagem 1",
            feedback: "Não: a imagem 1 mostra um triângulo.",
            media: {
              media: {
                type: "image",
                src: "/media/fixtures/shape-triangle.svg",
                alt: "Forma geométrica com três lados e três vértices.",
                width: 320,
                height: 240,
              },
              attribution: syntheticAttribution,
            },
          },
          {
            label: "Imagem 2",
            feedback: "Correto: a imagem 2 mostra um quadrado.",
            media: {
              media: {
                type: "image",
                src: "/media/fixtures/shape-square.svg",
                alt: "Forma geométrica com quatro lados iguais e quatro ângulos retos.",
                width: 320,
                height: 240,
              },
              attribution: syntheticAttribution,
            },
          },
        ],
        correctIndex: 1,
        explanation:
          "O quadrado tem quatro lados iguais e quatro ângulos retos; a outra imagem mostra um triângulo.",
        // Image-only options are not discriminable without sight, so the
        // exercise always offers a description-based counterpart.
        descriptionVariant: {
          prompt:
            "Pela descrição: a imagem 1 mostra uma forma com três lados e três vértices; a imagem 2 mostra uma forma com quatro lados iguais e quatro ângulos retos. Qual imagem mostra um quadrado?",
          options: [
            {
              label: "Imagem 1",
              feedback: "Não: a imagem 1 descreve um triângulo.",
            },
            {
              label: "Imagem 2",
              feedback: "Correto: a imagem 2 descreve um quadrado.",
            },
          ],
          correctIndex: 1,
          explanation:
            "A forma com quatro lados iguais e ângulos retos é o quadrado, mostrado na imagem 2.",
        },
      },
    },
    {
      kind: "exercise",
      exercise: {
        prompt: "Qual forma geométrica aparece na imagem acima?",
        promptMedia: {
          media: {
            type: "image",
            src: "/media/fixtures/shape-circle.svg",
            alt: "Um círculo preenchido em azul sobre fundo claro.",
          },
          // Same asset, but without permission evidence: the gate blocks
          // the stimulus and the description variant is offered instead.
          attribution: unlicensedAttribution,
        },
        descriptionVariant: {
          prompt:
            "Pela descrição: a forma tem todos os pontos à mesma distância do centro, sem lados retos. Qual forma é essa?",
          options: [
            {
              label: "Círculo",
              feedback: "Correto: a descrição corresponde a um círculo.",
            },
            {
              label: "Quadrado",
              feedback: "Não: um quadrado tem lados retos e ângulos retos.",
            },
          ],
          correctIndex: 0,
          explanation:
            "Uma forma com todos os pontos equidistantes do centro é um círculo.",
        },
        options: [
          {
            label: "Círculo",
            feedback: "Correto.",
          },
          {
            label: "Quadrado",
            feedback: "Não.",
          },
        ],
        correctIndex: 0,
        explanation: "A imagem mostra um círculo.",
      },
    },
    {
      kind: "exercise",
      exercise: {
        prompt: "Qual forma geométrica aparece na imagem acima?",
        promptMedia: {
          media: {
            type: "image",
            // Permission recorded, but the file does not exist: exercises
            // the runtime load-failure path, which behaves like the gate.
            src: "/media/fixtures/shape-does-not-exist.svg",
            alt: "Um círculo preenchido em azul sobre fundo claro.",
          },
          attribution: syntheticAttribution,
        },
        descriptionVariant: {
          prompt:
            "Pela descrição: a forma tem três lados e três vértices. Qual forma é essa?",
          options: [
            {
              label: "Triângulo",
              feedback: "Correto: três lados e três vértices é um triângulo.",
            },
            {
              label: "Círculo",
              feedback: "Não: o círculo não tem lados retos.",
            },
          ],
          correctIndex: 0,
          explanation: "A forma descrita é um triângulo.",
        },
        options: [
          {
            label: "Triângulo",
            feedback: "Correto.",
          },
          {
            label: "Círculo",
            feedback: "Não.",
          },
        ],
        correctIndex: 0,
        explanation: "A imagem mostra um triângulo.",
      },
    },
  ],
};

/**
 * Companion of `visualExerciseDemo` for `/laboratorio/licao-visual-bloqueada`:
 * a visual exercise whose stimulus lacks permission evidence AND has no
 * description variant — it must stay blocked and non-completable, proving a
 * visual exercise can never be guessed at with a hidden stimulus.
 */
export const blockedExerciseDemo: LessonContent = {
  intro:
    "Esta demonstração contém um exercício cujo estímulo visual não tem evidência de permissão e não possui alternativa por descrição: ele deve permanecer bloqueado e a atividade não pode ser concluída.",
  blocks: [
    {
      kind: "text",
      heading: "Exercício sem estímulo disponível",
      body: "O exercício a seguir depende de uma imagem que ainda não tem autorização registrada. Sem o estímulo, responder seria adivinhar — por isso as opções ficam bloqueadas e o avanço não é liberado.",
    },
    {
      kind: "exercise",
      exercise: {
        prompt: "Qual forma geométrica aparece na imagem acima?",
        promptMedia: {
          media: {
            type: "image",
            src: "/media/fixtures/shape-circle.svg",
            alt: "Um círculo preenchido em azul sobre fundo claro.",
          },
          attribution: unlicensedAttribution,
        },
        options: [
          {
            label: "Círculo",
            feedback: "Correto.",
          },
          {
            label: "Quadrado",
            feedback: "Não.",
          },
        ],
        correctIndex: 0,
        explanation: "A imagem mostra um círculo.",
      },
    },
  ],
};
