# R.5.3-A — Auditoria pré-migração da Complementação Editorial V2.1

## 1. Base e estado atual do repositório

- `origin/dev`: `a0013e2fda29b47e0edba41ff20865fadd920c6c`.
- O merge do PR #81 é o próprio merge commit e é ancestral de `origin/dev`.
- Working tree permanece limpa durante toda a auditoria.
- Estado runtime calculado: 41 registros, 41 drafts, 26 claims atomizados V2 migrados, 3 corpos editoriais (`HIST-001`, `HIST-006`, `CUR-001`), zero reviews, zero autorizações.
- Não encontrei alterações posteriores ao PR #81 relevantes ao contrato editorial.

## 2. Auditoria dos manifestos e contagens independentes

### V2 original

- Pacote em `apps/pwa/docs/curadoria-cultural/v2/pacote-original/`.
- 16/16 hashes SHA-256 válidos.
- Não alterado.

### ZIP V2.1

- SHA-256 calculado: `38644a5a22c0f9d6b89d840601828c1725e58389b201cb7f61b4a72ce6ce10d3` — confere com o esperado.
- ZIP extraído somente em `/tmp/curadoria-v21-audit`, fora do repositório.
- 11 arquivos presentes; manifesto contém 10 entradas porque o próprio manifesto não se autohashia.
- 10/10 hashes do manifesto válidos.

Contagens independentes:

| Item | Calculado |
|---|---:|
| claims complementares | 22 |
| claims recuperados | 5 |
| matriz consolidada | 53 |
| registros no acervo complementar | 14 |
| corpos originais preservados | 13 |
| corpos revisados | 1 (`BIB-011`) |
| referências verificadas | 27 entradas de URL |
| chamadas Firecrawl declaradas nesta etapa | 0 |

A matriz consolidada preserva os 31 IDs originais, mas os cinco recuperados diferem propositalmente em `url`, `locator` ou `consultation`; não há alteração de texto. Não há IDs duplicados na matriz consolidada.

## 3. Matriz individual dos 27 claims

Instituição abaixo significa a instituição/domínio documentalmente identificável no pacote/URL. O pacote não traz um campo estruturado `institution`; portanto não preenchi metadados runtime inexistentes. Todas as datas registradas são `2026-11-27` e representam a rodada documentada, não uma nova verificação independente feita nesta auditoria.

