import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  fixtureCuriosityEntries,
  fixtureHistoryEntries,
  fixtureLibraryEntries,
  fixturePersonalityEntries,
} from "@/test/cultural-fixtures";

import { CulturalDetail } from "./cultural-detail";
import { CuriosityCards } from "./curiosity-cards";
import { HistoryTimeline } from "./history-timeline";
import { LibraryBrowser } from "./library-browser";
import { PersonalityGallery } from "./personality-gallery";

describe("cultural fixture rendering", () => {
  it("renders the history timeline in chronological order", () => {
    const html = renderToStaticMarkup(<HistoryTimeline entries={fixtureHistoryEntries} />);
    expect(html.indexOf("Primeiro marco fictício")).toBeLessThan(
      html.indexOf("Segundo marco fictício"),
    );
    expect(html).toContain("Linha do tempo cultural");
    expect(html).toContain("Ler registro");
  });

  it("renders curiosity cards with voluntary disclosure controls", () => {
    const html = renderToStaticMarkup(<CuriosityCards entries={fixtureCuriosityEntries} />);
    expect(html).toContain("Revelar resposta");
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("Aprofundar");
    expect(html).not.toContain("pontuação");
  });

  it("renders personality fallback initials instead of fabricated portraits", () => {
    const html = renderToStaticMarkup(<PersonalityGallery entries={fixturePersonalityEntries} />);
    expect(html).toContain("PF");
    expect(html).toContain("Pessoa Fictícia Um");
    expect(html).not.toContain("<img");
  });

  it("renders the library grade with metadata and typographic fallback", () => {
    const html = renderToStaticMarkup(<LibraryBrowser entries={fixtureLibraryEntries} />);
    expect(html).toContain("Busca textual");
    expect(html).toContain("Livro Fictício Alfabeto Visual");
    expect(html).toContain("Vídeo Fictício Constelação");
    expect(html).toContain("Formato");
    expect(html).toContain("Acesso");
    expect(html).not.toContain("<img");
  });

  it("renders detail content, public references and public relations only", () => {
    const [target, source] = fixtureHistoryEntries;
    const html = renderToStaticMarkup(
      <CulturalDetail
        entry={source}
        relations={[{ relation: source.relatedEntries[0], entry: target }]}
      />,
    );
    expect(html).toContain("Registro cultural");
    expect(html).toContain("Referências públicas");
    expect(html).toContain("Relações culturais");
    expect(html).toContain("Instituição Fictícia de Testes");
    expect(html).not.toContain("internalPending");
    expect(html).not.toContain("validationStatus");
  });

  it("renders library detail metadata without exposing draft contract fields", () => {
    const html = renderToStaticMarkup(
      <CulturalDetail entry={fixtureLibraryEntries[0]} relations={[]} />,
    );
    expect(html).toContain("Autoria ou créditos");
    expect(html).toContain("Modalidade de acesso");
    expect(html).toContain("Idiomas");
    expect(html).not.toContain("unstructuredMetadata");
    expect(html).not.toContain("unknownMetadata");
  });
});
