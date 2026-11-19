import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { LessonContent, LessonExercise } from "@/data/lesson-content";

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

describe("visual exercises", () => {
  const permitted = {
    source: "Fonte",
    license: "Licença",
    permissionEvidence: "doc-123",
  };
  const gated = { source: "Fonte", license: "Licença" };

  function contentWith(exercise: LessonExercise): LessonContent {
    return { intro: "Intro.", blocks: [{ kind: "exercise", exercise }] };
  }

  it("renders a permitted promptMedia stimulus above the options", () => {
    const html = renderToStaticMarkup(
      <LessonRunner
        content={contentWith({
          prompt: "Qual forma?",
          promptMedia: {
            media: {
              type: "image",
              src: "/media/fixtures/shape-circle.svg",
              alt: "Um círculo azul.",
            },
            attribution: permitted,
          },
          options: [
            { label: "Círculo", feedback: "ok" },
            { label: "Quadrado", feedback: "não" },
          ],
          correctIndex: 0,
          explanation: "e",
        })}
      />,
    );
    expect(html).toContain('src="/media/fixtures/shape-circle.svg"');
    expect(html).toContain('alt="Um círculo azul."');
    expect(html).toContain("Círculo");
  });

  it("offers the description variant when the stimulus is gated", () => {
    const html = renderToStaticMarkup(
      <LessonRunner
        content={contentWith({
          prompt: "Qual forma aparece na imagem?",
          promptMedia: {
            media: {
              type: "image",
              src: "/media/fixtures/shape-circle.svg",
              alt: "Um círculo azul.",
            },
            attribution: gated,
          },
          descriptionVariant: {
            prompt: "Pela descrição, qual forma é essa?",
            options: [
              { label: "Círculo", feedback: "ok" },
              { label: "Quadrado", feedback: "não" },
            ],
            correctIndex: 0,
            explanation: "e",
          },
          options: [
            { label: "Círculo", feedback: "ok" },
            { label: "Quadrado", feedback: "não" },
          ],
          correctIndex: 0,
          explanation: "e",
        })}
      />,
    );
    // The gated stimulus never renders and the variant prompt is used.
    expect(html).not.toContain('src="/media/fixtures/shape-circle.svg"');
    expect(html).toContain("Versão por descrição");
    expect(html).toContain("Pela descrição, qual forma é essa?");
    // The step heading itself carries the variant's prompt — the question
    // actually being asked — not the hidden visual one.
    expect(html).toMatch(/<h2[^>]*>\s*Pela descrição, qual forma é essa\?/);
  });

  it("exposes an accessible modality toggle next to a permitted stimulus", () => {
    const html = renderToStaticMarkup(
      <LessonRunner
        content={contentWith({
          prompt: "Qual forma aparece na imagem?",
          promptMedia: {
            media: {
              type: "image",
              src: "/media/fixtures/shape-circle.svg",
              alt: "Um círculo azul.",
            },
            attribution: permitted,
          },
          descriptionVariant: {
            prompt: "Pela descrição, qual forma é essa?",
            options: [
              { label: "Círculo", feedback: "ok" },
              { label: "Quadrado", feedback: "não" },
            ],
            correctIndex: 0,
            explanation: "e",
          },
          options: [
            { label: "Círculo", feedback: "ok" },
            { label: "Quadrado", feedback: "não" },
          ],
          correctIndex: 0,
          explanation: "e",
        })}
      />,
    );
    // Real <button> with an accessible name and pressed-state indication.
    expect(html).toMatch(
      /<button[^>]*aria-pressed="false"[^>]*>\s*Responder por descrição/,
    );
    // The heading shows the visual prompt while the image is visible.
    expect(html).toMatch(
      /<h2[^>]*>\s*Qual forma aparece na imagem\?/,
    );
  });

  it("blocks the exercise when the stimulus is gated and no variant exists", () => {
    const html = renderToStaticMarkup(
      <LessonRunner
        content={contentWith({
          prompt: "Qual forma aparece na imagem?",
          promptMedia: {
            media: {
              type: "image",
              src: "/media/fixtures/shape-circle.svg",
              alt: "Um círculo azul.",
            },
            attribution: gated,
          },
          options: [
            { label: "Círculo", feedback: "ok" },
            { label: "Quadrado", feedback: "não" },
          ],
          correctIndex: 0,
          explanation: "e",
        })}
      />,
    );
    expect(html).toContain("Exercício indisponível");
    // Every option input is disabled — the exercise cannot be answered.
    const inputs = html.match(/<input[^>]*disabled[^>]*>/g) ?? [];
    expect(inputs.length).toBe(2);
  });
});