| Claim | Registro | Texto exato | Origem | Estado anterior | Estado proposto | URL | Instituição/domínio | Localizador | Data registrada | Classe | Decisão/ressalva |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `HIST-008-C04` | `HIST-008` | A Lei nº 14.191 é de 3 de agosto de 2021. | complementar | — | `content-checked` | https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14191.htm | domínio institucional Planalto | Cabeçalho da lei | 2026-11-27 | A | referência runtime `source-1` já existe; data explícita; sem lacuna contratual |
| `CUR-002-C04` | `CUR-002` | A Libras apresenta organização linguística em níveis como fonologia, léxico e sintaxe. | complementar | — | `content-checked` | https://ojsrevista.furb.br/ojs/index.php/linguagens/article/download/7287/4653/32619 | periódico hospedado na FURB | Seções 1–3 | 2026-11-27 | A | referência `source-2` existente; complementa organização linguística |
| `CUR-002-C05` | `CUR-002` | Configuração de mão, localização, movimento, orientação da mão e elementos não manuais são componentes estudados na fonologia das línguas de sinais. | complementar | — | `content-checked` | https://ojsrevista.furb.br/ojs/index.php/linguagens/article/download/7287/4653/32619 | periódico hospedado na FURB | Seção 2 | 2026-11-27 | A | referência `source-2` existente; delimita componentes fonológicos |
| `CUR-002-C06` | `CUR-002` | A datilologia corresponde à soletração manual e constitui uma das competências trabalhadas no ensino de Libras, ao lado de competências comunicativas e gramaticais. | complementar | — | `content-checked` | https://letraslibras.paginas.ufsc.br/files/2022/12/LSB7106-Libras-Iniciante.pdf | página UFSC/Letras Libras | Ementa, objetivos, conteúdo programático e cronograma de 30/03/2023 | 2026-11-27 | A | nova referência UFSC; usar somente a formulação aprovada R.5.1 |
| `CUR-006-C03` | `CUR-006` | A literatura surda sinalizada pode representar experiências visuais, culturais e identitárias das pessoas surdas. | complementar | — | `content-checked` | https://petletras.paginas.ufsc.br/2023/09/08/literatura-surda-os-conceitos-de-karnopp-mourao-e-sutton-spence/ | página UFSC/PET Letras | Discussão sobre Karnopp | 2026-11-27 | A | referência `source-1` existente; fonte secundária, mas claim delimitado |
| `CUR-006-C04` | `CUR-006` | Recursos poéticos e icônicos da Libras podem ser utilizados na construção de narrativas interpretativas. | complementar | — | `content-checked` | https://www.revistaglauks.ufv.br/Glauks/article/view/377 | revista Glauks/UFV | Resumo | 2026-11-27 | C | nova referência; pacote registra “não leitura integral”; exigir decisão sobre suficiência do resumo |
| `PER-002-C02` | `PER-002` | A obra foi originalmente publicada em 1995 e reimpressa em 2010. | complementar | — | `content-checked` | https://seer.ufu.br/index.php/EducacaoFilosofia/article/view/29990 | periódico UFU | Resumo da resenha | 2026-11-27 | A | referência `source-1` existente; dado bibliográfico direto |
| `PER-002-C03` | `PER-002` | A obra constitui uma contribuição pioneira à descrição linguística da Libras. | complementar | — | `content-checked` | https://seer.ufu.br/index.php/EducacaoFilosofia/article/view/29990 | periódico UFU | Resumo da resenha | 2026-11-27 | A | referência `source-1` existente; formulação avaliativa da resenha |
| `PER-002-C04` | `PER-002` | O inventário bibliográfico da Fundação Joaquim Nabuco registra a obra Por uma gramática de línguas de sinais, de Lucinda Ferreira Brito, publicada em 1995. | complementar | — | `metadata-checked` | https://www.gov.br/fundaj/pt-br/composicao/dimeca/biblioteca/acervos/inventarios-documentais-e-indices/libras_25_4_2012.pdf | domínio gov.br/Fundaj | Referência nº 24 | 2026-11-27 | C | nova referência Fundaj; divergência singular/plural e folha de rosto não conferida |
| `BIB-002-C02` | `BIB-002` | A obra de Karin Strobel aborda representações e perspectivas sobre a cultura surda. | complementar | — | `content-checked` | https://editora.ufsc.br/2016/10/10/lancamento-as-imagens-do-outro-sobre-a-cultura-surda/ | Editora UFSC | Descrição editorial | 2026-11-27 | A | referência `source-1` existente; descrição editorial direta |
| `BIB-003-C03` | `BIB-003` | A Gramática da Libras — Volume 1 reúne estudos sobre a descrição linguística da Libras, incluindo fundamentos gramaticais, documentação linguística, fonética e fonologia. | complementar | — | `content-checked` | https://www.researchgate.net/publication/385893948_A_Fonetica_e_a_Fonologia_das_Linguas_de_Sinais | plataforma ResearchGate — não instituição primária | Apresentação editorial e sumário, capítulos 1–4 | 2026-11-27 | C | nova referência ResearchGate/cópia parcial; distinguir conteúdo conferido de declaração de reprodução |
| `BIB-003-C04` | `BIB-003` | O registro institucional do Volume 1 apresenta 37 entradas de autoria, incluindo os quatro organizadores. | complementar | — | `metadata-checked` | https://repositorio.ufsc.br/handle/123456789/262318?show=full | Repositório Institucional UFSC | dc.contributor.author e dc.identifier.citation | 2026-11-27 | B | aplicar a mesma remoção determinística já autorizada de `?show=full`; evidência `metadata-checked` |
| `BIB-003-C05` | `BIB-003` | O Repositório Institucional da UFSC disponibiliza um arquivo PDF da Gramática da Libras — Volume 1. | complementar | — | `metadata-checked` | https://repositorio.ufsc.br/handle/123456789/262318?show=full | Repositório Institucional UFSC | Files in this item | 2026-11-27 | B | aplicar a mesma remoção determinística já autorizada de `?show=full`; evidência `metadata-checked` |
| `BIB-004-C03` | `BIB-004` | Literatura em Libras é uma obra de Rachel Sutton-Spence, com tradução de Gustavo Gusmão. | complementar | — | `metadata-checked` | https://repositorio.ufsc.br/xmlui/bitstream/handle/123456789/259641/Literatura_em_Libras_Rachel_Sutton_Spence.pdf?sequence=1&isAllowed=y | Repositório Institucional UFSC | Ficha catalográfica e ficha técnica | 2026-11-27 | A | nova referência PDF institucional; metadados bibliográficos adequados ao claim |
| `BIB-004-C04` | `BIB-004` | A primeira edição foi publicada pela Editora Arara Azul em 2021. | complementar | — | `metadata-checked` | https://repositorio.ufsc.br/xmlui/bitstream/handle/123456789/259641/Literatura_em_Libras_Rachel_Sutton_Spence.pdf?sequence=1&isAllowed=y | Repositório Institucional UFSC | Ficha catalográfica | 2026-11-27 | A | nova referência PDF institucional; metadados bibliográficos adequados ao claim |
| `BIB-004-C05` | `BIB-004` | A obra aborda conceitos, narrativas, recursos estéticos e aspectos sociais da literatura em Libras. | complementar | — | `content-checked` | https://repositorio.ufsc.br/xmlui/bitstream/handle/123456789/259641/Literatura_em_Libras_Rachel_Sutton_Spence.pdf?sequence=1&isAllowed=y | Repositório Institucional UFSC | Apresentação, p. 5 | 2026-11-27 | A | nova referência PDF institucional; escopo limitado às primeiras oito páginas deve ser preservado |
| `BIB-005-C02` | `BIB-005` | Cinderela Surda é uma releitura de um conto clássico da literatura infantil que valoriza a cultura surda. | complementar | — | `content-checked` | https://librando.paginas.ufsc.br/signwrite/ | LIBRANDO/UFSC | Entrada Cinderela Surda | 2026-11-27 | A | referência `source-1` existente; conteúdo editorial direto |
| `BIB-005-C03` | `BIB-005` | A obra integra a seção de escrita de sinais do acervo LIBRANDO. | complementar | — | `content-checked` | https://librando.paginas.ufsc.br/signwrite/ | LIBRANDO/UFSC | Seção SignWriting | 2026-11-27 | A | referência `source-1` existente; vínculo com seção SignWriting direto |
| `BIB-005-C04` | `BIB-005` | A terceira edição foi publicada pela Editora da ULBRA em 2011. | complementar | — | `metadata-checked` | https://librando.paginas.ufsc.br/signwrite/ | LIBRANDO/UFSC | Referência bibliográfica da entrada | 2026-11-27 | A | referência `source-1` existente; metadado bibliográfico adequado |
| `BIB-011-C02` | `BIB-011` | Contação de Histórias integra a programação da TV INES. | complementar | — | `content-checked` | https://debasi.ines.gov.br/tv-ines | domínio gov.br/Fundaj | Categoria Infantil | 2026-11-27 | A | nova referência institucional TV INES; complementa propriedade da série |
| `BIB-011-C03` | `BIB-011` | As animações contemplam obras de autores e ilustradores nacionais traduzidas para Libras. | complementar | — | `content-checked` | https://debasi.ines.gov.br/tv-ines/conta%C3%A7%C3%A3o-de-hist%C3%B3rias | domínio gov.br/Fundaj | Descrição institucional | 2026-11-27 | A | referência `source-1` existente; descrição institucional direta |
| `BIB-011-C04` | `BIB-011` | A série busca tornar a literatura infantil e juvenil acessível à comunidade surda de todas as idades. | complementar | — | `content-checked` | https://debasi.ines.gov.br/tv-ines/conta%C3%A7%C3%A3o-de-hist%C3%B3rias | domínio gov.br/Fundaj | Descrição institucional | 2026-11-27 | A | referência `source-1` existente; sustenta a revisão aprovada do corpo |
| `PER-001-C03` | `PER-001` | Tese sobre prosódia em ASL e Libras, 2019. | recuperado | located | `content-checked` | https://repositorio.ufsc.br/handle/123456789/204538 | Repositório Institucional UFSC | Registro da tese | 2026-11-27 | A | recuperado; nova referência institucional UFSC; estado anterior `located` |
| `PER-001-C04` | `PER-001` | Dissertação sobre tradução de fábulas, 2012. | recuperado | located | `content-checked` | https://repositorio.ufsc.br/handle/123456789/100721 | Repositório Institucional UFSC | Título, autoria, resumo e data do registro institucional | 2026-11-27 | B | recuperado; substituição por referência institucional alternativa HTTPS, não normalização nem equivalência binária presumida |
| `PER-002-C01` | `PER-002` | Obra gramatical atribuída a Lucinda Ferreira Brito. | recuperado | located | `content-checked` | https://seer.ufu.br/index.php/EducacaoFilosofia/article/view/29990 | periódico UFU | Resenha acadêmica | 2026-11-27 | A | recuperado; referência `source-1` existente; estado anterior `located` |
| `BIB-002-C01` | `BIB-002` | Quarta edição, Editora UFSC, 2016. | recuperado | located | `metadata-checked` | https://editora.ufsc.br/2016/10/10/lancamento-as-imagens-do-outro-sobre-a-cultura-surda/ | Editora UFSC | Notícia de lançamento | 2026-11-27 | A | recuperado; referência `source-1` existente; `metadata-checked` é adequado ao claim bibliográfico |
| `BIB-010-C02` | `BIB-010` | Matriz francesa de Pierre Pélissier. | recuperado | located | `content-checked` | https://www.scielo.br/j/rbee/a/S5Gyt4gMNzzQJJmLYqMcqCC/abstract/?lang=pt | SciELO | Resumo do estudo de Sofiato e Reily | 2026-11-27 | A | recuperado; nova referência SciELO; estado anterior `located` |

