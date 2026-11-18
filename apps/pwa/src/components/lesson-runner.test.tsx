import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { LessonContent } from "@/data/lesson-content";

import { LessonRunner, runnerCopy } from "./lesson-runner";

const singleStepLesson: LessonContent = {
  intro: "Intro neutra.",
  blocks: [{ kind: "text", heading: "Passo único", body: "Corpo neutro." }],
};

describe("runnerCopy", () => {
  it("uses lesson language when progress is recorded", () => {
    const copy = runnerCopy(true);
    expect(copy.finish).toBe("Finalizar lição");
    expect(copy.complete).toBe("Concluir lição");
    expect(copy.completeHint).toContain("registrar a lição");
  });

  it("uses experience language when nothing is recorded", () => {
    const copy = runnerCopy(false);
    expect(copy.finish).toBe("Finalizar experiência");
    expect(copy.complete).toBe("Concluir experiência");
    expect(copy.completeHint).toContain("não registra progresso");
  });
});

describe("LessonRunner copy by mode", () => {
  it("shows experience language in lab mode (no lessonKey)", () => {
    const html = renderToStaticMarkup(
      <LessonRunner content={singleStepLesson} />,
    );
    expect(html).toContain("Finalizar experiência");
    expect(html).not.toContain("Finalizar lição");
  });

  it("keeps lesson language in published mode (lessonKey set)", () => {
    const html = renderToStaticMarkup(
      <LessonRunner content={singleStepLesson} lessonKey="alfabeto/m1/l1" />,
    );
    expect(html).toContain("Finalizar lição");
    expect(html).not.toContain("Finalizar experiência");
  });
});
