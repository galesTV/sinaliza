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
    description: "Marcos e contextos em uma linha do tempo cultural.",
  },
  {
    category: "curiosity",
    segment: "curiosidades",
    label: "Curiosidades",
    pluralLabel: "Curiosidades",
    description: "Perguntas e descobertas para explorar sem pressa.",
  },
  {
    category: "personality",
    segment: "personalidades",
    label: "Personalidades",
    pluralLabel: "Personalidades",
    description: "Pessoas e contribuições apresentadas sem rankings.",
  },
  {
    category: "library",
    segment: "biblioteca",
    label: "Biblioteca",
    pluralLabel: "Biblioteca Cultural",
    description: "Obras, documentos e materiais culturais em formatos variados.",
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
