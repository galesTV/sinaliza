# Curadoria cultural — pacote D.2

Documentação de trabalho da área Explorar. Este material **não é conteúdo aprovado para publicação**.

Pacote original recebido em 26/11/2026: `sinaliza-curadoria-D2.zip`

SHA-256 do pacote original: `3ca8a06a4adfd3c6a84b269dfb5368bd5354edb36b75eaa90be45a7a55663feb`

SHA-256 do `catalogo-candidato.json` original: `8852ec6801f24266bcfdc2e139e0f9c129bead5f36e8dc33ccd48dc81e31a89c`

## Organização

### Curadoria cultural V2

Em `v2/`: preservação documental do pacote `sinaliza-curadoria-V2.zip`, com os artefatos originais, manifesto SHA-256, auditoria D.2.3-A e orientações de integração incremental. O material continua interno, intermediário e sem autorização de publicação; não é catálogo runtime.

### Registros culturais candidatos — 35

Em `registros-candidatos/`:

- `historia.md` — 8 candidatos HIST;
- `curiosidades.md` — 8 candidatos CUR;
- `personalidades.md` — 7 candidatos PER;
- `biblioteca.md` — 12 candidatos BIB.

Os textos foram preservados como recebidos. A conversão editorial tipada fica em `src/data/cultural-catalog.ts`, com todos os registros ainda bloqueados para publicação.

### Benchmarks internos — 9

Em `benchmarks/benchmark-internacional.md`.

Benchmarks são documentação interna de pesquisa. Eles não fazem parte da taxonomia pública, do contrato cultural runtime nem de qualquer projeção pública.

### Backlog bibliográfico complementar — 9

Em `backlog/referencias-bibliograficas-complementares.md`.

São pistas editoriais sem metadados/fontes suficientes. Não foram promovidas a registros completos e não entram no catálogo runtime.

### Evidências

Em `evidencias/`:

- `matriz-evidencias.md` — matriz original, com 44/44 registros marcados como bloqueados e sem evidência de revisão registrada;
- `catalogo-candidato.json` — seed original preservado para rastreabilidade, incluindo os 9 benchmarks internos.

O JSON original não é contrato runtime. O campo `publishable` do seed não é autorização e não foi migrado como mecanismo de publicação.

### Governança editorial

Em `governanca/`:

- `direitos-e-permissoes.md`;
- `revisao-especializada.md`;
- `especificacao-ux.md`;
- `plano-implementacao.md`.

## Estado editorial em 26/11/2026

- Nenhum registro cultural real tem revisão de pesquisa, técnica ou especializada registrada.
- Nenhum registro cultural real tem autorização final de publicação.
- Nenhum asset de terceiro tem autorização de reprodução registrada.
- A estratégia permitida é somente links externos legítimos, após validação editorial.
- Não há evidência que autorize apresentar a professora Fernanda como revisora destes conteúdos.

## Regra operacional

A implementação técnica deve permanecer fail-closed: qualquer lacuna de conteúdo, revisão, autorização ou direitos mantém o registro indisponível. Lacunas factuais não devem ser preenchidas por inferência.
