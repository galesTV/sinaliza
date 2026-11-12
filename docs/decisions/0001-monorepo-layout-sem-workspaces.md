# ADR 0001 — Monorepo por diretórios, sem ferramenta de workspaces

- **Data:** 2026-11-12
- **Status:** Aceita (proposta — aguardando confirmação do owner)

## Contexto

O briefing propõe `apps/landing`, `apps/pwa`, `packages/shared` e `supabase/` em um monorepo. A inspeção mostrou que o repositório já usa a convenção `apps/` + `docs/`, mas **não** possui `package.json` raiz, npm workspaces, pnpm ou Turborepo — `apps/landing` é um pacote npm standalone com seu próprio `package-lock.json`, e o deploy na Vercel usa `apps/landing` como Root Directory.

## Decisão

Manter o monorepo **apenas como organização de diretórios**: cada app em `apps/` permanece standalone (próprio `package.json` e lockfile). Não adicionar workspaces nem Turborepo neste momento. `packages/shared` só será criado quando houver código real compartilhado entre apps.

## Alternativas consideradas

- **npm workspaces na raiz:** facilitaria `packages/shared`, mas mudaria o fluxo de instalação/build da landing e adicionaria risco ao deploy existente na Vercel — custo alto para um benefício ainda inexistente.
- **Turborepo:** overhead de configuração desproporcional para um hackathon com duas aplicações.

## Consequências

- `apps/pwa` será criado como app Next.js standalone com as mesmas versões da landing (Next 16.4.5, React 19.3, Tailwind 4).
- Deploys independentes na Vercel: um projeto por app, cada um com seu Root Directory.
- Design tokens/componentes serão duplicados inicialmente; extração para `packages/shared` será reavaliada quando o compartilhamento real existir (ver ADR 0003).
- Se workspaces forem adicionados no futuro, registrar novo ADR e validar o deploy da landing antes de aplicar.
