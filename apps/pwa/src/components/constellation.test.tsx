import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ConstellationFigure } from "./constellation";

describe("ConstellationFigure", () => {
  it("renders a decorative SVG hidden from assistive tech", () => {
    const html = renderToStaticMarkup(<ConstellationFigure />);

    expect(html).toContain("<svg");
    expect(html).toContain('aria-hidden="true"');
  });

  it("is deterministic across renders", () => {
    expect(renderToStaticMarkup(<ConstellationFigure />)).toEqual(
      renderToStaticMarkup(<ConstellationFigure />),
    );
  });
});
