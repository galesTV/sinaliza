# ADR 0002 — Backend com Supabase (sem serviço dedicado)

- **Data:** 2026-11-12
- **Status:** Proposta — aguardando aprovação

## Contexto

O MVP precisa de autenticação, persistência de perfil/progresso, e possível armazenamento de mídia. O briefing recomenda Supabase e proíbe backend desnecessário.

## Decisão

Usar **Supabase** como backend do PWA:

- PostgreSQL para dados relacionais, com migrações versionadas em `supabase/migrations/`.
- Supabase Auth para cadastro/login/sessão.
- RLS em todas as tabelas com dados de usuário.
- Supabase Storage somente quando houver necessidade real de mídia.
- Lógica de negócio em módulos dentro do app Next.js (route handlers/server actions), sem serviço separado.

## Alternativas consideradas

- **NestJS dedicado:** aumenta superfície de deploy, manutenção e tempo de implementação — descartado para o MVP.
- **Prisma + Postgres gerenciado:** adiciona camada ORM sem necessidade; Supabase já entrega Auth + DB + RLS integrados.

## Consequências

- Nomenclatura atual de chaves do Supabase: a chave **publishable** (`sb_publishable_...`, sucessora da legada `anon`) é a única que pode aparecer em variáveis `NEXT_PUBLIC_*`; chaves **secret** (`sb_secret_...`, sucessoras da `service_role`) ficam restritas ao servidor e **nunca** podem ser expostas ao navegador. As chaves legadas estão sendo descontinuadas até o fim de 2026 — código novo deve preferir a nomenclatura nova.
- Provisionamento do projeto Supabase e das variáveis de ambiente é configuração manual do owner (ver relatório de fundação).
- `.env.example` no app documentará todas as variáveis exigidas.
