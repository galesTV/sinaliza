import type { Metadata } from "next";

import { Breadcrumb } from "@/components/breadcrumb";
import { CulturalEmptyState } from "@/components/cultural/cultural-empty-state";
import { CulturalPageHeader } from "@/components/cultural/cultural-page-header";
import { CuriosityCards } from "@/components/cultural/curiosity-cards";
import type { PublicCulturalCuriosityEntry } from "@/data/cultural-publication";
import { getPublicCulturalEntriesByCategory } from "@/data/cultural-public";

export const metadata: Metadata = {
  title: "Curiosidades — Explorar",
  description: "Cartões de descoberta cultural com respostas reveladas voluntariamente.",
};

export default function ExploreCuriositiesPage() {
  const entries = getPublicCulturalEntriesByCategory("curiosity").filter(
    (entry): entry is PublicCulturalCuriosityEntry => entry.category === "curiosity",
  );

  return (
    <div className="flex flex-col gap-9">
      <Breadcrumb items={[{ label: "Explorar", href: "/explorar" }, { label: "Curiosidades" }]} />
      <CulturalPageHeader
        titleId="curiosities-title"
        title="Curiosidades"
        description="Perguntas e respostas para descobrir no seu ritmo — sem pontuação, vidas, penalidades ou sequência obrigatória."
      />
      {entries.length === 0 ? (
        <CulturalEmptyState categoryLabel="Curiosidades" />
      ) : (
        <CuriosityCards entries={entries} />
      )}
    </div>
  );
}