### Resumo da classificação

- A: 21 claims aptos para migração direta.
- B: 3 claims aptos mediante transformação/substituição determinística documentada (`BIB-003-C04`, `BIB-003-C05`, `PER-001-C04`).
- C: 3 claims condicionados (`CUR-006-C04`, `PER-002-C04`, `BIB-003-C03`).
- D: 0 claims bloqueados por evidência insuficiente.

Nenhum ID colide com claims runtime existentes. Nenhum texto é duplicado verbatim em claims já presentes. Há complementaridade semântica, não duplicidade exata.

## 4. Mapeamento de referências

### Reutilização direta de referência runtime existente — 14 claims

`HIST-008-C04`; `CUR-002-C04`; `CUR-002-C05`; `CUR-006-C03`; `PER-002-C02`; `PER-002-C03`; `BIB-002-C02`; `BIB-005-C02`; `BIB-005-C03`; `BIB-005-C04`; `BIB-011-C03`; `BIB-011-C04`; `PER-002-C01`; `BIB-002-C01`.

### Transformação canônica determinística — 2 claims

`BIB-003-C04` e `BIB-003-C05` usam `?show=full` no pacote, mas o runtime já possui a URL canônica sem o sufixo. A mesma transformação documentada na D.2.3-D.2 pode ser reaplicada, sem tratar isso como nova pesquisa.

