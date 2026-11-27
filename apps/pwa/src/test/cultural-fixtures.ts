import type {
  PublicCulturalCuriosityEntry,
  PublicCulturalHistoryEntry,
  PublicCulturalLibraryEntry,
  PublicCulturalPersonalityEntry,
} from "@/data/cultural-publication";

const reference = {
  institution: "Instituição Fictícia de Testes",
  url: "https://example.org/fonte-ficticia",
  purpose: "Fixture sintética de interface",
  consultedAt: "2026-11-27",
};

export const fixtureHistoryEntries: PublicCulturalHistoryEntry[] = [
  {
    id: "FIX-HIST-002",
    slug: "segundo-marco-ficticio",
    category: "history",
    title: "Segundo marco fictício",
    summary: "Um evento imaginário usado apenas para verificar ordenação e composição visual.",
    references: [reference],
    relatedEntries: [],
    history: {
      year: 2020,
      dateLabel: "2020",
      context: "Contexto fictício para teste de interface.",
    },
  },
  {
    id: "FIX-HIST-001",
    slug: "primeiro-marco-ficticio",
    category: "history",
    title: "Primeiro marco fictício",
    summary: "Um evento imaginário anterior, usado para validar a linha do tempo.",
    references: [reference],
    relatedEntries: [
      { targetId: "FIX-HIST-002", kind: "historical-context" },
    ],
    history: {
      year: 2010,
      dateLabel: "2010",
      context: "Contexto fictício anterior.",
    },
  },
];

export const fixtureCuriosityEntries: PublicCulturalCuriosityEntry[] = [
  {
    id: "FIX-CUR-001",
    slug: "curiosidade-ficticia-das-estrelas",
    category: "curiosity",
    title: "Curiosidade fictícia das estrelas",
    summary: "Uma descoberta inventada exclusivamente para testar o cartão interativo.",
    references: [reference],
    relatedEntries: [],
    curiosity: {
      question: "Por que esta curiosidade fictícia existe?",
      shortAnswer: "Para verificar a revelação voluntária da resposta sem usar fatos reais.",
      deepening: "Este aprofundamento também é inventado e não representa cultura surda.",
    },
  },
  {
    id: "FIX-CUR-002",
    slug: "curiosidade-ficticia-do-espelho",
    category: "curiosity",
    title: "Curiosidade fictícia do espelho",
    summary: "Outra descoberta inventada para demonstrar ritmo e composição da grade.",
    references: [reference],
    relatedEntries: [],
    curiosity: {
      question: "O que esta segunda curiosidade fictícia demonstra?",
      shortAnswer: "A disposição de múltiplos cartões sem transformar a experiência em avaliação.",
    },
  },
];

export const fixturePersonalityEntries: PublicCulturalPersonalityEntry[] = [
  {
    id: "FIX-PER-001",
    slug: "pessoa-ficticia-um",
    category: "personality",
    title: "Pessoa Fictícia Um",
    summary: "Perfil imaginário usado para validar a galeria editorial e o fallback tipográfico.",
    references: [reference],
    relatedEntries: [],
    personality: {
      personName: "Pessoa Fictícia Um",
      biographicalSummary: "Biografia inventada para teste, sem referência a pessoa real.",
      contributions: ["Contribuição fictícia", "Outra contribuição fictícia"],
    },
  },
  {
    id: "FIX-PER-002",
    slug: "pessoa-ficticia-dois",
    category: "personality",
    title: "Pessoa Fictícia Dois",
    summary: "Segundo perfil imaginário para demonstrar a galeria responsiva sem representar pessoa real.",
    references: [reference],
    relatedEntries: [],
    personality: {
      personName: "Pessoa Fictícia Dois",
      biographicalSummary: "Biografia totalmente inventada para validar hierarquia e fallback visual.",
      contributions: ["Pesquisa fictícia"],
    },
  },
];

export const fixtureLibraryEntries: PublicCulturalLibraryEntry[] = [
  {
    id: "FIX-BIB-001",
    slug: "livro-ficticio-alfabeto-visual",
    category: "library",
    title: "Livro Fictício Alfabeto Visual",
    summary: "Obra inventada para testar grade, busca e filtros da biblioteca.",
    references: [reference],
    relatedEntries: [],
    library: {
      creators: ["Autor Fictício"],
      publicationYear: 2024,
      publisher: "Editora Fictícia",
      format: "book",
      access: "open-digital",
      languages: ["Português"],
    },
  },
  {
    id: "FIX-BIB-002",
    slug: "video-ficticio-constelacao",
    category: "library",
    title: "Vídeo Fictício Constelação",
    summary: "Item audiovisual inventado para testar filtros e fallback visual.",
    references: [reference],
    relatedEntries: [],
    library: {
      creators: ["Coletivo Fictício"],
      publicationYear: 2025,
      format: "audiovisual-series",
      access: "external-website",
      languages: ["Libras", "Português"],
    },
  },
];

export const fixtureCulturalEntries = [
  ...fixtureHistoryEntries,
  ...fixtureCuriosityEntries,
  ...fixturePersonalityEntries,
  ...fixtureLibraryEntries,
];
