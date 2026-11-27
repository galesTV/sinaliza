# Sinaliza — D.2.3-A: auditoria de integração da Curadoria Cultural V2

**Escopo:** análise somente leitura. Nenhum arquivo, branch, commit, PR, deploy, Supabase, flag, registro ou o redesign em outra sessão foi alterado.

**Data da auditoria:** 2026-11-27.

**Limite de verificação:** auditoria estrutural local. As fontes externas não foram reabertas nem reverificadas nesta sessão.

## Sumário executivo

O pacote V2 está íntegro e internamente consistente com o inventário declarado: 41 candidatos, 35 registros da base preservados, 6 novos candidatos, 14 fichas prioritárias enriquecidas, 31 afirmações atomizadas, 24 referências bibliográficas recebidas, 15 relações candidatas e 9 benchmarks internos. Não há revisões, autorizações ou registros publicáveis — estado correto e compatível com o contrato fail-closed.

A integração **não pode ser uma importação direta do JSON**. O pacote é um formato editorial intermediário sem `slug`, `category`, `version`, IDs estruturados de referência, objeto `rights`, subobjetos obrigatórios por categoria ou metadados completos de publicação. Há ainda dois URLs `http://`, uma modalidade de acesso `video` fora do enum atual, corpo editorial longo sem campo contratual e metadados bibliográficos/coleções/volumes sem representação no contrato.

Recomendação central: migrar primeiro evidências e rascunhos mínimos, sem promover metadados não verificados a fatos estruturados nem transformar pistas de relação em evidência. Extensões contratuais devem ser decididas e implementadas em PRs separados, somente após autorização.

---

## A. Estado do repositório e SHA auditado

### Repositório

- Repositório: `galesTV/sinaliza`.
- `origin/dev` local e remoto conferidos por `git ls-remote`: ambos em `16b1dd57d8fa2fac88dedd9ae09152960d982269`.
- HEAD auditado de `origin/dev`: merge do PR #74, de 2026-11-27 00:19:12 -0300.
- Fundação cultural do PR #73 entrou pelo merge `9bb6ebf40e596a0d46505c3bd66839721846ec39`.
- Commits relevantes: `59518ddfb5d297dcbec785354542d57f26aadf0a` (`feat(pwa): add cultural catalog foundation`) e `80c4c4d8724f8bc0658a5cc9deb89327599fdf6d` (`feat(pwa): harden cultural catalog isolation`).
- A auditoria usou `git archive origin/dev` extraído fora do repositório; o checkout local permaneceu intocado.

### Orientações lidas

- `AGENTS.md` raiz e `apps/pwa/AGENTS.md`.
- Pontos obrigatórios preservados: não inventar conteúdo Libras; marcar lacunas como pendentes; não expor segredos; revisão humana; documentação em português; código/contratos em inglês; mudanças pequenas; Gitflow sob controle do proprietário.

### Contrato real auditado

Arquivos analisados:

- `apps/pwa/src/data/cultural-catalog-model.ts`
- `apps/pwa/src/data/cultural-catalog.ts`
- `apps/pwa/src/data/cultural-publication.ts`
- `apps/pwa/src/data/cultural-public.ts`
- `apps/pwa/src/data/cultural-catalog.test.ts`
- `apps/pwa/src/data/cultural-publication.test.ts`
- `apps/pwa/src/data/cultural-server-isolation.test.ts`
- `docs/decisions/0005-catalogo-cultural-explorar.md`
- `apps/pwa/docs/revisao-publicacao-cultural.md`
- documentação de `apps/pwa/docs/curadoria-cultural/`

### Estado funcional do contrato em `origin/dev`

- Categorias públicas: `history`, `curiosity`, `personality`, `library`.
- Catálogo atual: 35 registros reais — 8 HIST, 8 CUR, 7 PER, 12 BIB — sem benchmarks.
- Todos os 35 são `draft`, sem revisões, sem autorização final, com pendências e com referências incompletas para publicação.
- Publicação é derivada por predicado fail-closed; booleanos não autorizam publicação.
- Revisões exigidas para publicação: `research`, `technical`, `expert`, nesta ordem, na versão e no fingerprint correntes; autorização final independente, também na versão e fingerprint correntes.
- Projeção pública é allowlistada e remove status, revisões, autorizações, direitos/evidências, claims, pendências, metadados não estruturados e relações não verificadas ou com alvo não publicável.
- `cultural-catalog.ts` e `cultural-public.ts` usam `server-only`; os módulos de modelo/publicação permanecem puros para testes.
- Não há consumidor de UI pública do catálogo neste SHA; a projeção real retorna lista vazia enquanto não houver registros aprovados.

### Testes associados

A cobertura existente verifica: contagem/categorias; ausência de benchmarks; drafts bloqueados; preservação de URLs sem inventar metadados; relações migradas como não verificadas; lacunas de biblioteca; IDs/slugs únicos; validação estrutural; fail-closed; fingerprint e invalidação; cadeia de revisões; autorização final; direitos; projeção allowlist; omitir relações sem evidência/alvo publicável; isolamento server-only.

