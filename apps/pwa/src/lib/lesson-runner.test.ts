import { describe, expect, it, vi } from "vitest";

import type { LessonContent } from "@/data/lesson-content";

import { createLessonRunner } from "./lesson-runner";

function makeContent(): LessonContent {
  return {
    intro: "intro",
    blocks: [
      { kind: "text", heading: "Passo 1", body: "texto" },
      {
        kind: "exercise",
        exercise: {
          prompt: "Pergunta 1",
          options: [
            { label: "A", feedback: "errada" },
            { label: "B", feedback: "certa" },
          ],
          correctIndex: 1,
          explanation: "B é a resposta",
        },
      },
      {
        kind: "exercise",
        exercise: {
          prompt: "Pergunta 2",
          options: [
            { label: "X", feedback: "certa" },
            { label: "Y", feedback: "errada" },
          ],
          correctIndex: 0,
          explanation: "X é a resposta",
        },
      },
    ],
  };
}

describe("createLessonRunner", () => {
  it("starts on the first block and advances through text", () => {
    const runner = createLessonRunner(makeContent());
    const snap = runner.getSnapshot();
    expect(snap.stepIndex).toBe(0);
    expect(snap.stepCount).toBe(3);
    expect(snap.block?.kind).toBe("text");

    runner.advance();
    expect(runner.getSnapshot().block?.kind).toBe("exercise");
  });

  it("reports an incorrect answer and keeps the exercise unsolved", () => {
    const runner = createLessonRunner(makeContent());
    runner.advance();

    runner.select(0);
    const snap = runner.getSnapshot();
    expect(snap.result).toBe("incorrect");
    expect(snap.selectedOption).toBe(0);
    expect(snap.solvedExercises).toBe(0);
  });

  it("blocks advancing while an exercise is unanswered or incorrect", () => {
    const runner = createLessonRunner(makeContent());
    runner.advance();

    runner.advance();
    expect(runner.getSnapshot().stepIndex).toBe(1);

    runner.select(0);
    runner.advance();
    expect(runner.getSnapshot().stepIndex).toBe(1);
  });

  it("allows retrying after an incorrect answer", () => {
    const runner = createLessonRunner(makeContent());
    runner.advance();

    runner.select(0);
    expect(runner.getSnapshot().result).toBe("incorrect");

    runner.select(1);
    const snap = runner.getSnapshot();
    expect(snap.result).toBe("correct");
    expect(snap.solvedExercises).toBe(1);

    runner.advance();
    expect(runner.getSnapshot().stepIndex).toBe(2);
  });

  it("ignores selections on a solved exercise and invalid indices", () => {
    const runner = createLessonRunner(makeContent());
    runner.advance();

    runner.select(1);
    expect(runner.getSnapshot().solvedExercises).toBe(1);

    runner.select(0);
    runner.select(5);
    runner.select(-1);
    expect(runner.getSnapshot().solvedExercises).toBe(1);
    expect(runner.getSnapshot().selectedOption).toBe(1);
  });

  it("ignores selections on text blocks", () => {
    const runner = createLessonRunner(makeContent());
    runner.select(0);
    expect(runner.getSnapshot().selectedOption).toBeNull();
  });

  it("withholds completion until all exercises are solved", () => {
    const runner = createLessonRunner(makeContent());
    expect(runner.complete()).toBe(false);
    expect(runner.getSnapshot().completed).toBe(false);

    runner.advance();
    runner.select(1);
    runner.advance();
    runner.advance(); // last exercise still unanswered → blocked
    expect(runner.getSnapshot().block?.kind).toBe("exercise");

    runner.select(0);
    runner.advance();
    const snap = runner.getSnapshot();
    expect(snap.block).toBeNull();
    expect(snap.canComplete).toBe(true);
    expect(runner.complete()).toBe(true);
    expect(runner.getSnapshot().completed).toBe(true);
  });

  it("fires onComplete exactly once despite repeated complete calls", () => {
    const onComplete = vi.fn();
    const runner = createLessonRunner(makeContent(), { onComplete });

    runner.advance();
    runner.select(1);
    runner.advance();
    runner.select(0);
    runner.advance();

    expect(runner.complete()).toBe(true);
    expect(runner.complete()).toBe(false);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(runner.getSnapshot().canComplete).toBe(false);
  });

  it("resets fully on restart", () => {
    const runner = createLessonRunner(makeContent());
    runner.advance();
    runner.select(1);
    runner.advance();
    runner.select(0);
    runner.advance();
    runner.complete();

    runner.restart();
    const snap = runner.getSnapshot();
    expect(snap.stepIndex).toBe(0);
    expect(snap.solvedExercises).toBe(0);
    expect(snap.completed).toBe(false);
    expect(snap.block?.kind).toBe("text");
  });

  it("notifies subscribers on every transition", () => {
    const runner = createLessonRunner(makeContent());
    const listener = vi.fn();
    runner.subscribe(listener);

    runner.advance();
    runner.select(0);
    runner.select(1);
    runner.advance();
    expect(listener).toHaveBeenCalledTimes(4);
  });
});
