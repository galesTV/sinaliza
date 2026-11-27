import type { CulturalCategory } from "./cultural-catalog-model";

export interface CulturalCategoryPresentation {
  category: CulturalCategory;
  segment: string;
  label: string;
  pluralLabel: string;
  description: string;
}

export const CULTURAL_CATEGORY_PRESENTATIONS: readonly CulturalCategoryPresentation[] = [
  {
    category: "history",
    segment: "historia",
    label: "História",
    pluralLabel: "Histórias",
    description: "Conheça os acontecimentos que marcaram a história da Libras e da comunidade surda.",
  },
  {
    category: "curiosity",
    segment: "curiosidades",
    label: "Curiosidades",
    pluralLabel: "Curiosidades",
    description: "Descubra novas perspectivas sobre a Libras e a cultura surda, no seu ritmo.",
  },
  {
    category: "personality",
    segment: "personalidades",
    label: "Personalidades",
    pluralLabel: "Personalidades",
    description: "Conheça pessoas que contribuíram para a história, a arte, a educação e os estudos da Libras.",
  },
  {
    category: "library",
    segment: "biblioteca",
    label: "Biblioteca",
    pluralLabel: "Biblioteca Cultural",
    description: "Explore obras, documentos e materiais culturais em diferentes formatos.",
  },
];

export function getCulturalCategoryPresentation(
  category: CulturalCategory,
): CulturalCategoryPresentation {
  const presentation = CULTURAL_CATEGORY_PRESENTATIONS.find(
    (item) => item.category === category,
  );
  if (!presentation) throw new Error(`Unknown cultural category: ${category}`);
  return presentation;
}

export function getCulturalCategoryBySegment(
  segment: string,
): CulturalCategory | undefined {
  return CULTURAL_CATEGORY_PRESENTATIONS.find(
    (item) => item.segment === segment,
  )?.category;
}

export function getCulturalCategoryHref(category: CulturalCategory): string {
  return `/explorar/${getCulturalCategoryPresentation(category).segment}`;
}
