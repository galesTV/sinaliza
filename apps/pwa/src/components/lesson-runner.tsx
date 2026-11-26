"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";

import {
  exerciseMediaList,
  hasMediaDisplayPermission,
  isExerciseVisuallyPermitted,
  type LessonContent,
  type LessonExercise,
  type LessonExerciseOption,
} from "@/data/lesson-content";
import {
  createLessonRunner,
  type LessonRunnerSnapshot,
} from "@/lib/lesson-runner";
import { cn } from "@/lib/utils";

import { Badge } from "./badge";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconExternalLink,
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

const OPTION_CARD_BASE =
  "flex h-full min-h-11 w-full flex-col gap-3 rounded-xl border p-3 text-left text-sm font-medium transition-colors duration-200 focus-visible:outline-none";

const OPTION_TONES = {
  idle: "border-border bg-white/[0.025] text-foreground hover:bg-white/[0.07]",
  selected: "border-primary/50 bg-primary/10 text-foreground",
  correct: "border-success/50 bg-success/10 text-success",
  incorrect: "border-destructive/50 bg-destructive/10 text-foreground",
  disabled: "border-border bg-white/[0.015] text-muted",
} as const;

/**
 * Neutral selection indicator for exercise options. Letter badges (A, B,
 * C, D) were dropped because they read as part of the answer in
 * letter-identification exercises ("A — Letra B"). State is shown by
 * shape, not colour alone: empty circle → filled dot when selected →
 * check on the correct option once solved → x on a wrong selection.
 */
function OptionIndicator({
  selected,
  correct,
  incorrect,
}: {
  selected: boolean;
  correct: boolean;
  incorrect: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
        selected ? "border-current" : "border-border text-muted",
      )}
    >
      {correct ? (
        <IconCheck className="h-3 w-3" />
      ) : incorrect ? (
        <IconX className="h-3 w-3" />
      ) : selected ? (
        <span className="h-2.5 w-2.5 rounded-full bg-current" />
      ) : null}
    </span>
  );
}

