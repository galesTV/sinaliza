# Rastreabilidade da preparação editorial D.3.4-B

Documento derivado da preparação controlada autorizada após a auditoria D.3.4-A. Os pacotes V2/V2.1, manifestos e rastreabilidades históricas permanecem imutáveis. Nada aqui constitui revisão humana, validação factual final, autorização de publicação, licença de mídia ou publicação.

- Base Git: `39bb0809b434dc8d8a87b9b6a67fec103635846e` (`origin/dev`, merge do PR #90).
- Branch autorizada: `feat/cultural-library-first-release-preparation`.
- Escopo: exatamente `BIB-011`, `BIB-010` e `BIB-004`.
- Corpos editoriais e claims de `BIB-011`/`BIB-010`: preservados byte a byte. Em `BIB-004`, somente as correções expressamente autorizadas em D.3.4-B.1 foram aplicadas ao resumo, à claim legada, às claims de tradução e ao corpo editorial. Relações, títulos, direitos e ausência de artwork: preservados.
- Direitos: `external-link-only`, `assets: []`, sem incorporação ou reprodução de conteúdo de terceiros.
- Estado posterior obrigatório: 41 drafts, zero reviews, zero autorizações, projeção pública vazia.

## Matriz de transição

| Registro | Versão antes → depois | Fingerprint antes → depois | SHA-256 do corpo | Bloqueadores remanescentes |
|---|---|---|---|---|
| `BIB-011` | `candidate-4` → `candidate-5` | `0dc124ea99d68531ff7a82a3cf88c176b1f865efcfbaaf5074a8ee5ff500fce0` → `07fbd3ef34b7410f7a83efacf539515249b5abf994aa1bf433d48c82e2fe4cc7` | `5dd9f7abca37cf371906267123adf8aeadc5cfb60f52f75440a36b68277f3b61` | entry has not completed expert validation; missing final publication authorization |
| `BIB-010` | `candidate-4` → `candidate-5` | `ad7a8470656e1bb992dedf1ef021823c8e9b301bd5c138c1bb780d0e9e9ac151` → `e008a09c63c23ff15fb198042e3048bce2eafda506833eac2f9daed62e69cfce` | `d88294389baca400df145fcde4d5e45985919df53a5a9ac46b8d559217f3f47a` | entry has not completed expert validation; missing final publication authorization |
| `BIB-004` | `candidate-4` → `candidate-5` → `candidate-6` | `3c88d98ae40ae4813bbb7a6b13e2cf5e5a782e231b43fe63269c15729ead7744` → `f45c33a6066374c4534ffddfd8ffdcbf956772aab846164dedc26e2dc915c8a3` → `9e0f708972ba6074453c31b01dfac14c26aafd4ff1cfb3e9d02bf2079332e1de` | `dce0f4b58b7182edc1c6e0b45e5be7753eb446d5efe95577a8ceea649b8ff5a9` | entry has not completed expert validation; missing final publication authorization |

## Natureza das alterações

- Referências incompletas foram completadas com instituição, finalidade e data real de consulta quando houve verificação direta; limitações de acesso foram documentadas explicitamente.
- Metadados bibliográficos estruturados foram preenchidos somente dentro do contrato existente. ISBN, edição, páginas, papéis autorais e múltiplos links ficaram fora do contrato e permanecem apenas documentados nos pacotes.
- `internalPending` foi esvaziado somente porque metadados/acesso foram verificados no escopo documentado e a ficha não utiliza mídia de terceiros. Não foi declarada autorização de mídia.
- Em D.3.4-B, nenhuma claim foi reescrita. Em D.3.4-B.1, somente as claims e o corpo de `BIB-004` expressamente autorizados foram corrigidos; as demais claims e corpos permanecem preservados.

## Refinamento autorizado D.3.4-B.1 de BIB-004

`candidate-5` foi estado intermediário de preparação bibliográfica e não é apresentado como versão final de `BIB-004`. Em `candidate-6`, a formulação provisória “a conferir” foi substituída por “Obra sobre literatura sinalizada, com versões em português e Libras.” no resumo e em `claim-1`. As referências da claim legada passaram de `source-1` para `source-2` e `source-3`, porque a curadoria LIBRANDO e o PDF sustentam diretamente a redação, enquanto a reverificação do handle institucional ficou limitada por validação de segurança.

O crédito foi precisado como tradução do conteúdo em Libras por Gustavo Gusmão, com base na ficha catalográfica e na ficha técnica do PDF. `BIB-004-C01`, `BIB-004-C03` e o corpo editorial foram ajustados somente nesse recorte autorizado. Não foi atribuída coautoria nem tradução do português.

C05 foi verificada pontualmente na página 5 e no sumário, páginas 7–12: a apresentação declara quatro seções sobre conceitos fundamentais, produção de narrativas e contos, elementos da linguagem estética e inter-relação entre sociedade e literatura em Libras. Não foi declarada leitura integral da obra.

`open-digital` foi interpretado como acesso digital gratuito ao conteúdo, não licença aberta de reprodução. O PDF declara direitos reservados. A UI pública atual usa o rótulo “Digital aberto” sem afirmar licença aberta; a ausência de explicação adicional foi registrada como ponto de atenção, sem alteração de UI/contrato nesta fase.

## Baseline e preservação fora de escopo

`src/test/cultural-d334b-baseline.ts` preserva integralmente os três registros autorizados no estado anterior à preparação. O mesmo arquivo registra expectativas compactas de integridade de todos os 41 registros derivadas da revisão base imutável: versão, fingerprint, status, contagem de revisões, presença/ausência de autorização e pendências internas. O validador D.3.4-B exige igualdade exata dos três estados preparados e rejeita alterações de conteúdo ou workflow nos 38 registros fora de escopo.

## Limitações de fontes

- UFSC/Repositório: a página do item de `BIB-004` exibiu validação de segurança da RedeUFSC na nova consulta; o PDF direto foi acessado para ficha catalográfica/técnica, apresentação e sumário, sem leitura integral declarada.
- SciELO: a nova tentativa para `BIB-010/source-2` retornou página de conexão segura/JavaScript; a evidência anterior V2.1 de 2026-11-27 permanece o limite documentado.
- YouTube/TV INES: a verificação de episódio foi amostral e não comprova disponibilidade integral ou permanente de todos os episódios.

## Associação de futuras respostas à versão congelada

As respostas futuras devem registrar, no mínimo: ID do registro, versão exata, fingerprint SHA-256 exato, tipo de revisão (`research`, `technical` ou `expert`), data, revisor e decisão/ressalvas. O identificador RC-1.0 do formulário existente não deve ser tratado como versão ou fingerprint. Uma implementação posterior pode adicionar um campo oculto/instrucional no formulário ou uma planilha de correspondência que vincule cada resposta ao par `(version, contentFingerprint)` antes de qualquer importação para o catálogo.