Não executei lint/test/build porque a tarefa era exclusivamente auditoria somente leitura e nenhuma alteração foi produzida; a análise foi estática e estrutural sobre o conteúdo de `origin/dev`.

---

## B. Integridade do pacote V2

### Integridade física

- ZIP SHA-256: `8d0a9dcdae1f7778f2e15a12af2bbdd98134a79e7cebaa9e6de761ad08ee3ef5`.
- `unzip -t`: sem erros.
- 17 arquivos no ZIP.
- Manifesto contém 16 entradas — todos os arquivos exceto o próprio `manifesto-sha256.json`; os 16 hashes conferem.

### Inventário confirmado

| Item | Esperado | Auditado | Estado |
|---|---:|---:|---|
| Registros culturais candidatos | 41 | 41 | OK |
| Registros existentes preservados | 35 | 35 | OK |
| Novos candidatos | 6 | 6 | OK |
| Fichas prioritárias enriquecidas | 14 | 14 | OK |
| Afirmações individualizadas | 31 | 31 | OK |
| Referências Capovilla | 24 | 24 | OK |
| Relações culturais propostas | 15 | 15 | OK |
| Benchmarks internos | 9 | 9 | OK |
| Registros autorizados | 0 | 0 | OK |

### Distribuição dos 41 registros

- HIST: 8 (`HIST-001`–`HIST-008`)
- CUR: 8 (`CUR-001`–`CUR-008`)
- PER: 9 (`PER-001`–`PER-009`)
- BIB: 16 (`BIB-001`–`BIB-016`)

IDs são únicos, seguem o padrão esperado e são sequenciais por prefixo. Títulos não se repetem. Não há campos principais vazios.

### Coerência interna

- `baseline-b5.json` é estruturalmente idêntico aos primeiros 35 registros de `acervo-editorial.json`.
- Os objetos `original` dos 35 registros existentes correspondem ao seed D.2 e aos dados já migrados no repositório nos campos comparáveis.
- `catalogo-d2-legado.json` contém 44 itens: 35 registros culturais + 9 benchmarks; todos `candidate`, todos `external-link-only`, nenhum `publishable`.
- `acervo-editorial.md` tem 41 seções na mesma ordem dos IDs do JSON; corpos, URLs e pendências conferem com o JSON.
- As 31 afirmações incorporadas aos registros são exatamente as 31 da `matriz-afirmacoes.json`: mesmas chaves, textos, URLs, locators e estados de consulta.
- Estados de consulta das afirmações: 22 `content-checked`, 5 `located`, 4 `metadata-checked`.
- Todos os URLs das afirmações existem em `sourceUrls` do respectivo registro.
- Todos os endpoints das 15 relações existem no acervo; não há autorrelações nem pares dirigidos duplicados.
- As 24 referências Capovilla têm IDs únicos, todas `received-not-individually-reverified` e `not-established` para reuso.

### Observações estruturais relevantes

- Total de `sourceUrls`: 64 ocorrências, 47 URLs únicos. Não há duplicação dentro de um mesmo registro; repetição entre registros é esperada quando uma fonte sustenta mais de uma ficha.
- Dois URLs não são HTTPS:
  - `PER-001`: `http://tede.ufsc.br/teses/PGET0138-D.pdf`
  - `PER-009`: `http://antologia.libras.ufsc.br/files/2016/06/Tese_MACHADO_2018.pdf`
- `additionalSourceNote` é polimórfico: `null` em 31 registros, string em 6 e lista em 4. Isso é aceitável em formato intermediário, mas exige normalização antes de qualquer migração.
- `publicationAuthorized` é `false` em todos os registros; mesmo assim, esse booleano não deve ser migrado como mecanismo de autorização.
- Benchmarks e documentos de governança do pacote estão alinhados à documentação interna já presente no repositório; não pertencem à taxonomia pública.

---

## C. Comparação entre catálogo existente e pacote V2

### Preservação dos 35 existentes

A preservação está correta no nível de baseline: os 35 objetos `original` do pacote correspondem ao catálogo D.2/repo em título, resumo, fontes originais, pendência original, relações originais, status de revisão, status de direitos e não publicabilidade.

Isso significa que a V2 **não sobrescreveu a baseline**; ela adiciona uma camada editorial externa (`editorialBody`, `priority`, `claims`, `metadata`, fontes ampliadas e pendências de processo).

### Enriquecimento editorial

As 14 fichas prioritárias com `editorialBody` diferente do `summary` original são:

`HIST-001`, `HIST-006`, `HIST-008`, `CUR-001`, `CUR-002`, `CUR-006`, `PER-001`, `PER-002`, `BIB-002`, `BIB-003`, `BIB-004`, `BIB-005`, `BIB-010`, `BIB-011`.

As 31 afirmações estão distribuídas somente nessas 14 fichas. As outras 27 fichas — incluindo os 6 novos candidatos — não têm afirmações atomizadas.

