# Plano de implementação
Prazo 30/11/2026 23h59. Priorizar jornada principal, deploy e vídeo acima da estante.
1. Auditoria read-only: branch/base, rotas, catálogo, guards, testes, deploy, arquitetura de preview e regras de publicação. Não assumir caminhos.
2. Documentação e contratos: IDs únicos, fontes por afirmação, revisão versionada, direitos independentes, relações válidas; seed candidato fora do bundle público. Não confiar em boolean publishable vindo do seed. Reutilizar predicado central fail-closed.
3. P0: rotas Explorar e quatro categorias, grade e ficha, fallback, links externos verificados. Renderizar somente registros aprovados pelo processo existente. Não publicar benchmark interno.
4. P1: busca, filtros, relações entre registros publicáveis, estante CSS 3D se P0 estável. P2: WebGL, favoritos, contribuições e dataset.
5. Testes: duplicatas, fontes ausentes, revisão incompleta/obsoleta, direitos ausentes, acesso direto, busca e relações sem vazamento, build/lint/test, mobile/desktop, teclado e reduced motion. Verificar artefatos públicos e rede. Não alterar Supabase sem necessidade aprovada.
6. Entrega: relatório de arquivos, testes executados, limitações, itens bloqueados, screenshots de preview; pedir autorização antes de commit/push/PR/deploy. Não prometer publicação de 35 fichas até revisão.
