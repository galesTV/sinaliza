import type { Metadata } from "next";

import { Breadcrumb } from "@/components/breadcrumb";
import { CulturalEmptyState } from "@/components/cultural/cultural-empty-state";
import { CulturalPageHeader } from "@/components/cultural/cultural-page-header";
import { PersonalityGallery } from "@/components/cultural/personality-gallery";
import type { PublicCulturalPersonalityEntry } from "@/data/cultural-publication";
import { getPublicCulturalEntriesByCategory } from "@/data/cultural-public";

export const metadata: Metadata = {
  title: "Personalidades — Explorar",
  description: "Galeria editorial de pessoas e contribuições culturais publicadas.",
};

export default function ExplorePersonalitiesPage() {
  const entries = getPublicCulturalEntriesByCategory("personality").filter(
    (entry): entry is PublicCulturalPersonalityEntry => entry.category === "personality",
  );

  return (
    <div className="flex flex-col gap-9">
      <Breadcrumb items={[{ label: "Explorar", href: "/explorar" }, { label: "Personalidades" }]} />
      <CulturalPageHeader
        titleId="personalities-title"
        title="Personalidades"
        description="Uma galeria editorial de pessoas e contribuições, sem rankings nem retratos gerados para preencher lacunas."
      />
      {entries.length === 0 ? (
        <CulturalEmptyState categoryLabel="Personalidades" />
      ) : (
        <PersonalityGallery entries={entries} />
      )}
    </div>
  );
}
