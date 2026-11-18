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
| Conteúdo adicionado a `lessonContents` sem entrada `expert-validated` | **Barrido em runtime** pela guarda de `LessonContentArea` (Fase 5) e pelos testes de segurança de publicação. |
| `validationStatus` → `"expert-validated"` sem revisões | `validateCatalogEntry` falha (cadeia obrigatória); `isPublishable` retorna `false`; testes falham. |
| Revisões antigas reaproveitadas após edição do rascunho | `review.version !== entry.version` → inválidas; testes falham. |

## Proteção em tempo de execução (Fase 5)

**Implementada.** `LessonContentArea` só monta o `LessonRunner` quando a
entrada de catálogo da lição existe e `isPublishable(entry)` retorna
verdadeiro — `expert-validated`, cadeia completa de revisões sobre a
versão atual do conteúdo e rascunho bem-formado. A guarda é
*fail-closed*: catálogo ausente, status sem revisões válidas e revisões
de versões anteriores caem no aviso honesto "Conteúdo indisponível no
momento". Sem o runner montado, o conteúdo não renderiza e `lessonKey` —
o único caminho que grava progresso — nunca é recebido.

Conteúdo commitado em `lessonContents` + `status: "available"` sem
validação legítima agora é bloqueado em runtime, mesmo que os testes não
rodem. As rotas de laboratório não passam por `LessonContentArea` e
continuam exibindo rascunhos identificados, sem `lessonKey` e sem
registro de progresso.

## Riscos residuais

- **Conteúdo vs. versão revisada:** a guarda comprova que a *entrada de
  catálogo* é publicável, mas não que `lessonContents[key]` é idêntico ao
  rascunho revisado — uma divergência entre os dois ainda renderizaria o
  material do registro publicado. Mitigação possível (não aplicada):
  renderizar `entry.draft` diretamente ou comparar conteúdo e versão no
  momento da renderização.
- **Páginas estáticas:** a guarda é avaliada em build; uma alteração de
  dados exige rebuild/deploy — comportamento idêntico ao de hoje.
- A suíte de testes segue como segunda barreira, agora cobrindo também
  os cenários de bloqueio da guarda em `lesson-page.test.tsx`.

## Conclusão

Não foi encontrada falha que permita publicar conteúdo não validado sem
que os testes falhem. O fluxo está correto e o versionamento impede o
reuso indevido de revisões. O risco arquitetural identificado na Fase 4 —
guarda existente apenas em teste — foi corrigido na Fase 5 com a proteção
em runtime descrita acima, sem flexibilizar nenhuma regra.
