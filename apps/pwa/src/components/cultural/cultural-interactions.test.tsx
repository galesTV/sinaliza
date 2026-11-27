// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";

import {
  fixtureCuriosityEntries,
  fixtureLibraryEntries,
} from "@/test/cultural-fixtures";

import { CuriosityCards } from "./curiosity-cards";
import { LibraryBrowser } from "./library-browser";
import { OrbitalShelf } from "./orbital-shelf";

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

afterEach(() => {
  while (mounted.length > 0) {
    const item = mounted.pop()!;
    act(() => item.root.unmount());
    item.container.remove();
  }
});

function click(element: Element, coordinates?: { x: number; y: number }) {
  act(() => {
    element.dispatchEvent(new MouseEvent("click", {
      bubbles: true,
      clientX: coordinates?.x ?? 0,
      clientY: coordinates?.y ?? 0,
    }));
  });
}

function mockOrbitalItemRects(container: HTMLElement) {
  container.querySelectorAll(".orbital-item").forEach((element, index) => {
    Object.defineProperty(element, "getBoundingClientRect", {
      value: () => ({
        left: index * 100,
        right: index * 100 + 140,
        top: 0,
        bottom: 200,
        width: 140,
        height: 200,
        x: index * 100,
        y: 0,
        toJSON: () => ({}),
      }),
    });
  });
}

