// @vitest-environment jsdom

import { act, StrictMode } from "react";
import { createRoot, hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { LessonContent } from "@/data/lesson-content";

import { LessonRunner } from "./lesson-runner";

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
window.scrollBy = () => {};

const mounted: Array<{ root: Root; container: HTMLDivElement }> = [];

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

function render(element: React.ReactElement): HTMLDivElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(element));
  mounted.push({ root, container });
  return container;
}

async function hydrate(element: React.ReactElement): Promise<HTMLDivElement> {
  const container = document.createElement("div");
  document.body.appendChild(container);
  container.innerHTML = renderToString(element);
  let root!: Root;
  await act(async () => {
    root = hydrateRoot(container, element);
  });
  mounted.push({ root, container });
  return container;
}

function click(element: Element) {
  act(() => {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

function buttonWithText(container: HTMLElement, text: string) {
  return Array.from(container.querySelectorAll("button")).find((button) =>
    button.textContent?.includes(text),
  );
}

afterEach(() => {
  while (mounted.length > 0) {
    const item = mounted.pop()!;
    act(() => item.root.unmount());
    item.container.remove();
  }
});

const twoTextSteps: LessonContent = {
  intro: "Intro.",
  blocks: [
    { kind: "text", heading: "Primeiro passo", body: "Primeiro corpo." },
    { kind: "text", heading: "Segundo passo", body: "Segundo corpo." },
  ],
};

const exerciseFirst: LessonContent = {
  intro: "Intro.",
  blocks: [
    {
      kind: "exercise",
      exercise: {
        prompt: "Escolha a alternativa correta.",
        options: [
          { label: "Correta", feedback: "ok" },
          { label: "Incorreta", feedback: "não" },
        ],
        correctIndex: 0,
        explanation: "Explicação.",
      },
    },
  ],
};

describe("LessonRunner hydration interaction readiness", () => {
  it("does not focus the heading during initial hydration but preserves later step focus", async () => {
    const container = await hydrate(
      <StrictMode>
        <LessonRunner content={twoTextSteps} />
      </StrictMode>,
    );

    const runner = container.querySelector("[data-lesson-interactive]");
    expect(runner?.getAttribute("data-lesson-interactive")).toBe("true");
    expect(document.activeElement?.id).not.toBe("lesson-runner-title");

    const continueButton = buttonWithText(container, "Continuar");
    expect(continueButton).toBeDefined();
    expect((continueButton as HTMLButtonElement).disabled).toBe(false);

    click(continueButton!);

    expect(container.textContent).toContain("Passo 2 de 2");
    expect(document.activeElement?.id).toBe("lesson-runner-title");
    expect(document.activeElement?.textContent).toBe("Segundo passo");
  });

  it("focuses the initial step when remounted after hydration in Strict Mode", () => {
    const container = render(
      <StrictMode>
        <LessonRunner content={twoTextSteps} />
      </StrictMode>,
    );

    expect(
      container.querySelector("[data-lesson-interactive]")?.getAttribute(
        "data-lesson-interactive",
      ),
    ).toBe("true");
    expect(document.activeElement?.id).toBe("lesson-runner-title");
    expect(document.activeElement?.textContent).toBe("Primeiro passo");
  });

  it("hydrates compatible SSR markup and enables exercise-first controls", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const container = await hydrate(
      <StrictMode>
        <LessonRunner content={exerciseFirst} />
      </StrictMode>,
    );

    const runner = container.querySelector("[data-lesson-interactive]");
    expect(runner?.getAttribute("data-lesson-interactive")).toBe("true");
    expect(container.textContent).toContain("Passo 1 de 1");
    expect(consoleError).not.toHaveBeenCalled();

    const correct = container.querySelector<HTMLInputElement>(
      'input[aria-label="Correta"]',
    );
    expect(correct?.disabled).toBe(false);
    click(correct!);
    const confirm = buttonWithText(container, "Confirmar resposta");
    expect((confirm as HTMLButtonElement).disabled).toBe(false);
    click(confirm!);

    expect(container.textContent).toContain("Correto!");
    expect(container.textContent).toContain("Passo 1 de 1");
    consoleError.mockRestore();
  });
});