/** Compact credit kept under each visual option's own photograph. */
function OptionMediaCredit({
  media,
}: {
  media: NonNullable<LessonExerciseOption["media"]>;
}) {
  const { attribution } = media;
  return (
    <p className="px-1 text-[10px] leading-snug text-muted">
      {media.media.type === "image" ? "Imagem: " : "Fonte: "}
      {attribution.sourceUrl ? (
        <a
          href={attribution.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 transition-colors hover:text-foreground"
        >
          {attribution.source}
        </a>
      ) : (
        attribution.source
      )}
      {" — "}
      {attribution.licenseUrl ? (
        <a
          href={attribution.licenseUrl}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 transition-colors hover:text-foreground"
        >
          {attribution.license}
        </a>
      ) : (
        attribution.license
      )}
    </p>
  );
}

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
  answeredInVariant,
  onSelect,
  onSelectVariant,
  onClearIncorrect,
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
  /** Which modality the recorded answer belongs to (runner per-block state). */
  answeredInVariant: boolean;
  onSelect: (index: number) => void;
  onSelectVariant: (index: number) => void;
  onClearIncorrect: () => void;
  onAdvance: () => void;
  onBack: () => void;
  canGoBack: boolean;
  isLastBlock: boolean;
  finishLabel: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const solved = result === "correct";

  const variant = exercise.descriptionVariant;

  // Runtime failures: media that passed the static permission gate can
  // still fail to load — those count as unavailable the same way. This
  // state lives per step (the parent keys ExerciseBlock by stepIndex), so
  // a failure in one exercise can never leak into another, and revisiting
  // a step retries the load exactly once instead of latching forever.
  const [failedSrcs, setFailedSrcs] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );
  // Temporary per-exercise preference: it does not leak to other
  // exercises, and a revisit starts in the modality the recorded answer
  // belongs to so the view always matches the answer record.
  const [prefersDescription, setPrefersDescription] = useState(
    () => answeredInVariant && Boolean(variant),
  );

  const mediaLoadFailed = exerciseMediaList(exercise).some((item) =>
    failedSrcs.has(item.media.src),
  );
  const mediaUnavailable =
    !isExerciseVisuallyPermitted(exercise) || mediaLoadFailed;

  const useVariant = Boolean(variant) && (mediaUnavailable || prefersDescription);
  const blocked = mediaUnavailable && !variant;

  const prompt = useVariant ? variant!.prompt : exercise.prompt;
  const options: LessonExerciseOption[] = useVariant
    ? variant!.options
    : exercise.options;
  const correctIndex = useVariant
    ? variant!.correctIndex
    : exercise.correctIndex;

  // Photo-first card presentation when every option carries a permitted
  // image — the photograph itself is the choice being evaluated, so it
  // needs enough area for the hand details instead of a thumbnail row.
  const visualOptions =
    !useVariant &&
    options.length > 0 &&
    options.every(
      (option) =>
        option.media?.media.type === "image" &&
        hasMediaDisplayPermission(option.media.attribution),
    );

  // Feedback, option highlighting and the answer key always follow the
  // modality the answer was recorded in — never the modality currently on
  // screen. A media failure after answering may flip the view but cannot
  // reinterpret the recorded answer.
  const recordedMode =
    result === null ? null : answeredInVariant ? "description" : "visual";
  const answeredInShownMode =
    recordedMode === null ||
    recordedMode === (useVariant ? "description" : "visual");
  const feedbackOptions =
    recordedMode === "description" && variant
      ? variant.options
      : exercise.options;
  const feedbackExplanation =
    recordedMode === "description" && variant
      ? variant.explanation
      : exercise.explanation;

  // Discreet credits for the option thumbnails actually on screen — the
  // same attribution metadata the media blocks show. Hidden media never
  // earns a credit line.
  const optionAttributions = useVariant
    ? []
    : Array.from(
        new Map(
          options
            .filter(
              (option) =>
                option.media &&
                hasMediaDisplayPermission(option.media.attribution) &&
                !failedSrcs.has(option.media.media.src),
            )
            .map((option) => {
              const media = option.media!;
              return [
                `${media.media.type} ${media.attribution.source} ${media.attribution.license}`,
                media,
              ] as const;
            }),
        ).values(),
      );

  const markFailed = (src: string) =>
    setFailedSrcs((previous) => {
      if (previous.has(src)) return previous;
      const next = new Set(previous);
      next.add(src);
      return next;
    });

  const handleSelect = (index: number) => {
    if (useVariant) onSelectVariant(index);
    else onSelect(index);
  };

  const previousResultRef = useRef(result);
  const correctOptionLabelRef = useRef<HTMLLabelElement>(null);

  // A correct answer disables the radio that may currently own focus. Keep
  // focus on that answer's visible label instead of letting the browser drop
  // it to BODY; the next Tab then reaches the advance action naturally. Media
  // and feedback insertion can shift layout after the transition, so visibility
  // is rechecked from resize events rather than an arbitrary timeout. Revisiting
  // an already solved step must not steal focus from the step heading managed
  // by the parent runner.
  useEffect(() => {
    const previousResult = previousResultRef.current;
    previousResultRef.current = result;
    if (previousResult !== "correct" && result === "correct") {
      const correctOptionLabel = correctOptionLabelRef.current;
      correctOptionLabel?.focus({ preventScroll: true });
      let frame = 0;
      const ensureVisible = () => {
        frame = 0;
        if (!correctOptionLabel || document.activeElement !== correctOptionLabel) {
          return;
        }
        const rect = correctOptionLabel.getBoundingClientRect();
        const topBoundary =
          document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
        const bottomBoundary = Array.from(document.querySelectorAll("nav")).reduce(
          (boundary, nav) => {
            const style = window.getComputedStyle(nav);
            if (style.position !== "fixed" || style.display === "none") {
              return boundary;
            }
            const navRect = nav.getBoundingClientRect();
            if (navRect.bottom < window.innerHeight) return boundary;
            return Math.min(boundary, navRect.top);
          },
          window.innerHeight,
        );
        const clearOfFixedChrome =
          rect.top >= topBoundary && rect.bottom <= bottomBoundary;
        if (!clearOfFixedChrome) {
          correctOptionLabel.scrollIntoView({ block: "start" });
        }
      };
      const scheduleVisibilityCheck = () => {
        if (frame === 0) frame = requestAnimationFrame(ensureVisible);
      };
      scheduleVisibilityCheck();
      window.addEventListener("resize", scheduleVisibilityCheck);
      const resizeObserver =
        typeof ResizeObserver === "undefined"
          ? null
          : new ResizeObserver(scheduleVisibilityCheck);
      resizeObserver?.observe(document.body);
      if (correctOptionLabel) resizeObserver?.observe(correctOptionLabel);
      return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("resize", scheduleVisibilityCheck);
        resizeObserver?.disconnect();
      };
    }
  }, [result]);

  return (
    <div className="flex flex-col gap-5">
      <h2
        ref={headingRef}
        tabIndex={-1}
        id="lesson-runner-title"
        className="scroll-mt-24 font-display text-xl font-semibold tracking-tight text-foreground focus-visible:outline-none"
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
          <HonestNote
            title={
              mediaLoadFailed ? "Não foi possível carregar a mídia" : undefined
            }
          >
            {mediaLoadFailed
              ? "Uma ou mais mídias deste exercício não puderam ser carregadas agora. "
              : ""}
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

      <fieldset
        className={cn(
          visualOptions
            ? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
            : "flex flex-col gap-2.5",
        )}
        disabled={blocked}
      >
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
            <div key={option.label} className="flex flex-col gap-1.5">
              <label
                ref={solved && isCorrect ? correctOptionLabelRef : undefined}
                tabIndex={solved && isCorrect ? -1 : undefined}
                className="group block h-full scroll-mt-20 scroll-mb-20 focus:outline-none md:scroll-mb-0"
              >
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
                    visualOptions ? OPTION_CARD_BASE : OPTION_BUTTON_BASE,
                    "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring group-focus-visible:outline-2 group-focus-visible:outline-offset-[-2px] group-focus-visible:outline-ring",
                    solved || blocked ? "cursor-default" : "cursor-pointer",
                    tone,
                  )}
                >
                  {visualOptions ? (
                    <>
                      <span className="flex items-center gap-2.5">
                        <OptionIndicator
                          selected={isSelected}
                          correct={solved && isCorrect}
                          incorrect={result === "incorrect" && isSelected}
                        />
                        <span className="text-sm font-medium">
                          {option.label}
                        </span>
                      </span>
                      {option.media && (
                        // eslint-disable-next-line @next/next/no-img-element -- lesson media stays dependency-free; next/image is not used in this app
                        <img
                          src={option.media.media.src}
                          // Exercise media alt text is authored to describe the
                          // visible configuration without naming the answer.
                          alt={option.media.media.alt}
                          className="h-auto w-full rounded-lg border border-border bg-black/40 object-contain"
                          onError={() => markFailed(option.media!.media.src)}
                        />
                      )}
                    </>
                  ) : (
                    <>
                      <OptionIndicator
                        selected={isSelected}
                        correct={solved && isCorrect}
                        incorrect={result === "incorrect" && isSelected}
                      />
                      <span className="flex min-w-0 flex-1 items-center gap-3">
                        {!useVariant && option.media && (
                          // eslint-disable-next-line @next/next/no-img-element -- lesson media stays dependency-free; next/image is not used in this app
                          <img
                            src={option.media.media.src}
                            alt={option.media.media.alt}
                            className="h-16 w-16 shrink-0 rounded-lg border border-border bg-black/40 object-contain"
                            onError={() => markFailed(option.media!.media.src)}
                          />
                        )}
                        {option.label}
                      </span>
                    </>
                  )}
                </span>
              </label>
              {visualOptions && option.media && (
                <OptionMediaCredit media={option.media} />
              )}
            </div>
          );
        })}
      </fieldset>

      {!visualOptions && optionAttributions.length > 0 && (
        <p className="text-[11px] leading-relaxed text-muted">
          Créditos das imagens das alternativas:{" "}
          {optionAttributions
            .map(
              ({ media, attribution }) =>
                `${media.type === "image" ? "Imagem: " : "Fonte: "}${attribution.source} — ${attribution.license}`,
            )
            .join(" · ")}
        </p>
      )}

      {variant && !mediaUnavailable && !solved && (
        <button
          type="button"
          aria-pressed={prefersDescription}
          onClick={() => {
            if (result === "incorrect") onClearIncorrect();
            setPrefersDescription((value) => !value);
          }}
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
            <button
              type="button"
              onClick={onAdvance}
              className="btn-primary scroll-mb-20 md:scroll-mb-0"
            >
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
  onSnapshot,
  headerAccessory,
  onRestart,
}: {
  content: LessonContent;
  /** When set, completing the lesson records it in the real progress store. */
  lessonKey?: string;
  completionLabel?: string;
  /**
   * Optional read-only observer for demonstrations. It receives snapshots
   * after render and must never be used as a substitute for `lessonKey`.
   */
  onSnapshot?: (snapshot: LessonRunnerSnapshot) => void;
  /** Optional compact status visualization rendered in the runner header. */
  headerAccessory?: ReactNode;
  /**
   * Optional restart owner for demonstrations whose parent must coordinate
   * layout/state outside the runner. Regular lessons keep the internal
   * runner restart when this prop is absent.
   */
  onRestart?: () => void;
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
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    onSnapshot?.(snapshot);
  }, [onSnapshot, snapshot]);

  // Move focus to the new step so keyboard and screen-reader users are not
  // left stranded on a removed/disabled control. Scroll the whole runner
  // into view so mobile learners keep its step/exercise context visible.
  useEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;
    heading.focus({ preventScroll: true });
    sectionRef.current?.scrollIntoView({ block: "start" });
  }, [snapshot.stepIndex]);

  const { block, stepIndex, stepCount } = snapshot;
  const copy = runnerCopy(completedKey !== undefined);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="lesson-runner-title"
      className="flex scroll-mt-24 flex-col gap-6 rounded-3xl border border-border bg-surface-elevated p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)] sm:p-8"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="accent">
            Passo {Math.min(stepIndex + 1, stepCount)} de {stepCount}
          </Badge>
          <Badge>
            {snapshot.solvedExercises} de {snapshot.totalExercises} exercícios
            resolvidos
          </Badge>
        </div>
        {headerAccessory}
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
              className="scroll-mt-24 font-display text-xl font-semibold tracking-tight text-foreground focus-visible:outline-none"
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
            className="scroll-mt-24 font-display text-xl font-semibold tracking-tight text-foreground focus-visible:outline-none"
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

      {block?.kind === "resources" && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              Para saber mais
            </p>
            <h2
              ref={headingRef}
              tabIndex={-1}
              id="lesson-runner-title"
              className="scroll-mt-24 font-display text-xl font-semibold tracking-tight text-foreground focus-visible:outline-none"
            >
              {block.heading}
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-muted">
              {block.body}
            </p>
          </div>
          <ul className="flex flex-col gap-3">
            {block.items.map((item) => (
              <li
                key={item.url}
                className="flex flex-col gap-1.5 rounded-xl border border-border bg-white/[0.025] p-4"
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 self-start rounded text-sm font-semibold text-accent underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {item.title}
                  <IconExternalLink className="h-3.5 w-3.5" />
                  <span className="sr-only">
                    (abre em nova aba, site externo)
                  </span>
                </a>
                <p className="text-xs font-medium text-muted">
                  {item.source} · site externo — abre em nova aba
                </p>
                <p className="text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
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
            // Per-step key: transient UI state (load failures, description
            // preference) is scoped to this step — it can neither leak into
            // other exercises nor latch permanently across revisits.
            key={stepIndex}
            exercise={block.exercise}
            selectedOption={snapshot.selectedOption}
            result={snapshot.result}
            answeredInVariant={snapshot.answeredInVariant}
            onSelect={runner.select}
            onSelectVariant={runner.selectVariant}
            onClearIncorrect={runner.clearIncorrectSelection}
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
                className="scroll-mt-24 font-display text-xl font-semibold tracking-tight text-foreground focus-visible:outline-none"
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
                onClick={onRestart ?? runner.restart}
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
