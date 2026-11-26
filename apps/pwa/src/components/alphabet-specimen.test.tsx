import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  getSpecimen,
  type AlphabetSpecimen,
} from "@/data/alphabet-specimens";

import { SpecimenReviewNote, SpecimenViewer } from "./alphabet-specimen";

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
    // Letter C is the catalogued letter still without licensed media.
    const html = renderToStaticMarkup(
      <SpecimenViewer specimen={getSpecimen("C")!} />,
    );
    expect(html).toContain("em produção");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("<video");
  });

  it("renders the licensed Fiocruz photo with the required credit", () => {
    const html = renderToStaticMarkup(
      <SpecimenViewer specimen={getSpecimen("A")!} />,
    );
    expect(html).toContain("<img");
    expect(html).toContain(
      "Imagem: <a href=\"https://www.fiocruzimagens.fiocruz.br/s/fiocruzimagens/item/127847\"",
    );
    expect(html).toContain("Mauro Campello | Acervo Fiocruz Imagens");
    expect(html).toContain("Licença");
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

  it("never renders media without proven display permission", () => {
    for (const attribution of [
      undefined,
      { source: "Fonte externa", license: "Sem licença informada" },
      {
        source: "Fonte externa",
        license: "CC BY 4.0",
        permissionEvidence: "",
      },
    ]) {
      const html = renderToStaticMarkup(
        <SpecimenViewer
          specimen={makeSpecimen({
            media: {
              type: "image",
              src: "/media/x.jpg",
              alt: "Configuração de mão.",
            },
            attribution,
          })}
        />,
      );
      expect(html).not.toContain("<img");
      expect(html).toContain("em produção");
    }
  });

  it("explains local-review restriction instead of reporting an unconfirmed license", () => {
    const specimen = makeSpecimen({
      media: { type: "image", src: "", alt: "Configuração de mão." },
      attribution: {
        source: "Fonte externa",
        license: "Uso educativo restrito",
        permissionEvidence: "",
        displayScope: "local-review",
      },
    });
    const html = renderToStaticMarkup(
      <>
        <SpecimenReviewNote specimen={specimen} />
        <SpecimenViewer specimen={specimen} />
      </>,
    );
    expect(html).toContain("autorização documentada para revisão local");
    expect(html).toContain("não é exibida neste ambiente público");
    expect(html).not.toContain("licença confirmada está disponível");
  });

  it("previews licensed media while the unvalidated-review note shows", () => {
    const specimen = makeSpecimen({
      validationStatus: "draft",
      media: LICENSED_MEDIA.media,
      attribution: LICENSED_MEDIA.attribution,
    });
    const html = renderToStaticMarkup(
      <>
        <SpecimenReviewNote specimen={specimen} />
        <SpecimenViewer specimen={specimen} />
      </>,
    );
    // Licensed media is displayable even in draft — but the pending-review
    // warning must stay on the page.
    expect(html).toContain("<img");
    expect(html).toContain("não validado");
  });
});
