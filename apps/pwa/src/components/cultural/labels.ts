export const LIBRARY_FORMAT_LABELS: Record<string, string> = {
  book: "Livro",
  "children-literature": "Literatura infantil",
  dictionary: "Dicionário",
  "audiovisual-series": "Série audiovisual",
  "academic-study": "Estudo acadêmico",
  "historical-facsimile": "Fac-símile histórico",
  website: "Site",
  other: "Outro formato",
};

export const LIBRARY_ACCESS_LABELS: Record<string, string> = {
  "open-digital": "Acesso digital gratuito",
  "institutional-digital": "Digital institucional",
  commercial: "Comercial",
  physical: "Físico",
  "external-website": "Site externo",
  unavailable: "Indisponível",
  other: "Outra modalidade",
};

export const RELATION_KIND_LABELS: Record<string, string> = {
  theme: "Tema relacionado",
  person: "Pessoa relacionada",
  work: "Obra relacionada",
  "historical-context": "Contexto histórico",
  source: "Fonte relacionada",
};

export function libraryFormatLabel(format: string | undefined): string {
  return format ? (LIBRARY_FORMAT_LABELS[format] ?? format) : "Formato não informado";
}

export function libraryAccessLabel(access: string | undefined): string {
  return access ? (LIBRARY_ACCESS_LABELS[access] ?? access) : "Acesso não informado";
}

export function relationKindLabel(kind: string): string {
  return RELATION_KIND_LABELS[kind] ?? "Relação cultural";
}

type LibraryPresentationFacts = {
  library: {
    creators?: string[];
    format?: string;
  };
  references: readonly { institution: string }[];
};

export function hasInstitutionalResponsibilityEvidence(entry: LibraryPresentationFacts): boolean {
  const creators = entry.library.creators ?? [];
  return (
    entry.library.format === "audiovisual-series" &&
    creators.length > 0 &&
    creators.every((creator) =>
      entry.references.some((reference) => reference.institution.includes(creator)),
    )
  );
}

export function libraryCreatorsRoleLabel(entry: LibraryPresentationFacts): string {
  return hasInstitutionalResponsibilityEvidence(entry)
    ? "Responsabilidade institucional"
    : "Autoria ou créditos";
}
