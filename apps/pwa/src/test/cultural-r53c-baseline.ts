// Frozen baseline captured from origin/dev 8b9810952782ca400e28a6ae71f5f7a03a365f96 before the R.5.3-C editorial-body migration.
// It is intentionally offline and stores only the 11 records affected by R.5.3-B.2 plus compact pre-R.5.3-C fingerprints and workflow state for all records.
// Workflow fields excluded from content fingerprints are kept outside `content` so both material content and editorial pendings remain independently verifiable.

export const culturalR53B2PostMigrationBaseline = {
  "HIST-008": {
    "version": "candidate-3",
    "fingerprint": "6756284d92284bfbef788f633fd267ad18a127d4dd01e8a6330c84a37c986b71",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Preservar condições legais e público abrangido."
      ]
    },
    "content": {
      "id": "HIST-008",
      "slug": "2021-educacao-bilingue-de-surdos",
      "category": "history",
      "title": "2021 — Educação bilíngue de surdos",
      "summary": "A Lei 14.191 inseriu a modalidade de educação bilíngue de surdos na LDB, com Libras como primeira língua e português escrito como segunda, para estudantes optantes.",
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
      "rights": {
        "mode": "external-link-only",
        "assets": []
      },
      "relatedEntries": [],
      "history": {
        "year": 2021,
        "unknownMetadata": []
      }
    }
  },
  "CUR-002": {
    "version": "candidate-3",
    "fingerprint": "890bdc6f0b63708e249289e9fc43d2c434ce80028ca9178ab69a373f9e00a65e",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Exemplos gramaticais exigem revisão."
      ]
    },
    "content": {
      "id": "CUR-002",
      "slug": "libras-e-portugues-feito-com-as-maos",
      "category": "curiosity",
      "title": "Libras é português feito com as mãos?",
      "summary": "Não. Libras possui estrutura gramatical própria.",
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
      "curiosity": {
        "question": "Libras é português feito com as mãos?",
        "shortAnswer": "Não. Libras possui estrutura gramatical própria."
      }
    }
  },
  "CUR-006": {
    "version": "candidate-3",
    "fingerprint": "0b9fa3e2137cccdd5b13b75c9e1a3b8f9fdffc0d31cf8c643996298c364be007",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Selecionar poema e autorização específica."
      ]
    },
    "content": {
      "id": "CUR-006",
      "slug": "existe-poesia-em-libras",
      "category": "curiosity",
      "title": "Existe poesia em Libras?",
      "summary": "Sim. Literatura sinalizada pode explorar movimento, espaço, ritmo e configurações de mão.",
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
      "curiosity": {
        "question": "Existe poesia em Libras?",
        "shortAnswer": "Sim. Literatura sinalizada pode explorar movimento, espaço, ritmo e configurações de mão."
      }
    }
  },
  "PER-001": {
    "version": "candidate-3",
    "fingerprint": "361520a2380b3aed48825df05724ea2711c4b2d30e334a66ddb625171b3bd67c",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Confirmar biografia, obras e autodeclaração em fontes primárias."
      ]
    },
    "content": {
      "id": "PER-001",
      "slug": "nelson-pimenta",
      "category": "personality",
      "title": "Nelson Pimenta",
      "summary": "Referência em produções e estudos de Libras e literatura sinalizada.",
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
      "rights": {
        "mode": "external-link-only",
        "assets": []
      },
      "relatedEntries": [],
      "personality": {
        "personName": "Nelson Pimenta",
        "biographicalSummary": "Referência em produções e estudos de Libras e literatura sinalizada."
      }
    }
  },
  "PER-002": {
    "version": "candidate-2",
    "fingerprint": "e1d9ba11caba38b4246f6ed9c7a79cbaff454eeb776bf873b681c1217d32e7ca",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Confirmar trajetória e datas."
      ]
    },
    "content": {
      "id": "PER-002",
      "slug": "lucinda-ferreira-brito",
      "category": "personality",
      "title": "Lucinda Ferreira Brito",
      "summary": "Pesquisadora pioneira dos estudos linguísticos das línguas de sinais no Brasil; autora de Por uma gramática de línguas de sinais.",
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
      "personality": {
        "personName": "Lucinda Ferreira Brito",
        "biographicalSummary": "Pesquisadora pioneira dos estudos linguísticos das línguas de sinais no Brasil; autora de Por uma gramática de línguas de sinais."
      }
    }
  },
  "BIB-002": {
    "version": "candidate-2",
    "fingerprint": "15a2d7a75628858d0c37897f07d2c6fda4ac5f2b203d3e7f2962ae52f8ef9409",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Conferir metadados e acesso; sem autorização de mídia."
      ]
    },
    "content": {
      "id": "BIB-002",
      "slug": "as-imagens-do-outro-sobre-a-cultura-surda",
      "category": "library",
      "title": "As imagens do outro sobre a cultura surda",
      "summary": "Cultura e representações; referência editorial.",
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
      }
    }
  },
  "BIB-003": {
    "version": "candidate-3",
    "fingerprint": "cd063c912619408e54794e6aad13121fb6a67b26fa2f925551e0de660972e6cc",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Conferir metadados e acesso; sem autorização de mídia."
      ]
    },
    "content": {
      "id": "BIB-003",
      "slug": "gramatica-da-libras-volume-1",
      "category": "library",
      "title": "Gramática da Libras — Volume 1",
      "summary": "Linguística; PDF institucional.",
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
      }
    }
  },
  "BIB-004": {
    "version": "candidate-3",
    "fingerprint": "2038e113ba6b37f195923e09da7b3033cbb9ac731a658cbeb3e0af32e43bb75f",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Conferir metadados e acesso; sem autorização de mídia."
      ]
    },
    "content": {
      "id": "BIB-004",
      "slug": "literatura-em-libras",
      "category": "library",
      "title": "Literatura em Libras",
      "summary": "Literatura sinalizada; versões em português e Libras a conferir.",
      "references": [
        {
          "id": "source-1",
          "url": "https://repositorio.ufsc.br/xmlui/handle/123456789/259641"
        },
        {
          "id": "source-2",
          "url": "https://librando.paginas.ufsc.br/livros-2/"
        },
        {
          "id": "source-3",
          "url": "https://repositorio.ufsc.br/xmlui/bitstream/handle/123456789/259641/Literatura_em_Libras_Rachel_Sutton_Spence.pdf?sequence=1&isAllowed=y",
          "institution": "UFSC — Repositório Institucional",
          "purpose": "Ficha catalográfica e ficha técnica",
          "consultedAt": "2026-11-27"
        }
      ],
      "claims": [
        {
          "id": "claim-1",
          "text": "Literatura sinalizada; versões em português e Libras a conferir.",
          "referenceIds": [
            "source-1"
          ]
        },
        {
          "id": "BIB-004-C01",
          "text": "Autoria, tradução e edição de 2021.",
          "referenceIds": [
            "source-1"
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
          "text": "Literatura em Libras é uma obra de Rachel Sutton-Spence, com tradução de Gustavo Gusmão.",
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
      "library": {
        "unknownMetadata": [
          "creators",
          "publicationYear",
          "publisher",
          "format",
          "access",
          "languages"
        ],
        "unstructuredMetadata": "Rachel Sutton-Spence · 2021 · Arara Azul"
      }
    }
  },
  "BIB-005": {
    "version": "candidate-3",
    "fingerprint": "c23a0a9006dcd65d66b88537228a2e073111af56d7bfca1a832e7a597d9c6c71",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Conferir metadados e acesso; sem autorização de mídia."
      ]
    },
    "content": {
      "id": "BIB-005",
      "slug": "cinderela-surda",
      "category": "library",
      "title": "Cinderela Surda",
      "summary": "Literatura infantil; releitura cultural.",
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
      }
    }
  },
  "BIB-010": {
    "version": "candidate-3",
    "fingerprint": "9f00ee86d99578e7758335ca8a1299946369a29840eae9a573cd3afd43551f93",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Conferir metadados e acesso; sem autorização de mídia."
      ]
    },
    "content": {
      "id": "BIB-010",
      "slug": "iconographia-dos-signaes-dos-surdos-mudos",
      "category": "library",
      "title": "Iconographia dos Signaes dos Surdos-Mudos",
      "summary": "Patrimônio histórico; título original de época, não terminologia atual.",
      "references": [
        {
          "id": "source-1",
          "url": "https://seer.ines.gov.br/index.php/serie-historica/issue/view/167"
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
      "library": {
        "unknownMetadata": [
          "creators",
          "publicationYear",
          "publisher",
          "format",
          "access",
          "languages"
        ],
        "unstructuredMetadata": "Flausino José da Gama · 1875"
      }
    }
  },
  "BIB-011": {
    "version": "candidate-3",
    "fingerprint": "0fe24be59e70bc4c95fcd7c4cff65076b8f78cf6b14a2092bde9d3438a44b96b",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Conferir metadados e acesso; sem autorização de mídia."
      ]
    },
    "content": {
      "id": "BIB-011",
      "slug": "contacao-de-historias",
      "category": "library",
      "title": "Contação de Histórias",
      "summary": "Série audiovisual de literatura infantil e juvenil.",
      "references": [
        {
          "id": "source-1",
          "url": "https://debasi.ines.gov.br/tv-ines/conta%C3%A7%C3%A3o-de-hist%C3%B3rias"
        },
        {
          "id": "source-2",
          "url": "https://debasi.ines.gov.br/tv-ines",
          "institution": "INES — TV INES / DEBASI",
          "purpose": "Categoria Infantil",
          "consultedAt": "2026-11-27"
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
      "library": {
        "unknownMetadata": [
          "creators",
          "publicationYear",
          "publisher",
          "format",
          "access",
          "languages"
        ],
        "unstructuredMetadata": "TV INES"
      }
    }
  }
} as const;

