# Supabase — banco de dados do Sinaliza

Infraestrutura de migrações versionadas para o projeto Supabase do Sinaliza
(ref `rrkyugefpydskajfilws`, PostgreSQL 17, us-east-1).

## Regras

- Toda alteração de schema acontece **somente** por migrações versionadas em
  `supabase/migrations/` — nunca edições ad-hoc no dashboard (ver AGENTS.md §10).
- Nenhuma chave secreta (`sb_secret_*`, service_role, tokens de acesso) é
  comitada neste repositório. Autenticação do CLI é pessoal de cada dev/owner.
- RLS permanece habilitado em toda tabela; dados pessoais/de progresso são
  isolados por `auth.uid()` (ver AGENTS.md §12 e ADR 0004).

## Estrutura

```text
supabase/
├── config.toml      # Configuração gerada por `supabase init` (stack local)
├── migrations/      # Migrações versionadas — <timestamp>_<nome>.sql
├── tests/           # Suítes pgTAP (`npx supabase test db`, stack local)
├── verification/    # Checks somente-leitura pós-deploy (SQL Editor)
└── seed/            # Dados de desenvolvimento (quando houver)
```

## Fluxo de trabalho

```bash
# Uma vez: autenticação pessoal do Supabase CLI (token do próprio usuário)
npx supabase login

# Vincular ao projeto hospedado (executado pelo owner ou por quem tiver acesso)
npx supabase link --project-ref rrkyugefpydskajfilws

# Criar uma nova migração (arquivo vazio, timestamp automático)
npx supabase migration new <nome_da_migracao>

# Aplicar migrações pendentes ao projeto vinculado — sempre a partir dos
# arquivos versionados, nunca SQL manual no dashboard
npx supabase db push
```

Desenvolvimento local opcional com stack completa (`npx supabase start`)
requer Docker; não é necessário para o fluxo de migrações acima.

## Testes de banco (pgTAP)

```bash
npx supabase start      # stack local completa (requer Docker)
npx supabase test db    # roda supabase/tests/*.test.sql
```

As suítes rodam dentro de uma transação revertida ao final — nunca deixam
dados de teste no banco. A stack local não inclui a extensão
`supabase_test_helpers`: as fixtures inserem em `auth.users` diretamente e
simulam chamadas autenticadas com as mesmas GUCs que o PostgREST define
(`role` + `request.jwt.claim.sub`, lidas por `auth.uid()`).

## Verificação pós-deploy

Após `db push` no projeto hospedado, rode
`supabase/verification/rls-checks.sql` no SQL Editor: são consultas
somente-leitura que conferem flags de RLS, policies, grants de tabela e de
coluna, o trigger e a exposição de schemas — cada query indica o resultado
esperado. Para validação comportamental completa (isolamento entre usuários,
acesso anônimo, idempotência), a suíte pgTAP é a fonte de verdade; ela também
pode rodar contra o projeto vinculado com `npx supabase test db --remote`,
desde que executada conscientemente (insere usuários de teste que a transação
reverte).

## Rollback

Migrações `db push` não têm down-migrations automáticas. Para reverter a
migração `20261117152227_profiles_and_lesson_completions` no projeto
hospedado, execute no SQL Editor (remove profiles, completions e o trigger):

```sql
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists private.handle_new_user();
drop trigger if exists profiles_updated_at on public.profiles;
drop table if exists public.lesson_completions;
drop table if exists public.profiles;
drop schema if exists private;
```

Depois marque a migração como revertida no histórico remoto:

```bash
npx supabase migration repair --status reverted 20261117152227
```

ATENÇÃO: o `drop` destrói os dados das tabelas — para o schema inicial isso é
aceitável (ainda sem dados de produção), mas confirme antes de executar.
