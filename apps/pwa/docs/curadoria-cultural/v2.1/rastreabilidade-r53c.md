# Rastreabilidade da migração R.5.3-C

Documento derivado; os pacotes originais V2/V2.1 e as rastreabilidades históricas permanecem imutáveis. Escopo exclusivo: migração draft verbatim dos 11 corpos editoriais restantes. Nada neste documento constitui revisão especializada, validação factual nova, autorização de publicação ou associação de artwork real.

- Base Git: `8b9810952782ca400e28a6ae71f5f7a03a365f96` (merge do PR #86).
- Registros alterados: 11 (`HIST-008`, `CUR-002`, `CUR-006`, `PER-001`, `PER-002`, `BIB-002`, `BIB-003`, `BIB-004`, `BIB-005`, `BIB-010`, `BIB-011`).
- Registros preservados: 30.
- Novas associações corpo→claims: 47.
- Novos claims: 0; novas referências: 0; artworks reais: 0.
- Estado editorial: todos permanecem `draft`, sem reviews e sem autorização final.

As versões anteriores/posteriores e fingerprints usam o mecanismo runtime real. Campos de workflow não participam do fingerprint. O campo `artwork` participa quando presente; nesta transição todos os registros reais permanecem sem artwork.

## HIST-008

- Origem documental: `v2/pacote-original/acervo-editorial.json` (corpo literal V2, confirmado no acervo complementar).
- Classificação da auditoria R.5.3-C.1: A.
- SHA-256 UTF-8 do corpo: `d08ac1b4dc73c2abc5d5d88e2002050b37c8e8629ac50461565e62217ac9b70b`.
- Corpo exato:

> A Lei nº 14.191, de 3 de agosto de 2021, incluiu a educação bilíngue de surdos na LDB. A modalidade prevê Libras como primeira língua e português escrito como segunda para os educandos abrangidos que optem por ela. A lei também prevê materiais didáticos e professores bilíngues.

- Associação frase → claims: F1→C04+C01; F2→C02; F3→C03.
- `editorialBody.claimIds`: `HIST-008-C01`, `HIST-008-C02`, `HIST-008-C03`, `HIST-008-C04`.
- Referências correspondentes: `source-1` https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14191.htm.
- Ressalvas preservadas: nenhuma ressalva adicional; pendências editoriais permanecem.
- Versão: `candidate-3` → `candidate-4`.
- Fingerprint: `6756284d92284bfbef788f633fd267ad18a127d4dd01e8a6330c84a37c986b71` → `dc5aba56bf7f5200748a9c45b8a13fa855e897a932b31d36797443e14d8e3728`.

## CUR-002

- Origem documental: `v2/pacote-original/acervo-editorial.json` (corpo literal V2, confirmado no acervo complementar).
- Classificação da auditoria R.5.3-C.1: B.
- SHA-256 UTF-8 do corpo: `5b487bd69b4de0e1eca982589fa25a7b4dc4d9add7955e2b28fa60a6d1b16763`.
- Corpo exato:

> Libras não é português representado pelas mãos. Possui estrutura gramatical própria. Configurações de mão, localização, movimento e elementos não manuais participam da sinalização. Aprender o alfabeto manual não equivale a dominar a língua.

- Associação frase → claims: F1→síntese de C01/C04; F2→C01+C04; F3→C05 com apoio C02/C03; F4→síntese de C06.
- `editorialBody.claimIds`: `CUR-002-C01`, `CUR-002-C02`, `CUR-002-C03`, `CUR-002-C04`, `CUR-002-C05`, `CUR-002-C06`.
- Referências correspondentes: `source-1` https://www.planalto.gov.br/ccivil_03/leis/2002/l10436.htm; `source-2` https://ojsrevista.furb.br/ojs/index.php/linguagens/article/download/7287/4653/32619; `source-3` https://doi.org/10.51207/2179-4057.20220014; `source-4` https://letraslibras.paginas.ufsc.br/files/2022/12/LSB7106-Libras-Iniciante.pdf.
- Ressalvas preservadas: F1/F4 são sínteses pedagógicas; decisão aprovada sobre datilologia preservada.
- Versão: `candidate-3` → `candidate-4`.
- Fingerprint: `890bdc6f0b63708e249289e9fc43d2c434ce80028ca9178ab69a373f9e00a65e` → `df8ef3310fbb9657fc4a961f042779cc6fbde03015da0c21b634fe6f8f8f5015`.

## CUR-006

- Origem documental: `v2/pacote-original/acervo-editorial.json` (corpo literal V2, confirmado no acervo complementar).
- Classificação da auditoria R.5.3-C.1: B.
- SHA-256 UTF-8 do corpo: `a25ebefcf1456799b586b9fc9774d8c2ae37fb7697dcd25661241faa3cb4f156`.
- Corpo exato:

> A poesia em Libras explora recursos visuais e linguísticos, como ritmo, repetição e simetria. A produção poética sinalizada permite expressar experiências e criar narrativas artísticas. O acervo LIBRANDO reúne exemplos de poemas.

- Associação frase → claims: F1→C01 com síntese apoiada por C04; F2→C03+C04; F3→C02.
- `editorialBody.claimIds`: `CUR-006-C01`, `CUR-006-C02`, `CUR-006-C03`, `CUR-006-C04`.
- Referências correspondentes: `source-3` https://librando.paginas.ufsc.br/poemas/; `source-1` https://petletras.paginas.ufsc.br/2023/09/08/literatura-surda-os-conceitos-de-karnopp-mourao-e-sutton-spence/; `source-4` https://www.revistaglauks.ufv.br/Glauks/article/view/377.
- Ressalvas preservadas: C03 é fonte secundária; C04 limita-se ao resumo acadêmico, sem leitura integral.
- Versão: `candidate-3` → `candidate-4`.
- Fingerprint: `0b9fa3e2137cccdd5b13b75c9e1a3b8f9fdffc0d31cf8c643996298c364be007` → `ecf9e1b9cb3c9a2990d09ef59c0d342fa05e9c61c3b06af38ab72060fa4397eb`.

## PER-001

- Origem documental: `v2/pacote-original/acervo-editorial.json` (corpo literal V2, confirmado no acervo complementar).
- Classificação da auditoria R.5.3-C.1: B.
- SHA-256 UTF-8 do corpo: `664a5ac1c2716139ab6fc62f58b09c9be0f148990ab051c44cfabb544961a9ce`.
- Corpo exato:

> Nelson Pimenta de Castro é uma liderança surda com atuação na arte, educação e pesquisa. Sua trajetória inclui teatro, cinema e estudos da tradução. Entre seus trabalhos acadêmicos estão uma dissertação sobre tradução de fábulas e uma tese sobre prosódia em ASL e Libras.

- Associação frase → claims: F1→C05+C06+C01; F2→C06+C01+C02+C07; F3→C04+C03.
- `editorialBody.claimIds`: `PER-001-C01`, `PER-001-C02`, `PER-001-C03`, `PER-001-C04`, `PER-001-C05`, `PER-001-C06`, `PER-001-C07`.
- Referências correspondentes: `source-2` https://indl.iphan.gov.br/pessoas-de-referencia/nelson-pimenta-de-castro/; `source-3` https://nuestra.ufsc.br/vocab/index.php?tema=42&/nelson-pimenta-de-castro; `source-4` https://repositorio.ufsc.br/handle/123456789/204538; `source-5` https://repositorio.ufsc.br/handle/123456789/100721.
- Ressalvas preservadas: usa C01–C07 sem claim-1; C04 é referência institucional alternativa HTTPS, sem equivalência binária presumida.
- Versão: `candidate-3` → `candidate-4`.
- Fingerprint: `361520a2380b3aed48825df05724ea2711c4b2d30e334a66ddb625171b3bd67c` → `2dbcee07accd0ceaa60b9b58679b46eb764fbd9ea1659dd6aa05a96dfa0f9e33`.

## PER-002

- Origem documental: `v2/pacote-original/acervo-editorial.json` (corpo literal V2, confirmado no acervo complementar).
- Classificação da auditoria R.5.3-C.1: B.
- SHA-256 UTF-8 do corpo: `cb4e17eb84080902eae274641502e86d96be0e0c5f095d03d852393d21a73a60`.
- Corpo exato:

> Lucinda Ferreira Brito é uma referência nos estudos linguísticos das línguas de sinais no Brasil. Sua obra Por uma gramática de línguas de sinais, originalmente publicada em 1995, integra a bibliografia sobre a descrição linguística da Libras.

- Associação frase → claims: F1→síntese de C03; F2→C01+C02+C04+C03.
- `editorialBody.claimIds`: `PER-002-C01`, `PER-002-C02`, `PER-002-C03`, `PER-002-C04`.
- Referências correspondentes: `source-1` https://seer.ufu.br/index.php/EducacaoFilosofia/article/view/29990; `source-2` https://www.gov.br/fundaj/pt-br/composicao/dimeca/biblioteca/acervos/inventarios-documentais-e-indices/libras_25_4_2012.pdf.
- Ressalvas preservadas: divergência singular/plural do título bibliográfico e folha de rosto não conferida permanecem.
- Versão: `candidate-2` → `candidate-3`.
- Fingerprint: `e1d9ba11caba38b4246f6ed9c7a79cbaff454eeb776bf873b681c1217d32e7ca` → `e9711e2cc680e33202e8c3c9b13ab81c15794448c71321f38c9180960e49f7a7`.

## BIB-002

- Origem documental: `v2/pacote-original/acervo-editorial.json` (corpo literal V2, confirmado no acervo complementar).
- Classificação da auditoria R.5.3-C.1: B.
- SHA-256 UTF-8 do corpo: `f8ddb0bce9699cddc8d6a1c37a02292229899be20a11286d31955ea639a73507`.
- Corpo exato:

> Obra de Karin Lilian Strobel voltada às representações da cultura surda. A quarta edição foi lançada pela Editora UFSC em 2016. É uma leitura candidata para conhecer perspectivas culturais e identitárias.

- Associação frase → claims: F1→C02; F2→C01; F3→recomendação editorial apoiada por C02.
- `editorialBody.claimIds`: `BIB-002-C01`, `BIB-002-C02`.
- Referências correspondentes: `source-1` https://editora.ufsc.br/2016/10/10/lancamento-as-imagens-do-outro-sobre-a-cultura-surda/.
- Ressalvas preservadas: recomendação editorial/juízo de candidatura, não afirmação factual nova.
- Versão: `candidate-2` → `candidate-3`.
- Fingerprint: `15a2d7a75628858d0c37897f07d2c6fda4ac5f2b203d3e7f2962ae52f8ef9409` → `6bd8de7d947d160f13ceb1a4c0f14375b231bf8259ae675307c3f437e7adef32`.

## BIB-003

- Origem documental: `v2/pacote-original/acervo-editorial.json` (corpo literal V2, confirmado no acervo complementar).
- Classificação da auditoria R.5.3-C.1: B.
- SHA-256 UTF-8 do corpo: `cb279973dba1dec0d5f86913d9aef9014347cf4079cddba5193a7201861d8f26`.
- Corpo exato:

> Gramática da Libras — Volume 1 reúne estudos linguísticos em uma publicação do INES de 2023. O registro institucional identifica quatro organizadores e uma equipe ampla de autores. O PDF está disponível no repositório da UFSC.

- Associação frase → claims: F1→C01+C03; F2→C02+C04; F3→C05.
- `editorialBody.claimIds`: `BIB-003-C01`, `BIB-003-C02`, `BIB-003-C03`, `BIB-003-C04`, `BIB-003-C05`.
- Referências correspondentes: `source-1` https://repositorio.ufsc.br/handle/123456789/262318; `source-2` https://www.researchgate.net/publication/385893948_A_Fonetica_e_a_Fonologia_das_Linguas_de_Sinais.
- Ressalvas preservadas: consulta parcial à apresentação e sumário; não leitura integral; direitos de mídia independentes.
- Versão: `candidate-3` → `candidate-4`.
- Fingerprint: `cd063c912619408e54794e6aad13121fb6a67b26fa2f925551e0de660972e6cc` → `a343dd0508688b16b3e7836474a571e6e581a3ae52447868a52a3410f7eccae0`.

## BIB-004

- Origem documental: `v2/pacote-original/acervo-editorial.json` (corpo literal V2, confirmado no acervo complementar).
- Classificação da auditoria R.5.3-C.1: B.
- SHA-256 UTF-8 do corpo: `f58bf2f1fc03f09464da4ebe06b8bb6da6b2ebbe640c88d8813b875baba895fb`.
- Corpo exato:

> Literatura em Libras, de Rachel Sutton-Spence, com tradução de Gustavo Gusmão, apresenta estudos sobre literatura sinalizada. A primeira edição é de 2021, pela Arara Azul. O LIBRANDO indica modalidades textuais e audiovisuais.

- Associação frase → claims: F1→C03+C05; F2→C04 com apoio C01; F3→C02.
- `editorialBody.claimIds`: `BIB-004-C01`, `BIB-004-C02`, `BIB-004-C03`, `BIB-004-C04`, `BIB-004-C05`.
- Referências correspondentes: `source-1` https://repositorio.ufsc.br/xmlui/handle/123456789/259641; `source-2` https://librando.paginas.ufsc.br/livros-2/; `source-3` https://repositorio.ufsc.br/xmlui/bitstream/handle/123456789/259641/Literatura_em_Libras_Rachel_Sutton_Spence.pdf?sequence=1&isAllowed=y.
- Ressalvas preservadas: consulta de C05 limitada às primeiras oito páginas do PDF.
- Versão: `candidate-3` → `candidate-4`.
- Fingerprint: `2038e113ba6b37f195923e09da7b3033cbb9ac731a658cbeb3e0af32e43bb75f` → `3c88d98ae40ae4813bbb7a6b13e2cf5e5a782e231b43fe63269c15729ead7744`.

## BIB-005

- Origem documental: `v2/pacote-original/acervo-editorial.json` (corpo literal V2, confirmado no acervo complementar).
- Classificação da auditoria R.5.3-C.1: A.
- SHA-256 UTF-8 do corpo: `89c2bb9753c258a7a51b1040491918f519e4a7a7837ab1a69b5da64126013cad`.
- Corpo exato:

> Cinderela Surda é uma releitura literária infantil que integra o acervo de obras com escrita de sinais do LIBRANDO. A edição localizada é a terceira, de 2011, publicada pela ULBRA.

- Associação frase → claims: F1→C02+C03; F2→C04 com apoio C01.
- `editorialBody.claimIds`: `BIB-005-C01`, `BIB-005-C02`, `BIB-005-C03`, `BIB-005-C04`.
- Referências correspondentes: `source-1` https://librando.paginas.ufsc.br/signwrite/.
- Ressalvas preservadas: nenhuma ressalva adicional; direitos de mídia independentes.
- Versão: `candidate-3` → `candidate-4`.
- Fingerprint: `c23a0a9006dcd65d66b88537228a2e073111af56d7bfca1a832e7a597d9c6c71` → `4f64ff88acfcca91788a6241d1a933aa33cfea18ff276afd6df6671e0ef5b8ce`.

## BIB-010

- Origem documental: `v2/pacote-original/acervo-editorial.json` (corpo literal V2, confirmado no acervo complementar).
- Classificação da auditoria R.5.3-C.1: B.
- SHA-256 UTF-8 do corpo: `d88294389baca400df145fcde4d5e45985919df53a5a9ac46b8d559217f3f47a`.
- Corpo exato:

> A Iconographia dos Signaes dos Surdos-Mudos, de 1875, é um documento histórico associado a Flausino José da Gama. Estudos comparativos apontam sua matriz na obra francesa de Pierre Pélissier. O título original é preservado como registro de época, não como terminologia contemporânea.

- Associação frase → claims: F1→C01; F2→C02; F3→enquadramento editorial documentado.
- `editorialBody.claimIds`: `BIB-010-C01`, `BIB-010-C02`.
- Referências correspondentes: `source-1` https://seer.ines.gov.br/index.php/serie-historica/issue/view/167; `source-2` https://www.scielo.br/j/rbee/a/S5Gyt4gMNzzQJJmLYqMcqCC/abstract/?lang=pt.
- Ressalvas preservadas: título histórico preservado como registro de época, não terminologia contemporânea.
- Versão: `candidate-3` → `candidate-4`.
- Fingerprint: `9f00ee86d99578e7758335ca8a1299946369a29840eae9a573cd3afd43551f93` → `ad7a8470656e1bb992dedf1ef021823c8e9b301bd5c138c1bb780d0e9e9ac151`.

## BIB-011

- Origem documental: `v2.1/pacote-original/acervo-complementar.json` (corpo revisado autorizado).
- Classificação da auditoria R.5.3-C.1: A.
- SHA-256 UTF-8 do corpo: `5dd9f7abca37cf371906267123adf8aeadc5cfb60f52f75440a36b68277f3b61`.
- Corpo exato:

> Contação de Histórias é uma série da TV INES que apresenta animações de obras de autores e ilustradores nacionais traduzidas para Libras. A iniciativa busca tornar a literatura infantil e juvenil acessível à comunidade surda de todas as idades.

- Associação frase → claims: F1→C02+C01+C03; F2→C04.
- `editorialBody.claimIds`: `BIB-011-C01`, `BIB-011-C02`, `BIB-011-C03`, `BIB-011-C04`.
- Referências correspondentes: `source-1` https://debasi.ines.gov.br/tv-ines/conta%C3%A7%C3%A3o-de-hist%C3%B3rias; `source-2` https://debasi.ines.gov.br/tv-ines.
- Ressalvas preservadas: texto revisado V2.1; atribuição institucional INES — TV INES / DEBASI.
- Versão: `candidate-3` → `candidate-4`.
- Fingerprint: `0fe24be59e70bc4c95fcd7c4cff65076b8f78cf6b14a2092bde9d3438a44b96b` → `0dc124ea99d68531ff7a82a3cf88c176b1f865efcfbaaf5074a8ee5ff500fce0`.

## Tabela estrutural de verificação

| Registro | Classe | Quantidade de claims | SHA-256 do corpo | Versão/fingerprint antes → depois | Ressalva resumida |
|---|---|---:|---|---|---|
| `HIST-008` | A | 4 | `d08ac1b4dc73c2abc5d5d88e2002050b37c8e8629ac50461565e62217ac9b70b` | `candidate-3`/`6756284d92284bfbef788f633fd267ad18a127d4dd01e8a6330c84a37c986b71` → `candidate-4`/`dc5aba56bf7f5200748a9c45b8a13fa855e897a932b31d36797443e14d8e3728` | nenhuma ressalva adicional; pendências editoriais permanecem |
| `CUR-002` | B | 6 | `5b487bd69b4de0e1eca982589fa25a7b4dc4d9add7955e2b28fa60a6d1b16763` | `candidate-3`/`890bdc6f0b63708e249289e9fc43d2c434ce80028ca9178ab69a373f9e00a65e` → `candidate-4`/`df8ef3310fbb9657fc4a961f042779cc6fbde03015da0c21b634fe6f8f8f5015` | F1/F4 são sínteses pedagógicas; decisão aprovada sobre datilologia preservada |
| `CUR-006` | B | 4 | `a25ebefcf1456799b586b9fc9774d8c2ae37fb7697dcd25661241faa3cb4f156` | `candidate-3`/`0b9fa3e2137cccdd5b13b75c9e1a3b8f9fdffc0d31cf8c643996298c364be007` → `candidate-4`/`ecf9e1b9cb3c9a2990d09ef59c0d342fa05e9c61c3b06af38ab72060fa4397eb` | C03 é fonte secundária; C04 limita-se ao resumo acadêmico, sem leitura integral |
| `PER-001` | B | 7 | `664a5ac1c2716139ab6fc62f58b09c9be0f148990ab051c44cfabb544961a9ce` | `candidate-3`/`361520a2380b3aed48825df05724ea2711c4b2d30e334a66ddb625171b3bd67c` → `candidate-4`/`2dbcee07accd0ceaa60b9b58679b46eb764fbd9ea1659dd6aa05a96dfa0f9e33` | usa C01–C07 sem claim-1; C04 é referência institucional alternativa HTTPS, sem equivalência binária presumida |
| `PER-002` | B | 4 | `cb4e17eb84080902eae274641502e86d96be0e0c5f095d03d852393d21a73a60` | `candidate-2`/`e1d9ba11caba38b4246f6ed9c7a79cbaff454eeb776bf873b681c1217d32e7ca` → `candidate-3`/`e9711e2cc680e33202e8c3c9b13ab81c15794448c71321f38c9180960e49f7a7` | divergência singular/plural do título bibliográfico e folha de rosto não conferida permanecem |
| `BIB-002` | B | 2 | `f8ddb0bce9699cddc8d6a1c37a02292229899be20a11286d31955ea639a73507` | `candidate-2`/`15a2d7a75628858d0c37897f07d2c6fda4ac5f2b203d3e7f2962ae52f8ef9409` → `candidate-3`/`6bd8de7d947d160f13ceb1a4c0f14375b231bf8259ae675307c3f437e7adef32` | recomendação editorial/juízo de candidatura, não afirmação factual nova |
| `BIB-003` | B | 5 | `cb279973dba1dec0d5f86913d9aef9014347cf4079cddba5193a7201861d8f26` | `candidate-3`/`cd063c912619408e54794e6aad13121fb6a67b26fa2f925551e0de660972e6cc` → `candidate-4`/`a343dd0508688b16b3e7836474a571e6e581a3ae52447868a52a3410f7eccae0` | consulta parcial à apresentação e sumário; não leitura integral; direitos de mídia independentes |
| `BIB-004` | B | 5 | `f58bf2f1fc03f09464da4ebe06b8bb6da6b2ebbe640c88d8813b875baba895fb` | `candidate-3`/`2038e113ba6b37f195923e09da7b3033cbb9ac731a658cbeb3e0af32e43bb75f` → `candidate-4`/`3c88d98ae40ae4813bbb7a6b13e2cf5e5a782e231b43fe63269c15729ead7744` | consulta de C05 limitada às primeiras oito páginas do PDF |
| `BIB-005` | A | 4 | `89c2bb9753c258a7a51b1040491918f519e4a7a7837ab1a69b5da64126013cad` | `candidate-3`/`c23a0a9006dcd65d66b88537228a2e073111af56d7bfca1a832e7a597d9c6c71` → `candidate-4`/`4f64ff88acfcca91788a6241d1a933aa33cfea18ff276afd6df6671e0ef5b8ce` | nenhuma ressalva adicional; direitos de mídia independentes |
| `BIB-010` | B | 2 | `d88294389baca400df145fcde4d5e45985919df53a5a9ac46b8d559217f3f47a` | `candidate-3`/`9f00ee86d99578e7758335ca8a1299946369a29840eae9a573cd3afd43551f93` → `candidate-4`/`ad7a8470656e1bb992dedf1ef021823c8e9b301bd5c138c1bb780d0e9e9ac151` | título histórico preservado como registro de época, não terminologia contemporânea |
| `BIB-011` | A | 4 | `5dd9f7abca37cf371906267123adf8aeadc5cfb60f52f75440a36b68277f3b61` | `candidate-3`/`0fe24be59e70bc4c95fcd7c4cff65076b8f78cf6b14a2092bde9d3438a44b96b` → `candidate-4`/`0dc124ea99d68531ff7a82a3cf88c176b1f865efcfbaaf5074a8ee5ff500fce0` | texto revisado V2.1; atribuição institucional INES — TV INES / DEBASI |

## Confirmações finais

- Exatamente 11 novos corpos foram migrados; total posterior: 14 corpos, incluindo `HIST-001`, `HIST-006` e `CUR-001` preservados.
- Cada `paragraphs` contém uma única string byte-equivalente à fonte autorizada.
- Nenhum texto foi reescrito, resumido, normalizado ou ampliado.
- Todos os `claimIds` pertencem ao registro proprietário e não contêm duplicidades.
- `PER-001` usa C01–C07 e não inclui `claim-1`.
- `BIB-011` usa exclusivamente a versão revisada V2.1.
- Nenhum claim, referência, summary, metadado, direito, relação, pendência, status, review, autorização ou artwork foi alterado/associado.