export const culturalPreR53CFingerprintBaseline = {
  "HIST-001": {
    "version": "candidate-3",
    "fingerprint": "7cc13fbb7fa0a15b092e0e80782b686c91273581fc18174ff72cc5594451d98b",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Conferir cronologia 1855–1857 e Lei 939."
      ]
    }
  },
  "HIST-002": {
    "version": "candidate-1",
    "fingerprint": "7c4e5f8c324469b690451334cfbef81fb73435e13bf3f6b6b91e63a7414ae24d",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Conferir estudo comparativo integral e direitos do fac-símile."
      ]
    }
  },
  "HIST-003": {
    "version": "candidate-1",
    "fingerprint": "2f50ebb36e32b9796aa1fcef0171e89fc32c1db60ff7912d4c46f18331c32110",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Verificar texto integral e efeitos específicos no Brasil."
      ]
    }
  },
  "HIST-004": {
    "version": "candidate-1",
    "fingerprint": "5f7daeef680a255b13b0f73b6b2d48f7fde6324be2cd07b586ac6c715d40ce35",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Não apresentar como início do movimento surdo."
      ]
    }
  },
  "HIST-005": {
    "version": "candidate-1",
    "fingerprint": "c71586ecc0c2d52d357e33d52533eb04aab9c1b9ff68cd0f76d56fdcb71cf10d",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Localizar original institucional; não reproduzir trechos."
      ]
    }
  },
  "HIST-006": {
    "version": "candidate-3",
    "fingerprint": "caddc7d4e35b1f164e41081775f6fdad6387993db49bda556a6f4ee60d8979ae",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Não chamar de segunda língua oficial do Brasil."
      ]
    }
  },
  "HIST-007": {
    "version": "candidate-1",
    "fingerprint": "892b13daa873efc2177e0ca3df9a8a921295982bac960f82f482d97e7867bf4c",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Distinguir texto original de legislação consolidada."
      ]
    }
  },
  "HIST-008": {
    "version": "candidate-3",
    "fingerprint": "6756284d92284bfbef788f633fd267ad18a127d4dd01e8a6330c84a37c986b71",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Preservar condições legais e público abrangido."
      ]
    }
  },
  "CUR-001": {
    "version": "candidate-3",
    "fingerprint": "b4da839e9fd3a3f9a2480fb21680873e1dd29118521fc960088d36f21fc2bab2",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Não usar contagem mundial sem fonte."
      ]
    }
  },
  "CUR-002": {
    "version": "candidate-3",
    "fingerprint": "890bdc6f0b63708e249289e9fc43d2c434ce80028ca9178ab69a373f9e00a65e",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Exemplos gramaticais exigem revisão."
      ]
    }
  },
  "CUR-003": {
    "version": "candidate-1",
    "fingerprint": "fdc7a588c4dd70e07e0bde76792e3cb5311ea4924aa024c2c4f6cd087bc4b1b8",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Não reduzir expressões a emoções; laboratório de mãos não avalia língua completa."
      ]
    }
  },
  "CUR-004": {
    "version": "candidate-1",
    "fingerprint": "839cbbc776c046b997e0205a191f4036051ffdf923dcaf4f2099d152adc3e4a7",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Artigo não extraído; confirmar antes de publicar exemplos."
      ]
    }
  },
  "CUR-005": {
    "version": "candidate-1",
    "fingerprint": "48a2c23f319b40f37868a374349fa3774e173bb4f6b93373bb83eb90c2223c02",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Não generalizar para toda população surda ou para 2026."
      ]
    }
  },
  "CUR-006": {
    "version": "candidate-3",
    "fingerprint": "0b9fa3e2137cccdd5b13b75c9e1a3b8f9fdffc0d31cf8c643996298c364be007",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Selecionar poema e autorização específica."
      ]
    }
  },
  "CUR-007": {
    "version": "candidate-1",
    "fingerprint": "3e10d2d0b7b3789a16dfdda739733b91efe8fbe7e1b0006e35a57ed278ef6a0d",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Não apresentar como obrigatório ou universal."
      ]
    }
  },
  "CUR-008": {
    "version": "candidate-1",
    "fingerprint": "9610e41c2643d0e72d87e29424f78f926a7f693f46da27f30d8c3a582df3ddd2",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Evitar homogeneização e revisar com pessoas surdas."
      ]
    }
  },
  "PER-001": {
    "version": "candidate-3",
    "fingerprint": "361520a2380b3aed48825df05724ea2711c4b2d30e334a66ddb625171b3bd67c",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Confirmar biografia, obras e autodeclaração em fontes primárias."
      ]
    }
  },
  "PER-002": {
    "version": "candidate-2",
    "fingerprint": "e1d9ba11caba38b4246f6ed9c7a79cbaff454eeb776bf873b681c1217d32e7ca",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Confirmar trajetória e datas."
      ]
    }
  },
  "PER-003": {
    "version": "candidate-1",
    "fingerprint": "e92e2d81e837a40104073bc1f4f369574da91d4e4381041b579bfce3ea64cb96",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Não inferir cargos atuais de apresentação histórica."
      ]
    }
  },
  "PER-004": {
    "version": "candidate-1",
    "fingerprint": "269047f92cfaf3f1402e953634ccddf27c60d3cd87dcf3531189cb7cd738250a",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Confirmar biografia e edição das obras."
      ]
    }
  },
  "PER-005": {
    "version": "candidate-1",
    "fingerprint": "6a6c552081f07fcdd1a9671c8ce91bab8a9a785319d2c8f0aa54eaeb43f57575",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Fonte específica da biografia ainda necessária; confirmar grafia e obras."
      ]
    }
  },
  "PER-006": {
    "version": "candidate-1",
    "fingerprint": "90125fd9189e043c041bce4efd2dbc92bbb525f22ba2f550c400feaa30c1a871",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Confirmar trajetória e cargos em fonte institucional."
      ]
    }
  },
  "PER-007": {
    "version": "candidate-1",
    "fingerprint": "f65a4685635fb95945ff494834fd4a4708601e45dd86daa96b047140de1988d2",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Contextualizar matriz francesa; não inventar retrato."
      ]
    }
  },
  "BIB-001": {
    "version": "candidate-1",
    "fingerprint": "479b134f867a4f72cd285ca2275fa94ca472806b3a6d847f4f92c3721de23747",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Conferir metadados e acesso; sem autorização de mídia."
      ]
    }
  },
  "BIB-002": {
    "version": "candidate-2",
    "fingerprint": "15a2d7a75628858d0c37897f07d2c6fda4ac5f2b203d3e7f2962ae52f8ef9409",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Conferir metadados e acesso; sem autorização de mídia."
      ]
    }
  },
  "BIB-003": {
    "version": "candidate-3",
    "fingerprint": "cd063c912619408e54794e6aad13121fb6a67b26fa2f925551e0de660972e6cc",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Conferir metadados e acesso; sem autorização de mídia."
      ]
    }
  },
  "BIB-004": {
    "version": "candidate-3",
    "fingerprint": "2038e113ba6b37f195923e09da7b3033cbb9ac731a658cbeb3e0af32e43bb75f",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Conferir metadados e acesso; sem autorização de mídia."
      ]
    }
  },
  "BIB-005": {
    "version": "candidate-3",
    "fingerprint": "c23a0a9006dcd65d66b88537228a2e073111af56d7bfca1a832e7a597d9c6c71",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Conferir metadados e acesso; sem autorização de mídia."
      ]
    }
  },
  "BIB-006": {
    "version": "candidate-1",
    "fingerprint": "dac40aa17bedd646e552be39f0448f048f01ada021b3df73df9d2b15cb59a091",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Conferir metadados e acesso; sem autorização de mídia."
      ]
    }
  },
  "BIB-007": {
    "version": "candidate-1",
    "fingerprint": "c5ee237dc027296b0b932a3f106bd4cee1bd2774e67b3608b57db7747a4d998c",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Conferir metadados e acesso; sem autorização de mídia."
      ]
    }
  },
  "BIB-008": {
    "version": "candidate-1",
    "fingerprint": "0d1b9493458a83f2e5614a91752603a125c6ce3be17b1cd919663bceae5b3c50",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Conferir metadados e acesso; sem autorização de mídia."
      ]
    }
  },
  "BIB-009": {
    "version": "candidate-1",
    "fingerprint": "c8c4cb85d45a422fff60cf12aaaa9fbd51b084f7f77e49d70dbb5b068fd82ea6",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Conferir metadados e acesso; sem autorização de mídia."
      ]
    }
  },
  "BIB-010": {
    "version": "candidate-3",
    "fingerprint": "9f00ee86d99578e7758335ca8a1299946369a29840eae9a573cd3afd43551f93",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Conferir metadados e acesso; sem autorização de mídia."
      ]
    }
  },
  "BIB-011": {
    "version": "candidate-3",
    "fingerprint": "0fe24be59e70bc4c95fcd7c4cff65076b8f78cf6b14a2092bde9d3438a44b96b",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Conferir metadados e acesso; sem autorização de mídia."
      ]
    }
  },
  "BIB-012": {
    "version": "candidate-1",
    "fingerprint": "e96771fafa1149fc4bf3cbcf13fd7f6224f51923bb02e68361cfcb9618bf00a4",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Conferir metadados e acesso; sem autorização de mídia."
      ]
    }
  },
  "PER-008": {
    "version": "candidate-1",
    "fingerprint": "4fd5052cdde1e0c7b6de33c0ccad574d7ce1cc5ef85ceed1035f1d1553b2a791",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Confirmar biografia institucional e contribuições individuais.",
        "Mapear afirmações individualmente; revisão de pesquisa, técnica, especializada e autorização final pendentes."
      ]
    }
  },
  "PER-009": {
    "version": "candidate-1",
    "fingerprint": "c8fb938492cc9014637c7e9267a8efb88309a0fa68cc0909ea09d38d12bac576",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Confirmar biografia institucional, tese integral e direitos dos poemas.",
        "Mapear afirmações individualmente; revisão de pesquisa, técnica, especializada e autorização final pendentes.",
        "Validar integralmente a correspondência entre o PDF HTTP documentado e o registro institucional HTTPS antes de uso factual adicional."
      ]
    }
  },
  "BIB-013": {
    "version": "candidate-1",
    "fingerprint": "40dfab81837f131c73bc636c739f3cd5cbdd27da072b50a8d92e30dba158d9bb",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Distinguir publicação de 2017 e oferta de 2026; edição/reimpressão não confirmada.",
        "Mapear afirmações individualmente; revisão de pesquisa, técnica, especializada e autorização final pendentes."
      ]
    }
  },
  "BIB-014": {
    "version": "candidate-1",
    "fingerprint": "dbc2e6e2d699be264dd0495734410afb9e9e54882403198fbdc811776a337636",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Verificar individualmente os oito volumes em fontes editoriais.",
        "Mapear afirmações individualmente; revisão de pesquisa, técnica, especializada e autorização final pendentes."
      ]
    }
  },
  "BIB-015": {
    "version": "candidate-1",
    "fingerprint": "2ac918fcde43f72f71011f97990de9be78e2aa15e15e4efda53480d0cc3d6301",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Localizar fonte oficial MEC e verificar acesso.",
        "Mapear afirmações individualmente; revisão de pesquisa, técnica, especializada e autorização final pendentes."
      ]
    }
  },
  "BIB-016": {
    "version": "candidate-1",
    "fingerprint": "f4209a7406c4a829dcbcc90b9d9ff6799ad66ab17a6fe3b63dbc4600584b2f49",
    "workflow": {
      "validationStatus": "draft",
      "reviews": [],
      "internalPending": [
        "Ler texto integral e contextualizar perspectivas históricas.",
        "Mapear afirmações individualmente; revisão de pesquisa, técnica, especializada e autorização final pendentes."
      ]
    }
  }
} as const;