### Novas referências necessárias — 11 claims

| Claim | Registro | Nova URL |
|---|---|---|
| `CUR-002-C06` | `CUR-002` | https://letraslibras.paginas.ufsc.br/files/2022/12/LSB7106-Libras-Iniciante.pdf |
| `CUR-006-C04` | `CUR-006` | https://www.revistaglauks.ufv.br/Glauks/article/view/377 |
| `PER-002-C04` | `PER-002` | https://www.gov.br/fundaj/pt-br/composicao/dimeca/biblioteca/acervos/inventarios-documentais-e-indices/libras_25_4_2012.pdf |
| `BIB-003-C03` | `BIB-003` | https://www.researchgate.net/publication/385893948_A_Fonetica_e_a_Fonologia_das_Linguas_de_Sinais |
| `BIB-004-C03` | `BIB-004` | PDF institucional UFSC com query `sequence=1&isAllowed=y` |
| `BIB-004-C04` | `BIB-004` | mesma referência de `BIB-004-C03` |
| `BIB-004-C05` | `BIB-004` | mesma referência de `BIB-004-C03` |
| `BIB-011-C02` | `BIB-011` | https://debasi.ines.gov.br/tv-ines |
| `PER-001-C03` | `PER-001` | https://repositorio.ufsc.br/handle/123456789/204538 |
| `PER-001-C04` | `PER-001` | https://repositorio.ufsc.br/handle/123456789/100721 |
| `BIB-010-C02` | `BIB-010` | https://www.scielo.br/j/rbee/a/S5Gyt4gMNzzQJJmLYqMcqCC/abstract/?lang=pt |

