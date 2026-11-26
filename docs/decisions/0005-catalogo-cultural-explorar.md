# ADR 0005 — Catálogo cultural local e fail-closed para Explorar

- **Data:** 2026-11-26
- **Status:** Aprovada — decisões J1–J7 registradas na autorização D.2.1

## Contexto

A área Explorar precisa apresentar conteúdo cultural sem enfraquecer as regras de revisão, direitos e proteção de rascunhos do Sinaliza. O pacote D.2 contém pesquisa candidata, mas nenhum registro tem revisão ou autorização documentada. O prazo do hackathon também impede introduzir CMS, backend ou migração de banco sem necessidade.

## Decisão

1. Usar catálogo local tipado na PWA, sem Supabase, CMS ou backend adicional no MVP.
2. Manter o registro editorial completo server-side e expor somente uma projeção pública por allowlist.
3. Exigir publicação derivada, nunca controlada por booleano: conteúdo completo, fontes estruturadas, revisões de pesquisa/técnica/especialista na versão atual, autorização final documentada na mesma versão e direitos compatíveis.
4. Exigir autorização final de publicação como etapa independente da revisão especializada, registrada pelo responsável pelo projeto após as revisões obrigatórias.
5. Não criar rotas públicas de preview para rascunhos culturais no MVP.
6. Excluir benchmarks da taxonomia pública e manter referências complementares como backlog editorial.
7. Não implementar estante, busca, filtros, rotas ou navegação na fase de fundação.

## Alternativas consideradas

- **Supabase/CMS imediato:** adicionaria provisionamento, modelagem, credenciais e migrações sem resolver a lacuna editorial — rejeitado para o MVP.
- **Copiar o JSON candidato diretamente para a UI:** exporia dados incompletos, pendências e benchmarks — rejeitado.
- **Publicação por campo `publishable`:** não comprova revisão, versão, direitos ou autorização — rejeitado.
- **Prévias públicas como no laboratório pedagógico:** não atende à regra específica de Explorar, que proíbe acesso direto a rascunhos no MVP — rejeitado.

## Consequências

- O catálogo real pode funcionar corretamente com zero registros publicáveis.
- A implementação pública posterior deve consumir somente DTOs projetados; o catálogo cru e a fachada pública usam `server-only`, fazendo importação indevida por Client Component falhar no build.
- Editar conteúdo editorial exige nova versão; revisões/autorizações também carregam fingerprint SHA-256 do material revisado e deixam de valer se o conteúdo mudar mesmo sem incremento manual da versão.
- Nenhum asset de terceiros entra no MVP sem evidência específica de permissão e redistribuição.
- A extração de primitivas compartilhadas com o catálogo pedagógico fica para depois, evitando alterar mecanismos em uso pela jornada principal.
