import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getLessonUrl } from "@/data/learning-paths";
import { getPathProgress, getResumeLesson } from "@/lib/progression";
import { lessonKey } from "@/lib/progress";

import { ModuleLessonChip } from "./module-lesson-chip";
import { PathProgressLineView } from "./path-progress-line";
import { ResumeCtaView } from "./resume-cta";

describe("ModuleLessonChip", () => {
  const href = getLessonUrl("alfabeto", "letras-a-e", "letra-a");
  const key = lessonKey("alfabeto", "letras-a-e", "letra-a");

  it("links to the lesson page", () => {
    const html = renderToStaticMarkup(
      <ModuleLessonChip
        href={href}
        title="Letra A"
        status="available"
        lessonKey={key}
      />,
    );
    expect(html).toContain(`href="${href}"`);
    expect(html).toContain("Letra A");
  });

  it("marks planned lessons as unavailable in text and style", () => {
    const html = renderToStaticMarkup(
      <ModuleLessonChip
        href={href}
        title="Letra A"
        status="planned"
        lessonKey={key}
      />,
    );
    expect(html).toContain("(em breve)");
    expect(html).toContain("border-dashed");
  });

  it("renders no completion check on the server (store is client-only)", () => {
    const html = renderToStaticMarkup(
      <ModuleLessonChip
        href={href}
        title="Letra A"
        status="available"
        lessonKey={key}
      />,
    );
    expect(html).not.toContain("(concluída)");
  });
});

describe("PathProgressLineView", () => {
  it("renders nothing when the path has no available lessons", () => {
    const path = {
      slug: "p",
      title: "p",
      summary: "",
      goal: "",
      icon: "alphabet" as const,
      contentNote: "",
      modules: [
        {
          slug: "m",
          title: "",
          description: "",
          lessons: [
            { slug: "l", title: "l", status: "planned" as const, objective: "" },
          ],
        },
      ],
    };
    const html = renderToStaticMarkup(
      <PathProgressLineView
        progress={getPathProgress(path, new Set())}
      />,
    );
    expect(html).toBe("");
  });

  it("shows completed-over-available without a misleading total", () => {
    const path = {
      slug: "p",
      title: "p",
      summary: "",
      goal: "",
      icon: "alphabet" as const,
      contentNote: "",
      modules: [
        {
          slug: "m",
          title: "",
          description: "",
          lessons: [
            { slug: "a", title: "a", status: "available" as const, objective: "" },
            { slug: "b", title: "b", status: "available" as const, objective: "" },
            { slug: "c", title: "c", status: "planned" as const, objective: "" },
          ],
        },
      ],
    };
    const completed = new Set([lessonKey("p", "m", "a")]);
    const html = renderToStaticMarkup(
      <PathProgressLineView progress={getPathProgress(path, completed)} />,
    );
    expect(html).toContain("1 de 2 lições disponíveis concluídas");
    expect(html).not.toContain("de 3");
  });
});

describe("ResumeCtaView", () => {
  it("offers the honest starting link when nothing is published", () => {
    const html = renderToStaticMarkup(
      <ResumeCtaView
        resume={undefined}
        availableCount={0}
        firstPathSlug="alfabeto"
      />,
    );
    expect(html).toContain('href="/trilhas/alfabeto"');
    expect(html).toContain("Começar pelo alfabeto");
    expect(html).toContain("Nenhuma lição publicada ainda");
  });

  it("offers a resume link straight to the next lesson", () => {
    const path = {
      slug: "alfabeto",
      title: "Alfabeto",
      summary: "",
      goal: "",
      icon: "alphabet" as const,
      contentNote: "",
      modules: [
        {
          slug: "m",
          title: "",
          description: "",
          lessons: [
            {
              slug: "letra-a",
              title: "Letra A",
              status: "available" as const,
              objective: "",
            },
          ],
        },
      ],
    };
    const resume = getResumeLesson([path], new Set());
    const html = renderToStaticMarkup(
      <ResumeCtaView
        resume={resume}
        availableCount={1}
        firstPathSlug="alfabeto"
      />,
    );
    expect(html).toContain('href="/trilhas/alfabeto/m/letra-a"');
    expect(html).toContain("Continuar:");
    expect(html).toContain("Letra A");
  });

  it("shows the all-caught-up state when every available lesson is done", () => {
    const html = renderToStaticMarkup(
      <ResumeCtaView
        resume={undefined}
        availableCount={2}
        firstPathSlug="alfabeto"
      />,
    );
    expect(html).toContain("concluiu todas as lições disponíveis");
    expect(html).toContain('href="/trilhas"');
  });
});