`BIB-004-C03/C04/C05` podem compartilhar uma única referência runtime. `PER-001-C04` deve ser tratado como referência institucional alternativa, não como normalização do antigo PDF HTTP nem como prova de equivalência binária.

## 5. Matriz frase por frase dos 11 corpos restantes

### HIST-008 — Apto

1. Lei 14.191/2021 inclui educação bilíngue na LDB — `HIST-008-C01` + `HIST-008-C04`; sustentação direta.
2. Libras primeira língua e português escrito segunda para optantes — `HIST-008-C02`; direta.
3. Materiais didáticos e professores bilíngues — `HIST-008-C03`; direta.

claimIds recomendados: `HIST-008-C01`, `HIST-008-C02`, `HIST-008-C03`, `HIST-008-C04`. Sem síntese não sustentada.

### CUR-002 — Apto, com sínteses explícitas

1. “Libras não é português representado pelas mãos” — `CUR-002-C01`; síntese conceitual direta da estrutura própria, não fato externo.
2. Estrutura gramatical própria — `CUR-002-C01` + `CUR-002-C04`; direta/complementar.
3. Configuração, localização, movimento e elementos não manuais participam da sinalização — `CUR-002-C02`, `CUR-002-C03`, `CUR-002-C05`; direta/complementar.
4. Alfabeto manual não equivale a dominar a língua — `CUR-002-C06`; síntese editorial aprovada a partir de datilologia como uma competência entre outras.

claimIds recomendados: `CUR-002-C01` a `CUR-002-C06`. Não substituir a formulação de C06.

### CUR-006 — Condicionado

1. Ritmo, repetição e simetria — `CUR-006-C01`; direta.
2. Expressar experiências e criar narrativas artísticas — `CUR-006-C03` + `CUR-006-C04`; sustentação parcialmente interpretativa. C03 é fonte secundária ampla; C04 depende de resumo sem leitura integral.
3. LIBRANDO reúne exemplos — `CUR-006-C02`; direta.

claimIds recomendados somente após decisão sobre C04: `CUR-006-C01`, `CUR-006-C02`, `CUR-006-C03`, `CUR-006-C04`. Condicionado à suficiência do resumo da Glauks e à revisão especializada da síntese.

### PER-001 — Condicionado

1. Liderança surda com atuação em arte, educação e pesquisa — `PER-001-C01` cobre educação/pesquisa/cinema; “liderança” e “arte” dependem de composição interpretativa com C02.
2. Teatro, cinema e estudos da tradução — `PER-001-C01` + `PER-001-C02`; cobertura parcial/comprimida.
3. Dissertação e tese — `PER-001-C03` + `PER-001-C04`; direta após recuperação. C04 exige tratamento como referência institucional alternativa.

