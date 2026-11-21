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
2. **Conteúdo publicado**: a página da lição renderiza o próprio
   `entry.draft` do catálogo (Fase 13C — fonte única; o antigo registro
   `lessonContents` foi eliminado). Publicar é uma única mudança de dados:
   `status: "available"` — o material exibido é por construção a versão
   revisada.
3. **Trilha** (`src/data/learning-paths.ts`): `Lesson.status`
   (`"planned" | "available"`) controla o que a página da lição renderiza.
4. **Progresso**: `LessonRunner` só recebe `lessonKey` (e portanto só
   grava progresso) quando `LessonContentArea` renderiza conteúdo
   publicado; as rotas de laboratório nunca passam `lessonKey`.
5. **Guarda nos testes** (`lesson-catalog.test.ts` /
   `lesson-page.test.tsx`): falham se uma lição `available` não tiver
   entrada de catálogo publicável ou se uma entrada não publicável
   apoiar uma lição disponível; a identidade draft↔renderizado é
   verificada diretamente (o runner recebe `entry.draft`).
6. **Versionamento**: uma revisão só vale enquanto `review.version`
   coincide com `entry.version` — editar o rascunho e incrementar a
   versão invalida revisões anteriores automaticamente.

## O que uma alteração manual isolada provoca

| Alteração manual | Efeito real |
|---|---|
| `Lesson.status` → `"available"`, sem entrada publicável | A página mostra o aviso honesto "Conteúdo indisponível no momento"; nenhum rascunho aparece e **nenhum progresso é registrado**. Não publica nada. |
| `status` → `"available"` com entrada publicável | Publicação legítima: a página renderiza `entry.draft` — por construção a versão que a cadeia de revisões cobriu. |
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

`status: "available"` sem validação legítima é bloqueado em runtime,
mesmo que os testes não rodem. As rotas de laboratório não passam por
`LessonContentArea` e continuam exibindo rascunhos identificados, sem
`lessonKey` e sem registro de progresso.

## Riscos residuais

- **Conteúdo vs. versão revisada — resolvido (Fase 13C):** a guarda
  passou a renderizar `entry.draft` diretamente; o registro
  `lessonContents`/`getLessonContent` foi eliminado, então não existe
  segunda fonte capaz de divergir do rascunho revisado. O teste de
  identidade em `lesson-page.test.tsx` comprova que o runner recebe o
  próprio objeto `entry.draft`.
- **Páginas estáticas:** a guarda é avaliada em build; uma alteração de
  dados exige rebuild/deploy — comportamento idêntico ao de hoje.
- A suíte de testes segue como segunda barreira, agora cobrindo também
  os cenários de bloqueio da guarda em `lesson-page.test.tsx`.

## Conclusão

Não foi encontrada falha que permita publicar conteúdo não validado sem
que os testes falhem. O fluxo está correto e o versionamento impede o
reuso indevido de revisões. A guarda implementada na Fase 5 impede a
montagem do runner — e portanto a renderização e o registro de progresso
— quando a entrada de catálogo da lição não é publicável, sem
flexibilizar nenhuma regra. Desde a Fase 13C, o risco de divergência
entre conteúdo publicado e rascunho revisado está eliminado por
construção: o material renderizado é o próprio `entry.draft`.
