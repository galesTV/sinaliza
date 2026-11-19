# Validação hospedada de RLS — bateria E.4

- **Data:** 2026-11-19
- **Escopo:** `public.profiles` e `public.lesson_completions` no Supabase hospedado
- **Natureza:** validação funcional dos controles de acesso nos cenários testados. Este documento **não** declara o banco "completamente seguro" e **não** constitui um pentest.

## 1. Objetivo e escopo

Verificar, no ambiente hospedado, os controles de acesso esperados pelo
modelo de dados do Sinaliza (ver `docs/architecture.md` e ADR 0004):

- `public.profiles`: cada usuário lê apenas o próprio perfil; sem DELETE
  para `authenticated`.
- `public.lesson_completions`: SELECT e INSERT restritos ao próprio
  usuário (`auth.uid()`); append-only — sem UPDATE/DELETE para
  `authenticated`; a coluna `completed_at` não pode ser fornecida pelo
  cliente (permissão de coluna + `default now()`).

A bateria E.4 exercitou esses controles com duas contas descartáveis
criadas para o teste, identificadas por variáveis de ambiente
(`SINALIZA_RLS_TEST_UID_A` / `SINALIZA_RLS_TEST_UID_B`).

## 2. Ambiente e metodologia

- Verificador: script PowerShell `hosted-rls-verify-utf8.ps1` (mantido
  fora do repositório), compatível com Windows PowerShell 5.1.
- Acesso: chave **publishable** (`sb_publishable_...`) + login por e-mail
  das duas contas de teste — exatamente o privilégio de um cliente real.
  Nenhuma chave secreta foi usada.
- Controles do próprio verificador, relevantes para confiar nos resultados:
  - cinco pré-condições *fail-closed* antes de qualquer escrita (sign-in
    das duas contas, identidades distintas, leitura do próprio perfil por
    cada conta);
  - *preflight* confirmando a inexistência de todas as chaves de teste;
  - manifesto de recuperação persistido antes da primeira escrita, com
    SQL de auditoria e plano de cleanup embutidos;
  - toda escrita confirmada (ou refutada) por GET de verificação com
    correspondência exata do par `(user_id, lesson_key)` — HTTP 2xx nunca
    é aceito como prova;
  - `SAFETY HALT` global: qualquer resultado inconclusivo, anomalia de
    persistência ou falha de integridade bloqueia todas as escritas
    subsequentes (exit code não-zero) e preserva as leituras de auditoria;
  - nenhum DELETE automático — cleanup é sempre manual e auditado.

## 3. Resultados por fase

| Fase | Conteúdo | Run ID | Resultado | Exit |
|---|---|---|---|---|
| E.4.0 | Hardening offline (SelfTest, 149 assertions) | — | 149/149 em Windows PS 5.1 e Linux pwsh 7.4.6; halt com exit não-zero | 0 |
| E.4.1 | Somente leitura, hospedado | `ecbb4260` | 9 PASS / 0 FAIL / 1 SKIP | 0 |
| E.4.2 | Inserções próprias | `0eabe768` | 14 PASS / 0 FAIL / 2 SKIP | 0 |
| E.4.3 | Tentativas negativas | `1bcfc033` | 18 PASS / 0 FAIL / 5 SKIP | 0 |
| E.4.4 | Suíte integrada | `80415461` | 27 PASS / 0 FAIL / 1 SKIP | 0 |

## 4. Evidências dos controles

**RLS (row level security)**

- Isolamento de perfis: cada conta lê somente o próprio perfil; leitura
  cruzada retorna vazio (E.4.1).
- Acesso anônimo (sem `Authorization`) negado nas duas tabelas (E.4.1).
- INSERT cruzado — conta A inserindo conclusão com `user_id` de B —
  rejeitado por RLS (E.4.3, E.4.4).
- Inserção de perfil com `id` arbitrário novo e com `id` de B rejeitadas
  por RLS `WITH CHECK` / mecanismo de permissão (E.4.3).
