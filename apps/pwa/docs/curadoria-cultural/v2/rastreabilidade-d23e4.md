# Rastreabilidade da migração D.2.3-E.4

Documento derivado; o pacote original em `pacote-original/` permanece imutável. Escopo exclusivo: migração draft verbatim dos corpos editoriais de `HIST-001`, `HIST-006` e `CUR-001`, aprovados como classe A na auditoria D.2.3-E.3. Nada neste documento constitui parecer especializado, validação factual nova ou autorização de publicação.

Os fingerprints abaixo usam o mecanismo runtime real. Campos de workflow (`version`, `validationStatus`, `reviews`, `publicationAuthorization`, `internalPending`) não participam do hash. Como a migração adicionou `editorialBody`, os três fingerprints mudaram mesmo sem alteração de claims, referências, summary, metadados, relações ou direitos.

## HIST-001

Corpo V2 exato:

> Em 1855, Ernest Huet apresentou uma proposta de educação de surdos. As aulas começaram em 1º de janeiro de 1856. A Lei nº 939, de 26 de setembro de 1857, integra a cronologia institucional do atual INES. Trata-se de um marco educacional, não de uma data de nascimento da Libras.

- SHA-256 UTF-8 do corpo: `afe7fd2a10f229aa1b9ce224665c539cf1db46ed755eeaa60534b6fb9b7fc47d`
- Versão: `candidate-2` → `candidate-3`
- Fingerprint: `9d6f9296d64c8be186862f7282e106354ff498003977a2c4b4c57606e5a2834d` → `7cc13fbb7fa0a15b092e0e80782b686c91273581fc18174ff72cc5594451d98b`
- Claims bloqueados vinculados: nenhum.

| Afirmação analítica | Claim runtime | Ref. runtime | URL original | URL runtime | Transformação | Localizador | Estado original |
|---|---|---|---|---|---|---|---|
| Huet apresentou a proposta em 1855, no contexto da educação de surdos | `HIST-001-C01` | `source-1` | https://seer.ines.gov.br/index.php/revista-espaco/article/download/703/708/2042 | https://seer.ines.gov.br/index.php/revista-espaco/article/download/703/708/2042 | nenhuma | Visitando o Acervo do INES, cronologia | `content-checked` |
| Aulas começaram em 1º de janeiro de 1856 | `HIST-001-C02` | `source-1` | https://seer.ines.gov.br/index.php/revista-espaco/article/download/703/708/2042 | https://seer.ines.gov.br/index.php/revista-espaco/article/download/703/708/2042 | nenhuma | Cronologia institucional | `content-checked` |
| Lei 939 de 26/09/1857 integra a cronologia institucional | `HIST-001-C03` | `source-1` | https://seer.ines.gov.br/index.php/revista-espaco/article/download/703/708/2042 | https://seer.ines.gov.br/index.php/revista-espaco/article/download/703/708/2042 | nenhuma | Cronologia institucional | `content-checked` |
| Marco educacional, não nascimento da Libras | `claim-1` | `source-1` | https://seer.ines.gov.br/index.php/revista-espaco/article/download/703/708/2042 | https://seer.ines.gov.br/index.php/revista-espaco/article/download/703/708/2042 | nenhuma | claim legado composto do candidato | não aplicável — sem estado atomizado V2 |

`claim-1` foi resolvido exclusivamente dentro de `HIST-001`; a existência do mesmo ID legado em outros registros não foi usada como evidência.

## HIST-006

Corpo V2 exato:

> Em 24 de abril de 2002, a Lei nº 10.436 reconheceu a Libras como meio legal de comunicação e expressão. A lei reconhece sua estrutura gramatical própria e prevê apoio ao uso e à difusão. Reconhecimento jurídico não equivale à criação da língua.

- SHA-256 UTF-8 do corpo: `d1f1919ae59401d5b2c79913b28be4eb78b39a37d3f91e700151a54f0598f2f0`
- Versão: `candidate-2` → `candidate-3`
- Fingerprint: `c25000fefb706576b2ddcb58206a359bddaefa8962e6640a2eccb3c94e947960` → `caddc7d4e35b1f164e41081775f6fdad6387993db49bda556a6f4ee60d8979ae`
- Claims bloqueados vinculados: nenhum.

