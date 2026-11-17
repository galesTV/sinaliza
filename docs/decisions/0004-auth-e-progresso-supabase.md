# ADR 0004 — Autenticação e progresso no Supabase

- **Data:** 2026-11-17
- **Status:** Proposta — decisões aprovadas pelo owner na revisão da arquitetura E.1

## Contexto

A arquitetura de integração Supabase (relatório da Fase E.1) foi revisada e
aprovada com decisões e ajustes explícitos do owner. Este ADR registra essas
decisões para que as fases de implementação (E.2+) as respeitem.

## Decisões aprovadas

- **D1 — Confirmação de e-mail ativada.** O fluxo de entrega de e-mail deve
  ser validado antes de depender dele para a demo.
- **D2 — Slugs de lições publicadas são imutáveis.** Uma vez publicada, a
  chave `trilha/modulo/lição` nunca muda; conteúdo novo recebe slug novo.
  Isso protege o `lesson_key` registrado no progresso.
- **D3 — Perfis permanecem privados.** `public.profiles` só é legível pelo
  próprio usuário via `auth.uid()`; visibilidade pública futura (rankings)
  exigirá view dedicada aprovada separadamente.
- **D4 — Progresso de convidado e de conta são isolados.** O progresso
  local de uma conta nunca é mesclado automaticamente no progresso local de
  outra. Consequências de implementação:
  - o store local usa chave por identidade: `sinaliza.progress.v1` para
    convidado e `sinaliza.progress.v1.u_<userId>` por conta autenticada;
  - mover progresso de convidado para uma conta é um processo de **claim
    explícito** (ação do usuário), nunca efeito colateral do login.
- **D5 — Supabase CLI e migrações versionadas aprovados.** Schema somente
  via `supabase/migrations/` aplicadas por `supabase db push`.
- **D6 — `display_name` obrigatório, 1–80 caracteres.**
- **D7 — Todas as rotas educacionais permanecem acessíveis sem
  autenticação.** O proxy só renova a sessão; proteção limita-se a páginas
  de conta futuras, verificada no servidor.

## Ajustes arquiteturais exigidos

1. Progresso local com escopo por conta e processo explícito de claim
   convidado→conta (D4 acima).
2. Conclusões de lição são **append-only** para usuários normais: sem
   permissões de UPDATE/DELETE para `authenticated` em
   `lesson_completions`.
3. Páginas autenticadas devem estar protegidas do cache do service worker
   **antes** de existir UI autenticada — rotas `/auth`, `/conta`, `/login`,
   `/cadastro` nunca são interceptadas pelo `sw.js`, e respostas autenticadas
   levam `Cache-Control: private, no-store`.
4. XP e streaks futuros não podem confiar em timestamps enviados pelo
   cliente: `completed_at` é gerado pelo servidor (`default now()`).

## Consequências

- `apps/pwa/src/proxy.ts` (Next.js 16) renova a sessão via `getClaims()` e é
  no-op quando o Supabase não está configurado — modo convidado preservado.
- Detecção de configuração (`getSupabaseEnv`) trata env ausente ou
  placeholder como "convidado": builds e previews funcionam sem variáveis.
- A coluna `completed_at` do servidor resolve o ajuste 4 sem custo agora e
  habilita XP/streaks retroativamente.
