import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getLessonContext } from "@/data/learning-paths";

import {
  LessonContentArea,
  LessonStatusBadge,
} from "./lesson-availability";
import { LessonPager } from "./lesson-pager";

describe("LessonStatusBadge", () => {
  it("renders the availability state", () => {
    expect(renderToStaticMarkup(<LessonStatusBadge status="planned" />)).toContain(
      "Em breve",
    );
    expect(
      renderToStaticMarkup(<LessonStatusBadge status="available" />),
    ).toContain("Disponível");
  });
});

describe("LessonContentArea", () => {
  it("shows an honest pending panel for planned lessons", () => {
    const html = renderToStaticMarkup(<LessonContentArea status="planned" />);
    expect(html).toContain("Conteúdo em preparação");
    expect(html).toContain("validação pedagógica");
  });

  it("renders the lesson runner when an available lesson has content", () => {
    const html = renderToStaticMarkup(
      <LessonContentArea
        status="available"
        lessonKey="trilha/modulo/licao"
        content={{
          intro: "intro",
          blocks: [{ kind: "text", heading: "Passo único", body: "texto" }],
        }}
      />,
    );
    expect(html).toContain("Passo único");
    expect(html).toContain("Passo 1 de 1");
  });

  it("renders nothing for an available lesson without content", () => {
    expect(
      renderToStaticMarkup(<LessonContentArea status="available" />),
    ).toBe("");
  });
});

describe("LessonPager", () => {
  it("links previous and next lessons in module order", () => {
    const context = getLessonContext("vocabulario", "saudacoes", "boa-tarde")!;
    const html = renderToStaticMarkup(<LessonPager context={context} />);

    expect(html).toContain("/trilhas/vocabulario/saudacoes/bom-dia");
    expect(html).toContain("/trilhas/vocabulario/saudacoes/boa-noite");
    expect(html).toContain("Lição anterior");
    expect(html).toContain("Próxima lição");
  });

  it("renders no previous link on the first lesson and no next link on the last", () => {
    const first = getLessonContext("alfabeto", "primeiros-passos", "o-que-e")!;
    const firstHtml = renderToStaticMarkup(<LessonPager context={first} />);
    expect(firstHtml).not.toContain("Lição anterior");
    expect(firstHtml).toContain("/trilhas/alfabeto/primeiros-passos/quando-usar");

    const last = getLessonContext("alfabeto", "letras-u-z", "letra-z")!;
    const lastHtml = renderToStaticMarkup(<LessonPager context={last} />);
    expect(lastHtml).not.toContain("Próxima lição");
    expect(lastHtml).toContain("/trilhas/alfabeto/letras-u-z/letra-y");
  });
});
