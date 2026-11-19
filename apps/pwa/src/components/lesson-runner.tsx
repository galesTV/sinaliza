"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";

import {
  exerciseMediaList,
  isExerciseVisuallyPermitted,
  type LessonContent,
  type LessonExercise,
  type LessonExerciseOption,
} from "@/data/lesson-content";
import { createLessonRunner } from "@/lib/lesson-runner";
import { cn } from "@/lib/utils";

import { Badge } from "./badge";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconGraduationCap,
  IconRefresh,
  IconX,
} from "./icons";
import { HonestNote } from "./honest-note";
import { LessonMedia } from "./lesson-media";
import { markLessonCompleted } from "./use-progress";

/** Copy for the finish flow, split by whether completion records progress. */
export function runnerCopy(recordsProgress: boolean) {
  return recordsProgress
    ? {
        finish: "Finalizar lição",
        complete: "Concluir lição",
        completeHint:
          "Você respondeu todos os exercícios corretamente. Conclua para registrar a lição.",
      }
    : {
        finish: "Finalizar experiência",
        complete: "Concluir experiência",
        completeHint:
          "Você respondeu todos os exercícios corretamente. Concluir a experiência não registra progresso.",
      };
}

const OPTION_BUTTON_BASE =
  "flex min-h-11 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors duration-200 focus-visible:outline-none";

const OPTION_TONES = {
  idle: "border-border bg-white/[0.025] text-foreground hover:bg-white/[0.07]",
  selected: "border-primary/50 bg-primary/10 text-foreground",
  correct: "border-success/50 bg-success/10 text-success",
  incorrect: "border-destructive/50 bg-destructive/10 text-foreground",
  disabled: "border-border bg-white/[0.015] text-muted",
} as const;

function BackButton({
  onBack,
  visible,
}: {
  onBack: () => void;
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <button type="button" onClick={onBack} className="btn-secondary">
      <IconArrowLeft className="h-4 w-4" />
      Voltar
    </button>
  );
}

