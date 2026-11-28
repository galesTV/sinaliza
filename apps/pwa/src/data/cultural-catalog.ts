/**
 * Cultural editorial registry migrated from curation package D.2.
 *
 * Every real record in this file is a candidate draft. Migration preserved
 * IDs, claims, source URLs, pendências and unverified relations without
 * inventing metadata, reviewers, approvals or rights evidence. The records
 * are server-side editorial data: public surfaces must consume the explicit
 * projection from `cultural-public.ts`, never this registry.
 */
import "server-only";
import type { CulturalCatalogEntry } from "./cultural-catalog-model";

export const culturalCatalog: CulturalCatalogEntry[] = [
  {
    "id": "HIST-001",
    "slug": "1857-fundacao-do-instituto-que-se-tornou-o-ines",
    "category": "history",
    "title": "1857 — Fundação do instituto que se tornou o INES",
    "summary": "A iniciativa de Ernest Huet antecedeu a oficialização do instituto em 1857. A instituição é um marco da educação de surdos, não a origem da Libras.",
    "version": "candidate-4",
    "artwork": {
      "motif": "timeline",
      "events": [
        {
          "year": 1855,
          "label": "Proposta",
          "claimId": "HIST-001-C01"
        },
        {
          "year": 1856,
          "label": "Início das aulas",
          "claimId": "HIST-001-C02"
        },
        {
          "year": 1857,
          "label": "Lei nº 939",
          "claimId": "HIST-001-C03"
        }
      ]
    },
    "references": [
      {
        "id": "source-1",
        "url": "https://seer.ines.gov.br/index.php/revista-espaco/article/download/703/708/2042"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "A iniciativa de Ernest Huet antecedeu a oficialização do instituto em 1857. A instituição é um marco da educação de surdos, não a origem da Libras.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "HIST-001-C01",
        "text": "Huet apresentou a proposta em 1855.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "HIST-001-C02",
        "text": "As aulas começaram em 1º de janeiro de 1856.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "HIST-001-C03",
        "text": "A Lei 939 é de 26 de setembro de 1857.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [
      {
        "targetId": "BIB-010",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "HIST-002",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "PER-007",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      }
    ],
    "internalPending": [
      "Conferir cronologia 1855–1857 e Lei 939."
    ],
    "history": {
      "year": 1857,
      "unknownMetadata": []
    },
    "editorialBody": {
      "paragraphs": [
        "Em 1855, Ernest Huet apresentou uma proposta de educação de surdos. As aulas começaram em 1º de janeiro de 1856. A Lei nº 939, de 26 de setembro de 1857, integra a cronologia institucional do atual INES. Trata-se de um marco educacional, não de uma data de nascimento da Libras."
      ],
      "claimIds": [
        "HIST-001-C01",
        "HIST-001-C02",
        "HIST-001-C03",
        "claim-1"
      ]
    }
  },
  {
    "id": "HIST-002",
    "slug": "1875-iconographia-de-flausino",
    "category": "history",
    "title": "1875 — Iconographia de Flausino",
    "summary": "Flausino José da Gama produziu uma obra iconográfica baseada na obra francesa de Pierre Pélissier. É patrimônio histórico, não um inventário independente da Libras atual.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://seer.ines.gov.br/index.php/serie-historica/issue/view/167"
      },
      {
        "id": "source-2",
        "url": "https://www.scielo.br/j/rbee/a/S5Gyt4gMNzzQJJmLYqMcqCC/abstract/?lang=pt"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Flausino José da Gama produziu uma obra iconográfica baseada na obra francesa de Pierre Pélissier. É patrimônio histórico, não um inventário independente da Libras atual.",
        "referenceIds": [
          "source-1",
          "source-2"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [
      {
        "targetId": "BIB-010",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "HIST-001",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "PER-007",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      }
    ],
    "internalPending": [
      "Conferir estudo comparativo integral e direitos do fac-símile."
    ],
    "history": {
      "year": 1875,
      "unknownMetadata": []
    }
  },
  {
    "id": "HIST-003",
    "slug": "1880-congresso-de-milao",
    "category": "history",
    "title": "1880 — Congresso de Milão",
    "summary": "Resoluções favoreceram o oralismo na educação de surdos. Não constituíram uma lei mundial. Em 2010, o congresso de Vancouver rejeitou essas resoluções.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://www.libras.ufsc.br/colecaoLetrasLibras/eixoFormacaoEspecifica/historiaDaEducacaoDeSurdos/assets/258/TextoBase_HistoriaEducacaoSurdos.pdf"
      },
      {
        "id": "source-2",
        "url": "https://wfdeaf.org/international-congress-of-the-deaf-iced-july-18-22-2010-vancouver-canada/"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Resoluções favoreceram o oralismo na educação de surdos. Não constituíram uma lei mundial. Em 2010, o congresso de Vancouver rejeitou essas resoluções.",
        "referenceIds": [
          "source-1",
          "source-2"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [],
    "internalPending": [
      "Verificar texto integral e efeitos específicos no Brasil."
    ],
    "history": {
      "year": 1880,
      "unknownMetadata": []
    }
  },
  {
    "id": "HIST-004",
    "slug": "1987-fundacao-da-feneis",
    "category": "history",
    "title": "1987 — Fundação da FENEIS",
    "summary": "A Federação Nacional de Educação e Integração dos Surdos foi fundada em 16 de maio de 1987, marco de organização coletiva.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://feneis.org.br/o-que-e/"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "A Federação Nacional de Educação e Integração dos Surdos foi fundada em 16 de maio de 1987, marco de organização coletiva.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [],
    "internalPending": [
      "Não apresentar como início do movimento surdo."
    ],
    "history": {
      "year": 1987,
      "unknownMetadata": []
    }
  },
  {
    "id": "HIST-005",
    "slug": "1999-a-educacao-que-nos-surdos-queremos",
    "category": "history",
    "title": "1999 — A educação que nós surdos queremos",
    "summary": "Documento coletivo associado à mobilização de participantes surdos no contexto do V Congresso Latino-Americano.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://seer.ines.gov.br/index.php/revista-espaco/article/download/1740/1675/5213"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Documento coletivo associado à mobilização de participantes surdos no contexto do V Congresso Latino-Americano.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [],
    "internalPending": [
      "Localizar original institucional; não reproduzir trechos."
    ],
    "history": {
      "year": 1999,
      "unknownMetadata": []
    }
  },
  {
    "id": "HIST-006",
    "slug": "2002-lei-de-libras",
    "category": "history",
    "title": "2002 — Lei de Libras",
    "summary": "A Lei 10.436 reconheceu a Libras como meio legal de comunicação e expressão, com estrutura gramatical própria.",
    "version": "candidate-4",
    "artwork": {
      "motif": "legal-document",
      "documentNumber": {
        "value": "10.436",
        "claimId": "claim-1"
      },
      "documentDate": {
        "value": "2002",
        "claimId": "HIST-006-C01"
      }
    },
    "references": [
      {
        "id": "source-1",
        "url": "https://www.planalto.gov.br/ccivil_03/leis/2002/l10436.htm"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "A Lei 10.436 reconheceu a Libras como meio legal de comunicação e expressão, com estrutura gramatical própria.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "HIST-006-C01",
        "text": "Lei datada de 24 de abril de 2002.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "HIST-006-C02",
        "text": "Reconhecimento como meio legal de comunicação e expressão.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "HIST-006-C03",
        "text": "Estrutura gramatical própria.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "HIST-006-C04",
        "text": "Apoio ao uso e difusão.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [],
    "internalPending": [
      "Não chamar de segunda língua oficial do Brasil."
    ],
    "history": {
      "year": 2002,
      "unknownMetadata": []
    },
    "editorialBody": {
      "paragraphs": [
        "Em 24 de abril de 2002, a Lei nº 10.436 reconheceu a Libras como meio legal de comunicação e expressão. A lei reconhece sua estrutura gramatical própria e prevê apoio ao uso e à difusão. Reconhecimento jurídico não equivale à criação da língua."
      ],
      "claimIds": [
        "HIST-006-C01",
        "HIST-006-C02",
        "HIST-006-C03",
        "HIST-006-C04"
      ]
    }
  },
  {
    "id": "HIST-007",
    "slug": "2005-decreto-5-626",
    "category": "history",
    "title": "2005 — Decreto 5.626",
    "summary": "Regulamentou a Lei de Libras e estabeleceu disposições sobre formação, ensino e acessibilidade.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://www2.camara.leg.br/legin/fed/decret/2005/decreto-5626-22-dezembro-2005-539842-publicacaooriginal-39399-pe.html"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Regulamentou a Lei de Libras e estabeleceu disposições sobre formação, ensino e acessibilidade.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [],
    "internalPending": [
      "Distinguir texto original de legislação consolidada."
    ],
    "history": {
      "year": 2005,
      "unknownMetadata": []
    }
  },
  {
    "id": "HIST-008",
    "slug": "2021-educacao-bilingue-de-surdos",
    "category": "history",
    "title": "2021 — Educação bilíngue de surdos",
    "summary": "A Lei 14.191 inseriu a modalidade de educação bilíngue de surdos na LDB, com Libras como primeira língua e português escrito como segunda, para estudantes optantes.",
    "version": "candidate-4",
    "references": [
      {
        "id": "source-1",
        "url": "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14191.htm"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "A Lei 14.191 inseriu a modalidade de educação bilíngue de surdos na LDB, com Libras como primeira língua e português escrito como segunda, para estudantes optantes.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "HIST-008-C01",
        "text": "Inclusão da modalidade na LDB.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "HIST-008-C02",
        "text": "Libras primeira língua e português escrito segunda, para optantes abrangidos.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "HIST-008-C03",
        "text": "Materiais didáticos e professores bilíngues.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "HIST-008-C04",
        "text": "A Lei nº 14.191 é de 3 de agosto de 2021.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [],
    "internalPending": [
      "Preservar condições legais e público abrangido."
    ],
    "history": {
      "year": 2021,
      "unknownMetadata": []
    },
    "editorialBody": {
      "paragraphs": [
        "A Lei nº 14.191, de 3 de agosto de 2021, incluiu a educação bilíngue de surdos na LDB. A modalidade prevê Libras como primeira língua e português escrito como segunda para os educandos abrangidos que optem por ela. A lei também prevê materiais didáticos e professores bilíngues."
      ],
      "claimIds": [
        "HIST-008-C01",
        "HIST-008-C02",
        "HIST-008-C03",
        "HIST-008-C04"
      ]
    }
  },
  {
    "id": "CUR-001",
    "slug": "existe-uma-lingua-de-sinais-universal",
    "category": "curiosity",
    "title": "Existe uma língua de sinais universal?",
    "summary": "Não. Existem diferentes línguas de sinais, como Libras, ASL e BSL.",
    "version": "candidate-4",
    "artwork": {
      "motif": "diversity-orbits"
    },
    "references": [
      {
        "id": "source-1",
        "url": "https://wfdeaf.org/contact/faqs/"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Não. Existem diferentes línguas de sinais, como Libras, ASL e BSL.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "CUR-001-C01",
        "text": "Não existe língua de sinais universal.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "CUR-001-C02",
        "text": "Há diferenças entre países e regiões.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [],
    "internalPending": [
      "Não usar contagem mundial sem fonte."
    ],
    "curiosity": {
      "question": "Existe uma língua de sinais universal?",
      "shortAnswer": "Não. Existem diferentes línguas de sinais, como Libras, ASL e BSL."
    },
    "editorialBody": {
      "paragraphs": [
        "Não existe uma língua de sinais universal. Comunidades de diferentes países e regiões utilizam línguas de sinais distintas. Aprender uma delas não garante compreender todas as outras."
      ],
      "claimIds": [
        "CUR-001-C01",
        "CUR-001-C02"
      ]
    }
  },
  {
    "id": "CUR-002",
    "slug": "libras-e-portugues-feito-com-as-maos",
    "category": "curiosity",
    "title": "Libras é português feito com as mãos?",
    "summary": "Não. Libras possui estrutura gramatical própria.",
    "version": "candidate-5",
    "artwork": {
      "motif": "parallel-structures"
    },
    "references": [
      {
        "id": "source-1",
        "url": "https://www.planalto.gov.br/ccivil_03/leis/2002/l10436.htm"
      },
      {
        "id": "source-2",
        "url": "https://ojsrevista.furb.br/ojs/index.php/linguagens/article/download/7287/4653/32619"
      },
      {
        "id": "source-3",
        "url": "https://doi.org/10.51207/2179-4057.20220014"
      },
      {
        "id": "source-4",
        "url": "https://letraslibras.paginas.ufsc.br/files/2022/12/LSB7106-Libras-Iniciante.pdf",
        "institution": "UFSC — Letras Libras",
        "purpose": "Ementa, objetivos, conteúdo programático e cronograma de 30/03/2023",
        "consultedAt": "2026-11-27"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Não. Libras possui estrutura gramatical própria.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "CUR-002-C01",
        "text": "Libras possui estrutura gramatical própria.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "CUR-002-C02",
        "text": "Elementos não manuais têm funções linguísticas.",
        "referenceIds": [
          "source-2"
        ]
      },
      {
        "id": "CUR-002-C03",
        "text": "Forma, localização, movimento e expressão facial são discutidos no estudo de Capovilla e Cecconi.",
        "referenceIds": [
          "source-3"
        ]
      },
      {
        "id": "CUR-002-C04",
        "text": "A Libras apresenta organização linguística em níveis como fonologia, léxico e sintaxe.",
        "referenceIds": [
          "source-2"
        ]
      },
      {
        "id": "CUR-002-C05",
        "text": "Configuração de mão, localização, movimento, orientação da mão e elementos não manuais são componentes estudados na fonologia das línguas de sinais.",
        "referenceIds": [
          "source-2"
        ]
      },
      {
        "id": "CUR-002-C06",
        "text": "A datilologia corresponde à soletração manual e constitui uma das competências trabalhadas no ensino de Libras, ao lado de competências comunicativas e gramaticais.",
        "referenceIds": [
          "source-4"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [
      {
        "targetId": "BIB-001",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-003",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "PER-002",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "PER-006",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      }
    ],
    "internalPending": [
      "Exemplos gramaticais exigem revisão."
    ],
    "curiosity": {
      "question": "Libras é português feito com as mãos?",
      "shortAnswer": "Não. Libras possui estrutura gramatical própria."
    },
    "editorialBody": {
      "paragraphs": [
        "Libras não é português representado pelas mãos. Possui estrutura gramatical própria. Configurações de mão, localização, movimento e elementos não manuais participam da sinalização. Aprender o alfabeto manual não equivale a dominar a língua."
      ],
      "claimIds": [
        "CUR-002-C01",
        "CUR-002-C02",
        "CUR-002-C03",
        "CUR-002-C04",
        "CUR-002-C05",
        "CUR-002-C06"
      ]
    }
  },
  {
    "id": "CUR-003",
    "slug": "o-rosto-tambem-participa-da-gramatica",
    "category": "curiosity",
    "title": "O rosto também participa da gramática?",
    "summary": "Expressões não manuais, incluindo rosto, cabeça e corpo, podem desempenhar funções linguísticas.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://ojsrevista.furb.br/ojs/index.php/linguagens/article/download/7287/4653/32619"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Expressões não manuais, incluindo rosto, cabeça e corpo, podem desempenhar funções linguísticas.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [],
    "internalPending": [
      "Não reduzir expressões a emoções; laboratório de mãos não avalia língua completa."
    ],
    "curiosity": {
      "question": "O rosto também participa da gramática?",
      "shortAnswer": "Expressões não manuais, incluindo rosto, cabeça e corpo, podem desempenhar funções linguísticas."
    }
  },
  {
    "id": "CUR-004",
    "slug": "existem-variacoes-na-libras",
    "category": "curiosity",
    "title": "Existem variações na Libras?",
    "summary": "Sim. Línguas apresentam variações regionais e sociais; diferentes formas podem ser legítimas.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://corpuslibras.ufsc.br/publicacoes"
      },
      {
        "id": "source-2",
        "url": "https://periodicos.ufsc.br/index.php/forum/article/view/77334"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Sim. Línguas apresentam variações regionais e sociais; diferentes formas podem ser legítimas.",
        "referenceIds": [
          "source-1",
          "source-2"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [
      {
        "targetId": "BIB-008",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-009",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      }
    ],
    "internalPending": [
      "Artigo não extraído; confirmar antes de publicar exemplos."
    ],
    "curiosity": {
      "question": "Existem variações na Libras?",
      "shortAnswer": "Sim. Línguas apresentam variações regionais e sociais; diferentes formas podem ser legítimas."
    }
  },
  {
    "id": "CUR-005",
    "slug": "toda-pessoa-surda-usa-libras",
    "category": "curiosity",
    "title": "Toda pessoa surda usa Libras?",
    "summary": "Não. Trajetórias linguísticas são diversas. A PNS 2019 registrou conhecimento de Libras em 22,4% das pessoas de 5 a 40 anos com deficiência auditiva, conforme definição da pesquisa.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://agenciadenoticias.ibge.gov.br/agencia-sala-de-imprensa/2013-agencia-de-noticias/releases/31445-pns-2019-pais-tem-17-3-milhoes-de-pessoas-com-algum-tipo-de-deficiencia"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Não. Trajetórias linguísticas são diversas. A PNS 2019 registrou conhecimento de Libras em 22,4% das pessoas de 5 a 40 anos com deficiência auditiva, conforme definição da pesquisa.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [],
    "internalPending": [
      "Não generalizar para toda população surda ou para 2026."
    ],
    "curiosity": {
      "question": "Toda pessoa surda usa Libras?",
      "shortAnswer": "Não. Trajetórias linguísticas são diversas. A PNS 2019 registrou conhecimento de Libras em 22,4% das pessoas de 5 a 40 anos com deficiência auditiva, conforme definição da pesquisa."
    }
  },
  {
    "id": "CUR-006",
    "slug": "existe-poesia-em-libras",
    "category": "curiosity",
    "title": "Existe poesia em Libras?",
    "summary": "Sim. Literatura sinalizada pode explorar movimento, espaço, ritmo e configurações de mão.",
    "version": "candidate-5",
    "artwork": {
      "motif": "visual-rhythm"
    },
    "references": [
      {
        "id": "source-1",
        "url": "https://petletras.paginas.ufsc.br/2023/09/08/literatura-surda-os-conceitos-de-karnopp-mourao-e-sutton-spence/"
      },
      {
        "id": "source-2",
        "url": "https://librando.paginas.ufsc.br/artigos/"
      },
      {
        "id": "source-3",
        "url": "https://librando.paginas.ufsc.br/poemas/"
      },
      {
        "id": "source-4",
        "url": "https://www.revistaglauks.ufv.br/Glauks/article/view/377",
        "institution": "UFV — Revista Glauks",
        "purpose": "Resumo",
        "consultedAt": "2026-11-27"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Sim. Literatura sinalizada pode explorar movimento, espaço, ritmo e configurações de mão.",
        "referenceIds": [
          "source-1",
          "source-2"
        ]
      },
      {
        "id": "CUR-006-C01",
        "text": "Ritmo, repetição e simetria são recursos poéticos.",
        "referenceIds": [
          "source-3"
        ]
      },
      {
        "id": "CUR-006-C02",
        "text": "O acervo lista poemas sinalizados.",
        "referenceIds": [
          "source-3"
        ]
      },
      {
        "id": "CUR-006-C03",
        "text": "A literatura surda sinalizada pode representar experiências visuais, culturais e identitárias das pessoas surdas.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "CUR-006-C04",
        "text": "Recursos poéticos e icônicos da Libras podem ser utilizados na construção de narrativas interpretativas.",
        "referenceIds": [
          "source-4"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [
      {
        "targetId": "BIB-004",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-005",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-006",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-007",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-011",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "CUR-007",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "PER-003",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      }
    ],
    "internalPending": [
      "Selecionar poema e autorização específica."
    ],
    "curiosity": {
      "question": "Existe poesia em Libras?",
      "shortAnswer": "Sim. Literatura sinalizada pode explorar movimento, espaço, ritmo e configurações de mão."
    },
    "editorialBody": {
      "paragraphs": [
        "A poesia em Libras explora recursos visuais e linguísticos, como ritmo, repetição e simetria. A produção poética sinalizada permite expressar experiências e criar narrativas artísticas. O acervo LIBRANDO reúne exemplos de poemas."
      ],
      "claimIds": [
        "CUR-006-C01",
        "CUR-006-C02",
        "CUR-006-C03",
        "CUR-006-C04"
      ]
    }
  },
  {
    "id": "CUR-007",
    "slug": "linguas-de-sinais-podem-ser-escritas",
    "category": "curiosity",
    "title": "Línguas de sinais podem ser escritas?",
    "summary": "SignWriting é um dos sistemas de escrita de línguas de sinais, estudado por Marianne Stumpf.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://www.libras.ufsc.br/colecaoLetrasLibras/eixoFormacaoEspecifica/escritaDeSinaisIII/scos/cap10898/1.html"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "SignWriting é um dos sistemas de escrita de línguas de sinais, estudado por Marianne Stumpf.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [
      {
        "targetId": "BIB-004",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-005",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-006",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-007",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-011",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "CUR-006",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "PER-003",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      }
    ],
    "internalPending": [
      "Não apresentar como obrigatório ou universal."
    ],
    "curiosity": {
      "question": "Línguas de sinais podem ser escritas?",
      "shortAnswer": "SignWriting é um dos sistemas de escrita de línguas de sinais, estudado por Marianne Stumpf."
    }
  },
  {
    "id": "CUR-008",
    "slug": "o-que-e-cultura-surda",
    "category": "curiosity",
    "title": "O que é cultura surda?",
    "summary": "Experiências, práticas culturais, identidades e formas de pertencimento podem ser construídas em comunidades surdas diversas.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://repositorio.ufsc.br/handle/123456789/91978"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Experiências, práticas culturais, identidades e formas de pertencimento podem ser construídas em comunidades surdas diversas.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [
      {
        "targetId": "BIB-002",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "PER-004",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "PER-005",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      }
    ],
    "internalPending": [
      "Evitar homogeneização e revisar com pessoas surdas."
    ],
    "curiosity": {
      "question": "O que é cultura surda?",
      "shortAnswer": "Experiências, práticas culturais, identidades e formas de pertencimento podem ser construídas em comunidades surdas diversas."
    }
  },
  {
    "id": "PER-001",
    "slug": "nelson-pimenta",
    "category": "personality",
    "title": "Nelson Pimenta",
    "summary": "Referência em produções e estudos de Libras e literatura sinalizada.",
    "version": "candidate-5",
    "artwork": {
      "motif": "monogram"
    },
    "references": [
      {
        "id": "source-1",
        "url": "https://www.revistas.editora.ufcg.edu.br/index.php/RLR/article/view/1742"
      },
      {
        "id": "source-2",
        "url": "https://indl.iphan.gov.br/pessoas-de-referencia/nelson-pimenta-de-castro/"
      },
      {
        "id": "source-3",
        "url": "https://nuestra.ufsc.br/vocab/index.php?tema=42&/nelson-pimenta-de-castro"
      },
      {
        "id": "source-4",
        "url": "https://repositorio.ufsc.br/handle/123456789/204538",
        "institution": "UFSC — Repositório Institucional",
        "purpose": "Registro da tese",
        "consultedAt": "2026-11-27"
      },
      {
        "id": "source-5",
        "url": "https://repositorio.ufsc.br/handle/123456789/100721",
        "institution": "UFSC — Repositório Institucional",
        "purpose": "Título, autoria, resumo e data do registro institucional",
        "consultedAt": "2026-11-27"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Referência em produções e estudos de Libras e literatura sinalizada.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "PER-001-C01",
        "text": "Atuação em educação, pesquisa e cinema.",
        "referenceIds": [
          "source-2"
        ]
      },
      {
        "id": "PER-001-C02",
        "text": "Trajetória artística e formação acadêmica.",
        "referenceIds": [
          "source-3"
        ]
      },
      {
        "id": "PER-001-C03",
        "text": "Tese sobre prosódia em ASL e Libras, 2019.",
        "referenceIds": [
          "source-4"
        ]
      },
      {
        "id": "PER-001-C04",
        "text": "Dissertação sobre tradução de fábulas, 2012.",
        "referenceIds": [
          "source-5"
        ]
      },
      {
        "id": "PER-001-C05",
        "text": "Nelson Pimenta de Castro é identificado como uma liderança surda pelo Inventário Nacional da Diversidade Linguística.",
        "referenceIds": [
          "source-2"
        ]
      },
      {
        "id": "PER-001-C06",
        "text": "Nelson Pimenta de Castro possui trajetória artística no teatro, incluindo atuação no espetáculo Nelson 6 ao Vivo.",
        "referenceIds": [
          "source-3"
        ]
      },
      {
        "id": "PER-001-C07",
        "text": "Nelson Pimenta de Castro concluiu mestrado e doutorado em Estudos da Tradução pela Universidade Federal de Santa Catarina.",
        "referenceIds": [
          "source-3"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [],
    "internalPending": [
      "Confirmar biografia, obras e autodeclaração em fontes primárias."
    ],
    "personality": {
      "personName": "Nelson Pimenta",
      "biographicalSummary": "Referência em produções e estudos de Libras e literatura sinalizada."
    },
    "editorialBody": {
      "paragraphs": [
        "Nelson Pimenta de Castro é uma liderança surda com atuação na arte, educação e pesquisa. Sua trajetória inclui teatro, cinema e estudos da tradução. Entre seus trabalhos acadêmicos estão uma dissertação sobre tradução de fábulas e uma tese sobre prosódia em ASL e Libras."
      ],
      "claimIds": [
        "PER-001-C01",
        "PER-001-C02",
        "PER-001-C03",
        "PER-001-C04",
        "PER-001-C05",
        "PER-001-C06",
        "PER-001-C07"
      ]
    }
  },
  {
    "id": "PER-002",
    "slug": "lucinda-ferreira-brito",
    "category": "personality",
    "title": "Lucinda Ferreira Brito",
    "summary": "Pesquisadora pioneira dos estudos linguísticos das línguas de sinais no Brasil; autora de Por uma gramática de línguas de sinais.",
    "version": "candidate-3",
    "references": [
      {
        "id": "source-1",
        "url": "https://seer.ufu.br/index.php/EducacaoFilosofia/article/view/29990"
      },
      {
        "id": "source-2",
        "url": "https://www.gov.br/fundaj/pt-br/composicao/dimeca/biblioteca/acervos/inventarios-documentais-e-indices/libras_25_4_2012.pdf",
        "institution": "Fundação Joaquim Nabuco",
        "purpose": "Referência nº 24",
        "consultedAt": "2026-11-27"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Pesquisadora pioneira dos estudos linguísticos das línguas de sinais no Brasil; autora de Por uma gramática de línguas de sinais.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "PER-002-C02",
        "text": "A obra foi originalmente publicada em 1995 e reimpressa em 2010.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "PER-002-C03",
        "text": "A obra constitui uma contribuição pioneira à descrição linguística da Libras.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "PER-002-C04",
        "text": "O inventário bibliográfico da Fundação Joaquim Nabuco registra a obra Por uma gramática de línguas de sinais, de Lucinda Ferreira Brito, publicada em 1995.",
        "referenceIds": [
          "source-2"
        ]
      },
      {
        "id": "PER-002-C01",
        "text": "Obra gramatical atribuída a Lucinda Ferreira Brito.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [
      {
        "targetId": "BIB-001",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-003",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "CUR-002",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "PER-006",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      }
    ],
    "internalPending": [
      "Confirmar trajetória e datas."
    ],
    "personality": {
      "personName": "Lucinda Ferreira Brito",
      "biographicalSummary": "Pesquisadora pioneira dos estudos linguísticos das línguas de sinais no Brasil; autora de Por uma gramática de línguas de sinais."
    },
    "editorialBody": {
      "paragraphs": [
        "Lucinda Ferreira Brito é uma referência nos estudos linguísticos das línguas de sinais no Brasil. Sua obra Por uma gramática de línguas de sinais, originalmente publicada em 1995, integra a bibliografia sobre a descrição linguística da Libras."
      ],
      "claimIds": [
        "PER-002-C01",
        "PER-002-C02",
        "PER-002-C03",
        "PER-002-C04"
      ]
    }
  },
  {
    "id": "PER-003",
    "slug": "marianne-rossi-stumpf",
    "category": "personality",
    "title": "Marianne Rossi Stumpf",
    "summary": "Pesquisadora da escrita de línguas de sinais e da educação, autora de tese sobre SignWriting.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://www.libras.ufsc.br/colecaoLetrasLibras/eixoFormacaoEspecifica/escritaDeSinaisIII/scos/cap10898/1.html"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Pesquisadora da escrita de línguas de sinais e da educação, autora de tese sobre SignWriting.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [
      {
        "targetId": "BIB-004",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-005",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-006",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-007",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-011",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "CUR-006",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "CUR-007",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      }
    ],
    "internalPending": [
      "Não inferir cargos atuais de apresentação histórica."
    ],
    "personality": {
      "personName": "Marianne Rossi Stumpf",
      "biographicalSummary": "Pesquisadora da escrita de línguas de sinais e da educação, autora de tese sobre SignWriting."
    }
  },
  {
    "id": "PER-004",
    "slug": "karin-lilian-strobel",
    "category": "personality",
    "title": "Karin Lilian Strobel",
    "summary": "Pesquisadora de cultura e história surda, autora de tese sobre vestígios culturais.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://repositorio.ufsc.br/handle/123456789/91978"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Pesquisadora de cultura e história surda, autora de tese sobre vestígios culturais.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [
      {
        "targetId": "BIB-002",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "CUR-008",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "PER-005",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      }
    ],
    "internalPending": [
      "Confirmar biografia e edição das obras."
    ],
    "personality": {
      "personName": "Karin Lilian Strobel",
      "biographicalSummary": "Pesquisadora de cultura e história surda, autora de tese sobre vestígios culturais."
    }
  },
  {
    "id": "PER-005",
    "slug": "gladis-perlin",
    "category": "personality",
    "title": "Gladis Perlin",
    "summary": "Referência candidata em identidade e educação de surdos.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://librando.paginas.ufsc.br/artigos/"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Referência candidata em identidade e educação de surdos.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [
      {
        "targetId": "BIB-002",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "CUR-008",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "PER-004",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      }
    ],
    "internalPending": [
      "Fonte específica da biografia ainda necessária; confirmar grafia e obras."
    ],
    "personality": {
      "personName": "Gladis Perlin",
      "biographicalSummary": "Referência candidata em identidade e educação de surdos."
    }
  },
  {
    "id": "PER-006",
    "slug": "ronice-muller-de-quadros",
    "category": "personality",
    "title": "Ronice Müller de Quadros",
    "summary": "Pesquisadora de linguística das línguas de sinais e organizadora de Gramática da Libras.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://repositorio.ufsc.br/handle/123456789/262318"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Pesquisadora de linguística das línguas de sinais e organizadora de Gramática da Libras.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [
      {
        "targetId": "BIB-001",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-003",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "CUR-002",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "PER-002",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      }
    ],
    "internalPending": [
      "Confirmar trajetória e cargos em fonte institucional."
    ],
    "personality": {
      "personName": "Ronice Müller de Quadros",
      "biographicalSummary": "Pesquisadora de linguística das línguas de sinais e organizadora de Gramática da Libras."
    }
  },
  {
    "id": "PER-007",
    "slug": "flausino-jose-da-gama",
    "category": "personality",
    "title": "Flausino José da Gama",
    "summary": "Ex-aluno do instituto que se tornou o INES e responsável pela Iconographia de 1875.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://seer.ines.gov.br/index.php/serie-historica/issue/view/167"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Ex-aluno do instituto que se tornou o INES e responsável pela Iconographia de 1875.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [
      {
        "targetId": "BIB-010",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "HIST-001",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "HIST-002",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      }
    ],
    "internalPending": [
      "Contextualizar matriz francesa; não inventar retrato."
    ],
    "personality": {
      "personName": "Flausino José da Gama",
      "biographicalSummary": "Ex-aluno do instituto que se tornou o INES e responsável pela Iconographia de 1875."
    }
  },
  {
    "id": "BIB-001",
    "slug": "por-uma-gramatica-de-linguas-de-sinais",
    "category": "library",
    "title": "Por uma gramática de línguas de sinais",
    "summary": "Estudos linguísticos; resenha, sem edição integral localizada.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://seer.ufu.br/index.php/EducacaoFilosofia/article/view/29990"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Estudos linguísticos; resenha, sem edição integral localizada.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [
      {
        "targetId": "BIB-003",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "CUR-002",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "PER-002",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "PER-006",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      }
    ],
    "internalPending": [
      "Conferir metadados e acesso; sem autorização de mídia."
    ],
    "library": {
      "unknownMetadata": [
        "creators",
        "publicationYear",
        "publisher",
        "format",
        "access",
        "languages"
      ],
      "unstructuredMetadata": "Lucinda Ferreira Brito · 1995 · Tempo Brasileiro"
    }
  },
  {
    "id": "BIB-002",
    "slug": "as-imagens-do-outro-sobre-a-cultura-surda",
    "category": "library",
    "title": "As imagens do outro sobre a cultura surda",
    "summary": "Cultura e representações; referência editorial.",
    "version": "candidate-3",
    "references": [
      {
        "id": "source-1",
        "url": "https://editora.ufsc.br/2016/10/10/lancamento-as-imagens-do-outro-sobre-a-cultura-surda/"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Cultura e representações; referência editorial.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "BIB-002-C02",
        "text": "A obra de Karin Strobel aborda representações e perspectivas sobre a cultura surda.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "BIB-002-C01",
        "text": "Quarta edição, Editora UFSC, 2016.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [
      {
        "targetId": "CUR-008",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "PER-004",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "PER-005",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      }
    ],
    "internalPending": [
      "Conferir metadados e acesso; sem autorização de mídia."
    ],
    "library": {
      "unknownMetadata": [
        "creators",
        "publicationYear",
        "publisher",
        "format",
        "access",
        "languages"
      ],
      "unstructuredMetadata": "Karin Strobel · 4ª ed. 2016 · Editora UFSC"
    },
    "editorialBody": {
      "paragraphs": [
        "Obra de Karin Lilian Strobel voltada às representações da cultura surda. A quarta edição foi lançada pela Editora UFSC em 2016. É uma leitura candidata para conhecer perspectivas culturais e identitárias."
      ],
      "claimIds": [
        "BIB-002-C01",
        "BIB-002-C02"
      ]
    }
  },
  {
    "id": "BIB-003",
    "slug": "gramatica-da-libras-volume-1",
    "category": "library",
    "title": "Gramática da Libras — Volume 1",
    "summary": "Linguística; PDF institucional.",
    "version": "candidate-5",
    "artwork": {
      "motif": "academic",
      "volumeNumber": {
        "value": "I",
        "claimId": "BIB-003-C04"
      }
    },
    "references": [
      {
        "id": "source-1",
        "url": "https://repositorio.ufsc.br/handle/123456789/262318"
      },
      {
        "id": "source-2",
        "url": "https://www.researchgate.net/publication/385893948_A_Fonetica_e_a_Fonologia_das_Linguas_de_Sinais",
        "institution": "INES — cópia parcial hospedada no ResearchGate",
        "purpose": "Apresentação editorial e sumário, capítulos 1–4",
        "consultedAt": "2026-11-27"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Linguística; PDF institucional.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "BIB-003-C01",
        "text": "Publicação INES de 2023, 511 páginas.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "BIB-003-C02",
        "text": "Organizadores: Ronice Müller de Quadros, Jair Barbosa da Silva, Miriam Royer e Vinícius Rodrigues da Silva.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "BIB-003-C03",
        "text": "A Gramática da Libras — Volume 1 reúne estudos sobre a descrição linguística da Libras, incluindo fundamentos gramaticais, documentação linguística, fonética e fonologia.",
        "referenceIds": [
          "source-2"
        ]
      },
      {
        "id": "BIB-003-C04",
        "text": "O registro institucional do Volume 1 apresenta 37 entradas de autoria, incluindo os quatro organizadores.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "BIB-003-C05",
        "text": "O Repositório Institucional da UFSC disponibiliza um arquivo PDF da Gramática da Libras — Volume 1.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [
      {
        "targetId": "BIB-001",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "CUR-002",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "PER-002",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "PER-006",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      }
    ],
    "internalPending": [
      "Conferir metadados e acesso; sem autorização de mídia."
    ],
    "library": {
      "unknownMetadata": [
        "creators",
        "publicationYear",
        "publisher",
        "format",
        "access",
        "languages"
      ],
      "unstructuredMetadata": "Quadros, Jair Barbosa da Silva, Miriam Royer e Vinícius Rodrigues da Silva (org., a conferir) · INES · 2023"
    },
    "editorialBody": {
      "paragraphs": [
        "Gramática da Libras — Volume 1 reúne estudos linguísticos em uma publicação do INES de 2023. O registro institucional identifica quatro organizadores e uma equipe ampla de autores. O PDF está disponível no repositório da UFSC."
      ],
      "claimIds": [
        "BIB-003-C01",
        "BIB-003-C02",
        "BIB-003-C03",
        "BIB-003-C04",
        "BIB-003-C05"
      ]
    }
  },
  {
    "id": "BIB-004",
    "slug": "literatura-em-libras",
    "category": "library",
    "title": "Literatura em Libras",
    "summary": "Obra sobre literatura sinalizada, com versões em português e Libras.",
    "version": "candidate-7",
    "references": [
      {
        "id": "source-1",
        "url": "https://repositorio.ufsc.br/xmlui/handle/123456789/259641",
        "institution": "UFSC — Repositório Institucional",
        "purpose": "Registro institucional da obra; metadados verificados na curadoria V2/V2.1, com reverificação em 2026-11-28 limitada pela validação de segurança da RedeUFSC",
        "consultedAt": "2026-11-28"
      },
      {
        "id": "source-2",
        "url": "https://librando.paginas.ufsc.br/livros-2/",
        "institution": "LIBRANDO — UFSC",
        "purpose": "Curadoria bibliográfica com ligações para PDF, leitura online e playlist de vídeos em Libras",
        "consultedAt": "2026-11-28"
      },
      {
        "id": "source-3",
        "url": "https://repositorio.ufsc.br/xmlui/bitstream/handle/123456789/259641/Literatura_em_Libras_Rachel_Sutton_Spence.pdf?sequence=1&isAllowed=y",
        "institution": "UFSC — Repositório Institucional",
        "purpose": "Ficha catalográfica, ficha técnica e apresentação da edição digital",
        "consultedAt": "2026-11-28"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Obra sobre literatura sinalizada, com versões em português e Libras.",
        "referenceIds": [
          "source-2",
          "source-3"
        ]
      },
      {
        "id": "BIB-004-C01",
        "text": "Autoria de Rachel Sutton-Spence, tradução do conteúdo em Libras por Gustavo Gusmão e primeira edição de 2021.",
        "referenceIds": [
          "source-3"
        ]
      },
      {
        "id": "BIB-004-C02",
        "text": "O LIBRANDO indica acesso textual e vídeos em Libras.",
        "referenceIds": [
          "source-2"
        ]
      },
      {
        "id": "BIB-004-C03",
        "text": "Literatura em Libras é uma obra de Rachel Sutton-Spence, com tradução do conteúdo em Libras por Gustavo Gusmão.",
        "referenceIds": [
          "source-3"
        ]
      },
      {
        "id": "BIB-004-C04",
        "text": "A primeira edição foi publicada pela Editora Arara Azul em 2021.",
        "referenceIds": [
          "source-3"
        ]
      },
      {
        "id": "BIB-004-C05",
        "text": "A obra aborda conceitos, narrativas, recursos estéticos e aspectos sociais da literatura em Libras.",
        "referenceIds": [
          "source-3"
        ]
      }
    ],
    "reviewPolicy": {
      "path": "documentary",
      "documentaryEligibility": {
        "contentClass": "bibliographic-descriptive",
        "rationale": "Ficha estritamente bibliográfica: apresenta autoria, crédito de tradução, edição, editora, idiomas, modalidades de acesso e descrição sumária da obra apoiados em documentação institucional, ficha técnica, apresentação e sumário. Não ensina Libras, não realiza análise literária independente, não avalia pedagogicamente a obra e não valida linguisticamente o conteúdo.",
        "claimIds": [
          "claim-1",
          "BIB-004-C01",
          "BIB-004-C02",
          "BIB-004-C03",
          "BIB-004-C04",
          "BIB-004-C05"
        ],
        "coveredSurfaces": [
          "identity",
          "title",
          "summary",
          "claims",
          "references",
          "libraryMetadata",
          "relatedEntries",
          "editorialBody"
        ]
      }
    },
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [
      {
        "targetId": "BIB-005",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-006",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-007",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-011",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "CUR-006",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "CUR-007",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "PER-003",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      }
    ],
    "internalPending": [],
    "library": {
      "creators": [
        "Rachel Sutton-Spence"
      ],
      "publicationYear": 2021,
      "publisher": "Editora Arara Azul",
      "format": "book",
      "access": "open-digital",
      "languages": [
        "Português",
        "Libras"
      ],
      "unknownMetadata": [],
      "unstructuredMetadata": "Rachel Sutton-Spence · 2021 · Arara Azul"
    },
    "editorialBody": {
      "paragraphs": [
        "Literatura em Libras, de Rachel Sutton-Spence, com tradução do conteúdo para Libras por Gustavo Gusmão, apresenta estudos sobre literatura sinalizada. A primeira edição é de 2021, pela Arara Azul. O LIBRANDO indica modalidades textuais e audiovisuais."
      ],
      "claimIds": [
        "BIB-004-C01",
        "BIB-004-C02",
        "BIB-004-C03",
        "BIB-004-C04",
        "BIB-004-C05"
      ]
    }
  },
  {
    "id": "BIB-005",
    "slug": "cinderela-surda",
    "category": "library",
    "title": "Cinderela Surda",
    "summary": "Literatura infantil; releitura cultural.",
    "version": "candidate-5",
    "artwork": {
      "motif": "literary"
    },
    "references": [
      {
        "id": "source-1",
        "url": "https://librando.paginas.ufsc.br/signwrite/"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Literatura infantil; releitura cultural.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "BIB-005-C01",
        "text": "Autoria e terceira edição de 2011, 36 páginas.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "BIB-005-C02",
        "text": "Cinderela Surda é uma releitura de um conto clássico da literatura infantil que valoriza a cultura surda.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "BIB-005-C03",
        "text": "A obra integra a seção de escrita de sinais do acervo LIBRANDO.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "BIB-005-C04",
        "text": "A terceira edição foi publicada pela Editora da ULBRA em 2011.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [
      {
        "targetId": "BIB-004",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-006",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-007",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-011",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "CUR-006",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "CUR-007",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "PER-003",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      }
    ],
    "internalPending": [
      "Conferir metadados e acesso; sem autorização de mídia."
    ],
    "library": {
      "unknownMetadata": [
        "creators",
        "publicationYear",
        "publisher",
        "format",
        "access",
        "languages"
      ],
      "unstructuredMetadata": "Carolina Hessel, Fabiano Rosa e Lodenir Karnopp · edição localizada 2011"
    },
    "editorialBody": {
      "paragraphs": [
        "Cinderela Surda é uma releitura literária infantil que integra o acervo de obras com escrita de sinais do LIBRANDO. A edição localizada é a terceira, de 2011, publicada pela ULBRA."
      ],
      "claimIds": [
        "BIB-005-C01",
        "BIB-005-C02",
        "BIB-005-C03",
        "BIB-005-C04"
      ]
    }
  },
  {
    "id": "BIB-006",
    "slug": "rapunzel-surda",
    "category": "library",
    "title": "Rapunzel Surda",
    "summary": "Literatura infantil com protagonista surda.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://librando.paginas.ufsc.br/signwrite/"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Literatura infantil com protagonista surda.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [
      {
        "targetId": "BIB-004",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-005",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-007",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-011",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "CUR-006",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "CUR-007",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "PER-003",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      }
    ],
    "internalPending": [
      "Conferir metadados e acesso; sem autorização de mídia."
    ],
    "library": {
      "unknownMetadata": [
        "creators",
        "publicationYear",
        "publisher",
        "format",
        "access",
        "languages"
      ],
      "unstructuredMetadata": "Carolina Hessel Silveira, Lodenir Karnopp e Fabiano Souto Rosa · edição localizada 2005"
    }
  },
  {
    "id": "BIB-007",
    "slug": "o-feijaozinho-surdo",
    "category": "library",
    "title": "O Feijãozinho Surdo",
    "summary": "Literatura infantil e representatividade.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://librando.paginas.ufsc.br/signwrite/"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Literatura infantil e representatividade.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [
      {
        "targetId": "BIB-004",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-005",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-006",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-011",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "CUR-006",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "CUR-007",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "PER-003",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      }
    ],
    "internalPending": [
      "Conferir metadados e acesso; sem autorização de mídia."
    ],
    "library": {
      "unknownMetadata": [
        "creators",
        "publicationYear",
        "publisher",
        "format",
        "access",
        "languages"
      ],
      "unstructuredMetadata": "Liêge Gemelli Kuchenbecker · 2009"
    }
  },
  {
    "id": "BIB-008",
    "slug": "novo-deit-libras",
    "category": "library",
    "title": "Novo Deit-Libras",
    "summary": "Dicionário ilustrado; disponibilidade comercial a conferir.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://www.edusp.com.br/livros/novo-deit-libras/"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Dicionário ilustrado; disponibilidade comercial a conferir.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [
      {
        "targetId": "BIB-009",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "CUR-004",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      }
    ],
    "internalPending": [
      "Conferir metadados e acesso; sem autorização de mídia."
    ],
    "library": {
      "unknownMetadata": [
        "creators",
        "publicationYear",
        "publisher",
        "format",
        "access",
        "languages"
      ],
      "unstructuredMetadata": "Fernando Capovilla, Walkiria Raphael e Aline Mauricio · Edusp"
    }
  },
  {
    "id": "BIB-009",
    "slug": "dicionario-digital-da-libras",
    "category": "library",
    "title": "Dicionário Digital da Libras",
    "summary": "Consulta digital de sinais.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://dicionario.ines.gov.br/"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Consulta digital de sinais.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [
      {
        "targetId": "BIB-008",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "CUR-004",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      }
    ],
    "internalPending": [
      "Conferir metadados e acesso; sem autorização de mídia."
    ],
    "library": {
      "unknownMetadata": [
        "creators",
        "publicationYear",
        "publisher",
        "format",
        "access",
        "languages"
      ],
      "unstructuredMetadata": "INES / Acessibilidade Brasil"
    }
  },
  {
    "id": "BIB-010",
    "slug": "iconographia-dos-signaes-dos-surdos-mudos",
    "category": "library",
    "title": "Iconographia dos Signaes dos Surdos-Mudos",
    "summary": "Patrimônio histórico; título original de época, não terminologia atual.",
    "version": "candidate-5",
    "references": [
      {
        "id": "source-1",
        "url": "https://seer.ines.gov.br/index.php/serie-historica/issue/view/167",
        "institution": "INES — Série Histórica",
        "purpose": "Apresentação institucional do fac-símile e acesso à edição completa em PDF",
        "consultedAt": "2026-11-28"
      },
      {
        "id": "source-2",
        "url": "https://www.scielo.br/j/rbee/a/S5Gyt4gMNzzQJJmLYqMcqCC/abstract/?lang=pt",
        "institution": "SciELO",
        "purpose": "Resumo do estudo de Sofiato e Reily",
        "consultedAt": "2026-11-27"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Patrimônio histórico; título original de época, não terminologia atual.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "BIB-010-C01",
        "text": "Obra de Flausino publicada em 1875.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "BIB-010-C02",
        "text": "Matriz francesa de Pierre Pélissier.",
        "referenceIds": [
          "source-2"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [
      {
        "targetId": "HIST-001",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "HIST-002",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "PER-007",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      }
    ],
    "internalPending": [],
    "library": {
      "creators": [
        "Flausino José da Gama"
      ],
      "publicationYear": 1875,
      "format": "historical-facsimile",
      "access": "institutional-digital",
      "languages": [
        "Português"
      ],
      "unknownMetadata": [
        "publisher"
      ],
      "unstructuredMetadata": "Flausino José da Gama · 1875"
    },
    "editorialBody": {
      "paragraphs": [
        "A Iconographia dos Signaes dos Surdos-Mudos, de 1875, é um documento histórico associado a Flausino José da Gama. Estudos comparativos apontam sua matriz na obra francesa de Pierre Pélissier. O título original é preservado como registro de época, não como terminologia contemporânea."
      ],
      "claimIds": [
        "BIB-010-C01",
        "BIB-010-C02"
      ]
    }
  },
  {
    "id": "BIB-011",
    "slug": "contacao-de-historias",
    "category": "library",
    "title": "Contação de Histórias",
    "summary": "Série audiovisual de literatura infantil e juvenil.",
    "version": "candidate-6",
    "references": [
      {
        "id": "source-1",
        "url": "https://debasi.ines.gov.br/tv-ines/conta%C3%A7%C3%A3o-de-hist%C3%B3rias",
        "institution": "INES — DEBASI / TV INES",
        "purpose": "Descrição institucional da série e lista de episódios vinculados ao YouTube",
        "consultedAt": "2026-11-28"
      },
      {
        "id": "source-2",
        "url": "https://debasi.ines.gov.br/tv-ines",
        "institution": "INES — TV INES / DEBASI",
        "purpose": "Apresentação institucional da TV INES e categoria Infantil",
        "consultedAt": "2026-11-28"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Série audiovisual de literatura infantil e juvenil.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "BIB-011-C01",
        "text": "Série de animações literárias traduzidas para Libras.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "BIB-011-C02",
        "text": "Contação de Histórias integra a programação da TV INES.",
        "referenceIds": [
          "source-2"
        ]
      },
      {
        "id": "BIB-011-C03",
        "text": "As animações contemplam obras de autores e ilustradores nacionais traduzidas para Libras.",
        "referenceIds": [
          "source-1"
        ]
      },
      {
        "id": "BIB-011-C04",
        "text": "A série busca tornar a literatura infantil e juvenil acessível à comunidade surda de todas as idades.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "reviewPolicy": {
      "path": "documentary",
      "documentaryEligibility": {
        "contentClass": "bibliographic-descriptive",
        "rationale": "Ficha estritamente documental sobre série audiovisual institucional: descreve natureza, responsabilidade institucional, finalidade declarada e modalidade de acesso conforme fontes oficiais. Não avalia eficácia, não analisa linguisticamente os episódios e não afirma verificação integral ou disponibilidade permanente.",
        "claimIds": [
          "claim-1",
          "BIB-011-C01",
          "BIB-011-C02",
          "BIB-011-C03",
          "BIB-011-C04"
        ],
        "coveredSurfaces": [
          "identity",
          "title",
          "summary",
          "claims",
          "references",
          "libraryMetadata",
          "relatedEntries",
          "editorialBody"
        ]
      }
    },
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [
      {
        "targetId": "BIB-004",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-005",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-006",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "BIB-007",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "CUR-006",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "CUR-007",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      },
      {
        "targetId": "PER-003",
        "kind": "unverified-candidate",
        "evidenceReferenceIds": []
      }
    ],
    "internalPending": [],
    "library": {
      "creators": [
        "TV INES"
      ],
      "format": "audiovisual-series",
      "access": "external-website",
      "languages": [
        "Libras"
      ],
      "unknownMetadata": [
        "publicationYear",
        "publisher"
      ],
      "unstructuredMetadata": "TV INES"
    },
    "editorialBody": {
      "paragraphs": [
        "Contação de Histórias é uma série da TV INES que apresenta animações de obras de autores e ilustradores nacionais traduzidas para Libras. A iniciativa busca tornar a literatura infantil e juvenil acessível à comunidade surda de todas as idades."
      ],
      "claimIds": [
        "BIB-011-C01",
        "BIB-011-C02",
        "BIB-011-C03",
        "BIB-011-C04"
      ]
    }
  },
  {
    "id": "BIB-012",
    "slug": "a-vida-em-libras",
    "category": "library",
    "title": "A Vida em Libras",
    "summary": "Série audiovisual sobre situações cotidianas.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://debasi.ines.gov.br/tv-ines/a-vida-em-libras"
      }
    ],
    "claims": [
      {
        "id": "claim-1",
        "text": "Série audiovisual sobre situações cotidianas.",
        "referenceIds": [
          "source-1"
        ]
      }
    ],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [],
    "internalPending": [
      "Conferir metadados e acesso; sem autorização de mídia."
    ],
    "library": {
      "unknownMetadata": [
        "creators",
        "publicationYear",
        "publisher",
        "format",
        "access",
        "languages"
      ],
      "unstructuredMetadata": "TV INES · Heveraldo Ferreira (apresentação a conferir)"
    }
  },
  {
    "id": "PER-008",
    "slug": "fernando-cesar-capovilla",
    "category": "personality",
    "title": "Fernando César Capovilla",
    "summary": "Pesquisador com trabalhos em psicologia, linguagem, cognição e educação; coautor de obras lexicográficas sobre Libras.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://www.edusp.com.br/loja/produto/9788531416453"
      },
      {
        "id": "source-2",
        "url": "https://doi.org/10.51207/2179-4057.20220014"
      },
      {
        "id": "source-3",
        "url": "https://www.researchgate.net/publication/348550868"
      }
    ],
    "claims": [],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [],
    "internalPending": [
      "Confirmar biografia institucional e contribuições individuais.",
      "Mapear afirmações individualmente; revisão de pesquisa, técnica, especializada e autorização final pendentes."
    ],
    "personality": {
      "personName": "Fernando César Capovilla",
      "biographicalSummary": "Pesquisador com trabalhos em psicologia, linguagem, cognição e educação; coautor de obras lexicográficas sobre Libras."
    }
  },
  {
    "id": "PER-009",
    "slug": "fernanda-de-araujo-machado",
    "category": "personality",
    "title": "Fernanda de Araújo Machado",
    "summary": "Pesquisadora e artista com produção em poesia sinalizada e estudos da Libras; autora coletiva da Gramática da Libras.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://librando.paginas.ufsc.br/poemas/"
      },
      {
        "id": "source-2",
        "url": "https://repositorio.ufsc.br/handle/123456789/262318"
      },
      {
        "id": "source-3",
        "url": "https://repositorio.ufsc.br/handle/123456789/194013"
      }
    ],
    "claims": [],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [],
    "internalPending": [
      "Confirmar biografia institucional, tese integral e direitos dos poemas.",
      "Mapear afirmações individualmente; revisão de pesquisa, técnica, especializada e autorização final pendentes.",
      "Validar integralmente a correspondência entre o PDF HTTP documentado e o registro institucional HTTPS antes de uso factual adicional."
    ],
    "personality": {
      "personName": "Fernanda de Araújo Machado",
      "biographicalSummary": "Pesquisadora e artista com produção em poesia sinalizada e estudos da Libras; autora coletiva da Gramática da Libras."
    }
  },
  {
    "id": "BIB-013",
    "slug": "dicionario-da-lingua-de-sinais-do-brasil",
    "category": "library",
    "title": "Dicionário da Língua de Sinais do Brasil: A Libras em Suas Mãos",
    "summary": "Coleção de três volumes de Fernando César Capovilla, Walkiria Duarte Raphael, Janice Gonçalves Temoteo e Antonielle Cantarelli Martins.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://www.edusp.com.br/loja/produto/9788531416453"
      }
    ],
    "claims": [],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [],
    "internalPending": [
      "Distinguir publicação de 2017 e oferta de 2026; edição/reimpressão não confirmada.",
      "Mapear afirmações individualmente; revisão de pesquisa, técnica, especializada e autorização final pendentes."
    ],
    "library": {
      "unknownMetadata": [
        "creators",
        "publicationYear",
        "publisher",
        "format",
        "access",
        "languages"
      ],
      "unstructuredMetadata": "Metadados V2 não verificados: {\"collectionVolumes\":3,\"edition2017Isbns\":[\"9788531415401\",\"9788531415418\",\"9788531415425\"],\"publisherListing2026\":{\"isbn\":\"9788531416453\",\"pages\":2944,\"editionRelationship\":\"unknown\"}}"
    }
  },
  {
    "id": "BIB-014",
    "slug": "enciclopedia-da-lingua-de-sinais-brasileira",
    "category": "library",
    "title": "Enciclopédia da Língua de Sinais Brasileira: O Mundo do Surdo em Libras",
    "summary": "Coleção temática de oito volumes de Fernando César Capovilla e Walkiria Duarte Raphael.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://www.researchgate.net/publication/356788292"
      }
    ],
    "claims": [],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [],
    "internalPending": [
      "Verificar individualmente os oito volumes em fontes editoriais.",
      "Mapear afirmações individualmente; revisão de pesquisa, técnica, especializada e autorização final pendentes."
    ],
    "library": {
      "unknownMetadata": [
        "creators",
        "publicationYear",
        "publisher",
        "format",
        "access",
        "languages"
      ],
      "unstructuredMetadata": "Metadados V2 não verificados: {\"collectionVolumes\":8,\"years\":[2004,2005,2018,2019]}"
    }
  },
  {
    "id": "BIB-015",
    "slug": "cartilha-de-libras-em-medicina-e-saude",
    "category": "library",
    "title": "Cartilha de Libras em Medicina e Saúde",
    "summary": "Material temático de Fernando César Capovilla e Walkiria Duarte Raphael, publicado em 2022.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://www.researchgate.net/publication/359471101"
      }
    ],
    "claims": [],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [],
    "internalPending": [
      "Localizar fonte oficial MEC e verificar acesso.",
      "Mapear afirmações individualmente; revisão de pesquisa, técnica, especializada e autorização final pendentes."
    ],
    "library": {
      "unknownMetadata": [
        "creators",
        "publicationYear",
        "publisher",
        "format",
        "access",
        "languages"
      ],
      "unstructuredMetadata": "Metadados V2 não verificados: {\"year\":2022,\"pages\":59,\"isbn\":\"9786587855073\"}"
    }
  },
  {
    "id": "BIB-016",
    "slug": "filosofias-educacionais-em-relacao-ao-surdo",
    "category": "library",
    "title": "Filosofias educacionais em relação ao surdo: do oralismo à comunicação total ao bilinguismo",
    "summary": "Artigo de Fernando César Capovilla, de 2000, para aprofundamento histórico, em diálogo com pesquisas contemporâneas e perspectivas surdas.",
    "version": "candidate-1",
    "references": [
      {
        "id": "source-1",
        "url": "https://abpee.net/pdf/artigos/art-6-6.pdf"
      },
      {
        "id": "source-2",
        "url": "https://www.academia.edu/181982680/"
      }
    ],
    "claims": [],
    "validationStatus": "draft",
    "reviews": [],
    "rights": {
      "mode": "external-link-only",
      "assets": []
    },
    "relatedEntries": [],
    "internalPending": [
      "Ler texto integral e contextualizar perspectivas históricas.",
      "Mapear afirmações individualmente; revisão de pesquisa, técnica, especializada e autorização final pendentes."
    ],
    "library": {
      "unknownMetadata": [
        "creators",
        "publicationYear",
        "publisher",
        "format",
        "access",
        "languages"
      ],
      "unstructuredMetadata": "Metadados V2 não verificados: {\"year\":2000,\"journal\":\"Revista Brasileira de Educação Especial\",\"volume\":6,\"pages\":\"99–116\"}"
    }
  }
];

export function getCulturalEntryById(
  id: string,
): CulturalCatalogEntry | undefined {
  return culturalCatalog.find((entry) => entry.id === id);
}

export function getCulturalEntryBySlug(
  category: CulturalCatalogEntry["category"],
  slug: string,
): CulturalCatalogEntry | undefined {
  return culturalCatalog.find(
    (entry) => entry.category === category && entry.slug === slug,
  );
}
