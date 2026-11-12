# Sinaliza — Escopo do Produto (MVP)

Documento de escopo para o MVP da plataforma de aprendizagem, com prazo final em **30 de novembro de 2026** (HackBrasil 2026). Complementa a [Visão do Produto](product-overview.md) com decisões concretas de escopo e priorização.

## 1. Escopo do MVP

| Funcionalidade | Prioridade | Observações |
|---|---|---|
| Autenticação (cadastro, login, logout, sessão) | Alta | Supabase Auth; rotas protegidas. |
| Perfil do estudante | Alta | Nome de exibição, XP, streak, progresso. Coletar apenas o necessário. |
| Dashboard educacional | Alta | Progresso atual, ação de "continuar", trilhas disponíveis, objetivo diário, XP/streak, conquistas recentes. Deve guiar para a próxima ação, não apenas exibir estatísticas. |
| Estrutura de aprendizagem | Alta | Trilha → módulos → lições → exercícios. Conteúdo inicial: alfabeto manual e vocabulário básico. |
| Experiência de lição | Alta | Objetivos claros, demonstrações visuais, explicações passo a passo, exercícios, indicadores de progresso, feedback de conclusão. Lições curtas. |
| Exercícios interativos | Alta | Múltipla escolha, associação imagem→resposta, reconhecimento de vocabulário e alfabeto, perguntas e respostas. Avaliação confiável com feedback significativo. |
| Progresso persistente | Alta | Lições/exercícios concluídos, resultados, XP, conquistas, streak. Progresso não pode se perder ao recarregar. |
| Gamificação | Média | XP, streak, conquistas, indicadores de progresso. Evitar leaderboards complexos salvo benefício claro. |
| PWA (manifest, ícones, service worker, offline básico) | Alta | Prioridade: instalabilidade, shell cacheado e acesso a conteúdo previamente armazenado. Sincronização de progresso offline somente se couber no prazo e puder ser testada com segurança. |
| Prática com câmera (experimental) | Média/Baixa | Diferencial experimental; nunca bloquear a plataforma central. |

## 2. Conteúdo educacional inicial

- **Alfabeto manual de Libras.**
- **Vocabulário básico** por categorias: saudações, apresentações, expressões cotidianas, família, números, objetos comuns, perguntas básicas.

Regras de conteúdo:

- Não inventar sinais ou descrições sem referências confiáveis.
- Não reutilizar material educacional protegido por direitos autorais sem permissão.
- Marcar explicitamente conteúdo que depende de validação por especialista.
- Qualidade pedagógica acima de quantidade de lições.

## 3. Fora de escopo para o MVP

- Tradutor universal ou reconhecimento completo de Libras.
- Interpretação de expressões faciais, movimentos corporais, gramática ou contexto linguístico.
- Leaderboards complexos.
- Backend dedicado separado (ex.: NestJS) — usar Next.js + Supabase.
- Sincronização offline sofisticada — apenas o básico confiável.

## 4. Limites de honestidade técnica

- Visão computacional é **assistência experimental de aprendizagem**: detecção de mão, 21 landmarks, extração de características geométricas e comparação com exemplos de referência validados.
- Uma comparação geométrica bem-sucedida **não** significa compreensão linguística do sinal.
- Nunca apresentar pontuação de confiança experimental como precisão linguística.
- A experiência educacional deve ser completamente utilizável sem câmera.

## 5. Prioridades de desenvolvimento (fases)

| Fase | Conteúdo |
|---|---|
| 0 — Fundação | Auditoria do repositório, AGENTS.md, estrutura do PWA, Supabase, variáveis de ambiente, migrações, testes, preservação da landing. |
| 1 — Plataforma central | Autenticação, perfil, dashboard, trilhas, módulos, lições, persistência. |
| 2 — Experiência educacional | Alfabeto, vocabulário, conteúdo visual, exercícios, feedback, progresso. |
| 3 — Gamificação | XP, streak, conquistas, visualização de progresso. |
| 4 — Visão computacional | MediaPipe no navegador, landmarks, comparação experimental, feedback visual. |
| 5 — Entrega | Instalação PWA, offline, acessibilidade, responsividade, testes, performance, deploy de produção, preparação da demo. |

As fases podem ser reorganizadas por dependências técnicas; mudanças significativas devem ser explicadas.

## 6. Critérios de pronto para o hackathon

- Jornada de aprendizagem completa e coerente de ponta a ponta.
- Progresso persistido e demonstrável entre sessões.
- Interface polida, responsiva e acessível, fiel à identidade visual.
- PWA instalável com comportamento offline básico verificado.
- Recurso experimental de câmera apresentado com limitações honestas.
- Landing page existente intacta e publicada.
