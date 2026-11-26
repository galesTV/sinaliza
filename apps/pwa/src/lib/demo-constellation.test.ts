import { describe, expect, it } from "vitest";

import {
  demoNodeStates,
  initialDemoConstellationState,
  reduceDemoConstellation,
} from "./demo-constellation";
import type { LessonRunnerSnapshot } from "./lesson-runner";

function snapshot(partial: Partial<LessonRunnerSnapshot>): LessonRunnerSnapshot {
  return {
    stepIndex: 0,
    stepCount: 6,
    block: null,
    selectedOption: null,
    result: null,
    answeredInVariant: false,
    canGoBack: false,
    solvedExercises: 0,
    totalExercises: 2,
    canComplete: false,
    completed: false,
    ...partial,
  };
}

describe("demo constellation state", () => {
  const exercises = [3, 5];

  it("starts mostly unrevealed and advances monotonically", () => {
    let state = initialDemoConstellationState();
    expect(demoNodeStates(state, exercises)).toEqual([]);

    state = reduceDemoConstellation(state, snapshot({ stepIndex: 2 }));
    expect(state.furthestStep).toBe(2);
    expect(demoNodeStates(state, exercises).slice(0, 4)).toEqual([
      "passed",
      "passed",
      "current",
      "locked",
    ]);
  });

  it("lights exercise nodes only for correct answers", () => {
    const state = reduceDemoConstellation(
      initialDemoConstellationState(),
      snapshot({ stepIndex: 3, solvedExercises: 1 }),
    );
    expect(demoNodeStates(state, exercises)[3]).toBe("correct");
    expect(demoNodeStates(state, exercises)[5]).toBe("locked");
  });

  it("ignores incorrect answers because only solved count is projected", () => {
    const state = reduceDemoConstellation(
      initialDemoConstellationState(),
      snapshot({ stepIndex: 3, result: "incorrect", solvedExercises: 0 }),
    );
    expect(state.correctExercises).toBe(0);
    expect(demoNodeStates(state, exercises)[3]).toBe("current");
  });

  it("does not duplicate or erase progress when navigating backward", () => {
    let state = reduceDemoConstellation(
      initialDemoConstellationState(),
      snapshot({ stepIndex: 5, solvedExercises: 2 }),
    );
    state = reduceDemoConstellation(
      state,
      snapshot({ stepIndex: 1, solvedExercises: 2 }),
    );
    expect(state.furthestStep).toBe(5);
    expect(state.correctExercises).toBe(2);
    expect(demoNodeStates(state, exercises)[5]).toBe("correct");
  });

  it("forms the completed simulation and resets only on restart after completion", () => {
    let state = reduceDemoConstellation(
      initialDemoConstellationState(),
      snapshot({ stepIndex: 6, solvedExercises: 2, completed: true }),
    );
    expect(state.completed).toBe(true);
    expect(demoNodeStates(state, exercises)).toEqual(
      Array(6).fill("complete"),
    );

    state = reduceDemoConstellation(state, snapshot({ stepIndex: 0 }));
    expect(state).toEqual(initialDemoConstellationState(6, 2));
  });
});
