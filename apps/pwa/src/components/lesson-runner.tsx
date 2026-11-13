"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import type { LessonContent, LessonExercise } from "@/data/lesson-content";
import { createLessonRunner } from "@/lib/lesson-runner";
import { cn } from "@/lib/utils";

import { Badge } from "./badge";
import {
  IconArrowRight,
  IconCheck,
  IconGraduationCap,
  IconRefresh,
  IconX,
} from "./icons";
import { markLessonCompleted } from "./use-progress";

const OPTION_BUTTON_BASE =
  "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors duration-200 focus-visible:outline-none";

const OPTION_TONES = {
  idle: "border-border bg-white/[0.025] text-foreground hover:bg-white/[0.07]",
  selected: "border-primary/50 bg-primary/10 text-foreground",
  correct: "border-success/50 bg-success/10 text-success",
  incorrect: "border-destructive/50 bg-destructive/10 text-foreground",
  disabled: "border-border bg-white/[0.015] text-muted",
} as const;

function ExerciseBlock({
  exercise,
  selectedOption,
  result,
  onSelect,
  onAdvance,
  isLastBlock,
}: {
  exercise: LessonExercise;
  selectedOption: number | null;
  result: "correct" | "incorrect" | null;
  onSelect: (index: number) => void;
  onAdvance: () => void;
  isLastBlock: boolean;
}) {
  const solved = result === "correct";

  return (
    <div className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2.5">
        <legend className="sr-only">{exercise.prompt}</legend>
        {exercise.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrect = index === exercise.correctIndex;
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
                name={exercise.prompt}
                className="peer sr-only"
                checked={isSelected}
                disabled={solved}
                onChange={() => onSelect(index)}
              />
              <span
                className={cn(
                  OPTION_BUTTON_BASE,
                  "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary",
                  solved ? "cursor-default" : "cursor-pointer",
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
                {option.label}
              </span>
            </label>
          );
        })}
      </fieldset>

      {result && selectedOption !== null && (
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
            {exercise.options[selectedOption].feedback}
          </p>
          {solved && (
            <p className="text-muted">{exercise.explanation}</p>
          )}
        </div>
      )}

      {solved && (
        <div>
          <button
            type="button"
            onClick={onAdvance}
            className="inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[11px] border border-white/15 bg-gradient-to-r from-primary to-[#8272f2] px-5 text-sm font-semibold text-on-primary shadow-[0_10px_30px_rgba(105,87,232,0.25)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(105,87,232,0.35)]"
          >
            {isLastBlock ? "Finalizar lição" : "Continuar"}
            <IconArrowRight className="h-4 w-4" />
          </button>
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

  return (
    <section
      aria-labelledby="lesson-runner-title"
      className="flex flex-col gap-6 rounded-3xl border border-border bg-surface p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)] sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge tone="accent">
          Passo {Math.min(stepIndex + 1, stepCount)} de {stepCount}
        </Badge>
        <Badge>
          {snapshot.solvedExercises} de {snapshot.totalExercises} exercícios
          resolvidos
        </Badge>
      </div>

      {stepIndex === 0 && (
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          {content.intro}
        </p>
      )}

      {block?.kind === "text" && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            <h2
              ref={headingRef}
              tabIndex={-1}
              id="lesson-runner-title"
              className="font-display text-xl font-semibold tracking-tight text-foreground focus-visible:outline-none"
            >
              {block.heading}
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted">
              {block.body}
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={runner.advance}
              className="inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[11px] border border-white/15 bg-gradient-to-r from-primary to-[#8272f2] px-5 text-sm font-semibold text-on-primary shadow-[0_10px_30px_rgba(105,87,232,0.25)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(105,87,232,0.35)]"
            >
              {stepIndex === stepCount - 1 ? "Finalizar lição" : "Continuar"}
              <IconArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {block?.kind === "exercise" && (
        <div className="flex flex-col gap-4">
          <h2
            ref={headingRef}
            tabIndex={-1}
            id="lesson-runner-title"
            className="font-display text-xl font-semibold tracking-tight text-foreground focus-visible:outline-none"
          >
            {block.exercise.prompt}
          </h2>
          <ExerciseBlock
            exercise={block.exercise}
            selectedOption={snapshot.selectedOption}
            result={snapshot.result}
            onSelect={runner.select}
            onAdvance={runner.advance}
            isLastBlock={stepIndex === stepCount - 1}
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
                  : "Você respondeu todos os exercícios corretamente. Conclua para registrar a lição."}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {!snapshot.completed ? (
              <button
                type="button"
                onClick={runner.complete}
                disabled={!snapshot.canComplete}
                className="inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[11px] border border-white/15 bg-gradient-to-r from-primary to-[#8272f2] px-5 text-sm font-semibold text-on-primary shadow-[0_10px_30px_rgba(105,87,232,0.25)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(105,87,232,0.35)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
              >
                <IconCheck className="h-4 w-4" />
                Concluir lição
              </button>
            ) : (
              <button
                type="button"
                onClick={runner.restart}
                className="inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[11px] border border-border bg-white/[0.025] px-5 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-white/[0.07]"
              >
                <IconRefresh className="h-4 w-4" />
                Recomeçar
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