- Leitura cruzada de `lesson_completions` retorna zero linhas mesmo com
  linha da outra conta existente (E.4.2, E.4.4).

**Constraint de unicidade**

- Duplicata de `(user_id, lesson_key)` rejeitada com HTTP 409 + código
  PostgreSQL `23505`, confirmada por GET com exatamente uma linha (E.4.2,
  E.4.4).
- INSERT idempotente (`on_conflict`, `resolution=ignore-duplicates`) não
  produz duplicatas (E.4.2, E.4.4).

**GRANT / permissões de coluna**

- UPDATE e DELETE em `lesson_completions` rejeitados (ausência de grant,
  incluindo tentativa cruzada de B sobre linha de A) (E.4.3, E.4.4).
- DELETE em `profiles` rejeitado (E.4.3).
- INSERT fornecendo `completed_at` rejeitado por permissão de coluna. Isso
  confirma que o cliente autenticado não pode fornecer esse campo no INSERT
  testado; nas inserções permitidas, aplica-se o valor padrão
  (`default now()`) definido pelo banco (E.4.3).
- Integridade da linha de A preservada após as tentativas de UPDATE/DELETE
  de B (comparação de snapshots `user_id`, `lesson_key`, `completed_at`)
  (E.4.4).

## 5. SKIPs e limitações

| Fase | SKIPs | Motivo |
|---|---|---|
| E.4.1 | 1 | Conta A sem registros em `lesson_completions` — leitura cruzada sem conclusão conclusiva naquele run (coberta depois em E.4.2/E.4.4). |
| E.4.2 | 2 | Probes dependentes de estado não exercitados naquela configuração de flags. |
| E.4.3 | 5 | Probes que exigem linha descartável de A criada por `-IncludeOwnedInsertTests`, e teste de UPDATE cruzado de perfil B desativado intencionalmente para preservar a integridade do perfil de teste durante a bateria. |
| E.4.4 | 1 | UPDATE cruzado do perfil de B não executado intencionalmente. |

Limitações gerais:

- A validação cobre os cenários acima; não prova ausência de outras
  rotas de acesso (ex.: funções `security definer`, outras policies,
  tabelas fora do escopo).
- Não houve teste de carga, fuzzing ou exploração — é verificação
  funcional de políticas, não pentest.
- O probe de UPDATE cross-user em `profiles` permanece desativado para
  preservar a integridade do perfil de teste durante a bateria.
- Resultados refletem as policies/migrations aplicadas na data do teste;
  mudanças futuras de schema exigem nova execução.

## 6. Recuperação e cleanup

- Cada execução gerou manifesto local de recuperação contendo run_id,
  identificadores de chaves de teste, linhas persistidas confirmadas,
  alertas de auditoria e o SQL de auditoria/cleanup — suficiente para
  reconstruir o plano mesmo com o processo interrompido.
- Antes do cleanup, a auditoria SQL confirmou exatamente **quatro
  registros de teste** e nenhum perfil fictício.
- O cleanup foi executado **manualmente**, de forma transacional, no SQL
  Editor do Supabase, apenas sobre os pares `(user_id, lesson_key)`
  gerados pelas execuções — nenhum DELETE automático.
- Auditoria pós-cleanup: **zero registros** entre as 15 chaves geradas
  nas três execuções de escrita.
- Manifestos preservados localmente, fora do repositório.

## 7. Riscos residuais e recomendações

- Reexecutar a bateria após qualquer migration que toque `profiles`,
  `lesson_completions` ou policies/grants relacionados.
- Estender a bateria quando novas tabelas de dados pessoais (XP, streak,
  conquistas, resultados de exercícios) entrarem em produção — o modelo
  de verificação já é parametrizado por chaves descartáveis.
- Avaliar, em mudança futura de policies de `profiles`, ativar o probe
  de UPDATE cruzado apenas com dados 100% descartáveis.
- Manter o verificador e seus manifestos fora do versionamento: embora
  sem segredos, eles revelam padrões de chaves de teste.