### Ampliação de fontes

10 registros existentes receberam 14 URLs adicionais em relação ao seed original:

| Registro | URLs adicionais |
|---|---:|
| `CUR-002` | 2 |
| `CUR-006` | 1 |
| `CUR-007` | 1 |
| `PER-001` | 4 |
| `PER-004` | 1 |
| `PER-005` | 1 |
| `PER-006` | 1 |
| `BIB-003` | 1 |
| `BIB-004` | 1 |
| `BIB-010` | 1 |

Quatro desses registros (`CUR-007`, `PER-004`, `PER-005`, `PER-006`) não estão entre as 14 fichas prioritárias atomizadas. Em alguns casos a URL também aparece como pista em `additionalSourceNote`; portanto a lista `sourceUrls` mistura fontes verificadas em diferentes graus e fontes apenas localizadas/não examinadas integralmente.

### Metadados

- 14 registros existentes prioritários têm metadados novos.
- 4 novos BIB têm metadados novos (`BIB-013`–`BIB-016`).
- `PER-008` e `PER-009` não trazem metadados estruturados.
- Os metadados enriquecidos são úteis, mas a própria documentação os trata como recebidos/não verificados individualmente; não devem ser promovidos automaticamente a campos públicos estruturados.

### Novos candidatos

Todos estão presentes, em `draft`, sem revisões, sem autorização e como `external-link-only`:

- `PER-008` — Fernando César Capovilla
- `PER-009` — Fernanda de Araújo Machado
- `BIB-013` — Dicionário da Língua de Sinais do Brasil
- `BIB-014` — Enciclopédia da Língua de Sinais Brasileira
- `BIB-015` — Cartilha de Libras em Medicina e Saúde
- `BIB-016` — Filosofias educacionais em relação ao surdo

Todos permanecem candidatos. A orientação acadêmica recebida não equivale a revisão especializada, autorização de publicação ou permissão de reprodução.

---

## D. Compatibilidade dos campos

Classificação: **direta** = já existe no contrato; **transformação** = cabe mediante normalização sem inventar fatos; **interna** = preservável fora da projeção/runtime ou como documentação; **extensão** = depende de alteração contratual futura; **pendente** = incompleto ou não verificável nesta rodada.

| Campo V2 | Campo/contrato atual | Classe | Avaliação |
|---|---|---|---|
| `id` | `id` | direta | IDs válidos e únicos. |
| `title` | `title` | direta | Pode ser preservado. |
| `original` | nenhum campo runtime equivalente | interna | Rastreabilidade editorial; não deve virar DTO público. |
| `editorialBody` | sem campo contratual | extensão/interna | Não cabe no contrato atual. Para os 6 novos é curto e poderia ser avaliado como `summary`, mas isso exige decisão editorial. Para as 14 enriquecidas, não deve substituir `summary` automaticamente. |
| `priority` | nenhum campo | interna | Triage editorial; não pertence ao DTO público. |
| `claims[].id` | `claims[].id` | direta | IDs únicos e consistentes. |
| `claims[].text` | `claims[].text` | direta | Texto preservável como afirmação candidata. |
| `claims[].url` | `references[].url` + `claims[].referenceIds` | transformação | Exige criar IDs de referência e resolver duplicatas/HTTP. |
| `claims[].locator` | sem campo | extensão/interna | Útil para revisão; não há locator/página/trecho no contrato de referência. |
| `claims[].consultation` | sem equivalente | interna/pendente | É estado editorial (`content-checked`, `located`, `metadata-checked`), não data; **não pode virar `consultedAt`**. |
| `sourceUrls` | `references[].url` | transformação | Cabe em rascunho após normalização HTTPS e IDs; faltam `institution`, `purpose`, `consultedAt` para publicação. |
| `metadata.year` | `history.year` ou `library.publicationYear` | transformação | Depende da categoria e de verificação factual. |
| `metadata.creators` | `library.creators` | transformação/pendente | Cabe no contrato, mas só deve sair de `unknownMetadata` após verificação. |
| `metadata.publisher` | `library.publisher` | transformação/pendente | Idem. |
| `metadata.subject` | sem campo | extensão | Temas bibliográficos não existem no contrato atual. |
| `metadata.accessOptions[].mode` | `library.access` | transformação parcial | `institutional-digital` e `external-website` são compatíveis; contrato admite apenas uma modalidade. |
| `metadata.accessOptions[].url` | sem campo separado | extensão | Referências públicas não distinguem fonte de evidência e URL de acesso à obra. |
| modo `video` em `BIB-004` | `LibraryAccess` | incompatível/pendente | `video` não pertence ao enum atual. |
| `metadata.edition`, `isbn`, `pages`, `translator`, `creatorRole`, `journal`, `volume` | sem campos estruturados | extensão/interna | Metadados bibliográficos ainda não suportados. |
| `collectionVolumes`, `years`, `edition2017Isbns`, `publisherListing2026` | sem campos estruturados | extensão/interna | Exigem modelagem de coleções/volumes/edições. |
| `accessNote`, `caveat`, `extraSource` | sem campos públicos | interna | Devem permanecer como pendências/notas internas até verificação. |
| `additionalSourceNote` | `references` ou notas internas | transformação/interna | URLs podem virar candidatos de referência; textos explicativos permanecem internos. Formato precisa normalização. |
| `validationStatus: draft` | `validationStatus` | direta | Correto. |
| `reviews: []` | `reviews` | direta | Correto; não há revisões. |
| `rightsPolicy` | `rights.mode` + `assets` | transformação | `external-link-only` mapeia para `{ mode: "external-link-only", assets: [] }`. |
| `publicationAuthorized` | nenhum equivalente aceitável | incompatível | Não migrar. O contrato propositalmente rejeita booleano de publicação. |
| `pending` | `internalPending` | transformação/direta | Já é lista e pode alimentar pendências internas. |
| ausência de `slug` | `slug` obrigatório | transformação | Pode ser gerado tecnicamente a partir do título, mas precisa política aprovada e checagem de colisão. |
| ausência de `category` | `category` obrigatório | transformação | Pode ser derivado do prefixo HIST/CUR/PER/BIB. |
| ausência de `version` | `version` obrigatório | transformação | Novos registros podem iniciar como `candidate-1`; alterações nos 35 exigem nova versão, provavelmente `candidate-2`. |
| ausência de subobjeto por categoria | `history`, `curiosity`, `personality`, `library` | transformação/pendente | Precisa composição cuidadosa; não inventar perguntas, respostas, biografia ou metadados. |
| `bibliografia-capovilla[].citationAsReceived` | sem campo bibliográfico estruturado | interna/extensão | Preservar como citação interna. Não é `CulturalReference` pronta: maioria não tem URL, instituição normalizada, finalidade nem data de consulta. |
| `verification` / `reusePermission` | workflow editorial/direitos | interna | Deve permanecer interno; `not-established` impede reuso de mídia. |
| relações `origin`, `target` | `relatedEntries[].targetId` | transformação | Endpoints válidos. |
| `proposedKind` | `CulturalRelationKind` | compatível como valor enum | Todos os valores propostos existem (`work`, `historical-context`, `theme`, `source`), mas não devem ser promovidos sem evidência. |
| `meaning` | `internalNote` | transformação/interna | Pode orientar revisão, nunca projeção pública. |
| `evidenceLead` | `evidenceReferenceIds` | pendente | Não é ID de referência e nem sempre está nas fontes da origem. |
| `status: unverified-candidate` | `kind: "unverified-candidate"` | transformação correta | Estado obrigatório até verificação. |

