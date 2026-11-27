# Contrato editorial cultural — leitura do PR #73

Relatório de leitura do contrato definitivo implementado no PR #73 para apoiar a preparação externa do pacote editorial D.2.2. Este documento não altera o contrato.

## 1. Arquivos do contrato

| Caminho | Papel |
|---|---|
| `src/data/cultural-catalog-model.ts` | Tipos editoriais, enums, validação estrutural e cadeia de revisões. Não contém dados. |
| `src/data/cultural-publication.ts` | Fingerprint, bloqueadores de publicação, predicado fail-closed e projeção pública allowlistada. Não contém dados. |
| `src/data/cultural-catalog.ts` | Registro editorial real migrado do pacote D.2; server-only; todos os registros reais são candidatos não publicáveis neste estágio. |
| `src/data/cultural-public.ts` | Fachada server-only de leitura pública; única entrada permitida para páginas e interface. |
| `src/data/cultural-publication.test.ts` | Testes do predicado, fingerprint, cadeia de revisões, direitos e projeção. |
| `src/data/cultural-server-isolation.test.ts` | Teste de isolamento server-only dos dados e da fachada. |

## 2. Categorias e enums

### Categorias culturais

`CULTURAL_CATEGORIES`:

- `history`
- `curiosity`
- `personality`
- `library`

### Estados de validação

`CulturalValidationStatus`, em ordem de ciclo editorial:

1. `draft`
2. `research-reviewed`
3. `technical-reviewed`
4. `expert-validated`

A cadeia exigida é derivada por `REQUIRED_CULTURAL_REVIEWS`:

- `draft`: nenhuma revisão exigida estruturalmente.
- `research-reviewed`: `research`.
- `technical-reviewed`: `research`, `technical`.
- `expert-validated`: `research`, `technical`, `expert`.

Para publicação, as três revisões precisam existir nessa ordem, ser válidas, cobrir a versão editorial atual e cobrir o fingerprint atual do conteúdo.

### Tipos de revisão

`CulturalReview.type`:

- `research`
- `technical`
- `expert`

### Relações culturais

`CulturalRelationKind`:

- `unverified-candidate` — interno; nunca projetado publicamente.
- `theme`
- `person`
- `work`
- `historical-context`
- `source`

### Assets e direitos

`CulturalAssetKind`:

- `image`
- `video`
- `document`
- `cover`
- `audio`
- `embed`

`CulturalAssetRights.scope`:

- `public`
- `local-review`

`CulturalRights.mode`:

- `external-link-only`
- `no-third-party-assets`
- `licensed-assets`
- `mixed`

### Formatos da biblioteca

`LibraryFormat`:

- `book`
- `children-literature`
- `dictionary`
- `audiovisual-series`
- `academic-study`
- `historical-facsimile`
- `website`
- `other`

### Modalidades de acesso da biblioteca

`LibraryAccess`:

- `open-digital`
- `institutional-digital`
- `commercial`
- `physical`
- `external-website`
- `unavailable`
- `other`

## 3. Estrutura comum de um registro editorial

Todos os registros compartilham `CulturalEntryBase`:

| Campo | Obrigatório | Observação |
|---|---:|---|
| `id` | sim | Identificador editorial único. |
| `slug` | sim | Lowercase URL-safe: letras minúsculas, números e hífens. |
| `category` | sim | Uma das quatro categorias. |
| `title` | sim | Não vazio. |
| `summary` | sim | Não vazio. |
| `version` | sim | Versão editorial; mudanças substantivas exigem nova versão. |
| `references` | sim | Pode ser vazio em rascunho, mas publicação exige referências completas. |
| `claims` | sim | Pode ser vazio em rascunho, mas publicação exige afirmações rastreáveis. |
| `validationStatus` | sim | Estado editorial declarado; não autoriza publicação por si só. |
| `reviews` | sim | Lista de revisões; publicação exige cadeia completa. |
| `publicationAuthorization` | opcional | Ausente em candidatos; obrigatória para publicação. |
| `rights` | sim | Direitos e assets de terceiros. |
| `relatedEntries` | sim | Relações editoriais; públicas apenas com evidência e alvo publicável. |
| `internalPending` | sim | Pendências internas; precisa estar vazio para publicação e nunca é projetado. |

## 4. Referências e afirmações

### `CulturalReference`

| Campo | Obrigatório no modelo | Obrigatório para publicação | Observação |
|---|---:|---:|---|
| `id` | sim | sim | Único dentro do registro. |
| `url` | sim | sim | Precisa ser URL `https` válida. |
| `institution` | opcional | sim | Instituição ou autoria responsável. |
| `purpose` | opcional | sim | O que a fonte fundamenta. |
| `consultedAt` | opcional | sim | Data ISO `YYYY-MM-DD` válida. |

### `CulturalClaim`

| Campo | Obrigatório | Observação |
|---|---:|---|
| `id` | sim | Único dentro do registro. |
| `text` | sim | Menor unidade editorial revisável. |
| `referenceIds` | sim | IDs precisam existir em `references`; publicação exige pelo menos uma referência por afirmação. |