claimIds recomendados condicionados: `PER-001-C01`, `PER-001-C02`, `PER-001-C03`, `PER-001-C04`. A decisão pendente é se os dois primeiros claims compostos bastam para “liderança”, “arte” e “teatro” ou se é necessária complementação factual futura.

### PER-002 — Condicionado

1. Referência nos estudos linguísticos — `PER-002-C03`; sustentação avaliativa da resenha.
2. Obra com título plural e publicação em 1995 — `PER-002-C01`, `PER-002-C02`, `PER-002-C04`; direta, mas há divergência bibliográfica singular/plural e folha de rosto não conferida.
3. Integra bibliografia de descrição da Libras — `PER-002-C03`; direta/avaliativa.

claimIds recomendados condicionados: `PER-002-C01` a `PER-002-C04`. Não migrar como apto até decisão bibliográfica sobre o título plural.

### BIB-002 — Apto, com juízo editorial identificado

1. Obra voltada a representações da cultura surda — `BIB-002-C02`; direta.
2. Quarta edição Editora UFSC 2016 — `BIB-002-C01`; bibliográfica/metadata-checked.
3. Leitura candidata para perspectivas culturais/identitárias — `BIB-002-C02`; síntese editorial/juízo de curadoria, sem fato externo.

claimIds recomendados: `BIB-002-C01`, `BIB-002-C02`. A última frase deve permanecer entendida como juízo editorial, não como fato verificado.

### BIB-003 — Condicionado

1. Reúne estudos linguísticos em publicação INES 2023 — `BIB-003-C01`, `BIB-003-C03`; direta, mas C03 usa cópia parcial.
2. Quatro organizadores e equipe ampla — `BIB-003-C02`, `BIB-003-C04`; direta bibliográfica/metadata.
3. PDF disponível no repositório UFSC — `BIB-003-C05`; metadata-checked, não verificação integral de download/conteúdo.

claimIds recomendados condicionados: `BIB-003-C01` a `BIB-003-C05`. Condicionado à decisão sobre cópia parcial/ResearchGate e à separação entre disponibilidade bibliográfica e autorização de uso. Declaração de reprodução não autoriza assets.

### BIB-004 — Apto, com ressalva de escopo bibliográfico

1. Autoria, tradução e objeto — `BIB-004-C01`, `BIB-004-C03`, `BIB-004-C05`; direta bibliográfica/conteúdo inicial.
2. Primeira edição 2021 Arara Azul — `BIB-004-C01`, `BIB-004-C04`; direta bibliográfica.
3. Modalidades textuais e audiovisuais — `BIB-004-C02`; direta.

claimIds recomendados: `BIB-004-C01` a `BIB-004-C05`. Preservar a ressalva de que C05 foi conferido em escopo limitado às primeiras oito páginas.

### BIB-005 — Apto

1. Releitura literária infantil/cultura surda — `BIB-005-C02`; direta.
2. Integra acervo SignWriting/LIBRANDO — `BIB-005-C03`; direta.
3. Terceira edição 2011 ULBRA — `BIB-005-C01`, `BIB-005-C04`; direta bibliográfica.

claimIds recomendados: `BIB-005-C01` a `BIB-005-C04`.

### BIB-010 — Apto, com ressalva terminológica explícita

1. Documento de 1875 associado a Flausino — `BIB-010-C01`; direta.
2. Matriz francesa de Pierre Pélissier — `BIB-010-C02`; direta após recuperação.
3. Título preservado como registro de época — síntese editorial/ressalva terminológica, sem fato externo.

claimIds recomendados: `BIB-010-C01`, `BIB-010-C02`. Manter explicitamente que o título histórico não é terminologia contemporânea.

### BIB-011 — Apto usando exclusivamente o corpo revisado

Corpo revisado exato: “Contação de Histórias é uma série da TV INES que apresenta animações de obras de autores e ilustradores nacionais traduzidas para Libras. A iniciativa busca tornar a literatura infantil e juvenil acessível à comunidade surda de todas as idades.”

