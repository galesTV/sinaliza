import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ActivityPanel } from "./activity-panel";

describe("ActivityPanel", () => {
  it("renders the honest empty state without completions", () => {
    const html = renderToStaticMarkup(<ActivityPanel items={[]} />);
    expect(html).toContain("Nenhuma atividade ainda");
    expect(html).toContain("lições concluídas aparecem aqui");
    expect(html).not.toContain("XP");
  });

  it("lists completed lessons with links", () => {
    const html = renderToStaticMarkup(
      <ActivityPanel
        items={[
          {
            key: "alfabeto/letras-a-e/letra-a",
            title: "Letra A",
            url: "/trilhas/alfabeto/letras-a-e/letra-a",
          },
        ]}
      />,
    );
    expect(html).toContain("1 lição concluída");
    expect(html).toContain("Letra A");
    expect(html).toContain("/trilhas/alfabeto/letras-a-e/letra-a");
  });

  it("pluralizes the count", () => {
    const html = renderToStaticMarkup(
      <ActivityPanel
        items={[
          { key: "a/b/c", title: "Uma", url: "/trilhas/a/b/c" },
          { key: "a/b/d", title: "Outra", url: "/trilhas/a/b/d" },
        ]}
      />,
    );
    expect(html).toContain("2 lições concluídas");
  });
});
