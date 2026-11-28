# Revisão técnica — BIB-004 — Literatura em Libras

**Modelo vazio. Nenhuma decisão está preenchida.** A revisão técnica humana deve conferir contrato, direitos, integridade, cobertura documental e superfície pública. As evidências automatizadas abaixo não são aprovação humana.

## Identificação obrigatória

- ID: `BIB-004`
- Versão: `candidate-7`
- Fingerprint: `7691c13bffb1a0bd6aed49556cf8a5521a50581ca72d84fb377d6a4dccaec805`
- SHA-256 do corpo: `dce0f4b58b7182edc1c6e0b45e5be7753eb446d5efe95577a8ceea649b8ff5a9`

## Evidências automatizadas atuais

| Item | Resultado real |
|---|---|
| Validação estrutural `validateCulturalEntry` | zero problemas |
| Categoria | `library` |
| Política | `documentary` / `bibliographic-descriptive` |
| Cobertura de claims | exata, sem IDs ausentes/duplicados/desconhecidos |
| Cobertura de superfícies | exata: `identity`, `title`, `summary`, `claims`, `references`, `libraryMetadata`, `relatedEntries`, `editorialBody` |
| Direitos | `external-link-only` |
| Assets | `[]` |
| Artwork | ausente |
| Pendências internas | `[]` |
| Estado editorial | `draft` |
| Reviews | `[]` |
| Autorização final | ausente |
| Bloqueadores reais | `entry has not completed documentary validation`; `missing final publication authorization` |
| Projeção pública real | vazia |

## DTO público previsto se um dia aprovado

Campos permitidos: `id`, `slug`, `title`, `summary`, `editorialBody.paragraphs`, referências públicas (`institution`, `url`, `purpose`, `consultedAt`), metadados bibliográficos estruturados e relações verificadas somente quando o destino também for publicável. No estado atual, nenhuma relação candidata aparece publicamente.

## Campos internos protegidos

`reviewPolicy`, justificativa de elegibilidade, claims internas, `claimIds`, status, reviews, autorização, fingerprints, direitos detalhados, pendências, metadados desconhecidos/não estruturados e evidências internas não entram no DTO público.

## Auditoria de revisões duplicadas/superseded

- O contrato trata reviews como evidência positiva; não existe tipo de rejeição/invalidação.
- Duplicatas ou reviews antigas não substituem a cadeia exigida: research/technical precisam existir, ser válidas, cobrir a versão atual e corresponder ao fingerprint.
- A ordenação usa a primeira review válida de cada tipo exigido; reviews extras não apagam uma cadeia válida anterior.
- Uma review posterior conflitante não tem representação formal de conflito/rejeição e pode não invalidar automaticamente uma anterior.
- A autorização é bloqueada se anterior à data da última review de tipo exigido na mesma versão, mas datas têm granularidade de dia; reviews posteriores no mesmo dia exigem auditoria operacional.
- Conclusão para esta fase: não há risco imediato porque não existem reviews registradas, mas antes de importar qualquer parecer humano deve-se verificar manualmente duplicatas, substituição e coerência temporal. Se houver conflito real, não importar/autorizar sem decisão explícita de governança.

## Decisão humana — vazia

- Revisor(a): ______________________________
- Data ISO: ______________________________
- Confirma elegibilidade estrutural documental? ☐ sim ☐ não ☐ pendente
- Confirma direitos/ausência de mídia? ☐ sim ☐ não ☐ pendente
- Confirma integridade versão/fingerprint? ☐ sim ☐ não ☐ pendente
- Independência/concentração de funções declarada: ______________________________
- Observações: ______________________________