---

## E. Findings por severidade

### Alta — impede importação direta ou exige decisão contratual

1. **JSON não importável diretamente.** Faltam campos obrigatórios do contrato (`slug`, `category`, `version`, `references` estruturadas, `rights` objeto, `relatedEntries`, subobjetos por categoria). A migração precisa ser transformacional e registro a registro.
2. **Corpo editorial longo não tem campo contratual.** Este é o principal ganho editorial das 14 fichas prioritárias, mas hoje só poderia ficar fora do runtime ou aguardar extensão/DTO explícito.
3. **Dois URLs `http://` violam a validação estrutural.** `PER-001` e `PER-009` não podem entrar no catálogo runtime com esses URLs sem correção/verificação HTTPS ou exclusão documentada.
4. **`accessOptions.mode: "video"` é inválido no enum atual.** O caso ocorre em `BIB-004`; além disso, o contrato só comporta uma modalidade `access` e não guarda URL específica de acesso.
5. **Bibliografia e metadados bibliográficos não cabem no contrato.** ISBN, edição, páginas, tradução, papel de criador, periódico, volume, coleção e relação entre edição/listagem editorial ficariam fora ou em texto não estruturado.

### Média — risco editorial ou de governança se migrado sem revisão

6. **Nenhuma referência está pronta para publicação.** O pacote não fornece instituição/autoria normalizada, finalidade e data ISO de consulta. `consultation` é um estado editorial, não uma data.
7. **Metadados estruturados do pacote continuam não verificados.** Mesmo quando cabem no contrato (`creators`, `publisher`, `year`), devem permanecer como candidatos/notas até revisão de pesquisa; caso contrário o runtime transformaria dados não verificados em fatos estruturados.
8. **As 15 relações são compatíveis com os enums, mas não com promoção automática.** Todas devem permanecer `unverified-candidate`. `evidenceLead` não é `referenceId`; 7 leads estão em `sourceUrls` da origem, 5 aparecem somente no alvo, 2 são referências bibliográficas Capovilla e 1 não consta nas fontes do acervo.
9. **Proveniência heterogênea de fontes.** ResearchGate/Academia aparecem em novos registros e algumas fontes adicionadas foram apenas localizadas ou não examinadas integralmente. Isso é aceitável como pista, não como evidência final.
10. **Os 6 novos registros não têm afirmações atomizadas.** Podem ser migrados como rascunhos estruturais, mas não há base para revisão factual individual ainda.
11. **A bibliografia recebida não é um conjunto de referências runtime.** Somente as leis trazem URL textual sem scheme e uma referência traz DOI; as demais são citações bibliográficas. Todas estão não reverificadas e sem permissão de reuso.
12. **Edições, coleções e volumes precisam de modelagem antes de deduplicação.** Não há duplicatas exatas, mas há sobreposição intencional: capítulos dentro do Novo Deit-Libras (`CAP-REF-003/010/011/024`), volumes da Enciclopédia (`CAP-REF-012`–`019`), volumes do Dicionário (`CAP-REF-020`–`022`) e versões/revisões relacionadas (`CAP-REF-006/007`). Não devem ser tratadas como duplicatas simples.