A migração pode preservar um resumo composto como uma única afirmação; o contrato não exige decomposição artificial.

## 5. Revisões, autorização, versão e fingerprint

### `CulturalReview`

| Campo | Obrigatório | Observação |
|---|---:|---|
| `reviewer` | sim | Não vazio. |
| `type` | sim | `research`, `technical` ou `expert`. |
| `date` | sim | Data ISO válida. |
| `version` | sim | Precisa cobrir a versão atual para publicação. |
| `contentFingerprint` | opcional no modelo | Obrigatório para publicação; SHA-256 hexadecimal de 64 caracteres. |
| `notes` | opcional | Não influencia fingerprint. |

### `CulturalPublicationAuthorization`

| Campo | Obrigatório | Observação |
|---|---:|---|
| `authorizer` | sim quando presente | Não vazio. |
| `date` | sim quando presente | Data ISO válida; não pode ser anterior à revisão mais recente da versão atual. |
| `version` | sim quando presente | Precisa ser igual à versão editorial atual. |
| `contentFingerprint` | opcional no modelo | Obrigatório para publicação e precisa ser igual ao fingerprint atual. |
| `scope` | sim quando presente | Somente `public-web`. |
| `notes` | opcional | Metadado editorial interno. |

### Fingerprint

`getCulturalContentFingerprint(entry)` produz SHA-256 determinístico do conteúdo editorial. Campos de workflow são excluídos:

- `version`
- `validationStatus`
- `reviews`
- `publicationAuthorization`
- `internalPending`

O fingerprint muda quando conteúdo substantivo muda, inclusive textos, afirmações, referências, direitos, assets, relações e metadados de categoria. Reaproveitar revisões ou autorizações após alteração substantiva falha na publicação.

## 6. Relações culturais

`CulturalRelation`:

| Campo | Obrigatório | Observação |
|---|---:|---|
| `targetId` | sim | Precisa existir no catálogo quando o catálogo completo é validado; não pode ser autorrelação. |
| `kind` | sim | Tipo da relação. |
| `evidenceReferenceIds` | sim | IDs precisam existir nas referências do registro de origem. |
| `internalNote` | opcional | Interno; nunca projetado. |

Na projeção pública, uma relação aparece apenas quando:

1. `kind` não é `unverified-candidate`;
2. há pelo menos uma referência de evidência;
3. o alvo também é publicável.

A projeção contém apenas `targetId` e `kind`; cabe à interface resolver o alvo novamente pela fachada pública.

## 7. Direitos e permissões

`CulturalRights` controla uso de material de terceiros independentemente da validação editorial.

`external-link-only` e `no-third-party-assets` não podem declarar assets. Quando o modo permite assets (`licensed-assets` ou `mixed`), cada asset precisa, para publicação:

- `source` preenchido;
- `license` preenchido;
- `permissionEvidence` preenchido;
- `publicationEvidence` preenchido;
- `scope` igual a `public`.

Campos adicionais de `CulturalAssetRights`:

| Campo | Observação |
|---|---|
| `id` | Obrigatório e único no registro. |
| `kind` | Tipo do asset. |
| `sourceUrl` | Opcional; quando presente precisa ser HTTPS válido. |
| `licenseUrl` | Opcional; quando presente precisa ser HTTPS válido. |
| `restrictions` | Opcional. |

`external-link-only` permite linkar para material externo, mas não copiar, hospedar, embutir ou reproduzir material de terceiros.

## 8. Campos por categoria

### História — `CulturalHistoryEntry`

`history`:

| Campo | Obrigatório no modelo | Para publicação |
|---|---:|---|
| `year` | opcional | `year` ou `dateLabel` precisa existir. |
| `dateLabel` | opcional | `year` ou `dateLabel` precisa existir. |
| `context` | opcional | opcional. |
| `unknownMetadata` | sim | Lista controlada de campos desconhecidos: `year`, `dateLabel`, `context`. |

`year`, quando presente, precisa ser inteiro não negativo.

### Curiosidades — `CulturalCuriosityEntry`

`curiosity`:

| Campo | Obrigatório | Observação |
|---|---:|---|
| `question` | sim | Não vazio. |
| `shortAnswer` | sim | Não vazio. |
| `deepening` | opcional | Aprofundamento textual. |

### Personalidades — `CulturalPersonalityEntry`

`personality`:

| Campo | Obrigatório | Observação |
|---|---:|---|
| `personName` | sim | Não vazio. |
| `biographicalSummary` | sim | Não vazio. |
| `contributions` | opcional | Lista textual de contribuições. |

O contrato público atual não projeta retrato ou asset de personalidade. Portanto a interface usa fallback tipográfico; não há campo público autorizado de imagem neste estágio.

### Biblioteca — `CulturalLibraryEntry`

`library`:

| Campo | Obrigatório no modelo | Para publicação |
|---|---:|---|
| `creators` | opcional | obrigatório com pelo menos um criador não vazio. |
| `publicationYear` | opcional | opcional; inteiro não negativo quando presente. |
| `publisher` | opcional | opcional. |
| `format` | opcional | obrigatório. |
| `access` | opcional | obrigatório. |
| `languages` | opcional | obrigatório com pelo menos um idioma não vazio. |
| `unknownMetadata` | sim | Não pode marcar `creators`, `format`, `access` ou `languages` como desconhecidos em um registro publicável. |
| `unstructuredMetadata` | opcional | Interno/editorial; não é projetado publicamente. |

`LibraryMetadataKey` controla os campos que podem ser marcados como desconhecidos:

- `creators`
- `publicationYear`
- `publisher`
- `format`
- `access`
- `languages`

## 9. Projeção pública

`projectPublicCulturalEntries` primeiro filtra registros com `isCulturalPublishable` e depois projeta apenas campos allowlistados.

Campos públicos comuns:

- `id`
- `slug`
- `category`
- `title`
- `summary`
- `references` públicas (`institution`, `url`, `purpose`, `consultedAt`)
- `relatedEntries` públicas (`targetId`, `kind`)
- metadados específicos da categoria

Ficam fora da projeção:

- `validationStatus`
- `reviews` e revisores
- `publicationAuthorization` e autorizador
- `rights`, evidências de permissão e assets
- `claims`
- `internalPending`
- `internalNote`
- `unstructuredMetadata`
- relações `unverified-candidate`
- relações sem evidência
- relações para registros não publicáveis

## 10. Regras de publicação efetivas

Um registro só é publicável quando não há nenhum bloqueador em `getCulturalPublicationBlockers`. Em resumo:

1. Estrutura válida por `validateCulturalEntry`.
2. Categoria pertencente à taxonomia pública.
3. `validationStatus` igual a `expert-validated`.
4. Revisões `research`, `technical`, `expert` válidas, em ordem, na versão atual e no fingerprint atual.
5. Autorização final presente, completa, em `public-web`, na versão atual, no fingerprint atual e não anterior às revisões.
6. `internalPending` vazio.
7. Pelo menos uma referência completa.
8. Pelo menos uma afirmação rastreável e nenhuma afirmação sem referência.
9. Conteúdo mínimo da categoria completo.
10. Direitos de assets completos e escopo público quando houver assets.

Não existe booleano manual de publicação. Injetar `publishable: true` no objeto não altera o resultado.

## 11. Exemplo sintético de candidato estruturalmente válido

Este exemplo é fictício, não representa fato cultural real e **não** é publicável. Não contém revisões nem autorização fictícias.

```ts
import type { CulturalHistoryEntry } from "@/data/cultural-catalog-model";

export const syntheticCandidate: CulturalHistoryEntry = {
  id: "SYNTH-HIST-001",
  slug: "marco-historico-sintetico",
  category: "history",
  title: "Marco histórico sintético",
  summary: "Resumo editorial fictício usado somente para demonstrar a estrutura do contrato.",
  version: "candidate-1",
  references: [
    {
      id: "source-1",
      url: "https://example.org/fonte-sintetica",
    },
  ],
  claims: [
    {
      id: "claim-1",
      text: "Afirmação fictícia vinculada à fonte sintética.",
      referenceIds: ["source-1"],
    },
  ],
  validationStatus: "draft",
  reviews: [],
  rights: {
    mode: "external-link-only",
    assets: [],
  },
  relatedEntries: [],
  internalPending: [
    "Substituir por fonte real e completar revisão editorial antes de qualquer publicação.",
  ],
  history: {
    year: 2000,
    unknownMetadata: [],
  },
};
```

O exemplo passa na validação estrutural de rascunho, mas falha na publicação porque não possui cadeia de revisões, autorização final, referências completas de publicação e porque contém pendência interna.

## 12. Limitações estruturais identificadas

1. **Conteúdo longo ausente da projeção pública:** o DTO público tem `summary` e metadados por categoria, mas não um campo de corpo editorial longo. A página de detalhes, portanto, não deve inventar conteúdo corrido.
2. **Retratos de personalidades não projetados:** embora exista contrato de rights/assets no registro editorial, a projeção pública atual não expõe retrato autorizado. A interface precisa usar fallback tipográfico até que uma decisão contratual explícita projete mídia autorizada.
3. **Links externos específicos da biblioteca:** referências públicas existem, mas não há campo bibliográfico separado para URL de acesso à obra. A interface pode linkar referências, sem transformar isso em modalidade de acesso.
4. **Categoria/tema bibliográfico:** o contrato tem `format`, `access`, idiomas e autoria, mas não um campo público de assunto/tema. Filtros por “categoria” bibliográfica não são suportados sem ampliação contratual; filtros implementáveis são formato e acesso.
5. **Ordenação de datas imprecisas:** o contrato aceita `year` ou `dateLabel`. Sem um formato estruturado de período, a interface pode ordenar com segurança por `year`; datas textuais sem ano exigem decisão editorial futura se precisarem de ordenação fina.
