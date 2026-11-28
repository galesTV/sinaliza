# Rastreabilidade da associação visual V.3.3

Documento derivado da migração controlada de metadados visuais. Os pacotes originais V2/V2.1 e as rastreabilidades históricas permanecem imutáveis. Nada neste documento constitui revisão especializada, validação factual nova, autorização de publicação, liberação de mídia ou integração visual pública.

- Base Git: `bbdca278c9b6b0f6e8bf87a60020c0d4d0d50ae4` (merge do PR #87).
- Escopo: exatamente oito registros culturais draft.
- Campos alterados: exclusivamente `artwork` e `version`.
- Novos claims: 0; novas referências: 0; alterações em corpos editoriais: 0.
- Estado editorial posterior: 41 drafts, zero reviews, zero autorizações e projeção pública vazia.
- Natureza das artes: representações editoriais próprias do Sinaliza; não são capas oficiais, retratos reais, reproduções de documentos, brasões, selos, sinais de Libras ou obras de terceiros.

## Matriz de associação

| Registro | Motivo | Metadados visuais exatos | Versão antes → depois | Fingerprint antes → depois |
|---|---|---|---|---|
| `HIST-001` | `timeline` | `1855/Proposta/HIST-001-C01`; `1856/Início das aulas/HIST-001-C02`; `1857/Lei nº 939/HIST-001-C03` | `candidate-3` → `candidate-4` | `7cc13fbb7fa0a15b092e0e80782b686c91273581fc18174ff72cc5594451d98b` → `5d9077c0408f6d8396730756a5d5966726be4f3019f991f3ba8a45be9f0d4b8e` |
| `HIST-006` | `legal-document` | `documentNumber=10.436/claim-1`; `documentDate=2002/HIST-006-C01` | `candidate-3` → `candidate-4` | `caddc7d4e35b1f164e41081775f6fdad6387993db49bda556a6f4ee60d8979ae` → `eddfa0e813f82aad06abb3ccd16124e870dd56a49af98f868ec418b95cfe1022` |
| `CUR-001` | `diversity-orbits` | somente motivo abstrato | `candidate-3` → `candidate-4` | `b4da839e9fd3a3f9a2480fb21680873e1dd29118521fc960088d36f21fc2bab2` → `9b36e420ffb33b423633f07dacb1a3f9b8c942e4073945484cd8d6c80b38d833` |
| `CUR-002` | `parallel-structures` | somente motivo abstrato | `candidate-4` → `candidate-5` | `df8ef3310fbb9657fc4a961f042779cc6fbde03015da0c21b634fe6f8f8f5015` → `e0e1245d105e0d76654515cac25b0bbe31be15b3a2dd8a1a19baf8a0b1cd95a6` |
| `CUR-006` | `visual-rhythm` | somente motivo abstrato | `candidate-4` → `candidate-5` | `ecf9e1b9cb3c9a2990d09ef59c0d342fa05e9c61c3b06af38ab72060fa4397eb` → `95432958b803dc5bf32acdba351da0e0a90a81f94f82e85249a1b7df5559bf60` |
| `PER-001` | `monogram` | somente motivo; sem `initials` persistido | `candidate-4` → `candidate-5` | `2dbcee07accd0ceaa60b9b58679b46eb764fbd9ea1659dd6aa05a96dfa0f9e33` → `a9fedc57bf147f49eb7f6b27c5a428919788f9d22312fbbe0c31dd77316f9b20` |
| `BIB-003` | `academic` | `volumeNumber=I/BIB-003-C04` | `candidate-4` → `candidate-5` | `a343dd0508688b16b3e7836474a571e6e581a3ae52447868a52a3410f7eccae0` → `0bef5c8d004ebb1dd64619c8bdfb57a6f76d816f3b3568015b7ee58103fcaa51` |
| `BIB-005` | `literary` | somente motivo abstrato | `candidate-4` → `candidate-5` | `4f64ff88acfcca91788a6241d1a933aa33cfea18ff276afd6df6671e0ef5b8ce` → `0d7596e0dbec74096e8064b86ac01323b92008b2d1341e91ecd3813a923c8304` |

## Justificativas semânticas

- `HIST-001`: a cronologia visual usa apenas os três marcos sustentados pelos claims locais C01–C03. Os rótulos são formas curtas de apresentação; não introduzem nascimento da Libras nem fatos adicionais. A distinção entre marco institucional e origem da língua permanece no corpo editorial.
- `HIST-006`: `claim-1` sustenta explicitamente que a Lei 10.436 reconheceu a Libras; `HIST-006-C01` sustenta a data de 24 de abril de 2002. O valor visual de data é somente `2002`, recorte anual já presente no claim e no metadado histórico, sem substituir a data completa do corpo editorial.
- `BIB-003`: `BIB-003-C04` identifica explicitamente o registro institucional do Volume 1. O numeral romano `I` é equivalência editorial convencional de apresentação para `Volume 1`, não um novo claim nem uma conversão factual autônoma.
- `PER-001`: nenhum `initials` foi persistido. O adaptador mantém `initials` ausente; o template de monograma deriva `NP` do título público `Nelson Pimenta`. Não há retrato, silhueta identificável ou aparência física fictícia.
- `CUR-001`, `CUR-002`, `CUR-006` e `BIB-005`: os motivos são abstratos e não carregam metadados factuais. Eles não representam quantidade de línguas, hierarquia linguística, regras gramaticais, sinais específicos, poemas, personagens, ilustrações ou capas de obras.

## Fatos versus representação abstrata

Somente `HIST-001`, `HIST-006` e `BIB-003` possuem valores visuais factuais curtos vinculados a `claimId` local. Os demais motivos são intenção visual abstrata. A validação estrutural garante forma, compatibilidade e vínculo local; a verdade factual continua dependente da revisão editorial humana e das fontes já rastreadas.

## Preservação e baselines

A baseline independente pré-V.3.3 foi capturada de `bbdca278c9b6b0f6e8bf87a60020c0d4d0d50ae4` antes da migração em `src/test/cultural-v33-baseline.ts`. Ela preserva versões, fingerprints e workflow dos 41 registros, com conteúdo material completo dos oito registros autorizados. A validação V.3.3 comprova que somente `artwork` e `version` mudaram nesses registros e que os 33 demais permanecem preservados.

A validação histórica R.5.3-C passou a normalizar exclusivamente os campos controlados pela V.3.3 ao reconstruir o estágio histórico, sem apagar verificações de corpo, claims, referências, fingerprint, classificação ou ressalvas. A ausência de artwork no estágio histórico é verificada na baseline independente.

## Direitos e pendências

Nenhum artwork foi registrado como asset de terceiros em `rights.assets`. Todos os direitos, assets, pendências, status, reviews e autorizações permanecem inalterados. Persistem as pendências editoriais já existentes, incluindo revisão especializada, revisão técnica, revisão de pesquisa e autorização final antes de qualquer publicação.

## Limitações

- A integração visual nas interfaces não pertence a esta fase.
- O template `timeline` ainda recebe eventos serializados como strings na adaptação atual; a evolução para `year`/`label` separados permanece em V.3.4.
- A identificação `Representação editorial do Sinaliza` ainda pode exigir ajuste de composição no rodapé bibliográfico em V.3.4.
- A validação estrutural não substitui revisão factual humana.
