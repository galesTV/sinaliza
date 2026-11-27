import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import {
  CulturalDetail,
  type ResolvedCulturalRelation,
} from "@/components/cultural/cultural-detail";
import {
  getPublicCulturalEntryById,
  getPublicCulturalEntryBySlug,
} from "@/data/cultural-public";
import { getCulturalCategoryBySegment } from "@/data/cultural-taxonomy";

export const instant = false;

interface CulturalDetailPageProps {
  params: Promise<{ categoria: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: CulturalDetailPageProps): Promise<Metadata> {
  const { categoria, slug } = await params;
  const category = getCulturalCategoryBySegment(categoria);
  if (!category) return {};

  const entry = getPublicCulturalEntryBySlug(category, slug);
  if (!entry) return {};

  return {
    title: entry.title,
    description: entry.summary,
  };
}

export default async function CulturalDetailPage({ params }: CulturalDetailPageProps) {
  await connection();
  const { categoria, slug } = await params;
  const category = getCulturalCategoryBySegment(categoria);
  if (!category) notFound();

  const entry = getPublicCulturalEntryBySlug(category, slug);
  if (!entry) notFound();

  const relations = entry.relatedEntries.flatMap((relation): ResolvedCulturalRelation[] => {
    const target = getPublicCulturalEntryById(relation.targetId);
    return target ? [{ relation, entry: target }] : [];
  });

  return <CulturalDetail entry={entry} relations={relations} />;
}
