import type { CulturalEditorialArtworkProps } from "@/components/cultural/editorial/cultural-editorial-artwork";

export const editorialTimelineFixture: CulturalEditorialArtworkProps = {
  category: "history",
  motif: "timeline",
  variant: "book-cover",
  title: "Marco editorial fictício de uma instituição imaginária",
  yearLabel: "1999",
  events: [
    "1997 — Proposta fictícia",
    "1998 — Primeiras atividades imaginárias",
    "1999 — Registro editorial fictício",
  ],
};

export const editorialLegalDocumentFixture: CulturalEditorialArtworkProps = {
  category: "history",
  motif: "legal-document",
  variant: "book-cover",
  title: "Documento legal fictício de teste visual",
  yearLabel: "2001",
  documentLabel: "Lei fictícia nº",
  documentNumber: "00.000",
  documentDate: "1º de janeiro",
};

export const editorialDiversityOrbitsFixture: CulturalEditorialArtworkProps = {
  category: "curiosity",
  motif: "diversity-orbits",
  variant: "card",
  title: "Existe uma diversidade conceitual completamente fictícia?",
  descriptor: "Fixture sintética sem afirmação cultural real.",
};

export const editorialParallelStructuresFixture: CulturalEditorialArtworkProps = {
  category: "curiosity",
  motif: "parallel-structures",
  variant: "card",
  title: "Duas estruturas imaginárias podem conviver sem hierarquia?",
  descriptor: "Composição abstrata para teste editorial.",
};

export const editorialVisualRhythmFixture: CulturalEditorialArtworkProps = {
  category: "curiosity",
  motif: "visual-rhythm",
  variant: "card",
  title: "Como o ritmo visual aparece em uma composição inventada?",
  descriptor: "Ondas fictícias sem referência a poema existente.",
};

export const editorialMonogramFixture: CulturalEditorialArtworkProps = {
  category: "personality",
  motif: "monogram",
  variant: "book-cover",
  title: "Pessoa Fictícia Editorial",
  initials: "PF",
  descriptor: "Pesquisa imaginária · Educação fictícia · Arte de teste",
};

export const editorialAcademicFixture: CulturalEditorialArtworkProps = {
  category: "library",
  motif: "academic",
  variant: "book-cover",
  title: "Compêndio Fictício de Estudos Editoriais",
  volumeNumber: "I",
  volumeLabel: "Volume fictício",
  metadataLabel: "Editora Imaginária · 2026",
};

export const editorialLiteraryFixture: CulturalEditorialArtworkProps = {
  category: "library",
  motif: "literary",
  variant: "book-cover",
  title: "Narrativa Fictícia do Acervo Ilustrado",
  metadataLabel: "Literatura imaginária · 2026",
};

export const editorialLongTitleFixture: CulturalEditorialArtworkProps = {
  category: "library",
  motif: "academic",
  variant: "book-cover",
  title:
    "Título bibliográfico sintético extraordinariamente longo para verificar quebra de linha, truncamento seguro e preservação da hierarquia editorial",
  volumeNumber: "II",
  volumeLabel: "Volume fictício",
  metadataLabel: "Editora Imaginária de Testes · 2026",
};

export const editorialMinimalFixtures: CulturalEditorialArtworkProps[] = [
  {
    category: "history",
    motif: "timeline",
    title: "Cronologia mínima fictícia",
  },
  {
    category: "history",
    motif: "legal-document",
    title: "Documento mínimo fictício",
  },
  {
    category: "personality",
    motif: "monogram",
    title: "Pessoa Mínima Fictícia",
  },
  {
    category: "library",
    motif: "academic",
    title: "Obra mínima fictícia",
  },
];

export const editorialMotifFixtures: CulturalEditorialArtworkProps[] = [
  editorialTimelineFixture,
  editorialLegalDocumentFixture,
  editorialDiversityOrbitsFixture,
  editorialParallelStructuresFixture,
  editorialVisualRhythmFixture,
  editorialMonogramFixture,
  editorialAcademicFixture,
  editorialLiteraryFixture,
];
