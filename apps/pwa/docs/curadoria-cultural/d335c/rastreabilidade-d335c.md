# Rastreabilidade D.3.5-C — classificação documental controlada

Documento de rastreabilidade da classificação editorial estrutural autorizada em D.3.5-C. **Não registra revisão humana, aprovação factual, autorização final ou publicação.** Os pacotes V2/V2.1, D.3.4-B e D.3.4-B.1 permanecem imutáveis.

## Escopo

Somente `BIB-004` e `BIB-011` foram classificadas como candidatas ao caminho documental. `BIB-010` permanece integralmente inalterada no caminho especializado legado. Os outros 38 registros também permanecem fora de escopo.

## Matriz de transição

| Registro | Versão antes → depois | Fingerprint antes → depois | SHA-256 do corpo antes/depois | Bloqueadores atuais |
|---|---|---|---|---|
| `BIB-004` | `candidate-6` → `candidate-7` | `9e0f708972ba6074453c31b01dfac14c26aafd4ff1cfb3e9d02bf2079332e1de` → `7691c13bffb1a0bd6aed49556cf8a5521a50581ca72d84fb377d6a4dccaec805` | `dce0f4b58b7182edc1c6e0b45e5be7753eb446d5efe95577a8ceea649b8ff5a9` → `dce0f4b58b7182edc1c6e0b45e5be7753eb446d5efe95577a8ceea649b8ff5a9` | `entry has not completed documentary validation`; `missing final publication authorization` |
| `BIB-011` | `candidate-5` → `candidate-6` | `07fbd3ef34b7410f7a83efacf539515249b5abf994aa1bf433d48c82e2fe4cc7` → `fa76434ad3aae44de26500d20f5c78a447d6963c62373c199efbca776cfa3e79` | `5dd9f7abca37cf371906267123adf8aeadc5cfb60f52f75440a36b68277f3b61` → `5dd9f7abca37cf371906267123adf8aeadc5cfb60f52f75440a36b68277f3b61` | `entry has not completed documentary validation`; `missing final publication authorization` |

## Políticas adicionadas

### BIB-004 — Literatura em Libras

- Caminho: `documentary`
- Classe: `bibliographic-descriptive`
- Justificativa: Ficha estritamente bibliográfica: apresenta autoria, crédito de tradução, edição, editora, idiomas, modalidades de acesso e descrição sumária da obra apoiados em documentação institucional, ficha técnica, apresentação e sumário. Não ensina Libras, não realiza análise literária independente, não avalia pedagogicamente a obra e não valida linguisticamente o conteúdo.
- Claims cobertas: `claim-1`, `BIB-004-C01`, `BIB-004-C02`, `BIB-004-C03`, `BIB-004-C04`, `BIB-004-C05`
- Superfícies cobertas: `identity`, `title`, `summary`, `claims`, `references`, `libraryMetadata`, `relatedEntries`, `editorialBody`

### BIB-011 — Contação de Histórias

- Caminho: `documentary`
- Classe: `bibliographic-descriptive`
- Justificativa: Ficha estritamente documental sobre série audiovisual institucional: descreve natureza, responsabilidade institucional, finalidade declarada e modalidade de acesso conforme fontes oficiais. Não avalia eficácia, não analisa linguisticamente os episódios e não afirma verificação integral ou disponibilidade permanente.
- Claims cobertas: `claim-1`, `BIB-011-C01`, `BIB-011-C02`, `BIB-011-C03`, `BIB-011-C04`
- Superfícies cobertas: `identity`, `title`, `summary`, `claims`, `references`, `libraryMetadata`, `relatedEntries`, `editorialBody`

## Diff editorial permitido

As únicas alterações nos registros reais foram:

1. incremento de `version`;
2. adição de `reviewPolicy`.

Título, slug, resumo, corpo, claims, referências, metadados, relações, direitos, assets, artwork, pendências, status, reviews e autorização permanecem inalterados. Ambas continuam `draft`, sem reviews e sem autorização.

## Validação estrutural

- `validateCulturalEntry`: zero problemas nas duas fichas.
- Política documental estruturalmente consistente nas duas fichas.
- Projeção pública real: vazia.
- Nenhum registro real é publicável.

## Preservação histórica

O validador D.3.5-C compara o estado atual com uma materialização independente do estado pós-D.3.4-B, permitindo somente política + incremento de versão nas duas fichas. A validação D.3.4-B passa a operar sobre a camada reconstruída pré-D.3.5-C, sem reescrever baselines nem mascarar alterações de conteúdo.