### Baixa — higiene de formato

13. **`additionalSourceNote` polimórfico** exige normalização (`null`/string/lista) antes de importação.
14. **URLs repetidos entre registros** não são erro, pois fontes podem sustentar várias fichas, mas a transformação precisa deduplicar referências dentro de cada registro e manter IDs estáveis.
15. **A descrição recebida da Lei 10.436 é imprecisa** no texto bibliográfico (“regulamenta”), algo já observado pelo próprio pacote; usar a redação correta: a lei dispõe/reconhece, e o Decreto 5.626 regulamenta.

---

## F. Pendências editoriais por registro

Pendências comuns a **todos** os 41 registros: revisão de pesquisa, revisão técnica, revisão especializada, autorização final, completar metadados de referência (`institution`, `purpose`, `consultedAt`) e resolver direitos antes de qualquer publicação. A coluna “pendência específica” reproduz a primeira pendência editorial do pacote.

| Registro | Estado no pacote | Pendência específica |
|---|---|---|
| `HIST-001` | prioritário enriquecido; 3 afirmações; metadados não verificados | Conferir cronologia 1855–1857 e Lei 939 |
| `HIST-002` | base preservada; sem afirmações atomizadas | Conferir estudo comparativo integral e direitos do fac-símile |
| `HIST-003` | base preservada; sem afirmações atomizadas | Verificar texto integral e efeitos específicos no Brasil |
| `HIST-004` | base preservada; sem afirmações atomizadas | Não apresentar como início do movimento surdo |
| `HIST-005` | base preservada; sem afirmações atomizadas | Localizar original institucional; não reproduzir trechos |
| `HIST-006` | prioritário enriquecido; 4 afirmações; metadados não verificados | Não chamar de segunda língua oficial do Brasil |
| `HIST-007` | base preservada; sem afirmações atomizadas | Distinguir texto original de legislação consolidada |
| `HIST-008` | prioritário enriquecido; 3 afirmações; metadados não verificados | Preservar condições legais e público abrangido |
| `CUR-001` | prioritário enriquecido; 2 afirmações; metadados não verificados | Não usar contagem mundial sem fonte |
| `CUR-002` | prioritário enriquecido; 3 afirmações; metadados não verificados | Exemplos gramaticais exigem revisão |
| `CUR-003` | base preservada; sem afirmações atomizadas | Não reduzir expressões a emoções; laboratório de mãos não avalia língua completa |
| `CUR-004` | base preservada; sem afirmações atomizadas | Artigo não extraído; confirmar antes de publicar exemplos |
| `CUR-005` | base preservada; sem afirmações atomizadas | Não generalizar para toda população surda ou para 2026 |
| `CUR-006` | prioritário enriquecido; 2 afirmações; metadados não verificados | Selecionar poema e autorização específica |
| `CUR-007` | base preservada; sem afirmações atomizadas | Não apresentar como obrigatório ou universal |
| `CUR-008` | base preservada; sem afirmações atomizadas | Evitar homogeneização e revisar com pessoas surdas |
| `PER-001` | prioritário enriquecido; 4 afirmações; metadados não verificados | Confirmar biografia, obras e autodeclaração em fontes primárias |
| `PER-002` | prioritário enriquecido; 1 afirmação; metadados não verificados | Confirmar trajetória e datas |
| `PER-003` | base preservada; sem afirmações atomizadas | Não inferir cargos atuais de apresentação histórica |
| `PER-004` | base preservada; sem afirmações atomizadas | Confirmar biografia e edição das obras |
| `PER-005` | base preservada; sem afirmações atomizadas | Fonte específica da biografia ainda necessária; confirmar grafia e obras |
| `PER-006` | base preservada; sem afirmações atomizadas | Confirmar trajetória e cargos em fonte institucional |
| `PER-007` | base preservada; sem afirmações atomizadas | Contextualizar matriz francesa; não inventar retrato |
| `BIB-001` | base preservada; sem afirmações atomizadas | Conferir metadados e acesso; sem autorização de mídia |
| `BIB-002` | prioritário enriquecido; 1 afirmação; metadados não verificados | Conferir metadados e acesso; sem autorização de mídia |
| `BIB-003` | prioritário enriquecido; 2 afirmações; metadados não verificados | Conferir metadados e acesso; sem autorização de mídia |
| `BIB-004` | prioritário enriquecido; 2 afirmações; metadados não verificados | Conferir metadados e acesso; sem autorização de mídia |
| `BIB-005` | prioritário enriquecido; 1 afirmação; metadados não verificados | Conferir metadados e acesso; sem autorização de mídia |
| `BIB-006` | base preservada; sem afirmações atomizadas | Conferir metadados e acesso; sem autorização de mídia |
| `BIB-007` | base preservada; sem afirmações atomizadas | Conferir metadados e acesso; sem autorização de mídia |
| `BIB-008` | base preservada; sem afirmações atomizadas | Conferir metadados e acesso; sem autorização de mídia |
| `BIB-009` | base preservada; sem afirmações atomizadas | Conferir metadados e acesso; sem autorização de mídia |
| `BIB-010` | prioritário enriquecido; 2 afirmações; metadados não verificados | Conferir metadados e acesso; sem autorização de mídia |
| `BIB-011` | prioritário enriquecido; 1 afirmação; metadados não verificados | Conferir metadados e acesso; sem autorização de mídia |
| `BIB-012` | base preservada; sem afirmações atomizadas | Conferir metadados e acesso; sem autorização de mídia |
| `PER-008` | novo candidato; sem afirmações atomizadas | Confirmar biografia institucional e contribuições individuais |
| `PER-009` | novo candidato; sem afirmações atomizadas | Confirmar biografia institucional, tese integral e direitos dos poemas |
| `BIB-013` | novo candidato; sem afirmações atomizadas; metadados não verificados | Distinguir publicação de 2017 e oferta de 2026; edição/reimpressão não confirmada |
| `BIB-014` | novo candidato; sem afirmações atomizadas; metadados não verificados | Verificar individualmente os oito volumes em fontes editoriais |
| `BIB-015` | novo candidato; sem afirmações atomizadas; metadados não verificados | Localizar fonte oficial MEC e verificar acesso |
| `BIB-016` | novo candidato; sem afirmações atomizadas; metadados não verificados | Ler texto integral e contextualizar perspectivas históricas |

