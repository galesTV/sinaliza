# Curadoria cultural V2 — preservação documental

Documentação editorial interna da área Explorar. Este material **não é conteúdo aprovado para publicação** e não altera o catálogo runtime.

## Origem e finalidade

Pacote recebido como `sinaliza-curadoria-V2.zip` para a consolidação editorial D.2.2/D.2.3. A finalidade desta pasta é preservar a proveniência, a rastreabilidade e o estado de verificação dos artefatos antes de qualquer migração futura para o catálogo tipado.

SHA-256 do ZIP recebido: `8d0a9dcdae1f7778f2e15a12af2bbdd98134a79e7cebaa9e6de761ad08ee3ef5`.

`pacote-original/` contém uma cópia byte a byte dos arquivos extraídos do ZIP, incluindo o manifesto SHA-256 original. Esses arquivos não devem ser editados nesta estrutura. Se uma versão normalizada for produzida no futuro, ela precisa ficar distinguível do original e ter hash próprio; hashes do manifesto original nunca devem ser reapresentados como hashes de arquivos modificados.

`auditoria-d23a.md` é uma cópia documental do relatório D.2.3-A aprovado. Ele é documentação derivada desta etapa, não faz parte do pacote original e não está coberto pelo manifesto original.

## Relação com o PR #73 e com o Explorar

O PR #73 estabeleceu a fundação do catálogo cultural runtime: contrato TypeScript, dados migrados dos 35 candidatos D.2, publicação fail-closed, projeção pública por allowlist, fingerprints, cadeia de revisões e isolamento server-only.

O pacote V2 não substitui essa fundação. Ele é um **catálogo editorial intermediário**, com corpo editorial ampliado, afirmações atomizadas, metadados ainda não verificados, bibliografia recebida e relações candidatas. O catálogo runtime continua sendo o contrato TypeScript em `src/data/`; nenhum JSON desta pasta é fonte de verdade operacional ou importação automática.

O PR #75 introduziu a experiência visual do Explorar usando somente a fachada pública. Esta documentação não integra, revisa nem modifica aquela implementação visual. O documento `../contrato-editorial-d2.md` já presente no repositório é uma versão normalizada em LF do contrato de referência; o arquivo original em `pacote-original/contrato-editorial-referencia.md` preserva os bytes e o hash recebidos. `../backlog-d2-2.md` é um documento relacionado, mas distinto de `pacote-original/backlog-contrato.md`.

## Inventário confirmado

| Item | Quantidade | Estado |
|---|---:|---|
| Registros culturais candidatos | 41 | Todos `draft`; nenhum publicável |
| Registros existentes preservados | 35 | Baseline D.2/B5 preservada |
| Novos candidatos | 6 | `PER-008`, `PER-009`, `BIB-013`–`BIB-016` |
| Fichas prioritárias enriquecidas | 14 | Corpo editorial e/ou afirmações ampliadas |
| Afirmações individualizadas | 31 | Matriz consistente com o acervo |
| Referências bibliográficas recebidas | 24 | Não reverificadas individualmente; reuso não estabelecido |
| Relações culturais propostas | 15 | Todas `unverified-candidate` |
| Benchmarks internos | 9 | Documentação interna; fora da taxonomia pública |
| Autorizações de publicação | 0 | Nenhuma |

## Bloqueadores da importação direta

- O JSON intermediário não contém `slug`, `category`, `version`, referências estruturadas com IDs, objeto `rights`, `relatedEntries` ou subobjetos exigidos por categoria.
- `publicationAuthorized` é apenas um campo editorial intermediário e não pode ser migrado como autorização; o contrato runtime propositalmente não usa booleano de publicação.
- Dois URLs são `http://` e não satisfazem a validação HTTPS do contrato: um em `PER-001` e um em `PER-009`.
- `claims[].consultation` é um estado editorial (`content-checked`, `located`, `metadata-checked`), não uma data; não pode virar `consultedAt`.
- Não há campo contratual para corpo editorial longo.
- Não há campo contratual para múltiplas modalidades/links específicos de acesso; `video` em `BIB-004` não pertence ao enum atual.
- Metadados bibliográficos estruturados, coleções, volumes, edições, ISBNs, páginas, tradutores e papéis de criação ainda não têm modelo contratual.
- Referências bibliográficas recebidas são citações internas, em grande parte sem URL estruturada, instituição, finalidade ou data de consulta.
- Relações propostas são pistas. `evidenceLead` não é `referenceId` e não deve virar evidência verificada automaticamente.

## Proveniência dos artefatos originais

Todos os hashes abaixo foram conferidos contra `pacote-original/manifesto-sha256.json` na preservação D.2.3-B. O manifesto não inclui a si mesmo.

