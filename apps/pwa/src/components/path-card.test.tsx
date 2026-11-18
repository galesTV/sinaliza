import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getLearningPath, getPathStats } from "@/data/learning-paths";

import { PathCard } from "./path-card";

describe("PathCard", () => {
  it("links to the path and renders title, summary and stats", () => {
    const path = getLearningPath("alfabeto");
    expect(path).toBeDefined();

    const html = renderToStaticMarkup(<PathCard path={path!} />);

    expect(html).toContain('href="/trilhas/alfabeto"');
    expect(html).toContain("Alfabeto manual");
    const stats = getPathStats(path!);
    expect(html).toContain(`${stats.moduleCount} módulos`);
    expect(html).toContain(`${stats.lessonCount} lições`);
  });
});
