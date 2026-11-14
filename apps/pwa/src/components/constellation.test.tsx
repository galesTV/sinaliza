import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ConstellationFigure } from "./constellation";

describe("ConstellationFigure", () => {
  it("renders a decorative SVG hidden from assistive tech", () => {
    const html = renderToStaticMarkup(<ConstellationFigure />);

    expect(html).toContain("<svg");
    expect(html).toContain('aria-hidden="true"');
  });

  it("draws the trajectory: nodes, edges, and a ring around the terminal node", () => {
    const html = renderToStaticMarkup(<ConstellationFigure />);

    // 12 nodes + the ring around the terminal node
    expect(html.match(/<circle /g)).toHaveLength(13);
    // 6 edges of the main trajectory + 6 of the secondary branches
    expect(html.match(/<line /g)).toHaveLength(12);
  });

  it("uses no warm accent — the amber token is reserved for one element per view (MASTER.md §2)", () => {
    const html = renderToStaticMarkup(<ConstellationFigure />);

    expect(html).not.toContain("highlight");
    expect(html).toContain("var(--color-accent)");
  });
});