| Arquivo original | SHA-256 | Conteúdo/estado |
|---|---|---|
| `README.md` | `e77f53cdff02fb578f0e926b733a79d3679b9a25a2bbb07114c14fa151db59cb` | Orientações e limitações do pacote |
| `acervo-editorial.json` | `8f7fc73dd79a57df5cdd20630c18a57b7f08b124e7422a645e9c48ee476a2a6d` | 41 candidatos em formato editorial intermediário |
| `acervo-editorial.md` | `f4f63b57f5f1b5192b6f199a556778674202393ea074c7ba535c848c79c94bd6` | Versão textual dos 41 rascunhos |
| `auditoria.json` | `76edbc6ddf26a83707b9f3f221dde8c74f0821ce77e153c85a099634c1c9bf49` | Contagens estruturais da consolidação |
| `backlog-contrato.md` | `bc5ed46fbd00199e28afabb0161eecc785fbbf4726d82c68105dd1469ddd4e2a` | Extensões contratuais futuras, não autorizadas |
| `baseline-b5.json` | `780fa274a9a8256e95783c34ee1ac8d43002fceb3f9eed2e5cd235e023910071` | Baseline integral dos 35 registros existentes |
| `benchmark-internacional.md` | `78d59c51986c2193f6ab722a6345fb31fb79d416c23037356815f428cf1077eb` | 9 benchmarks internos; não publicáveis |
| `bibliografia-capovilla.json` | `632780e1c6b84bdc962534b21250a5e1775b97a40e7a166ea64d89cb64441764` | 24 referências recebidas, não reverificadas |
| `bibliografia-capovilla.md` | `86ddebf68e7169add4a92cffa0db782f03d2ab9e6bd8caa3fc7e51fcd52243bd` | Transcrição legível da bibliografia recebida |
| `catalogo-d2-legado.json` | `c1201c043642913440eed0e228823cfa35bd0cbd35de37a07510ff41b1ed19cc` | Seed D.2 com 35 registros culturais e 9 benchmarks |
| `contrato-editorial-referencia.md` | `6b8ba0d78784321b32785a5192c1b5afae06c857616661f44e65447375b5a12e` | Leitura do contrato do PR #73; original com CRLF |
| `direitos-e-permissoes.md` | `aeede7e3ace97cf15bdd9b904d0b02805b418f7919de4a08a497aaeda2f523a9` | Regras de direitos; nenhum reuso autorizado |
| `manifesto-sha256.json` | não aplicável | Manifesto original; arquivo não coberto por si mesmo |
| `matriz-afirmacoes.json` | `0a7eeb930ff8277574e05a6106518b4ef6ad4bc53fb6048422bcb7ebff73d692` | 31 afirmações individualizadas |
| `prompt-devin.md` | `acf48f3c73c681194460b3d956534b52d17d99d9d67bcb7de5a3cc3ec84a1a30` | Instruções originais de auditoria somente leitura |
| `relacoes-candidatas.json` | `af697f000072dcea39a31a89ec171da7985bb39df9f1fde5e11c4f849ffe472c` | 15 relações culturais propostas |
| `revisao-especializada.md` | `7263887099f9766453ba825fde15c5b14726849d7efe876a267e3f959ae37c4f` | Requisitos de revisão humana especializada |

## Estado de verificação e direitos

- Fontes externas não foram reabertas nesta rodada.
- Nenhuma afirmação, fonte, metadado, relação, revisão ou autorização foi promovida a estado verificado.
- Os estados `content-checked`, `located` e `metadata-checked` são proveniência editorial interna, não revisão especializada nem data de consulta.
- Nenhum asset de terceiros possui autorização de reprodução registrada. A estratégia continua sendo somente links externos legítimos após validação.
- Benchmarks e bibliografia complementar permanecem documentação interna de pesquisa, fora da taxonomia pública e fora da projeção pública.

## Etapas futuras de migração

1. Preservar esta documentação e decidir formalmente o escopo da D.2.3-C.
2. Verificar alternativas HTTPS para fontes HTTP; sem alternativa confirmada, manter apenas como pista interna.
3. Migrar futuramente os seis novos candidatos como drafts mínimos, sem publicação e com slugs aprovados sujeitos à validação de unicidade.
4. Migrar futuramente as 31 afirmações e fontes ampliadas das 14 fichas prioritárias, sem converter estados de consulta em datas.
5. Manter as 15 relações como `unverified-candidate` até evidência revisada.
6. Avaliar, em PRs contratuais separados, corpo editorial longo, múltiplas modalidades/links de acesso, metadados bibliográficos e modelagem de coleções/volumes/edições.
7. Executar revisões de pesquisa, técnica e especializada, seguidas de autorização final independente, antes de qualquer publicação.

## Regra operacional

Nenhum conteúdo desta pasta está autorizado para publicação. Nenhuma parte deste pacote pode ser importada diretamente para `src/data/cultural-catalog.ts`. Lacunas factuais, de direitos, de revisão ou de contrato permanecem bloqueadoras fail-closed.
