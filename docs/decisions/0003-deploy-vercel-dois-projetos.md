# ADR 0003 — Deploy: dois projetos Vercel (landing e PWA)

- **Data:** 2026-11-12
- **Status:** Proposta — aguardando aprovação

## Contexto

A landing já está publicada na Vercel (`https://sinaliza-eta.vercel.app/`) com Root Directory `apps/landing`. O PWA precisa de deploy próprio sem arriscar a landing.

## Decisão

Criar um **segundo projeto na Vercel** para `apps/pwa`, com Root Directory `apps/pwa`. Dois projetos, dois deploys independentes, mesma origem no GitHub.

## Alternativas consideradas

- **Monorepo com projeto único/rewrites:** exigiria tooling de workspace e rewrites entre apps — mais complexo e arriscado para a landing existente.
- **Domínio único com subpath:** possível via rewrites, mas acrescenta acoplamento e risco sem necessidade no MVP.

## Consequências

- Nenhuma alteração na configuração do projeto da landing.
- Domínio do PWA a definir pelo owner (ex.: `app.sinaliza...` ou subdomínio Vercel).
- Variáveis de ambiente do PWA são configuradas no projeto Vercel do PWA, não no da landing.
