import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  fixtureCulturalEntries,
  fixtureCuriosityEntries,
  fixtureHistoryEntries,
  fixtureLibraryEntries,
  fixturePersonalityEntries,
} from "@/test/cultural-fixtures";

import { CulturalDetail } from "./cultural-detail";
import { ExploreHome } from "./explore-home";
import { CuriosityCards } from "./curiosity-cards";
import { HistoryTimeline } from "./history-timeline";
import { LibraryBrowser } from "./library-browser";
import { PersonalityGallery } from "./personality-gallery";
import { OrbitalShelf } from "./orbital-shelf";

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

  it("integrates representative artwork previews in ExploreHome without replacing category navigation", () => {
    const html = renderToStaticMarkup(<ExploreHome entries={fixtureCulturalEntries} />);
    expect(html).toContain("Escolha por onde começar");
    expect(html).toContain('data-variant="thumbnail"');
    expect(html).toContain('data-motif="legal-document"');
    expect(html).toContain('data-motif="diversity-orbits"');
    expect(html).toContain('data-motif="monogram"');
    expect(html).toContain('data-motif="academic"');
  });

  it("renders a history detail without relations when the public DTO has none", () => {
    const [entryWithoutRelations] = fixtureHistoryEntries;
    const html = renderToStaticMarkup(
      <CulturalDetail entry={entryWithoutRelations} relations={[]} />,
    );
    expect(html).toContain("Contexto histórico");
    expect(html).not.toContain("Relações culturais");
  });

  it("renders detail content, public references and public relations only", () => {
    const [target, source] = fixtureHistoryEntries;
    const html = renderToStaticMarkup(
      <CulturalDetail
        entry={source}
        relations={[{ relation: source.relatedEntries[0], entry: target }]}
      />,
    );
    expect(html).toContain("Contexto histórico");
    expect(html).toContain("Fontes e leituras complementares");
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

describe("cultural editorial body and artwork integration", () => {
  it("renders editorial paragraphs literally, in order, and with precedence over legacy narrative fields", () => {
    const entry = fixtureHistoryEntries[1];
    const html = renderToStaticMarkup(<CulturalDetail entry={entry} relations={[]} />);
    expect(html.indexOf("Primeiro parágrafo narrativo completamente inventado")).toBeLessThan(
      html.indexOf("Segundo parágrafo com caracteres especiais"),
    );
    expect(html).toContain("aspas &quot;editoriais&quot;");
    expect(html).not.toContain("<marcação>");
    expect(html).not.toContain("Contexto fictício anterior.</p>");
    expect(html).toContain('data-motif="timeline"');
    expect(html).toContain('data-variant="detail"');
  });

  it("keeps literal HTML-looking editorial text escaped instead of interpreted", () => {
    const html = renderToStaticMarkup(<CulturalDetail entry={fixtureHistoryEntries[0]} relations={[]} />);
    expect(html).toContain("&lt;marcação&gt;");
    expect(html).not.toContain("<marcação>");
  });

  it("uses editorial body as the main curiosity and personality narratives while preserving complementary data", () => {
    const curiosityHtml = renderToStaticMarkup(
      <CulturalDetail entry={fixtureCuriosityEntries[0]} relations={[]} />,
    );
    expect(curiosityHtml).toContain("Resposta editorial sintética em múltiplos parágrafos.");
    expect(curiosityHtml).not.toContain("Para verificar a revelação voluntária da resposta sem usar fatos reais.");
    expect(curiosityHtml).toContain("Por que esta curiosidade fictícia existe?");

    const personalityHtml = renderToStaticMarkup(
      <CulturalDetail entry={fixturePersonalityEntries[0]} relations={[]} />,
    );
    expect(personalityHtml).toContain("Narrativa biográfica sintética principal.");
    expect(personalityHtml).toContain("Contribuição fictícia");
    expect(personalityHtml).not.toContain("Biografia inventada para teste, sem referência a pessoa real.</p>");
  });

  it("renders library editorial description before the semantic bibliographic metadata", () => {
    const html = renderToStaticMarkup(
      <CulturalDetail entry={fixtureLibraryEntries[0]} relations={[]} />,
    );
    expect(html.indexOf("Descrição bibliográfica editorial completamente fictícia.")).toBeLessThan(
      html.indexOf("Autoria ou créditos"),
    );
    expect(html).toContain("Editora Fictícia");
    expect(html).toContain('data-variant="detail"');
  });

  it("preserves legacy narrative fallbacks when editorialBody is absent", () => {
    const entry = {
      ...fixtureCuriosityEntries[1],
      editorialBody: undefined,
      artwork: undefined,
    };
    const html = renderToStaticMarkup(<CulturalDetail entry={entry} relations={[]} />);
    expect(html).toContain("A disposição de múltiplos cartões sem transformar a experiência em avaliação.");
    expect(html).not.toContain('data-motif=');
  });

  it("integrates the eight approved motifs with the applicable presentation variants", () => {
    const historyHtml = renderToStaticMarkup(<HistoryTimeline entries={fixtureHistoryEntries} />);
    expect(historyHtml).toContain('data-motif="legal-document"');
    expect(historyHtml).toContain('data-motif="timeline"');
    expect(historyHtml).toContain('data-variant="thumbnail"');

    const curiosityHtml = renderToStaticMarkup(<CuriosityCards entries={fixtureCuriosityEntries} />);
    for (const motif of ["diversity-orbits", "parallel-structures", "visual-rhythm"]) {
      expect(curiosityHtml).toContain(`data-motif="${motif}"`);
    }
    expect(curiosityHtml).toContain('data-variant="card"');

    const personalityHtml = renderToStaticMarkup(<PersonalityGallery entries={fixturePersonalityEntries} />);
    expect(personalityHtml).toContain('data-motif="monogram"');

    const libraryHtml = renderToStaticMarkup(<LibraryBrowser entries={fixtureLibraryEntries} />);
    expect(libraryHtml).toContain('data-motif="academic"');
    expect(libraryHtml).toContain('data-motif="literary"');
    expect(libraryHtml).toContain('data-variant="book-cover"');
  });

  it("derives the monogram from the public title and renders the roman volume without claim ids", () => {
    const personality = {
      ...fixturePersonalityEntries[0],
      title: "Nelson Pimenta Sintético",
    };
    const personalityHtml = renderToStaticMarkup(<PersonalityGallery entries={[personality]} />);
    expect(personalityHtml).toContain("NP");
    expect(personalityHtml).not.toContain("claimId");

    const libraryHtml = renderToStaticMarkup(<LibraryBrowser entries={[fixtureLibraryEntries[0]]} />);
    expect(libraryHtml).toContain("I");
    expect(libraryHtml).not.toContain("claimId");
  });

  it("uses one fixed editorial identification per artwork unit", () => {
    const html = renderToStaticMarkup(<CulturalDetail entry={fixtureHistoryEntries[1]} relations={[]} />);
    expect(html.match(/Representação editorial do Sinaliza/g)).toHaveLength(1);
    expect(html).not.toContain("Coleção Sinaliza");
  });

  it("renders structured timeline years and labels without serialized event strings", () => {
    const html = renderToStaticMarkup(<HistoryTimeline entries={fixtureHistoryEntries} />);
    expect(html).toContain("2008");
    expect(html).toContain("Proposta fictícia");
    expect(html).not.toContain("2008 — Proposta fictícia");
  });

  it("keeps mixed library fallbacks and non-interactive orbital artwork surfaces", () => {
    const mixedEntries = [
      fixtureLibraryEntries[0],
      { ...fixtureLibraryEntries[1], artwork: undefined },
    ];
    const html = renderToStaticMarkup(<OrbitalShelfIntegrationProbe entries={mixedEntries} />);
    expect(html).toContain("orbital-initials");
    expect(html).toContain('data-variant="book-cover"');
    expect(html).toContain('data-variant="book-spine"');

    const orbitalItems = html.slice(
      html.indexOf('class="orbital-items"'),
      html.indexOf('aria-label="Obra anterior"'),
    );
    expect(orbitalItems).not.toContain("Fatos editoriais representados na arte");
    expect(html).toContain("Fatos editoriais representados na arte");
  });

  it("uses portrait personality panels and integrated orbital artwork surfaces", () => {
    const personalityHtml = renderToStaticMarkup(<PersonalityGallery entries={fixturePersonalityEntries} />);
    expect(personalityHtml).toContain("aspect-[3/4]");
    expect(personalityHtml).toContain("Representação editorial do Sinaliza");

    const orbitalHtml = renderToStaticMarkup(<OrbitalShelfIntegrationProbe entries={fixtureLibraryEntries} />);
    expect(orbitalHtml).toContain("orbital-cover-artwork");
    expect(orbitalHtml).toContain('data-variant="book-cover"');

    const libraryHtml = renderToStaticMarkup(<LibraryBrowser entries={[fixtureLibraryEntries[0]]} />);
    expect(libraryHtml).toContain("h-64");
    expect(libraryHtml.match(/Representação editorial do Sinaliza/g)).toHaveLength(1);
  });
});

function OrbitalShelfIntegrationProbe({ entries }: { entries: typeof fixtureLibraryEntries }) {
  return <OrbitalShelf entries={entries} />;
}
