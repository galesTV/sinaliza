/**
 * Pure lesson state machine — no React, no storage.
 *
 * Walks a `LessonContent` block list: text blocks advance freely, exercises
 * require a correct answer before advancing, and the lesson can only be
 * completed at the end with every exercise solved. `complete()` is idempotent
 * so accidental duplicate calls never emit a second completion.
 *
 * The demo at `/laboratorio/licao` uses this runner without a progress store;
 * real lessons will pair it with `progress.ts` via the `onComplete` callback.
 */

import type { LessonBlock, LessonContent } from "@/data/lesson-content";

export type ExerciseResult = "correct" | "incorrect";

export interface LessonRunnerSnapshot {
  /** Position in `content.blocks`; equals `blocks.length` at the end. */
  stepIndex: number;
  /** Total steps (blocks) — useful for "Passo X de N". */
  stepCount: number;
  /** Current block, or `null` on the completion screen. */
  block: LessonBlock | null;
  /** Index of the option selected for the current exercise, if any. */
  selectedOption: number | null;
  /** Result of the last selection on the current exercise. */
  result: ExerciseResult | null;
  solvedExercises: number;
  totalExercises: number;
  /** Reached the end with all exercises solved and not yet completed. */
  canComplete: boolean;
  completed: boolean;
}

export interface LessonRunnerDeps {
  onChange?(snapshot: LessonRunnerSnapshot): void;
  /** Fired exactly once, on the first successful `complete()`. */
  onComplete?(): void;
}

export function createLessonRunner(
  content: LessonContent,
  deps: LessonRunnerDeps = {},
) {
  const listeners = new Set<() => void>();
  const totalExercises = content.blocks.filter(
    (block) => block.kind === "exercise",
  ).length;

  let stepIndex = 0;
  let selectedOption: number | null = null;
  let result: ExerciseResult | null = null;
  let solvedExercises = 0;
  let completed = false;
  let snapshot = buildSnapshot();

  function atEnd() {
    return stepIndex >= content.blocks.length;
  }

  function currentBlock(): LessonBlock | null {
    return atEnd() ? null : content.blocks[stepIndex];
  }

  function buildSnapshot(): LessonRunnerSnapshot {
    return {
      stepIndex,
      stepCount: content.blocks.length,
      block: currentBlock(),
      selectedOption,
      result,
      solvedExercises,
      totalExercises,
      canComplete: atEnd() && solvedExercises === totalExercises && !completed,
      completed,
    };
  }

  function emit() {
    snapshot = buildSnapshot();
    for (const listener of listeners) listener();
    deps.onChange?.(snapshot);
  }

  /**
   * Records a selection on the current exercise. Ignored on non-exercise
   * steps and once the exercise is already solved — a solved exercise can
   * never flip back, so `solvedExercises` is counted exactly once.
   */
  function select(optionIndex: number) {
    const block = currentBlock();
    if (!block || block.kind !== "exercise") return;
    if (result === "correct") return;
    if (
      optionIndex < 0 ||
      optionIndex >= block.exercise.options.length
    ) {
      return;
    }

    selectedOption = optionIndex;
    if (optionIndex === block.exercise.correctIndex) {
      result = "correct";
      solvedExercises += 1;
    } else {
      result = "incorrect";
    }
    emit();
  }

  /**
   * Moves to the next block. Text blocks always advance; exercises only
   * advance after a correct answer. No-op at the end.
   */
  function advance() {
    const block = currentBlock();
    if (!block) return;
    if (block.kind === "exercise" && result !== "correct") return;

    stepIndex += 1;
    selectedOption = null;
    result = null;
    emit();
  }

  /**
   * Marks the lesson complete. Only valid at the end with every exercise
   * solved; subsequent calls are no-ops, so completion can never be recorded
   * twice.
   */
  function complete(): boolean {
    if (!snapshot.canComplete) return false;
    completed = true;
    emit();
    deps.onComplete?.();
    return true;
  }

  function restart() {
    stepIndex = 0;
    selectedOption = null;
    result = null;
    solvedExercises = 0;
    completed = false;
    emit();
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => snapshot,
    select,
    advance,
    complete,
    restart,
  };
}

export type LessonRunner = ReturnType<typeof createLessonRunner>;