---

## G. Plano de migração incremental

Princípio: nenhuma etapa publica conteúdo. Até revisão humana e autorização final explícitas, todos os registros permanecem drafts e a projeção pública deve continuar vazia.

### Etapa 0 — congelar decisões

1. Aprovar este relatório e decidir as questões da seção K.
2. Confirmar política de slugs, versionamento e tratamento de fontes HTTP.
3. Não importar o JSON diretamente.

### Etapa 1 — preservação documental da V2

1. Arquivar o pacote V2 ou seus artefatos normalizados em documentação interna de curadoria, incluindo manifesto SHA-256.
2. Manter benchmarks e bibliografia Capovilla como internos.
3. Não alterar runtime nesta etapa.

### Etapa 2 — incluir os 6 novos candidatos como drafts mínimos

1. Derivar `category` dos prefixos.
2. Gerar slugs técnicos estáveis, por exemplo:
   - `PER-008`: `fernando-cesar-capovilla`
   - `PER-009`: `fernanda-de-araujo-machado`
   - `BIB-013`: `dicionario-da-lingua-de-sinais-do-brasil`
   - `BIB-014`: `enciclopedia-da-lingua-de-sinais-brasileira`
   - `BIB-015`: `cartilha-de-libras-em-medicina-e-saude`
   - `BIB-016`: `filosofias-educacionais-em-relacao-ao-surdo`
3. Avaliar editorialmente se o `editorialBody` curto pode ser o `summary` inicial; não fazer isso automaticamente.
4. Criar referências somente com URLs HTTPS válidos. O URL HTTP de `PER-009` deve ser corrigido após verificação ou ficar apenas documentado internamente.
5. Manter `claims` vazio, `validationStatus: draft`, `reviews: []`, `rights` externo-only, `relatedEntries` vazio ou somente candidatos aprovados para migração posterior, e pendências explícitas.
6. Para `BIB-013`–`BIB-016`, manter metadados complexos em `unstructuredMetadata`/documentação interna até decisão contratual e verificação; não popular campos estruturados como fatos confirmados.
7. Versão inicial sugerida: `candidate-1` por registro novo.

### Etapa 3 — integrar afirmações e fontes das 14 fichas prioritárias

1. Criar referências estruturadas com IDs determinísticos por registro.
2. Mapear cada afirmação V2 para `claims[].referenceIds` reais.
3. Preservar `locator` e `consultation` em documentação interna ou aguardar extensão de proveniência; não converter para `consultedAt`.
4. Resolver `http://tede.ufsc.br/...` em `PER-001` antes de incluir a fonte no runtime.
5. Não substituir `summary` pelo corpo longo sem decisão editorial/contratual.
6. Incrementar a versão dos 14 registros alterados para uma nova versão editorial, por exemplo `candidate-2`, pois conteúdo/fontes/claims mudam.
7. Recalcular fingerprints somente quando o conteúdo estiver efetivamente migrado; não criar revisões ou autorizações fictícias.

