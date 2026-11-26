import type { LessonRunnerSnapshot } from "./lesson-runner";

/**
 * Ephemeral visual state for the guided-experience demo. This is a
 * presentation projection only: it has no lesson keys, storage, identity,
 * milestones, history or relationship to the educational progress store.
 */
export interface DemoConstellationState {
  currentStep: number;
  furthestStep: number;
  correctExercises: number;
  totalExercises: number;
  stepCount: number;
  completed: boolean;
}

export function initialDemoConstellationState(
  stepCount = 0,
  totalExercises = 0,
): DemoConstellationState {
  return {
    currentStep: 0,
    furthestStep: 0,
    correctExercises: 0,
    totalExercises,
    stepCount,
    completed: false,
  };
}

/**
 * Folds one runner snapshot into the furthest state reached. Correct
 * answers are monotonic in the runner, so taking maxima makes backward
 * navigation idempotent instead of duplicating or erasing demo progress.
 * The only reset path is a completed run followed by the runner's restart
 * snapshot (first step, zero answers, not completed).
 */
export function reduceDemoConstellation(
  state: DemoConstellationState,
  snapshot: LessonRunnerSnapshot,
): DemoConstellationState {
  if (
    state.completed &&
    snapshot.stepIndex === 0 &&
    snapshot.solvedExercises === 0 &&
    !snapshot.completed
  ) {
    return initialDemoConstellationState(
      snapshot.stepCount,
      snapshot.totalExercises,
    );
  }

  return {
    currentStep: snapshot.stepIndex,
    furthestStep: Math.max(state.furthestStep, snapshot.stepIndex),
    correctExercises: Math.max(
      state.correctExercises,
      snapshot.solvedExercises,
    ),
    totalExercises: snapshot.totalExercises,
    stepCount: snapshot.stepCount,
    completed: state.completed || snapshot.completed,
  };
}

export type DemoNodeState =
  | "locked"
  | "current"
  | "passed"
  | "correct"
  | "complete";

/**
 * Projects the ephemeral state onto the step nodes. Exercise steps light
 * as correct in answer order; normal unlocked steps remain passed/current.
 */
export function demoNodeStates(
  state: DemoConstellationState,
  exerciseStepIndexes: readonly number[],
): DemoNodeState[] {
  const count = Math.max(0, state.stepCount);
  const correctIndexes = new Set(
    exerciseStepIndexes.slice(0, state.correctExercises),
  );
  const lastIndex = Math.max(0, count - 1);
  const unlockedThrough = Math.min(state.furthestStep, lastIndex);
  const currentStep = Math.min(state.currentStep, lastIndex);

  return Array.from({ length: count }, (_, index) => {
    if (correctIndexes.has(index)) {
      return state.completed ? "complete" : "correct";
    }
    if (state.completed && index <= unlockedThrough) return "complete";
    if (index > unlockedThrough) return "locked";
    if (index === currentStep) return "current";
    if (index <= unlockedThrough) return "passed";
    return "locked";
  });
}