function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;
  act(() => {
    setter?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function setSelectValue(select: HTMLSelectElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLSelectElement.prototype,
    "value",
  )?.set;
  act(() => {
    setter?.call(select, value);
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

describe("cultural interactive components", () => {
  it("reveals and hides curiosity answers with accessible button state", () => {
    const container = render(<CuriosityCards entries={fixtureCuriosityEntries} />);
    const button = container.querySelector("button[aria-expanded]");
    expect(button).not.toBeNull();
    expect(button?.getAttribute("aria-expanded")).toBe("false");

    const answerId = button?.getAttribute("aria-controls");
    expect(answerId).toBeTruthy();
    const answer = container.querySelector(`#${answerId}`);
    expect(answer?.getAttribute("aria-hidden")).toBe("true");

    click(button!);
    expect(button?.getAttribute("aria-expanded")).toBe("true");
    expect(answer?.getAttribute("aria-hidden")).toBe("false");
    expect(answer?.textContent).toContain("verificar a revelação voluntária");

    click(button!);
    expect(button?.getAttribute("aria-expanded")).toBe("false");
    expect(answer?.getAttribute("aria-hidden")).toBe("true");
  });

  it("filters the library locally by accent-insensitive search text", () => {
    const container = render(<LibraryBrowser entries={fixtureLibraryEntries} />);
    expect(container.textContent).toContain("2 registros publicados encontrados");

    const input = container.querySelector<HTMLInputElement>("#library-search");
    expect(input).not.toBeNull();
    setInputValue(input!, "constelacao");

    expect(container.textContent).toContain("1 registro publicado encontrado");
    expect(container.textContent).toContain("Vídeo Fictício Constelação");
    expect(container.textContent).not.toContain("Livro Fictício Alfabeto Visual");

    setInputValue(input!, "termo sem resultado");
    expect(container.textContent).toContain("Nenhum resultado nesta busca");
  });

  it("filters the library by format and access without touching unpublished records", () => {
    const container = render(<LibraryBrowser entries={fixtureLibraryEntries} />);
    const format = container.querySelector<HTMLSelectElement>("#library-format");
    const access = container.querySelector<HTMLSelectElement>("#library-access");
    expect(format).not.toBeNull();
    expect(access).not.toBeNull();

    setSelectValue(format!, "book");
    expect(container.textContent).toContain("Livro Fictício Alfabeto Visual");
    expect(container.textContent).not.toContain("Vídeo Fictício Constelação");

    setSelectValue(format!, "all");
    setSelectValue(access!, "external-website");
    expect(container.textContent).toContain("Vídeo Fictício Constelação");
    expect(container.textContent).not.toContain("Livro Fictício Alfabeto Visual");
  });

  it("switches between grid and shelf with explicit pressed state", () => {
    const container = render(<LibraryBrowser entries={fixtureLibraryEntries} />);
    const shelfToggle = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Estante",
    );
    expect(shelfToggle?.getAttribute("aria-pressed")).toBe("false");

    click(shelfToggle!);
    expect(shelfToggle?.getAttribute("aria-pressed")).toBe("true");
    expect(container.textContent).toContain("Estante Orbital");
    expect(container.textContent).toContain("Obra 1 de 2");

    const gridToggle = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Grade",
    );
    click(gridToggle!);
    expect(gridToggle?.getAttribute("aria-pressed")).toBe("true");
    expect(container.textContent).not.toContain("Estante Orbital");
  });

  it("navigates the orbital shelf with controls and keyboard", () => {
    const container = render(<OrbitalShelf entries={fixtureLibraryEntries} />);
    expect(container.textContent).toContain("Obra 1 de 2");

    const next = container.querySelector('button[aria-label="Próxima obra"]');
    click(next!);
    expect(container.textContent).toContain("Obra 2 de 2");

    const stage = container.querySelector('[aria-label*="Estante orbital"]');
    act(() => {
      stage?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    });
    expect(container.textContent).toContain("Obra 1 de 2");

    act(() => {
      stage?.dispatchEvent(new MouseEvent("pointerdown", { clientX: 220, bubbles: true }));
      stage?.dispatchEvent(new MouseEvent("pointermove", { clientX: 130, bubbles: true }));
      stage?.dispatchEvent(new MouseEvent("pointerup", { clientX: 130, bubbles: true }));
    });
    expect(container.textContent).toContain("Obra 2 de 2");
  });

  it("selects a lateral item directly without opening its public detail", () => {
    const container = render(<OrbitalShelf entries={fixtureLibraryEntries} />);
    const lateralItem = container.querySelectorAll(".orbital-item")[1];
    expect(lateralItem).toBeDefined();
    mockOrbitalItemRects(container);

    click(lateralItem, { x: 220, y: 100 });

    expect(container.textContent).toContain("Obra 2 de 2");
    expect(container.textContent).toContain("Abrir ficha pública");
  });

  it("does not treat the click after horizontal drag as a lateral selection", () => {
    const many = fixtureLibraryEntries.flatMap((entry, group) =>
      Array.from({ length: 2 }, (_, index) => ({
        ...entry,
        id: `${entry.id}-${group}-${index}`,
        slug: `${entry.slug}-${group}-${index}`,
        title: `${entry.title} ${group}-${index}`,
      })),
    );
    const container = render(<OrbitalShelf entries={many} />);
    const stage = container.querySelector('[aria-label*="Estante orbital"]');
    mockOrbitalItemRects(container);

    act(() => {
      stage?.dispatchEvent(new MouseEvent("pointerdown", { clientX: 240, bubbles: true }));
      stage?.dispatchEvent(new MouseEvent("pointermove", { clientX: 150, bubbles: true }));
      stage?.dispatchEvent(new MouseEvent("pointerup", { clientX: 150, bubbles: true }));
    });
    expect(container.textContent).toContain("Obra 2 de 4");

    click(container.querySelectorAll(".orbital-item")[2], { x: 320, y: 100 });
    expect(container.textContent).toContain("Obra 2 de 4");
  });

  it("keeps a single-item shelf bounded and renders only nearby items in larger collections", () => {
    const single = render(<OrbitalShelf entries={fixtureLibraryEntries.slice(0, 1)} />);
    const previous = single.querySelector<HTMLButtonElement>('button[aria-label="Obra anterior"]');
    const next = single.querySelector<HTMLButtonElement>('button[aria-label="Próxima obra"]');
    expect(previous?.disabled).toBe(true);
    expect(next?.disabled).toBe(true);

    const many = fixtureLibraryEntries.flatMap((entry, group) =>
      Array.from({ length: 4 }, (_, index) => ({
        ...entry,
        id: `${entry.id}-${group}-${index}`,
        slug: `${entry.slug}-${group}-${index}`,
        title: `${entry.title} ${group}-${index}`,
      })),
    );
    const container = render(<OrbitalShelf entries={many} />);
    expect(container.querySelectorAll(".orbital-item").length).toBeLessThanOrEqual(7);
  });
});
