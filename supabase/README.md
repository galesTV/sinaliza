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
