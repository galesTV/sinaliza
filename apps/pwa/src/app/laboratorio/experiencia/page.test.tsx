import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { GuidedExperienceDemo } from "@/components/guided-experience-demo";
import {
  alphabetSpecimens,
  getSpecimenUrl,
} from "@/data/alphabet-specimens";

import GuidedExperiencePage, { metadata } from "./page";

/** Finds the first element of a given component type in a rendered tree. */
function findElement(node: ReactNode, type: unknown): ReactElement | null {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findElement(child, type);
      if (found) return found;
    }
    return null;
  }
  if (!isValidElement(node)) return null;
  if (node.type === type) return node;
  const children = (node.props as { children?: ReactNode }).children;
  return findElement(children, type);
}

describe("guided experience page", () => {
  const html = renderToStaticMarkup(<GuidedExperiencePage />);

  it("is noindexed laboratory content", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(html).toContain("Laboratório experimental");
  });

  it("states the activity objective before the first step", () => {
    expect(html).toContain("fluxo completo de uma atividade");
    expect(html).toContain("Passo 1 de 6");
  });

  it("keeps the laboratory honest about progress and content", () => {
    expect(html).toContain("Não registra progresso");
    expect(html).toContain("não é material");
  });

  it("runs the runner without a progress key", () => {
    // No lessonKey ever reaches the runner here: completing the experience
    // cannot write to the real progress store.
    const runner = findElement(GuidedExperiencePage(), GuidedExperienceDemo);
    expect(runner).not.toBeNull();
    expect(
      (runner!.props as { lessonKey?: string }).lessonKey,
    ).toBeUndefined();
  });

  it("links every catalogued specimen", () => {
    expect(alphabetSpecimens.length).toBeGreaterThan(0);
    for (const specimen of alphabetSpecimens) {
      const url = getSpecimenUrl(specimen.letter);
      expect(html).toContain(`href="${url}"`);
    }
  });

  it("shows the honest media state instead of placeholder imagery", () => {
    expect(html).toContain("Abra um espécime");
    expect(html).not.toContain("placeholder");
  });
});

describe("guided experience demo wiring", () => {
  it("labels the visual evolution as non-persisted simulation", () => {
    const html = renderToStaticMarkup(<GuidedExperienceDemo />);
    expect(html).toContain("Constelação demonstrativa");
    expect(html).toContain("não registra progresso nas trilhas");
    expect(html).toContain("Passo 1 de 6");
  });
});