1. Série da TV INES — `BIB-011-C02`; direta.
2. Animações de obras nacionais traduzidas — `BIB-011-C01`, `BIB-011-C03`; direta.
3. Acessibilidade à comunidade surda de todas as idades — `BIB-011-C04`; direta segundo descrição institucional.

claimIds recomendados: `BIB-011-C01` a `BIB-011-C04`. O corpo original não deve ser migrado. Créditos/direitos por episódio continuam não verificados, mas o corpo não incorpora episódios/assets.

## 6. Classificação final dos corpos

| Corpo | Classe | Decisão |
|---|---|---|
| HIST-008 | Apto | candidato à migração após evidências |
| CUR-002 | Apto | candidato; sínteses documentadas |
| CUR-006 | Condicionado | depende de decisão sobre `CUR-006-C04` |
| PER-001 | Condicionado | depende da suficiência dos claims compostos e do tratamento de C04 |
| PER-002 | Condicionado | depende da divergência bibliográfica singular/plural |
| BIB-002 | Apto | candidato; juízo editorial explícito |
| BIB-003 | Condicionado | depende de cópia parcial/ResearchGate e escopo de acesso |
| BIB-004 | Apto | candidato; preservar limite da consulta |
| BIB-005 | Apto | candidato |
| BIB-010 | Apto | candidato; ressalva terminológica explícita |
| BIB-011 | Apto | candidato somente com corpo revisado |

Resumo: 7 aptos, 4 condicionados, 0 bloqueados.

## 7. Preservação da E.4 e impactos RC-1.0

`HIST-001`, `HIST-006` e `CUR-001` estão preservados no pacote V2.1 com os mesmos corpos, claimIds e hashes da E.4. Não precisam de alteração nesta rodada. Seus corpos, versões `candidate-3`, claims, referências e fingerprints devem permanecer intocados.

Os três pertencem ao Lote A conforme instrução da E.4, mas o snapshot RC-1.0 permanece externo e será fornecido apenas na E.6. A composição completa das oito fichas não está no repositório; portanto não é possível calcular todos os impactos individuais. Em princípio, qualquer claim/corpo migrado para uma ficha do Lote A criará nova versão/fingerprint runtime e exigirá reconciliação substantiva antes de usar qualquer parecer externo. Nenhuma equivalência entre RC-1.0, `candidate-3` ou futuras versões foi presumida.

## 8. Direitos e publicação

- Todos os registros devem permanecer drafts e `external-link-only`.
- Não há autorização de mídia, assets, reviews ou publicação.
- A declaração de reprodução localizada para BIB-003 não cobre terceiros, capa ou ilustrações e não autoriza uso runtime.
- BIB-004 tem direitos reservados; acesso gratuito não é licença aberta.
- Nada nesta auditoria torna conteúdo público.

## 9. Plano de implementação posterior

### Recomendação prévia: PR documental independente

Recomendo arquivar o pacote V2.1 em PR documental separado antes de qualquer migração. Isso preserva proveniência imutável, reduz o diff da migração e segue o padrão do pacote V2 original.

### R.5.3-B — Migração das evidências

Depende da aprovação das classes A/B e da decisão sobre os três claims C.

Escopo proposto:
1. arquivar pacote V2.1, preferencialmente em PR anterior;
2. migrar claims A e transformações B aprovadas;
3. adicionar apenas referências necessárias, deduplicando o PDF de BIB-004;
4. registrar recuperações separadamente, sem alterar textos originais;
5. criar rastreabilidade derivada com URLs originais/runtime, transformações, estados anteriores/novos, datas registradas e ressalvas;
6. atualizar versões dos registros alterados de forma controlada — provavelmente `candidate-2` → `candidate-3` para registros ainda sem corpo; nunca alterar os três registros da E.4;
7. demonstrar fingerprints antes/depois e preservação dos demais registros;
8. testes positivos/negativos claim→referência→URL e isolamento público.