### Etapa 4 — relações culturais

1. Migrar no máximo como `kind: "unverified-candidate"`, com `evidenceReferenceIds: []` e `internalNote` documentando `meaning`/`evidenceLead`.
2. Não usar `proposedKind` publicamente até revisão de evidência.
3. Não copiar automaticamente URLs do alvo para a origem somente para satisfazer o contrato; cada referência precisa fundamentar editorialmente a relação naquele registro.
4. Relações opcionais não devem bloquear fichas independentes já aprovadas, comportamento que o contrato atual já preserva.

### Etapa 5 — extensões contratuais aprovadas

Separar contrato e dados:

1. Primeiro ampliar tipos, validação, fingerprint, DTO e testes.
2. Depois migrar dados que passam a caber no contrato.
3. Toda extensão pública deve entrar na allowlist conscientemente; campos de trabalho editorial permanecem fora da projeção.

### Etapa 6 — revisão e publicação futura

1. Revisão de pesquisa por lotes pequenos.
2. Revisão técnica de contrato, direitos e implementação.
3. Revisão especializada, priorizando participação surda.
4. Autorização final separada, pelo responsável autorizado.
5. Somente então uma ficha pode se tornar publicável; relações públicas continuam condicionadas a evidência e destino publicável.

---

## H. Proposta de PRs independentes

Nenhum PR foi criado. Sequência recomendada após aprovação explícita:

| PR | Escopo | Independência/dependência |
|---|---|---|
| 1. `docs(curation): archive V2 evidence package` | Documentação interna da V2, manifesto, matriz, bibliografia, relações, direitos/revisão, sem runtime | Independente; recomendado primeiro |
| 2. `feat(pwa): add six cultural draft candidates` | Apenas `PER-008/009`, `BIB-013/014/015/016` como drafts mínimos | Depende das decisões de slug/HTTP; independente das extensões de corpo |
| 3. `feat(pwa): migrate priority cultural claims` | 31 afirmações, fontes ampliadas e pendências das 14 fichas; sem corpo longo | Depende do PR 2 apenas se relações/novos IDs forem referenciados; pode ser independente |
| 4. `feat(pwa): extend cultural editorial body contract` | Campo de corpo editorial longo, fingerprint, validação, DTO/allowlist e testes | PR contratual independente; dados só em PR posterior |
| 5. `feat(pwa): model cultural access links` | Múltiplas modalidades e URLs específicas de acesso, com enum/validação/DTO | Independente do corpo; necessário antes de migrar `accessOptions` como dado estruturado |
| 6. `feat(pwa): extend bibliographic metadata` | ISBN/edição/páginas/papel/tradução/tema e modelagem de coleção-volume | Pode aguardar decisão editorial; idealmente dividir metadados simples e coleções/volumes |
| 7. `feat(pwa): migrate candidate cultural relations` | 15 relações como `unverified-candidate`, sem evidência presumida | Depende da existência dos novos registros se todos os endpoints forem migrados |
| 8. `feat(pwa): project authorized cultural media` | Projeção pública de assets autorizados | Adiar; hoje não há mídia autorizada |
| 9. PRs editoriais futuros por lote | Revisões reais, correções e autorizações finais | Não iniciar sem evidência humana formal |

Para o MVP, os PRs 1–3 são suficientes para consolidar rascunhos. PRs 4–5 tornam-se necessários quando a UI pública de Explorar exigir páginas de detalhe ou links de acesso bibliográfico. PR 6 é necessário apenas para publicar metadados bibliográficos ricos ou coleções com precisão. PR 8 pode aguardar porque não há mídia autorizada.

---

## I. Critérios de aceitação e testes recomendados

### Critérios de migração de rascunho

- Catálogo runtime passa de 35 para 41 registros somente quando os 6 novos forem efetivamente integrados.
- Distribuição final: 8 `history`, 8 `curiosity`, 9 `personality`, 16 `library`.
- Nenhum ID `BEN-*` entra no catálogo runtime.
- IDs e slugs únicos; slugs lowercase URL-safe.
- Nenhum URL de referência usa `http://`.
- Nenhum registro sai de `draft` sem evidência real de revisão.
- Nenhum registro recebe `publicationAuthorization` fictícia.
- Nenhum booleano `publishable`/`publicationAuthorized` influencia o predicado.
- `rights` permanece `external-link-only` sem assets até haver evidência de licença/permissão.
- `internalPending` preserva pendências sem expô-las publicamente.
- Alterações nos 35 registros existentes incrementam versão editorial; novos registros começam em versão inicial própria.
- Relações migradas permanecem `unverified-candidate` até evidência revisada.

### Testes unitários recomendados

