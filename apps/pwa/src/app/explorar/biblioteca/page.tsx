import type { Metadata } from "next";

import { Breadcrumb } from "@/components/breadcrumb";
import { CulturalEmptyState } from "@/components/cultural/cultural-empty-state";
import { CulturalPageHeader } from "@/components/cultural/cultural-page-header";
import { LibraryBrowser } from "@/components/cultural/library-browser";
import type { PublicCulturalLibraryEntry } from "@/data/cultural-publication";
import { getPublicCulturalEntriesByCategory } from "@/data/cultural-public";

export const metadata: Metadata = {
  title: "Biblioteca Cultural — Explorar",
  description: "Grade bibliográfica de obras, documentos, audiovisual e materiais culturais publicados.",
};

export default function ExploreLibraryPage() {
  const entries = getPublicCulturalEntriesByCategory("library").filter(
    (entry): entry is PublicCulturalLibraryEntry => entry.category === "library",
  );

  return (
    <div className="flex flex-col gap-9">
      <Breadcrumb items={[{ label: "Explorar", href: "/explorar" }, { label: "Biblioteca Cultural" }]} />
      <CulturalPageHeader
        titleId="library-title"
        title="Biblioteca Cultural"
        description="Livros, literatura infantil, poesia, audiovisual, documentos históricos, dicionários e materiais educacionais em uma grade acessível."
      />
      {entries.length === 0 ? (
        <CulturalEmptyState categoryLabel="Biblioteca Cultural" />
      ) : (
        <LibraryBrowser entries={entries} />
      )}
    </div>
  );
}
