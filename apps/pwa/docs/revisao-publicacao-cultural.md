# Revisão e publicação do catálogo cultural

Documento técnico-editorial da fundação implementada na fase D.2.1 (26/11/2026). A área Explorar ainda não possui rotas públicas; este documento descreve o contrato e a guarda de publicação preparados para fases posteriores.

## 1. Separação entre editorial e público

O catálogo editorial completo fica em `src/data/cultural-catalog.ts` e é tratado como dado server-side. Ele contém candidatos, afirmações, fontes incompletas, relações ainda não verificadas, pendências internas, revisões e autorizações.

A superfície pública nunca deve consumir esse registro cru. O módulo `src/data/cultural-publication.ts` deriva uma projeção pública por allowlist, contendo somente campos necessários à apresentação. A fachada server-side fica em `src/data/cultural-public.ts`.

O catálogo editorial e a fachada importam `server-only`. No Next.js, isso gera erro de build quando um Client Component entra no grafo de importação desses módulos. A proteção não depende apenas de convenção. Os módulos de tipos/validação e o módulo puro de publicação permanecem sem essa marca quando apropriado, para permitir testes e reuso controlado.

A projeção pública remove:

- rascunhos e registros não elegíveis;
- pendências e notas internas;
- benchmarks;
- nomes de revisores e registros de autorização;
- evidências privadas de permissão;
- metadados não estruturados ainda não verificados;
- relações semânticas não verificadas;
- relações cujos destinos também não sejam publicáveis.

Componentes client-side devem receber DTOs públicos já projetados. Não devem importar `cultural-catalog.ts`.

## 2. Versão editorial

Cada registro tem `version`. A migração D.2 usa `candidate-1` como versão técnica inicial, sem afirmar revisão ou aprovação.

Qualquer mudança substantiva em conteúdo editorial, afirmações, fontes usadas como evidência, relações, direitos ou materiais de terceiros exige nova versão. Revisões e autorização final só são válidas quando seu campo `version` coincide exatamente com a versão atual do registro.

Além da versão, revisões e autorização carregam `contentFingerprint`: um SHA-256 determinístico do conteúdo editorial revisado, calculado por serialização estável. O fingerprint inclui identidade, slug, categoria, título, resumo, conteúdo específico, referências, afirmações, direitos/assets e relações. Ele exclui somente campos de fluxo: versão, status, revisões, autorização e pendências internas.

Essa regra torna invalidação efetiva mesmo quando alguém altera o conteúdo e esquece de incrementar a versão: revisões e autorização antigas deixam de corresponder ao fingerprint atual. O fingerprint não substitui revisão humana nem prova veracidade; ele apenas vincula a decisão humana ao material exato revisado.

## 3. Cadeia obrigatória

A publicação exige, nesta ordem:

1. `research` — pesquisa e checagem documental;
2. `technical` — integridade técnica, contrato, direitos e implementação;
3. `expert` — validação especializada de fatos, terminologia, representatividade e adequação;
4. autorização final de publicação — decisão documentada do responsável pelo projeto, sem substituir nenhuma revisão.

As três revisões precisam ser válidas, cobrir a versão atual e aparecer na ordem do ciclo de vida. A autorização final também precisa cobrir a mesma versão e ter escopo `public-web`.

O predicado não reconhece publicação por booleano. O campo `publishable` do seed original não foi migrado como mecanismo de autorização.

## 4. Outras condições fail-closed

Além da cadeia de revisão, `isCulturalPublishable` exige:

- categoria pública válida (`history`, `curiosity`, `personality` ou `library`);
- conteúdo específico da categoria estruturalmente completo;
- ao menos uma afirmação rastreável;
- toda afirmação associada a referência;
- referências com instituição, finalidade, URL HTTPS e data de consulta;
- nenhuma pendência editorial interna aberta;
- relações publicadas com semântica, evidência e destino publicável;
- direitos compatíveis com o uso pretendido;
- nenhum asset público sem evidência de permissão e redistribuição.

Relações são enriquecimento opcional. Relações candidatas ou sem evidência são omitidas da projeção e não impedem a publicação de uma ficha independente aprovada. Uma relação só aparece publicamente quando tiver semântica verificada, evidência e destino também publicável.

A validação estrutural de uma referência não comprova sua veracidade. Ela apenas impede publicação por omissão de metadados; a verificação factual permanece humana.

## 5. Direitos de utilização

`external-link-only` permite apenas direcionar o usuário para fontes externas legítimas. Não autoriza copiar PDFs, hospedar vídeos, incorporar imagens/players, reproduzir capas, usar retratos ou extrair conteúdo de dicionários.

Registros com assets precisam usar modo de direitos compatível e cada asset precisa de fonte, licença, evidência de permissão, evidência de publicação/redistribuição e escopo público. Assets `local-review` nunca são elegíveis à projeção pública.

## 6. Estado da migração D.2

Os 35 registros reais migrados permanecem bloqueados porque:

- estão em `draft`;
- não têm revisões;
- não têm autorização final;
- possuem pendências internas;
- suas fontes preservam apenas URL, sem metadados completos;
- suas relações foram preservadas como candidatas não verificadas;
- os registros de biblioteca possuem metadados estruturados desconhecidos.

Nenhum registro cultural real foi promovido ou publicado nesta fase.
