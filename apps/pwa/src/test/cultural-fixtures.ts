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
    editorialBody: {
      paragraphs: [
        "Parágrafo editorial fictício com <marcação> que deve permanecer literal.",
        "Segundo parágrafo inventado para verificar ordem, quantidade e precedência editorial.",
      ],
    },
    artwork: {
      motif: "legal-document",
      documentNumber: "00.000",
      documentDate: "2020",
    },
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
    editorialBody: {
      paragraphs: [
        "Primeiro parágrafo narrativo completamente inventado para homologação.",
        "Segundo parágrafo com caracteres especiais: ç, ã, é e aspas \"editoriais\".",
      ],
    },
    artwork: {
      motif: "timeline",
      events: [
        { year: 2008, label: "Proposta fictícia" },
        { year: 2009, label: "Etapa imaginária" },
        { year: 2010, label: "Marco editorial fictício" },
      ],
    },
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
    editorialBody: {
      paragraphs: ["Resposta editorial sintética em múltiplos parágrafos.", "Continuação inventada sem interpretação de HTML."],
    },
    artwork: { motif: "diversity-orbits" },
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
    artwork: { motif: "parallel-structures" },
    references: [reference],
    relatedEntries: [],
    curiosity: {
      question: "O que esta segunda curiosidade fictícia demonstra?",
      shortAnswer: "A disposição de múltiplos cartões sem transformar a experiência em avaliação.",
    },
  },  {
    id: "FIX-CUR-003",
    slug: "curiosidade-ficticia-do-ritmo",
    category: "curiosity",
    title: "Curiosidade fictícia do ritmo",
    summary: "Terceira descoberta inventada para homologar o motivo de ritmo visual.",
    artwork: { motif: "visual-rhythm" },
    references: [reference],
    relatedEntries: [],
    curiosity: {
      question: "Como uma composição fictícia sugere ritmo?",
      shortAnswer: "Por meio de repetição visual inventada, sem afirmação cultural real.",
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
    editorialBody: {
      paragraphs: ["Narrativa biográfica sintética principal.", "Parágrafo complementar inventado para teste de precedência."],
    },
    artwork: { motif: "monogram" },
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
    editorialBody: {
      paragraphs: ["Descrição bibliográfica editorial completamente fictícia.", "Segundo parágrafo para validar a composição da ficha."],
    },
    artwork: {
      motif: "academic",
      volumeNumber: "I",
    },
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
    artwork: { motif: "literary" },
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
