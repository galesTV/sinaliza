import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { ResumeTarget } from "@/lib/progression";

import { ModuleStateBadgeView } from "./module-state-badge";
import { PathCardProgressView } from "./path-card-progress";
import { PathPreparationNote, PathResumeCtaView } from "./path-resume-cta";

const resume = (title: string): ResumeTarget => ({
  path: {
    slug: "p",
    title: "P",
    summary: "",
    goal: "",
    icon: "alphabet",
    contentNote: "",
    modules: [],
  },
  module: { slug: "m", title: "M", description: "", lessons: [] },
  lesson: { slug: "l", title, status: "available", objective: "" },
  url: "/trilhas/p/m/l",
});

describe("ModuleStateBadgeView", () => {
  it("communicates 'preparation' even while the identity loads", () => {
    // A module with no completable lesson is a catalog fact — no personal
    // state involved — so it renders during identity resolution too.
    const html = renderToStaticMarkup(
      <ModuleStateBadgeView
        progress={{
          completedCount: 0,
          availableCount: 0,
          lessonCount: 5,
          ratio: null,
        }}
        loading={true}
      />,
    );
    expect(html).toContain("Em preparação");
  });

  it("shows the partial counter in progress", () => {
    const html = renderToStaticMarkup(
      <ModuleStateBadgeView
        progress={{
          completedCount: 2,
          availableCount: 5,
          lessonCount: 5,
          ratio: 0.4,
        }}
        loading={false}
      />,
    );
    expect(html).toContain("Em andamento");
    expect(html).toContain("2 de 5 atividades publicadas percorridas");
  });

  it("distinguishes walked-with-planned from fully finished", () => {
    const html = renderToStaticMarkup(
      <ModuleStateBadgeView
        progress={{
          completedCount: 5,
          availableCount: 5,
          lessonCount: 9,
          ratio: 1,
        }}
        loading={false}
      />,
    );
    expect(html).toContain("Atividades publicadas percorridas");
    expect(html).toContain("4 em preparação");
    expect(html).not.toContain("concluído");
  });

  it("hides personal states while the identity resolves", () => {
    const html = renderToStaticMarkup(
      <ModuleStateBadgeView
        progress={{
          completedCount: 1,
          availableCount: 3,
          lessonCount: 3,
          ratio: 1 / 3,
        }}
        loading={true}
      />,
    );
    expect(html).not.toContain("Em andamento");
    expect(html).not.toContain("atividades publicadas");
  });
});

describe("PathResumeCtaView", () => {
  it("offers 'Começar' with no prior progress", () => {
    const html = renderToStaticMarkup(
      <PathResumeCtaView
        resume={resume("Letra A")}
        hasProgress={false}
        allWalked={false}
      />,
    );
    expect(html).toContain('href="/trilhas/p/m/l"');
    expect(html).toContain("Começar: Letra A");
  });

  it("offers 'Continuar' with prior progress", () => {
    const html = renderToStaticMarkup(
      <PathResumeCtaView
        resume={resume("Letra B")}
        hasProgress={true}
        allWalked={false}
      />,
    );
    expect(html).toContain("Continuar: Letra B");
  });

  it("states the walked state honestly without a CTA", () => {
    const html = renderToStaticMarkup(
      <PathResumeCtaView
        resume={undefined}
        hasProgress={true}
        allWalked={true}
      />,
    );
    expect(html).toContain("percorreu todas as atividades publicadas");
    expect(html).not.toContain("btn-primary");
  });
});

describe("PathPreparationNote", () => {
  it("renders the editorial preparation state, not a CTA", () => {
    const html = renderToStaticMarkup(<PathPreparationNote />);
    expect(html).toContain("Uma trilha em construção");
    expect(html).toContain("percurso planejado");
    expect(html).not.toContain("href=");
  });
});

describe("PathCardProgressView", () => {
  it("shows the discreet preparation state and the exploratory CTA", () => {
    const html = renderToStaticMarkup(
      <PathCardProgressView
        progress={{
          completedCount: 0,
          availableCount: 0,
          lessonCount: 30,
          ratio: null,
        }}
        loading={false}
      />,
    );
    expect(html).toContain("Em preparação");
    expect(html).toContain("Explorar trilha");
    expect(html).not.toContain("percorridas");
  });

  it("shows individual progress with a non-empty bar", () => {
    const html = renderToStaticMarkup(
      <PathCardProgressView
        progress={{
          completedCount: 2,
          availableCount: 5,
          lessonCount: 30,
          ratio: 0.4,
        }}
        loading={false}
      />,
    );
    expect(html).toContain("2 de 5 atividades publicadas percorridas");
    expect(html).toContain("width:40%");
    expect(html).toContain("Ver trilha");
    expect(html).not.toContain("Explorar trilha");
  });

  it("shows catalog availability without an empty bar when nothing is walked", () => {
    const html = renderToStaticMarkup(
      <PathCardProgressView
        progress={{
          completedCount: 0,
          availableCount: 5,
          lessonCount: 30,
          ratio: 0,
        }}
        loading={false}
      />,
    );
    expect(html).toContain("5 atividades publicadas");
    expect(html).not.toContain("width:");
  });

  it("hides the personal counter while the identity resolves", () => {
    const html = renderToStaticMarkup(
      <PathCardProgressView
        progress={{
          completedCount: 2,
          availableCount: 5,
          lessonCount: 30,
          ratio: 0.4,
        }}
        loading={true}
      />,
    );
    expect(html).not.toContain("percorridas");
    expect(html).toContain("Ver trilha");
  });
});