1. Contagem e distribuição: 41 total; 8/8/9/16 por categoria.
2. Seis novos IDs presentes; nenhum benchmark presente.
3. Todos os registros reais continuam não publicáveis enquanto estiverem em draft.
4. `validateCulturalCatalog(culturalCatalog)` retorna `[]` após migração estrutural.
5. Claims migradas têm IDs únicos por registro e todos os `referenceIds` resolvem.
6. Referências têm HTTPS válido; nenhum metadata de publicação é inventado.
7. Metadados desconhecidos continuam declarados em `unknownMetadata`; ausência não vira fato.
8. Fingerprint muda quando corpo, claims, fontes, relações, direitos ou metadados estendidos mudam.
9. Reviews/autorizações antigas não valem após mudança de fingerprint.
10. Projeção pública continua vazia para drafts.
11. Allowlist não vaza `editorialBody` interno, claims, pendências, locator, consultation, notas de fonte, rights, revisores, autorizador ou evidências.
12. Relações não verificadas são omitidas da projeção e não bloqueiam uma ficha independente aprovada.
13. Se houver extensão de acesso: modo inválido (`video` fora do enum, se permanecer fora) falha; múltiplos acessos são preservados; URLs exigem HTTPS.
14. Se houver coleções/volumes: não é possível confundir volume, edição e obra agregada; ISBNs de volumes não são concatenados como se fossem uma edição única.
15. Isolamento `server-only` permanece nos dados/fachada; módulos puros continuam testáveis.

### Checagens de engenharia por PR

- ESLint da PWA.
- Vitest da PWA.
- Build de produção da PWA.
- `git diff --check`.
- Se a landing for tocada acidentalmente, lint/build dela; o esperado é **não tocar** a landing nesta linha de trabalho.

---

## J. Estimativa de esforço

Estimativa técnica aproximada, excluindo reverificação documental externa e revisão humana especializada:

| Trabalho | Esforço estimado |
|---|---:|
| PR documental de evidências V2 | 0,5–1 h Devin |
| Migração dos 6 novos drafts mínimos + testes | 1–2 h Devin |
| Migração das 31 afirmações/fontes das 14 prioritárias + testes | 2–4 h Devin |
| Extensão de corpo editorial longo + DTO/fingerprint/testes | 2–4 h Devin |
| Extensão de múltiplos acessos/URLs + testes | 2–4 h Devin |
| Metadados bibliográficos estruturados simples | 2–4 h Devin |
| Modelagem de coleções/volumes/edições | 4–8 h Devin + decisão editorial |
| Migração mecânica das 15 relações como candidatas | 1–2 h Devin |
| Verificação factual das relações | depende de revisão humana |
| Revisão de fontes, direitos e especialistas | não estimável sem disponibilidade dos revisores |

A ordem não deve ser invertida: primeiro rascunho seguro, depois extensão contratual, depois dados estruturados, depois revisão/publicação.

---

## K. Decisões que exigem autorização

1. **Arquivamento da V2 no repositório:** aprovar inclusão documental e local exato.
2. **Política de slugs:** aprovar slugs propostos ou outra regra de geração.
3. **Resumo versus corpo:** decidir se o MVP público será summary-only ou se o contrato terá corpo editorial longo.
4. **Tratamento dos URLs HTTP:** verificar/corrigir para HTTPS antes de migrar, ou preservar apenas como pista interna e excluir do runtime.
5. **Metadados não verificados:** decidir se ficam somente em `unstructuredMetadata`/documentação até revisão de pesquisa ou se alguns campos podem ser estruturados como candidatos — recomendo a primeira opção.
6. **Escopo das extensões contratuais:** corpo longo, temas, múltiplos acessos/URLs, metadados bibliográficos, coleções/volumes e projeção de mídia devem ser aprovados separadamente.
7. **Modelagem bibliográfica:** decidir se coleções serão um registro agregado, registros por volume ou hierarquia explícita; não deduzir automaticamente.
8. **Acesso a obras:** decidir se a UI terá links específicos de acesso e como distinguir acesso institucional, comercial, externo e audiovisual; embeds continuam fora até revisão de termos.
9. **Uso de nomes e biografias:** confirmar fontes institucionais e revisão especializada antes de qualquer ficha de personalidade; não atribuir aprovação à professora Fernanda sem registro explícito.
10. **Promoção de relações:** cada `proposedKind` exige evidência revisada; autorizar apenas a preservação como `unverified-candidate` nesta fase.
11. **Revisão e publicação:** somente o responsável humano pode aprovar revisores, cadeia de revisão, autorização final e qualquer publicação.
12. **Implementação:** aguardando aprovação explícita antes de qualquer alteração de código, dados, branches ou PRs.

---

## Conclusão

O pacote V2 é utilizável como insumo editorial interno de alta qualidade estrutural, mas não como catálogo de produção. A base D.2 foi preservada com fidelidade; a camada nova é significativa, porém ainda incompleta para o contrato e para publicação. O caminho seguro é migrar evidências e drafts em etapas pequenas, manter tudo fail-closed, tratar metadados e relações como candidatos até revisão humana, e só então decidir extensões contratuais para apresentação pública.
