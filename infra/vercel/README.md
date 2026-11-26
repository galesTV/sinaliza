# Isolamento experimental de builds da landing na Vercel

Esta pasta contém uma regra experimental, fail-open, para reduzir builds desnecessários do projeto Vercel da landing em previews que não alteram nenhum input conhecido da landing.

A configuração do painel da Vercel **ainda não foi ativada**. Este diretório prepara e documenta a regra; não altera deployment, produção ou o projeto da PWA.

## Finalidade

O repositório usa uma separação por diretórios, sem workspaces npm/Turborepo. Por isso, o mecanismo nativo de monorepo da Vercel não possui uma fronteira de workspace suficiente para reconhecer que mudanças exclusivas da PWA/documentação não afetam a landing.

A regra compara o commit atual com o último deployment bem-sucedido informado pela Vercel. Ela só permite cancelar um build quando todas as proteções passam e todos os caminhos alterados são conhecidos como independentes da landing.

## Fronteira BUILD/SKIP

BUILD obrigatório:

- qualquer caminho dentro de `apps/landing/**`;
- `infra/**` e qualquer caminho novo, desconhecido ou não classificado;
- production, development, ambiente customizado, ambiente ausente, desconhecido ou contraditório;
- primeiro deployment de uma branch ou SHA anterior ausente/vazio/inválido;
- SHA atual inválido, simbólico, indisponível ou diferente do HEAD clonado;
- base igual ao commit atual, base não ancestral ou histórico insuficiente;
- falha de Git, diff vazio, diff incompleto ou leitura incompleta.

SKIP possível somente em preview positivamente identificado quando todos os caminhos alterados pertencem exclusivamente a:

- `apps/pwa/**`;
- `docs/**`;
- `supabase/**`;
- `.agents/**`;
- `README.md`;
- `AGENTS.md`.

`.gitignore` é intencionalmente tratado como BUILD: alterações nele podem influenciar a detecção automática de conteúdo do Tailwind e, portanto, o CSS gerado da landing.

Essa fronteira foi auditada no snapshot atual de `origin/dev`. Ela não é uma garantia permanente para branches futuras.

## Contrato de exit codes

O contrato do Ignored Build Step da Vercel é:

- exit `1`: continuar/buildar;
- exit `0`: cancelar o build.

O script versionado segue este contrato:

- imprime uma linha `BUILD: ...` e sai com `1` para qualquer incerteza, falha ou mudança relevante;
- imprime exatamente o token stdout `SKIP` seguido de uma única newline e sai com `0` somente para um skip válido; detalhes humanos do motivo vão para stderr e não fazem parte da confirmação.

O wrapper exige confirmação explícita: exit `0` sozinho não basta. Ele captura stdout com um sentinela que preserva newlines finais, deixa stderr fluir para os logs e só aceita SKIP quando a execução termina com exit `0` e stdout é exatamente `SKIP\n`. Qualquer stdout adicional — inclusive linha vazia final, texto sem newline final ou múltiplas confirmações — mensagem ausente, confirmação apenas em stderr, exit inesperado ou erro resulta em exit `1`.

Essa proteção evita erros acidentais e regressões simples. Ela **não** é uma fronteira de segurança contra um script deliberadamente modificado na branch: o script avaliado é conteúdo do commit em avaliação, portanto alterações futuras nele exigem revisão humana.

## Comando completo do wrapper

Este é o comando proposto para o campo Ignored Build Step do projeto da landing. Ele ainda não foi aplicado. O comando tem 254 caracteres, abaixo do limite de 256 documentado no schema oficial de `ignoreCommand`:

```bash
s=../../infra/vercel/landing-ignore-build.sh;[ "$VERCEL_ENV/$VERCEL_TARGET_ENV" = preview/preview ]&&bash -n "$s"||{ echo BUILD;exit 1;};o=$(bash $s;printf x$?);c=${o##*x};o=${o%x$c};echo "$o";[ $c = 0 ]&&[ "$o" = $'SKIP\n' ]&&exit 0;echo BUILD:$c;exit 1
```

