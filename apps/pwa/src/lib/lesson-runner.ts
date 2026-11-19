/**
 * Pure lesson state machine — no React, no storage.
 *
 * Walks a `LessonContent` block list: text blocks advance freely, exercises
 * require a correct answer before advancing, and the lesson can only be
 * completed at the end with every exercise solved. Steps also navigate
 * backward freely — a solved exercise stays solved when revisited, so
 * `solvedExercises` is always counted exactly once per block. `complete()`
 * is idempotent so accidental duplicate calls never emit a second
 * completion.
 *
 * The demo at `/laboratorio/licao` uses this runner without a progress store;
 * real lessons will pair it with `progress.ts` via the `onComplete` callback.
 */

import {
  isExerciseVisuallyPermitted,
  type LessonBlock,
  type LessonContent,
} from "@/data/lesson-content";

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
  /** Whether a previous step exists. */
  canGoBack: boolean;
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

interface BlockState {
  selectedOption: number | null;
  result: ExerciseResult | null;
}

export function createLessonRunner(
  content: LessonContent,
  deps: LessonRunnerDeps = {},
) {
  const listeners = new Set<() => void>();
  const totalExercises = content.blocks.filter(
    (block) => block.kind === "exercise",
  ).length;

  // Per-block answer state: revisiting a solved exercise shows it solved —
  // it can never be re-counted or flip back to unanswered.
  const blockStates: BlockState[] = content.blocks.map(() => ({
    selectedOption: null,
    result: null,
  }));

  let stepIndex = 0;
  let completed = false;
  let snapshot = buildSnapshot();

  function atEnd() {
    return stepIndex >= content.blocks.length;
  }

  function currentBlock(): LessonBlock | null {
    return atEnd() ? null : content.blocks[stepIndex];
  }

  function currentState(): BlockState | null {
    return atEnd() ? null : blockStates[stepIndex];
  }

  function solvedCount(): number {
    return blockStates.filter(
      (state, index) =>
        content.blocks[index].kind === "exercise" &&
        state.result === "correct",
    ).length;
  }

  function buildSnapshot(): LessonRunnerSnapshot {
    const state = currentState();
    return {
      stepIndex,
      stepCount: content.blocks.length,
      block: currentBlock(),
      selectedOption: state?.selectedOption ?? null,
      result: state?.result ?? null,
      canGoBack: stepIndex > 0,
      solvedExercises: solvedCount(),
      totalExercises,
      canComplete:
        atEnd() && solvedCount() === totalExercises && !completed,
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
   *
   * Guess-proofing: a selection on an exercise whose media stimulus is not
   * display-permitted is ignored outright — a visual question can never be
   * answered while its stimulus is hidden. Runtime load failures are a UI
   * concern (the component disables the inputs); the runner only enforces
   * the static, data-checkable half.
   */
  function select(optionIndex: number) {
    const block = currentBlock();
    const state = currentState();
    if (!block || !state || block.kind !== "exercise") return;
    if (state.result === "correct") return;
    if (!isExerciseVisuallyPermitted(block.exercise)) return;
    if (
      optionIndex < 0 ||
      optionIndex >= block.exercise.options.length
    ) {
      return;
    }

    state.selectedOption = optionIndex;
    state.result =
      optionIndex === block.exercise.correctIndex
        ? "correct"
        : "incorrect";
    emit();
  }

  /**
   * Records a selection scored against the exercise's description variant
   * — the text-only path used when the visual stimulus cannot be shown or
   * when the learner answers from a description. Ignored when the exercise
   * has no variant, and scored against `variant.correctIndex`, never the
   * visual exercise's.
   */
  function selectVariant(optionIndex: number) {
    const block = currentBlock();
    const state = currentState();
    if (!block || !state || block.kind !== "exercise") return;
    if (state.result === "correct") return;
    const variant = block.exercise.descriptionVariant;
    if (!variant) return;
    if (optionIndex < 0 || optionIndex >= variant.options.length) return;

    state.selectedOption = optionIndex;
    state.result =
      optionIndex === variant.correctIndex ? "correct" : "incorrect";
    emit();
  }

  /**
   * Moves to the next block. Text blocks always advance; exercises only
   * advance after a correct answer. No-op at the end.
   */
  function advance() {
    const block = currentBlock();
    const state = currentState();
    if (!block || !state) return;
    if (block.kind === "exercise" && state.result !== "correct") return;

    stepIndex += 1;
    emit();
  }

  /**
   * Moves to the previous block, restoring its recorded answer state.
   * No-op on the first step; also valid from the completion screen.
   */
  function back() {
    if (stepIndex === 0) return;
    stepIndex -= 1;
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
    for (const state of blockStates) {
      state.selectedOption = null;
      state.result = null;
    }
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
    selectVariant,
    advance,
    back,
    complete,
    restart,
  };
}

export type LessonRunner = ReturnType<typeof createLessonRunner>;