function ExerciseBlock({
  exercise,
  selectedOption,
  result,
  onSelect,
  onSelectVariant,
  onAdvance,
  onBack,
  canGoBack,
  isLastBlock,
  finishLabel,
  headingRef,
}: {
  exercise: LessonExercise;
  selectedOption: number | null;
  result: "correct" | "incorrect" | null;
  onSelect: (index: number) => void;
  onSelectVariant: (index: number) => void;
  onAdvance: () => void;
  onBack: () => void;
  canGoBack: boolean;
  isLastBlock: boolean;
  finishLabel: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const solved = result === "correct";

  // Runtime failures: media that passed the static permission gate can
  // still fail to load — those count as unavailable the same way.
  const [failedSrcs, setFailedSrcs] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );
  const [prefersDescription, setPrefersDescription] = useState(false);
  // Which modality the last answer was recorded in. An answer's feedback
  // and option highlighting must always read from that modality's pool —
  // a media failure after answering can flip the view without changing
  // what was actually answered.
  const [answeredMode, setAnsweredMode] = useState<
    "visual" | "description" | null
  >(null);

  const mediaUnavailable =
    !isExerciseVisuallyPermitted(exercise) ||
    exerciseMediaList(exercise).some((item) =>
      failedSrcs.has(item.media.src),
    );

  const variant = exercise.descriptionVariant;
  const useVariant = Boolean(variant) && (mediaUnavailable || prefersDescription);
  const blocked = mediaUnavailable && !variant;

  const prompt = useVariant ? variant!.prompt : exercise.prompt;
  const options: LessonExerciseOption[] = useVariant
    ? variant!.options
    : exercise.options;
  const correctIndex = useVariant
    ? variant!.correctIndex
    : exercise.correctIndex;

  // Feedback and answer styling always follow the modality the answer was
  // recorded in, not the modality currently displayed.
  const answeredInShownMode =
    answeredMode === null ||
    answeredMode === (useVariant ? "description" : "visual");
  const feedbackOptions =
    answeredMode === "description" && variant
      ? variant.options
      : exercise.options;
  const feedbackExplanation =
    answeredMode === "description" && variant
      ? variant.explanation
      : exercise.explanation;

  const markFailed = (src: string) =>
    setFailedSrcs((previous) => {
      if (previous.has(src)) return previous;
      const next = new Set(previous);
      next.add(src);
      return next;
    });

  const handleSelect = (index: number) => {
    setAnsweredMode(useVariant ? "description" : "visual");
    if (useVariant) onSelectVariant(index);
    else onSelect(index);
  };

  return (
    <div className="flex flex-col gap-5">
      <h2
        ref={headingRef}
        tabIndex={-1}
        id="lesson-runner-title"
        className="font-display text-xl font-semibold tracking-tight text-foreground focus-visible:outline-none"
      >
        {prompt}
      </h2>

      {exercise.promptMedia && !useVariant && (
        <LessonMedia
          key={exercise.promptMedia.media.src}
          block={{
            kind: "media",
            title: "Estímulo do exercício",
            description:
              exercise.promptMedia.description ??
              "Demonstração visual referida pelo enunciado deste exercício.",
            media: exercise.promptMedia.media,
            attribution: exercise.promptMedia.attribution,
          }}
          onUnavailable={() => markFailed(exercise.promptMedia!.media.src)}
        />
      )}

      {/* Announced politely so assistive tech hears the modality change. */}
      <div aria-live="polite">
        {useVariant && (
          <HonestNote>
            Versão por descrição: avalia a compreensão da descrição da
            demonstração, não a identificação visual. Não é uma equivalência
            pedagógica validada.
          </HonestNote>
        )}
      </div>

      {blocked && (
        <HonestNote title="Exercício indisponível por enquanto">
          Este exercício depende de uma demonstração visual que não pode ser
          exibida no momento — sem o estímulo, responder seria adivinhar. As
          opções ficam bloqueadas até a mídia estar autorizada e disponível.
        </HonestNote>
      )}

      <fieldset className="flex flex-col gap-2.5" disabled={blocked}>
        <legend className="sr-only">{prompt}</legend>
        {options.map((option, index) => {
          const isSelected = answeredInShownMode && selectedOption === index;
          const isCorrect = answeredInShownMode && index === correctIndex;
          const tone = solved
            ? isCorrect
              ? OPTION_TONES.correct
              : OPTION_TONES.disabled
            : result === "incorrect" && isSelected
              ? OPTION_TONES.incorrect
              : isSelected
                ? OPTION_TONES.selected
                : OPTION_TONES.idle;
          return (
            <label key={option.label} className="block">
              <input
                type="radio"
                name={`${exercise.prompt}${useVariant ? " (descrição)" : ""}`}
                className="peer sr-only"
                checked={!blocked && isSelected}
                disabled={solved || blocked}
                onChange={() => handleSelect(index)}
              />
              <span
                className={cn(
                  OPTION_BUTTON_BASE,
                  "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring",
                  solved || blocked ? "cursor-default" : "cursor-pointer",
                  tone,
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px]",
                    isSelected ? "border-current" : "border-border text-muted",
                  )}
                >
                  {solved && isCorrect ? (
                    <IconCheck className="h-3 w-3" />
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </span>
                <span className="flex min-w-0 flex-1 items-center gap-3">
                  {!useVariant && option.media && (
                    // eslint-disable-next-line @next/next/no-img-element -- lesson media stays dependency-free; next/image is not used in this app
                    <img
                      src={option.media.media.src}
                      alt={
                        option.media.media.type === "image"
                          ? option.media.media.alt
                          : ""
                      }
                      className="h-16 w-16 shrink-0 rounded-lg border border-border bg-black/40 object-contain"
                      onError={() => markFailed(option.media!.media.src)}
                    />
                  )}
                  {option.label}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      {variant && !mediaUnavailable && !solved && result === null && (
        <button
          type="button"
          aria-pressed={prefersDescription}
          onClick={() => setPrefersDescription((value) => !value)}
          className="self-start text-sm font-medium text-muted underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {prefersDescription
            ? "Voltar à versão com imagem"
            : "Responder por descrição"}
        </button>
      )}

      {result &&
        selectedOption !== null &&
        selectedOption < feedbackOptions.length && (
        <div
          role="status"
          className={cn(
            "flex flex-col gap-2 rounded-xl border px-4 py-3.5 text-sm leading-relaxed",
            solved
              ? "border-success/40 bg-success/10 text-foreground"
              : "border-destructive/40 bg-destructive/10 text-foreground",
          )}
        >
          <p className="flex items-center gap-2 font-semibold">
            {solved ? (
              <>
                <IconCheck className="h-4 w-4 text-success" />
                Correto!
              </>
            ) : (
              <>
                <IconX className="h-4 w-4 text-destructive" />
                Ainda não — tente novamente
              </>
            )}
          </p>
          <p className="text-muted">
            {feedbackOptions[selectedOption].feedback}
          </p>
          {solved && <p className="text-muted">{feedbackExplanation}</p>}
        </div>
      )}

      {(solved || canGoBack) && (
        <div className="flex flex-wrap gap-3">
          {solved && (
            <button type="button" onClick={onAdvance} className="btn-primary">
              {isLastBlock ? finishLabel : "Continuar"}
              <IconArrowRight className="h-4 w-4" />
            </button>
          )}
          <BackButton onBack={onBack} visible={canGoBack} />
        </div>
      )}
    </div>
  );
}

export function LessonRunner({
  content,
  lessonKey: completedKey,
  completionLabel = "Lição concluída",
}: {
  content: LessonContent;
  /** When set, completing the lesson records it in the real progress store. */
  lessonKey?: string;
  completionLabel?: string;
}) {
  // Created once per mounted component; pure — safe to build during SSR.
  const [runner] = useState(() =>
    createLessonRunner(content, {
      onComplete: () => {
        if (completedKey) markLessonCompleted(completedKey);
      },
    }),
  );
  const snapshot = useSyncExternalStore(
    runner.subscribe,
    runner.getSnapshot,
    runner.getSnapshot,
  );

  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the new step so keyboard and screen-reader users are not
  // left stranded on a removed/disabled control.
  useEffect(() => {
    headingRef.current?.focus();
  }, [snapshot.stepIndex]);

  const { block, stepIndex, stepCount } = snapshot;
  const copy = runnerCopy(completedKey !== undefined);

  return (
    <section
      aria-labelledby="lesson-runner-title"
      className="flex flex-col gap-6 rounded-3xl border border-border bg-surface-elevated p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)] sm:p-8"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
        <Badge tone="accent">
          Passo {Math.min(stepIndex + 1, stepCount)} de {stepCount}
        </Badge>
        <Badge>
          {snapshot.solvedExercises} de {snapshot.totalExercises} exercícios
          resolvidos
        </Badge>
      </header>

      {stepIndex === 0 && (
        <p className="max-w-2xl text-base leading-relaxed text-muted">
          {content.intro}
        </p>
      )}

      {block?.kind === "text" && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              Explicação
            </p>
            <h2
              ref={headingRef}
              tabIndex={-1}
              id="lesson-runner-title"
              className="font-display text-xl font-semibold tracking-tight text-foreground focus-visible:outline-none"
            >
              {block.heading}
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-muted">
              {block.body}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={runner.advance}
              className="btn-primary"
            >
              {stepIndex === stepCount - 1 ? copy.finish : "Continuar"}
              <IconArrowRight className="h-4 w-4" />
            </button>
            <BackButton onBack={runner.back} visible={snapshot.canGoBack} />
          </div>
        </div>
      )}

      {block?.kind === "media" && (
        <div className="flex flex-col gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            Demonstração
          </p>
          <h2
            ref={headingRef}
            tabIndex={-1}
            id="lesson-runner-title"
            className="font-display text-xl font-semibold tracking-tight text-foreground focus-visible:outline-none"
          >
            {block.title}
          </h2>
          <LessonMedia key={block.media.src} block={block} />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={runner.advance}
              className="btn-primary"
            >
              {stepIndex === stepCount - 1 ? copy.finish : "Continuar"}
              <IconArrowRight className="h-4 w-4" />
            </button>
            <BackButton onBack={runner.back} visible={snapshot.canGoBack} />
          </div>
        </div>
      )}

      {block?.kind === "exercise" && (
        <div className="flex flex-col gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            Exercício
          </p>
          <ExerciseBlock
            exercise={block.exercise}
            selectedOption={snapshot.selectedOption}
            result={snapshot.result}
            onSelect={runner.select}
            onSelectVariant={runner.selectVariant}
            onAdvance={runner.advance}
            onBack={runner.back}
            canGoBack={snapshot.canGoBack}
            isLastBlock={stepIndex === stepCount - 1}
            finishLabel={copy.finish}
            headingRef={headingRef}
          />
        </div>
      )}

      {!block && (
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-3.5">
            <span
              aria-hidden="true"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-success/35 bg-success/10 text-success"
            >
              <IconGraduationCap className="h-5 w-5" />
            </span>
            <div className="flex flex-col gap-1.5">
              <h2
                ref={headingRef}
                tabIndex={-1}
                id="lesson-runner-title"
                className="font-display text-xl font-semibold tracking-tight text-foreground focus-visible:outline-none"
              >
                {snapshot.completed ? completionLabel : "Tudo certo por aqui"}
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-muted">
                {snapshot.completed
                  ? "Você respondeu todos os exercícios corretamente."
                  : copy.completeHint}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {!snapshot.completed ? (
              <button
                type="button"
                onClick={runner.complete}
                disabled={!snapshot.canComplete}
                className="btn-primary"
              >
                <IconCheck className="h-4 w-4" />
                {copy.complete}
              </button>
            ) : (
              <button
                type="button"
                onClick={runner.restart}
                className="btn-secondary"
              >
                <IconRefresh className="h-4 w-4" />
                Recomeçar
              </button>
            )}
            <BackButton onBack={runner.back} visible={snapshot.canGoBack} />
          </div>
        </div>
      )}
    </section>
  );
}