| Afirmação analítica | Claim runtime | Ref. runtime | URL original | URL runtime | Transformação | Localizador | Estado original |
|---|---|---|---|---|---|---|---|
| Lei datada de 24 de abril de 2002 | `HIST-006-C01` | `source-1` | https://www.planalto.gov.br/ccivil_03/leis/2002/l10436.htm | https://www.planalto.gov.br/ccivil_03/leis/2002/l10436.htm | nenhuma | Identificação do ato | `content-checked` |
| Reconhecimento como meio legal de comunicação e expressão | `HIST-006-C02` | `source-1` | https://www.planalto.gov.br/ccivil_03/leis/2002/l10436.htm | https://www.planalto.gov.br/ccivil_03/leis/2002/l10436.htm | nenhuma | Art. 1º | `content-checked` |
| Estrutura gramatical própria | `HIST-006-C03` | `source-1` | https://www.planalto.gov.br/ccivil_03/leis/2002/l10436.htm | https://www.planalto.gov.br/ccivil_03/leis/2002/l10436.htm | nenhuma | Art. 1º, parágrafo único | `content-checked` |
| Apoio ao uso e difusão | `HIST-006-C04` | `source-1` | https://www.planalto.gov.br/ccivil_03/leis/2002/l10436.htm | https://www.planalto.gov.br/ccivil_03/leis/2002/l10436.htm | nenhuma | Art. 2º | `content-checked` |
| Reconhecimento jurídico não equivale à criação da língua | `HIST-006-C02`, `HIST-006-C03` | `source-1` | https://www.planalto.gov.br/ccivil_03/leis/2002/l10436.htm | https://www.planalto.gov.br/ccivil_03/leis/2002/l10436.htm | nenhuma | síntese editorial dedutiva | derivada de claims `content-checked` |

Síntese editorial aprovada: “Reconhecimento jurídico não equivale à criação da língua” é consequência conceitual direta do reconhecimento de uma língua já existente e não introduz fato externo. Permanece sujeita à revisão especializada.

## CUR-001

Corpo V2 exato:

> Não existe uma língua de sinais universal. Comunidades de diferentes países e regiões utilizam línguas de sinais distintas. Aprender uma delas não garante compreender todas as outras.

- SHA-256 UTF-8 do corpo: `8871f10ce475cf29789d5d89762e08d5784445b849ae67afe31cd396d25f3108`
- Versão: `candidate-2` → `candidate-3`
- Fingerprint: `068140ac553c02221af7c6ad07f9b2546e9868b8a6d847687fdcc08ef77177fc` → `b4da839e9fd3a3f9a2480fb21680873e1dd29118521fc960088d36f21fc2bab2`
- Claims bloqueados vinculados: nenhum.

| Afirmação analítica | Claim runtime | Ref. runtime | URL original | URL runtime | Transformação | Localizador | Estado original |
|---|---|---|---|---|---|---|---|
| Não existe língua de sinais universal | `CUR-001-C01` | `source-1` | https://wfdeaf.org/contact/faqs/ | https://wfdeaf.org/contact/faqs/ | nenhuma | FAQ sobre universalidade | `content-checked` |
| Comunidades de países e regiões usam línguas distintas | `CUR-001-C02` | `source-1` | https://wfdeaf.org/contact/faqs/ | https://wfdeaf.org/contact/faqs/ | nenhuma | FAQ sobre universalidade | `content-checked` |
| Aprender uma não garante compreender todas | `CUR-001-C01`, `CUR-001-C02` | `source-1` | https://wfdeaf.org/contact/faqs/ | https://wfdeaf.org/contact/faqs/ | nenhuma | síntese editorial dedutiva | derivada de claims `content-checked` |

Síntese editorial aprovada: a última frase é consequência dedutiva direta da inexistência de língua universal e da diversidade regional, sem introduzir fato externo. Permanece sujeita à revisão especializada.

## Confirmações finais

- Exatamente três corpos foram migrados: `HIST-001`, `HIST-006`, `CUR-001`.
- Cada `paragraphs` contém uma única string byte-equivalente ao `editorialBody` original do V2.
- Nenhum corpo foi reescrito, resumido, dividido ou ampliado.
- Todos os `claimIds` pertencem ao registro proprietário.
- Nenhum dos cinco claims bloqueados foi usado.
- Os sete corpos classe B e os quatro corpos excluídos não foram migrados.
- Todos os registros continuam `draft`, sem reviews e sem autorização.
