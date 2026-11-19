# Mídia educacional nas lições

Guia para referenciar um ativo de mídia licenciado e validado dentro de uma
lição. Este documento descreve **apenas a infraestrutura** — nenhum conteúdo
pedagógico deve ser publicado antes da validação linguística e pedagógica.

## Modelo

Todo passo de mídia é um `LessonMediaBlock` em `src/data/lesson-content.ts`:

```ts
{
  kind: "media",
  title: "Demonstração do sinal da letra A",   // título acessível (obrigatório)
  description: "A mão forma um punho com o polegar ...", // texto que se sustenta sem o vídeo (obrigatório)
  media: {
    type: "video",                       // ou "image"
    src: "/media/alfabeto/letras-a-e/letra-a.mp4",
    poster: "/media/alfabeto/letras-a-e/letra-a.jpg", // opcional
    captions: {                          // opcional, WebVTT
      src: "/media/alfabeto/letras-a-e/letra-a.pt-BR.vtt",
      srclang: "pt-BR",
      label: "Português",
    },
  },
  attribution: {                         // sempre obrigatório
    source: "Nome do autor/instituição",
    sourceUrl: "https://...",            // opcional
    license: "CC BY 4.0",                // obrigatório — nunca omita
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    permissionEvidence: "URL/ID do registro de autorização", // obrigatório para exibir
  },
}
```

Para imagens, `media` é `{ type: "image", src, alt }` — o `alt` é obrigatório
e validado.

## Gate de exibição (fail-closed)

`hasMediaDisplayPermission(attribution)` em `lesson-content.ts` decide se um
ativo pode ser renderizado: exige `source`, `license` **e**
`permissionEvidence` não vazios. `LessonMedia` aplica o gate em todo
render — lições publicadas **e** prévias de rascunho passam pelo mesmo
componente, então a prévia nunca contorna a regra. Sem evidência, o ativo
não aparece: um painel honesto "em produção" substitui a mídia, mantendo
descrição e atribuição visíveis.

**Limite do gate:** ele verifica que uma evidência foi *registrada*, não que
ela é juridicamente válida. Uma string não vazia não prova licença — a
revisão humana (pesquisa → técnica → especialista) é quem confere que a
evidência referenciada autoriza de fato o uso. O gate existe para impedir
publicação por omissão, não para certificar direitos.

## Mídia em exercícios

`LessonExercise` aceita mídia opcional em dois pontos, ambos cobertos pelo
mesmo gate. `promptMedia` aceita imagem ou vídeo; `option.media` é
restrita a **imagens** (tipo e validação estrutural rejeitam vídeo — uma
miniatura de vídeo dentro de uma opção de resposta não tem forma
acessível honesta). Quando alternativas exibem imagens, os créditos
(fonte + licença) aparecem em texto discreto abaixo das opções.

```ts
{
  kind: "exercise",
  exercise: {
    prompt: "Qual letra está sendo demonstrada?",
    promptMedia: { media: {...}, attribution: {...} }, // estímulo (opcional)
    options: [
      { label: "Imagem 1", feedback: "...", media: { media, attribution } },
      { label: "Imagem 2", feedback: "...", media: { media, attribution } },
    ],
    correctIndex: 1,
    explanation: "...",
    descriptionVariant: { /* ver abaixo */ },          // opcional
  },
}
```

**Regra central:** um exercício cujo estímulo/opção não pode ser exibido
**não é respondível** — o aluno nunca adivinha um estímulo oculto. O
bloqueio tem duas camadas distintas:

- **Validação do runner:** `select` recusa a resposta quando a permissão
  registrada falha (`isExerciseVisuallyPermitted`) — a metade estática,
  verificável nos dados.
- **Bloqueio da interface:** falhas de carregamento em tempo de execução
  são tratadas pelo componente, que desativa as opções — o runner não
  enxerga falhas de rede.

### Alternativa por descrição

