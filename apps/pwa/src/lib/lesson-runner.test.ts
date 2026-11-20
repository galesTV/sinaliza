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

  it("advances past media steps freely and never counts them as exercises", () => {
    const runner = createLessonRunner({
      intro: "intro",
      blocks: [
        {
          kind: "media",
          title: "Demo",
          description: "desc",
          media: { type: "video", src: "/media/x.mp4" },
          attribution: { source: "s", license: "l" },
        },
        {
          kind: "exercise",
          exercise: {
            prompt: "Pergunta",
            options: [
              { label: "A", feedback: "f" },
              { label: "B", feedback: "f" },
            ],
            correctIndex: 1,
            explanation: "e",
          },
        },
      ],
    });

    const snap = runner.getSnapshot();
    expect(snap.stepCount).toBe(2);
    expect(snap.totalExercises).toBe(1);
    expect(snap.block?.kind).toBe("media");

    // Media never gates progress: advancing does not require watching.
    runner.advance();
    expect(runner.getSnapshot().block?.kind).toBe("exercise");

    runner.select(1);
    runner.advance();
    expect(runner.complete()).toBe(true);
  });

  it("advances past resources steps freely and never counts them as exercises", () => {
    const runner = createLessonRunner({
      intro: "intro",
      blocks: [
        {
          kind: "resources",
          heading: "Recursos complementares",
          body: "Links externos.",
          items: [
            {
              title: "Fonte externa",
              source: "Instituição",
              url: "https://example.org/x",
              description: "Ajuda a revisar.",
            },
          ],
        },
        {
          kind: "exercise",
          exercise: {
            prompt: "Pergunta",
            options: [
              { label: "A", feedback: "f" },
              { label: "B", feedback: "f" },
            ],
            correctIndex: 1,
            explanation: "e",
          },
        },
      ],
    });

    const snap = runner.getSnapshot();
    expect(snap.stepCount).toBe(2);
    expect(snap.totalExercises).toBe(1);
    expect(snap.block?.kind).toBe("resources");

    // Resources never gate progress: advancing requires nothing, and a
    // stray select() on the step is ignored.
    runner.select(0);
    expect(runner.getSnapshot().selectedOption).toBeNull();
    runner.advance();
    expect(runner.getSnapshot().block?.kind).toBe("exercise");

    runner.select(1);
    runner.advance();
    expect(runner.complete()).toBe(true);
  });

  it("navigates backward freely and restores each step's answer state", () => {
    const runner = createLessonRunner(makeContent());
    expect(runner.getSnapshot().canGoBack).toBe(false);
    runner.back(); // already at the first step — no-op
    expect(runner.getSnapshot().stepIndex).toBe(0);

    runner.advance();
    expect(runner.getSnapshot().canGoBack).toBe(true);

    // An incorrect answer is remembered when returning to the exercise.
    runner.select(0);
    runner.back();
    expect(runner.getSnapshot().block?.kind).toBe("text");
    runner.advance();
    const returned = runner.getSnapshot();
    expect(returned.result).toBe("incorrect");
    expect(returned.selectedOption).toBe(0);
  });

  it("keeps a revisited exercise solved and never re-counts it", () => {
    const runner = createLessonRunner(makeContent());
    runner.advance();
    runner.select(1);
    expect(runner.getSnapshot().solvedExercises).toBe(1);

    runner.back();
    runner.advance();
    const snap = runner.getSnapshot();
    expect(snap.result).toBe("correct");
    expect(snap.solvedExercises).toBe(1);

    // Selecting again on the revisited exercise cannot flip or recount it.
    runner.select(0);
    expect(runner.getSnapshot().solvedExercises).toBe(1);
    expect(runner.getSnapshot().result).toBe("correct");
  });

  it("returns from the completion screen to the last block", () => {
    const runner = createLessonRunner(makeContent());
    runner.advance();
    runner.select(1);
    runner.advance();
    runner.select(0);
    runner.advance();
    expect(runner.getSnapshot().block).toBeNull();

    runner.back();
    const snap = runner.getSnapshot();
    expect(snap.block?.kind).toBe("exercise");
    expect(snap.result).toBe("correct");

    runner.advance();
    expect(runner.getSnapshot().canComplete).toBe(true);
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

describe("visual exercise gating", () => {
  const permittedAttribution = {
    source: "Fonte",
    license: "Licença",
    permissionEvidence: "doc-123",
  };
  const gatedAttribution = {
    source: "Fonte",
    license: "Licença",
  };

  function visualContent(opts: {
    permitted: boolean;
    withVariant: boolean;
  }): LessonContent {
    return {
      intro: "intro",
      blocks: [
        {
          kind: "exercise",
          exercise: {
            prompt: "Qual forma aparece?",
            promptMedia: {
              media: { type: "image", src: "/m.png", alt: "estímulo" },
              attribution: opts.permitted
                ? permittedAttribution
                : gatedAttribution,
            },
            options: [
              { label: "Certa", feedback: "ok" },
              { label: "Errada", feedback: "não" },
            ],
            correctIndex: 0,
            explanation: "e",
            ...(opts.withVariant
              ? {
                  descriptionVariant: {
                    prompt: "Pela descrição, qual forma?",
                    options: [
                      { label: "V-errada", feedback: "não" },
                      { label: "V-certa", feedback: "ok" },
                    ],
                    correctIndex: 1,
                    explanation: "ve",
                  },
                }
              : {}),
          },
        },
      ],
    };
  }

  it("ignores select() while the stimulus media is not permitted", () => {
    const runner = createLessonRunner(
      visualContent({ permitted: false, withVariant: false }),
    );

    runner.select(0);
    const snap = runner.getSnapshot();
    // The selection is refused: no guessing at a hidden stimulus, so the
    // exercise can never be marked correct nor the lesson completed.
    expect(snap.selectedOption).toBeNull();
    expect(snap.result).toBeNull();
    expect(snap.solvedExercises).toBe(0);

    runner.advance();
    expect(runner.getSnapshot().stepIndex).toBe(0);
    expect(runner.complete()).toBe(false);
  });

  it("accepts select() when the stimulus media is permitted", () => {
    const runner = createLessonRunner(
      visualContent({ permitted: true, withVariant: false }),
    );
    runner.select(1);
    expect(runner.getSnapshot().result).toBe("incorrect");
    runner.select(0);
    expect(runner.getSnapshot().result).toBe("correct");
  });

  it("scores selectVariant() against the variant's correctIndex", () => {
    const runner = createLessonRunner(
      visualContent({ permitted: false, withVariant: true }),
    );

    // Variant option 0 is incorrect per variant.correctIndex (= 1).
    runner.selectVariant(0);
    expect(runner.getSnapshot().result).toBe("incorrect");

    runner.selectVariant(1);
    const snap = runner.getSnapshot();
    expect(snap.result).toBe("correct");
    expect(snap.solvedExercises).toBe(1);

    runner.advance();
    expect(runner.complete()).toBe(true);
  });

  it("ignores selectVariant() when the exercise has no variant", () => {
    const runner = createLessonRunner(
      visualContent({ permitted: false, withVariant: false }),
    );
    runner.selectVariant(0);
    expect(runner.getSnapshot().selectedOption).toBeNull();
    expect(runner.getSnapshot().result).toBeNull();
  });

  it("still lets a permitted exercise be answered through its variant", () => {
    const runner = createLessonRunner(
      visualContent({ permitted: true, withVariant: true }),
    );
    runner.selectVariant(1);
    expect(runner.getSnapshot().result).toBe("correct");
  });
});

describe("answer modality per block", () => {
  const attribution = {
    source: "Fonte",
    license: "Licença",
    permissionEvidence: "doc-123",
  };

  const twoExerciseContent: LessonContent = {
    intro: "intro",
    blocks: [
      {
        kind: "exercise",
        exercise: {
          prompt: "A — qual forma aparece?",
          promptMedia: {
            media: { type: "image", src: "/a.png", alt: "estímulo A" },
            attribution,
          },
          options: [
            { label: "A0", feedback: "ok" },
            { label: "A1", feedback: "não" },
          ],
          correctIndex: 0,
          explanation: "ea",
          descriptionVariant: {
            prompt: "A — pela descrição, qual forma?",
            options: [
              { label: "AV0", feedback: "não" },
              { label: "AV1", feedback: "ok" },
            ],
            correctIndex: 1,
            explanation: "vea",
          },
        },
      },
      {
        kind: "exercise",
        exercise: {
          prompt: "B — qual forma aparece?",
          promptMedia: {
            media: { type: "image", src: "/b.png", alt: "estímulo B" },
            attribution,
          },
          options: [
            { label: "B0", feedback: "ok" },
            { label: "B1", feedback: "não" },
          ],
          correctIndex: 0,
          explanation: "eb",
        },
      },
    ],
  };

  it("records the answering modality per block across navigation", () => {
    const runner = createLessonRunner(twoExerciseContent);

    // A answered by description — modality recorded on A's block state.
    runner.selectVariant(1);
    expect(runner.getSnapshot().answeredInVariant).toBe(true);
    expect(runner.getSnapshot().result).toBe("correct");

    runner.advance();
    runner.select(0);
    expect(runner.getSnapshot().answeredInVariant).toBe(false);
    expect(runner.getSnapshot().result).toBe("correct");

    // Revisiting A restores ITS modality — B's visual answer cannot
    // reinterpret A's description answer, and vice-versa.
    runner.back();
    expect(runner.getSnapshot().answeredInVariant).toBe(true);
    expect(runner.getSnapshot().selectedOption).toBe(1);
    expect(runner.getSnapshot().result).toBe("correct");

    runner.advance();
    expect(runner.getSnapshot().answeredInVariant).toBe(false);
    expect(runner.getSnapshot().result).toBe("correct");
  });

  it("records visual modality for select() and variant for selectVariant()", () => {
    const runner = createLessonRunner(twoExerciseContent);
    runner.select(0);
    expect(runner.getSnapshot().answeredInVariant).toBe(false);

    runner.advance();
    runner.selectVariant(0); // ignored: B has no variant
    expect(runner.getSnapshot().result).toBeNull();
    expect(runner.getSnapshot().answeredInVariant).toBe(false);
  });

  it("clears the recorded modality on restart()", () => {
    const runner = createLessonRunner(twoExerciseContent);
    runner.selectVariant(1);
    runner.restart();
    expect(runner.getSnapshot().answeredInVariant).toBe(false);
    expect(runner.getSnapshot().selectedOption).toBeNull();
  });
});
