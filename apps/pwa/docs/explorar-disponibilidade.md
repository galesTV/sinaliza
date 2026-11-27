# Disponibilidade da seção Explorar

## Estratégia adotada

A seção Explorar usa uma liberação conservadora em duas camadas:

1. **Autorização explícita de lançamento** pela variável de ambiente `SINALIZA_EXPLORE_LAUNCHED=true`.
2. **Conteúdo mínimo publicável**: pelo menos um registro publicável em cada uma das quatro categorias culturais (`history`, `curiosity`, `personality`, `library`).

A entrada **Explorar** na navegação principal só é renderizada quando as duas condições são verdadeiras. A verificação acontece no servidor, em `src/data/explore-availability.ts`, e o shell envia apenas um booleano aos componentes clientes de navegação. Nenhuma contagem, lista ou registro editorial é exposto para decidir a navegação.

## Consequências

- Com o valor padrão `SINALIZA_EXPLORE_LAUNCHED=false`, não há entrada pública ativa na navegação principal.
- Mesmo com a variável em `true`, a entrada permanece oculta enquanto qualquer categoria estiver sem conteúdo publicável.
- As rotas `/explorar` e `/explorar/<categoria>` permanecem honestas quando acessadas diretamente: exibem a estrutura da experiência e estados vazios neutros, sem títulos, contagens internas ou dados de candidatos.
- Não existe rota pública de preview de rascunhos culturais.

## Publicação e detalhes

As páginas consomem somente a fachada `src/data/cultural-public.ts`, que retorna a projeção pública criada por `src/data/cultural-publication.ts`. Registros inexistentes, em categoria incompatível ou não publicáveis retornam `notFound()` na página.

Como Cache Components pode enviar o shell parcial antes da resolução dinâmica de `notFound()`, o proxy de requisições (`src/proxy.ts`) também aplica a mesma consulta da fachada pública antes da renderização para rotas `/explorar/<categoria>/<slug>`. Quando não há projeção pública, ele reescreve para `/_not-found`, garantindo status HTTP 404 em produção. A regra editorial não é duplicada: o proxy apenas verifica a existência do DTO público pela fachada.

`generateStaticParams` foi omitido na rota de detalhes neste estágio. Em Next.js 16 com Cache Components, a função não pode retornar uma lista vazia; como atualmente não há registros culturais publicáveis, declará-la quebraria o build. A guarda de publicação permanece em runtime pela fachada pública e pelo proxy. Quando houver registros publicáveis, a decisão de reintroduzir `generateStaticParams` deve ser reavaliada sem nunca incluir candidatos.

## Configuração

`.env.example` documenta:

```bash
SINALIZA_EXPLORE_LAUNCHED=false
```

A variável não usa prefixo `NEXT_PUBLIC_` porque a decisão é tomada no servidor. Ela não altera regras de aprovação, não publica registros e não deve ser usada como bypass editorial.