Branches antigas sem `infra/vercel/landing-ignore-build.sh` continuam em BUILD porque `bash -n` falha ao abrir/ler o script antes da execução.

## Execução local dos testes

Na raiz do repositório:

```bash
bash -n infra/vercel/landing-ignore-build.sh
python3 -m py_compile infra/vercel/test-landing-ignore-build.py
python3 infra/vercel/test-landing-ignore-build.py
```

O harness cria repositórios Git temporários e não altera o histórico real. Ele valida previews, produção, ambientes customizados, SHAs inválidos, clone raso, force push, renames, nomes especiais, diffs incompletos, falhas de pipeline, wrapper e skips acumulados.

O teste de permissão de arquivo ilegível é reportado como `SKIPPED` quando executado por um usuário privilegiado capaz de ler arquivos com modo `000`; nesse caso, a limitação é explícita e não é contada como PASS.

## Limitação do shallow clone

A Vercel usa clone raso. `VERCEL_GIT_PREVIOUS_SHA` pode não existir como objeto no clone quando a base estiver fora da profundidade disponível. Nesse caso, a regra faz BUILD. Isso é intencional: é melhor perder economia do que ignorar uma mudança desconhecida.

A comparação correta depende da base ser o último deployment bem-sucedido e ancestral do commit atual. Force pushes ou histórico divergente fazem BUILD.

## Dependência das variáveis de sistema

A regra depende das variáveis de sistema da Vercel:

- `VERCEL_ENV`;
- `VERCEL_TARGET_ENV`;
- `VERCEL_GIT_COMMIT_SHA`;
- `VERCEL_GIT_PREVIOUS_SHA`.

Somente `VERCEL_ENV=preview` e `VERCEL_TARGET_ENV=preview` simultaneamente são elegíveis. Ambientes customizados podem ter `VERCEL_ENV=preview`, mas não são tratados como preview legítimo quando `VERCEL_TARGET_ENV` contém o nome customizado.

Se as variáveis estiverem ausentes, vazias ou inconsistentes, o resultado é BUILD.

## Revisão da fronteira

A introdução de qualquer uma das seguintes mudanças exige revisão explícita da allowlist antes de confiar em novos SKIPs:

- dependências compartilhadas entre apps;
- package/workspaces/turborepo na raiz;
- scripts ou configurações globais de build;
- imports cruzados entre `apps/landing` e outros diretórios;
- mudanças em infraestrutura de deploy;
- novos diretórios na raiz.

## Ativação controlada futura

Não executada nesta etapa. Quando houver autorização humana explícita:

1. Confirmar Root Directory `apps/landing`, branch de produção, system environment variables e acesso a arquivos fora do Root Directory.
2. Escolher janela de baixa atividade, porque a configuração é global no projeto da landing e pode afetar previews subsequentes.
3. Aplicar o wrapper somente no projeto Vercel da landing, nunca no projeto da PWA.
4. Estabelecer um primeiro deployment bem-sucedido na branch de teste.
5. Confirmar que `VERCEL_GIT_PREVIOUS_SHA` aparece corretamente no deployment seguinte.
6. Testar mudança independente: esperar SKIP.
7. Testar mudança da landing: esperar BUILD.
8. Testar caminho desconhecido: esperar BUILD.
9. Confirmar que produção e PWA permanecem sem alteração operacional.

## Rollback e recuperação

Rollback:

1. Abrir o projeto da landing na Vercel.
2. Settings → Build and Deployment → Ignored Build Step.
3. Voltar de Custom para Automatic e salvar.

Recuperação de um build necessário que tenha sido cancelado:

1. Abrir o deployment/commit afetado.
2. Usar Redeploy.
3. Desmarcar `Use project's Ignore Build Step`.
4. Confirmar o redeploy.

Não usar o projeto `sinaliza-pwa` para teste; ele permanece desconectado do GitHub e com fluxo manual inalterado.