`descriptionVariant` é a modalidade textual de um exercício visual: enunciado,
opções e gabarito próprios (`selectVariant` pontua contra
`variant.correctIndex`). Ela é oferecida quando o estímulo não pode ser
exibido — e o aluno pode optar por ela mesmo com a mídia visível. A interface
rotula a variante como avaliação **por descrição**, não identificação visual;
equivalência pedagógica só poderá ser afirmada após validação especializada.
A variante é sempre só texto (mídia dentro dela é erro de validação).

## Exercícios de demonstração

`/laboratorio/licao-visual` (`visualExerciseDemo`) exercita os quatro caminhos
com formas geométricas sintéticas: estímulo autorizado, opções com imagem,
estímulo sem permissão → variante, e arquivo ausente → variante.
`/laboratorio/licao-visual-bloqueada` (`blockedExerciseDemo`) mostra um
exercício sem alternativa que permanece bloqueado.

## Testes E2E

`npm run test:e2e` (Playwright, `@playwright/test`) roda `e2e/visual-lessons.spec.ts`
em dois projetos — desktop e viewport móvel ~390px — cobrindo: fluxo de
exercícios textuais, bloqueio de mídia sem permissão, bloqueio de exercício
sem estímulo, exercícios com fixtures locais, navegação por teclado e
ausência de registro de progresso em prévias. O servidor de dev sobe
sozinho na porta 3100.

## Organização sugerida dos ativos

Ativos locais ficam sob `apps/pwa/public/media/<trilha>/<modulo>/`:

```
public/media/alfabeto/letras-a-e/
├── letra-a.mp4        # vídeo (H.264 em .mp4, +faststart)
├── letra-a.jpg        # poster 16:9
└── letra-a.pt-BR.vtt  # legendas
```

Ativos de teste/fixture ficam em `public/media/fixtures/` e jamais entram
em lições reais.

## Convenções WebVTT

- Arquivo `.vtt` UTF-8 começando com `WEBVTT`.
- Timestamps `MM:SS.mmm --> MM:SS.mmm`.
- `srclang` em BCP-47 (`pt-BR`), `label` como aparece no menu do player
  (ex.: "Português").
- A trilha é carregada como `<track kind="captions">` e ativada por padrão.

## Regras de validação

`validateLessonContent(content)` (exportada de `lesson-content.ts`) retorna a
lista de problemas de um material. O teste do registry aplica essas regras a
toda entrada de `lessonContents`, portanto **metadados obrigatórios ausentes
não passam em silêncio**: título, descrição, `src`, `attribution.source`,
`attribution.license`, `alt` (imagem) e campos de legenda são verificados.

## Atribuição e permissão

**Uma URL pública não implica permissão de reuso.** Antes de referenciar um
ativo externo, verifique:

1. A licença explicitamente declarada pela fonte (página do ativo, termos de
   uso). Prefira produção própria ou licenças abertas verificáveis (CC BY,
   CC BY-SA). Evite "sem licença informada".
2. Os termos exigidos (atribuição, share-alike, não-comercial) — registre-os
   em `attribution.license`/`licenseUrl`.
3. Direito de imagem de pessoas filmadas — sinais de Libras precisam de
   intérprete/ator com autorização.

Em caso de dúvida, **não use o ativo** e registre a pendência.

## Como testar uma lição antes de publicar

1. Adicione a entrada em `lessonContents` e rode `npx vitest run
   src/data/lesson-content.test.ts` — a validação de integridade roda sobre
   toda entrada.
2. Suba `npm run dev` e abra a lição (preview antes de mudar `status` para
   `"available"`): confira poster, legendas, descrição, atribuição e o
   estado de erro (renomeie o `src` temporariamente para ver o fallback).
3. Navegue por teclado (Tab até o player e o botão Continuar) e teste em
   viewport mobile ~390px.
4. Só então mude `status` para `"available"` em `learning-paths.ts`.

## Limitações atuais

- Sem CDN/storage: ativos vivem em `public/` (decisão futura com backend).
- Player nativo do navegador — sem analytics de visualização e sem exigência
  de "assistir para avançar" (decisão consciente: mídia nunca bloqueia o
  progresso nem marca conclusão).
