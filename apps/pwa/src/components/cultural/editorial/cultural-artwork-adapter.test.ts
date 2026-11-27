import { describe, expect, it } from "vitest";

import type { PublicCulturalEntry } from "../../../data/cultural-publication";
import {
  adaptCulturalArtwork,
  SINALIZA_EDITORIAL_REPRESENTATION_LABEL,
} from "./cultural-artwork-adapter";

function basePublicEntry(category: PublicCulturalEntry["category"]): PublicCulturalEntry {
  const common = {
    id: "FIX-001",
    slug: "registro-sintetico",
    title: "Registro sintético",
    summary: "Resumo sintético.",
    references: [],
    relatedEntries: [],
  };
  if (category === "history") {
    return { ...common, category, history: { year: 1857 } };
  }
  if (category === "curiosity") {
    return {
      ...common,
      category,
      curiosity: { question: "Pergunta sintética?", shortAnswer: "Resposta sintética." },
    };
  }
  if (category === "personality") {
    return {
      ...common,
      category,
      personality: { personName: "Nelson Pimenta Sintético", biographicalSummary: "Resumo sintético." },
    };
  }
  return {
    ...common,
    category,
    library: {
      creators: ["Autora Sintética"],
      publicationYear: 2026,
      publisher: "Editora Sintética",
    },
  };
}

describe("adaptCulturalArtwork", () => {
  it("returns undefined when artwork is absent, preserving the current fallback", () => {
    expect(adaptCulturalArtwork(basePublicEntry("history"))).toBeUndefined();
  });

  it("adapts timeline events to template-compatible text without exposing claim ids", () => {
    const entry = {
      ...basePublicEntry("history"),
      artwork: {
        motif: "timeline" as const,
        events: [
          { year: 1855, label: "Proposta" },
          { year: 1856, label: "Início das aulas" },
        ],
      },
    } as PublicCulturalEntry;
    expect(adaptCulturalArtwork(entry, "detail")).toMatchObject({
      category: "history",
      variant: "detail",
      motif: "timeline",
      yearLabel: "1857",
      events: ["1855 — Proposta", "1856 — Início das aulas"],
      representationLabel: SINALIZA_EDITORIAL_REPRESENTATION_LABEL,
    });
    expect(JSON.stringify(adaptCulturalArtwork(entry))).not.toContain("claimId");
  });

  it("adapts legal document facts without inventing omitted values", () => {
    const entry = {
      ...basePublicEntry("history"),
      artwork: {
        motif: "legal-document" as const,
        documentNumber: "10.436",
      },
    } as PublicCulturalEntry;
    expect(adaptCulturalArtwork(entry)).toMatchObject({
      motif: "legal-document",
      yearLabel: "1857",
      documentNumber: "10.436",
    });
    expect(adaptCulturalArtwork(entry)).not.toHaveProperty("documentDate");
  });

  it("adapts compatible curiosity, personality and library motifs", () => {
    for (const motif of ["diversity-orbits", "parallel-structures", "visual-rhythm"] as const) {
      const curiosity = {
        ...basePublicEntry("curiosity"),
        artwork: { motif },
      } as PublicCulturalEntry;
      expect(adaptCulturalArtwork(curiosity)).toMatchObject({ motif });
    }

    const personality = {
      ...basePublicEntry("personality"),
      artwork: { motif: "monogram" as const, initials: "NP" },
    } as PublicCulturalEntry;
    expect(adaptCulturalArtwork(personality)).toMatchObject({ motif: "monogram", initials: "NP" });

    const academic = {
      ...basePublicEntry("library"),
      artwork: { motif: "academic" as const, volumeNumber: "I" },
    } as PublicCulturalEntry;
    expect(adaptCulturalArtwork(academic, "book-cover")).toMatchObject({
      motif: "academic",
      volumeNumber: "I",
      metadataLabel: "Autora Sintética · 2026 · Editora Sintética",
    });

    const literary = {
      ...basePublicEntry("library"),
      artwork: { motif: "literary" as const },
    } as PublicCulturalEntry;
    expect(adaptCulturalArtwork(literary)).toMatchObject({ motif: "literary" });
  });

  it("returns undefined for incompatible category/motif combinations instead of guessing", () => {
    const entry = {
      ...basePublicEntry("history"),
      artwork: { motif: "literary" as const },
    } as PublicCulturalEntry;
    expect(adaptCulturalArtwork(entry)).toBeUndefined();
  });
});
