# Revisão do processo de publicação de lições

Análise do fluxo `draft → research-reviewed → technical-reviewed →
expert-validated` realizada na Fase 4 (18/11/2026), para verificar se uma
lição pode ser publicada apenas por alteração manual de `status`.

## Como o fluxo funciona hoje

1. **Catálogo** (`src/data/lesson-catalog.ts`): cada lição tem
   `validationStatus`, `version` e `reviews[]`. `isPublishable(entry)`
   exige `expert-validated` **e** a cadeia completa de revisões
   (pesquisa + técnica + especialista) sobre a **versão atual** do
   conteúdo, além de rascunho bem-formado.
2. **Conteúdo publicado** (`src/data/lesson-content.ts`): o registro
   `lessonContents` só deve receber material de lições publicáveis —
   hoje está vazio.
3. **Trilha** (`src/data/learning-paths.ts`): `Lesson.status`
   (`"planned" | "available"`) controla o que a página da lição renderiza.
4. **Progresso**: `LessonRunner` só recebe `lessonKey` (e portanto só
   grava progresso) quando `LessonContentArea` renderiza conteúdo
   publicado; as rotas de laboratório nunca passam `lessonKey`.
5. **Guarda nos testes** (`lesson-catalog.test.ts` /
   `lesson-content.test.ts`): falham se conteúdo não validado entrar em
   `lessonContents`, se uma lição publicada não tiver entrada de catálogo
   publicável, ou se o rascunho de uma entrada não validada vazar para o
   registro publicado.
6. **Versionamento**: uma revisão só vale enquanto `review.version`
   coincide com `entry.version` — editar o rascunho e incrementar a
   versão invalida revisões anteriores automaticamente.

## O que uma alteração manual isolada provoca

| Alteração manual | Efeito real |
|---|---|
| `Lesson.status` → `"available"`, sem conteúdo em `lessonContents` | A página mostra o aviso honesto "Conteúdo indisponível no momento"; nenhum rascunho aparece e **nenhum progresso é registrado**. Não publica nada. |
| Conteúdo adicionado a `lessonContents` sem entrada `expert-validated` | **Barrido pelos testes** de segurança de publicação. |
| `validationStatus` → `"expert-validated"` sem revisões | `validateCatalogEntry` falha (cadeia obrigatória); `isPublishable` retorna `false`; testes falham. |
| Revisões antigas reaproveitadas após edição do rascunho | `review.version !== entry.version` → inválidas; testes falham. |

## Risco residual identificado

**A guarda existe apenas na suíte de testes, não em tempo de execução.**
`LessonContentArea` renderiza qualquer `lessonContents[key]` para uma
lição `"available"` sem consultar o catálogo em runtime. Se alguém
commitar conteúdo não validado + status `available` e os testes não
rodarem (ou forem removidos), o material chega à trilha sem nenhuma
barreira estrutural.

**Avaliação:** hoje a barreira é suficiente porque os testes rodam em todo
PR — mas a integridade da publicação depende integralmente deles.

**Correção mínima proposta (não aplicada — aguardando decisão):**
fazer `LessonContentArea` renderizar o conteúdo somente quando
`isPublishable(getCatalogEntry(key))` for verdadeiro, reutilizando a
regra já existente. São ~5 linhas e nenhuma mudança de modelo de dados;
o aviso honesto atual cobre o caso de lição `available` sem publicação
legítima. Alternativa equivalente: um assert no build/CI já garantido
pelos testes atuais — nesse caso, documentar no AGENTS.md que a suíte de
testes é parte do mecanismo de publicação.

## Conclusão

Não foi encontrada falha que permita publicar conteúdo não validado sem
que os testes falhem. O fluxo está correto e o versionamento impede o
reuso indevido de revisões. O risco residual é de arquitetura (guarda só
em teste), documentado acima com uma correção mínima opcional — nenhuma
regra foi flexibilizada.
