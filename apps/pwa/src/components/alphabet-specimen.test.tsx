import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  getSpecimen,
  type AlphabetSpecimen,
} from "@/data/alphabet-specimens";

import { SpecimenViewer } from "./alphabet-specimen";

const LICENSED_MEDIA: Pick<AlphabetSpecimen, "media" | "attribution"> = {
  media: {
    type: "image",
    src: "/media/alfabeto/letras-u-z/letra-x.jpg",
    alt: "Demonstração da configuração de mão da letra X.",
  },
  attribution: {
    source: "Equipe Sinaliza",
    license: "Produção própria",
    permissionEvidence: "Termo de autorização de imagem do intérprete.",
  },
};

function makeSpecimen(
  overrides: Partial<AlphabetSpecimen> = {},
): AlphabetSpecimen {
  return {
    id: "letra-x",
    lessonKey: "alfabeto/letras-u-z/letra-x",
    letter: "X",
    title: "Letra X",
    references: [
      {
        institution: "INES",
        url: "https://example.org/fonte",
        purpose: "Testar",
        consultedAt: "2026-11-18",
      },
    ],
    validationStatus: "draft",
    version: "draft-1",
    reviews: [],
    ...overrides,
  };
}

describe("SpecimenViewer", () => {
  it("renders the honest unavailable state when there is no media", () => {
    const html = renderToStaticMarkup(
      <SpecimenViewer specimen={getSpecimen("A")!} />,
    );
    expect(html).toContain("em produção");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("<video");
  });

  it("renders licensed media through the accessible media component", () => {
    const html = renderToStaticMarkup(
      <SpecimenViewer
        specimen={makeSpecimen({
          media: LICENSED_MEDIA.media,
          attribution: LICENSED_MEDIA.attribution,
        })}
      />,
    );
    expect(html).toContain("<img");
    expect(html).toContain("Licença");
  });
});