Esforço estimado: uma sessão de implementação/validação, mais revisão humana. Risco principal: decidir se os três claims C entram, ficam fora ou aguardam nova pesquisa.

### R.5.3-C — Migração dos corpos editoriais

Depende da conclusão da R.5.3-B e da aprovação dos corpos aptos/condicionados.

Escopo proposto:
1. migrar somente corpos aprovados, usando textos byte-exatos do acervo complementar;
2. para `BIB-011`, usar exclusivamente o corpo revisado;
3. vincular o conjunto exato de claimIds aprovado;
4. promover versões no próximo incremento após a migração de evidências — provavelmente `candidate-3` → `candidate-4` nos registros afetados;
5. preservar os três corpos da E.4 e todos os demais registros;
6. ampliar testes byte-exatos, rastreabilidade, negativos e ausência pública.

Esforço estimado: uma sessão de implementação/validação após B. Risco principal: versionamento semântico não uniforme entre registros e reconciliação posterior RC-1.0.

## 10. Critérios de aceitação propostos

- 16/16 hashes V2 originais e 10/10 hashes V2.1 válidos.
- Pacote V2.1 imutável no repositório antes da migração.
- Nenhum texto de claim original alterado.
- Recuperações preservam estado anterior e referência original.
- Todas as transformações de URL explicitamente documentadas.
- Nenhum claim C migrado sem decisão explícita.
- Corpos byte-equivalentes ao acervo aprovado; BIB-011 somente corpo revisado.
- Registros E.4 inalterados.
- Todos os registros continuam drafts, external-link-only, sem reviews/autorização.
- Projeção pública real vazia e bundles públicos sem conteúdo editorial interno.
- Fingerprints recalculados pelo mecanismo real e documentados.

## 11. Veredito e decisões que exigem autorização

Veredito: o pacote V2.1 está íntegro, consistente nas contagens principais e compatível com o contrato runtime. A migração pode ser planejada, mas não deve começar antes de decisões explícitas.

Decisões necessárias:

1. Aprovar ou rejeitar o arquivamento documental do V2.1 em PR independente.
2. Aprovar os 21 claims classe A.
3. Aprovar as três transformações/substituições classe B.
4. Decidir individualmente `CUR-006-C04`, `PER-002-C04` e `BIB-003-C03`: migrar, condicionar a nova pesquisa ou excluir.
5. Decidir se os dois claims compostos de PER-001 bastam para “liderança”, “arte” e “teatro”.
6. Decidir a divergência bibliográfica de PER-002 — plural sustentado pela Fundaj versus divergência em resenha/índice e folha de rosto não conferida.
7. Aprovar o conjunto inicial de corpos para R.5.3-C.
8. Confirmar a política de versionamento escalonado para evidências e corpos.

Working tree final: limpa. Não usei Firecrawl, não alterei arquivos do repositório e não iniciei R.5.3-B/C, E.5 ou E.6.

## Erratas e ressalvas documentais do arquivamento

Esta seção é documentação derivada do arquivamento R.5.3-B.1. Ela não modifica retroativamente as conclusões originais da auditoria nem representa autorização de migração.

- `BIB-011-C02`, `BIB-011-C03` e `BIB-011-C04`: as referências `debasi.ines.gov.br` pertencem ao INES, não à Fundação Joaquim Nabuco. A atribuição incorreta aparece na tabela da auditoria.
- `BIB-003`: a abrangência da declaração de reprodução sobre capa, ilustrações e materiais de terceiros não foi confirmada. Não se deve afirmar categoricamente que esses materiais estão excluídos nem que estão autorizados.
- `CUR-006-C04`: a consulta foi limitada ao resumo do artigo.
- `PER-002-C04`: inventário bibliográfico consultado; a folha de rosto original não foi conferida.
- `BIB-003-C03`: apresentação editorial e sumário consultados em cópia parcial hospedada no ResearchGate.
- `PER-001-C04`: referência institucional alternativa, sem equivalência binária presumida.

Nenhuma decisão de migração está executada ou definitivamente autorizada por este arquivamento.
