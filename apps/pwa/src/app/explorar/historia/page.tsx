import type { Metadata } from "next";

import { Breadcrumb } from "@/components/breadcrumb";
import { CulturalEmptyState } from "@/components/cultural/cultural-empty-state";
import { CulturalPageHeader } from "@/components/cultural/cultural-page-header";
import { HistoryTimeline } from "@/components/cultural/history-timeline";
import type { PublicCulturalHistoryEntry } from "@/data/cultural-publication";
import { getPublicCulturalEntriesByCategory } from "@/data/cultural-public";

export const metadata: Metadata = {
  title: "História — Explorar",
  description: "Linha do tempo cultural com marcos históricos publicados do universo da Libras.",
};

export default function ExploreHistoryPage() {
  const entries = getPublicCulturalEntriesByCategory("history").filter(
    (entry): entry is PublicCulturalHistoryEntry => entry.category === "history",
  );

  return (
    <div className="flex flex-col gap-9">
      <Breadcrumb items={[{ label: "Explorar", href: "/explorar" }, { label: "História" }]} />
      <CulturalPageHeader
        titleId="history-title"
        title="História"
        description="Marcos e contextos organizados em ordem cronológica, sem preencher lacunas com datas inventadas."
      />
      {entries.length === 0 ? (
        <CulturalEmptyState categoryLabel="História" />
      ) : (
        <HistoryTimeline entries={entries} />
      )}
    </div>
  );
}
