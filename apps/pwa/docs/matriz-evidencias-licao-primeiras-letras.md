# Matriz de evidências — Lição "Primeiras letras do alfabeto manual"

Relação entre cada afirmação do rascunho
(`alfabeto/primeiros-passos/primeiras-letras`, versão `draft-5`) e as
fontes consultadas para a preparação da revisão especializada.

**Data da consulta:** 19/11/2026.
**Aviso:** verificação de fidelidade da redação — não é validação
pedagógica ou linguística. A lição permanece `draft` até a revisão
especializada prevista para 25/11/2026. As descrições das letras foram
redigidas a partir das referências, mas **nenhuma imagem das fontes foi
incorporada** — a confirmação visual de cada configuração depende da
especialista e/ou de mídia licenciada.

**Nota draft-4:** esta versão integra a infraestrutura visual — slots de
`LessonMediaBlock` por letra e dois exercícios com `promptMedia`/
`option.media` — **sem nenhum arquivo de mídia e sem
`permissionEvidence`**. Todos os slots e exercícios permanecem
bloqueados pelo gate de exibição e o aprendiz só vê o painel "em
produção" e as `descriptionVariant`s. Os caminhos `/media/alfabeto/
primeiros-passos/letra-*.jpg` são identificadores planejados, não
arquivos existentes.

**Nota draft-5 (20/11/2026):** nenhuma afirmação pedagógica nova — a
versão apenas acrescenta o bloco final "Recursos complementares": dois
hiperlinks https para páginas de terceiros (ver linha 19 e fonte F7).
Nenhum conteúdo externo foi copiado, baixado ou embutido, e a seção
declara explicitamente que os recursos não passaram por revisão
especializada — os links não alteram a evidência das afirmações
anteriores.

## Fontes consultadas

| Código | Fonte | URL | Observação |
|---|---|---|---|
| F1 | INES — *Alfabeto de Libras e Configuração de Mãos* (página da publicação) | https://www.gov.br/ines/pt-br/central-de-conteudos/publicacoes-1/todas-as-publicacoes/alfabeto-manual-e-configuracao-de-maos | Referência primária das configurações; conteúdo protegido por verificação anti-bot — metadados confirmados, ilustrações não extraídas. |
| F2 | Artigo acadêmico — "Ensino de libras para ouvintes em cursos de extensão do IFSC", *Seminário Nacional de Ciência e Tecnologia do IFSC* | https://periodicos.ifsc.edu.br/index.php/snctifsc/article/view/6899 | "26 configurações de mão que correspondem às letras do alfabeto português" (citando Quadros & Karnopp, 2004); registra a orientação da palma como parte de cada configuração. |
| F3 | UFRB — *Dicionário de Configurações das Mãos em Libras* (Charles Lary Marques Ferraz, editora UFRB) | https://www1.ufrb.edu.br/editora/component/phocadownload/category/2-e-books | PDF obtido (362 p.). Organizado por configuração de mão (tabela de Felipe & Monteiro, 2001); documenta parâmetros CM / ponto de articulação / movimento / orientação / expressão por sinal. |
| F4 | ENAP — *Apostila em Libras — Curso Básico* (2019, 79 p.) | https://repositorio.enap.gov.br/bitstream/1/4121/4/Apostila%20em%20LIBRAS%20-%20Curso%20B%C3%A1sico%20ENAP%202019.pdf | Seção "Alfabeto manual e ou datilologia" (pp. 8–14). |
| F5 | Documento interno — `docs/curadoria-alfabeto.md` | — | Matriz de curadoria das cinco letras candidatas (complexidade técnica e ambiguidades registradas); estimativas técnicas, não linguísticas. |
| F6 | UFSC — *Gramática da Libras (V.1)*, Quadros, R. M. de et al. (repositório institucional, 2023) | https://repositorio.ufsc.br/handle/123456789/262318 | Fundamentação dos parâmetros de formação dos sinais; item do repositório confirmado, conteúdo integral não extraído. |
| F7 | Unesp, Acervo Digital — "Conteúdos e didática de Libras - Alfabeto, numerais, pronomes, advérbios de tempo, dias da semana, meses, cores, cumprimentos e parâmetros dos sinais" (Unesp/NEaD/Univesp TV, 2014) | https://acervodigital.unesp.br/handle/unesp/222981 | Videoaula (~50 min), licença "Uso livre. CC BY-NC-SA 4.0". Apenas hiperlink no bloco "Recursos complementares" (draft-5) — sem cópia, download ou embed. |

## Matriz afirmação × evidência

| # | Afirmação na lição | Fonte | Evidência (localização na fonte) | Fidelidade | Pendências / notas |
|---|---|---|---|---|---|
| 1 | "Cada letra do alfabeto manual é uma configuração de mão: a posição dos dedos e do polegar e a orientação em que a mão é apresentada." | F2, F3 | IFSC: letras correspondem a configurações de mão, com a orientação da palma como parte de cada configuração. UFRB: registra CM + orientação como parâmetros por sinal. | **Fiel.** | — |
| 2 | "repare primeiro na forma dos dedos e depois observe para onde a palma e os dedos apontam — cada letra tem a sua orientação própria." | F2, F3 | IFSC registra a orientação da palma como traço de cada configuração; UFRB documenta orientação por sinal. | **Fiel — deliberadamente sem regra universal.** Não se afirma uma orientação comum a todas as letras (cuidado pedagógico aprovado). | A descrição da orientação específica de cada letra ficou para a validação com imagem/vídeo — ver itens 4–7. |
| 3 | "Cada letra do alfabeto manual é uma configuração de mão" e quatro letras ensinadas (B, L, A, I). | F2, F3, F4 | IFSC e ENAP confirmam o alfabeto manual como conjunto de configurações; UFRB nomeia configurações como "mão em letra 'B'", "mão em letra 'L'", "mão em letra 'A'", "mão em letra 'I'". | **Fiel.** | Recorte B → L → A → I aprovado provisoriamente pelo responsável (19/11/2026); letra C (candidata na curadoria) ficou fora por exigir curvatura menos estável em demonstração estática. |
| 4 | Letra B: "a mão fica aberta e estendida, com os quatro dedos juntos e o polegar dobrado sobre a palma." | F3, F1 | UFRB registra a configuração "mão em letra 'B'" (CM 61/62) e a variante "mão em letra 'B' com o dedo polegar destacado" (CM 63); INES é a referência primária da configuração. | **Fiel em essência — descrição redigida, pendente de confirmação visual.** A posição exata do polegar (sobre a palma × sobre os dedos) deve ser conferida contra imagem licenciada ou pela especialista. | Registrar à especialista: UFRB documenta variante com polegar destacado — a descrição ensinada deve corresponder à forma canônica do alfabeto. |
| 5 | "essa forma de 'mão estendida' aparece em muitos sinais da Libras." | F3 | UFRB lista dezenas de sinais produzidos com a configuração "mão em letra 'B'" (pp. 335–341 e seguintes). | **Fiel.** | — |
| 6 | Letra L: "o dedo indicador aponta para cima e o polegar se abre para o lado, enquanto os demais dedos ficam dobrados." | F3, F1 | UFRB registra "mão em letra 'L'" (CM 8a) usada em sinais como ÁGUA, LEI, PAPEL. | **Fiel em essência — descrição redigida, pendente de confirmação visual.** | Orientação da palma não descrita (sem regra universal) — confirmar com imagem/especialista. |
| 7 | "outras letras, como a G, também usam o indicador estendido — a posição do polegar e a orientação da mão são pontos de atenção a confirmar nas demonstrações." | F5 | Registro interno da curadoria (ambiguidade L×G sinalizada na análise técnica). | **Reformulada como ponto de atenção a confirmar** (`draft-1` → `draft-2`): a redação anterior atribuía a diferença a traços específicos sem fonte primária; a nova versão não fecha a explicação diferencial. | Pendência explícita para a especialista: confirmar a distinção L×G e a formulação. |
| 8 | Letra A: "a mão fecha em um punho, com os quatro dedos dobrados e o polegar apoiado ao lado deles, por fora." | F3, F1 | UFRB registra "mão em letra 'A'" (CM 1) usada em sinais como EVACUAR, APAGAR, ACOMPANHAR. | **Fiel em essência — descrição redigida, pendente de confirmação visual.** | Posição exata do polegar (lateral × sobre os dedos) a confirmar. |
| 9 | "a letra S tem uma forma muito parecida — a posição do polegar é um ponto de atenção a confirmar nas demonstrações." | F5 | Registro interno da curadoria (ambiguidade A×S sinalizada). | **Reformulada como ponto de atenção a confirmar** (`draft-1` → `draft-2`), pelo mesmo motivo do item 7. | Pendência para a especialista: confirmar a distinção A×S (posição do polegar × movimento/orientação). |
| 10 | Letra I: "apenas o dedo mínimo fica estendido; os outros dedos e o polegar ficam dobrados." | F3, F1 | UFRB registra "mão em letra 'I'" (CM 38) e a variante "mão em letra 'I' com o dedo polegar dobrado" (CM 39). | **Fiel em essência — descrição redigida, pendente de confirmação visual.** | A variante com polegar dobrado documentada no UFRB reforça a necessidade de confirmar a forma canônica. |
| 11 | "a letra J usa uma forma parecida — um ponto de atenção é que ela costuma envolver movimento, enquanto o I é estático." | F5 | Registro interno da curadoria: "I é estático; J usa a mesma configuração com movimento". | **Reformulada como ponto de atenção a confirmar** (`draft-1` → `draft-2`): convergente com a literatura (J é convencionalmente descrito como I + movimento), mas sem fonte primária extraída nesta consulta. | Pendência para a especialista confirmar. |
| 12 | Exercícios de identificação visual (draft-4): "Qual letra do alfabeto manual está sendo demonstrada na imagem?" e "Qual destas imagens mostra a letra I?" — feedbacks replicam as descrições dos itens 4, 8 e 10. | — | Descrições rastreadas acima. | **Consistente — mas hoje não executáveis visualmente.** Sem `permissionEvidence` nem arquivos, o gate bloqueia o estímulo e as opções visuais; só as `descriptionVariant`s são vistas. | As variantes declaram explicitamente que avaliam a compreensão da descrição, não a identificação visual — não se afirma treino de reconhecimento visual sem mídia. |
| 13 | `descriptionVariant`s dos exercícios visuais: "a imagem 1 mostra a mão aberta com os quatro dedos juntos; a imagem 2 ... apenas o dedo mínimo estendido; a imagem 3 ... punho fechado com o polegar apoiado ao lado dos dedos". | — | Redação interna coerente com os itens 4, 8 e 10; os rótulos "Imagem 1/2/3" descrevem conteúdo planejado, não material existente. | **Fiel enquanto descrição** — os textos replicam as descrições pedagógicas já rastreadas. | Quando a mídia real chegar, conferir se cada foto corresponde à descrição usada na variante. |
| 14 | Exercício textual (ex-2 do draft-3, mantido verbatim) — feedback: "a forma dos dedos e a orientação da mão são traços centrais para distinguir uma letra da outra — em letras com movimento, como a J, o movimento também diferencia" / "as letras que você viu até aqui são estáticas". | F2, F3, F5 | Orientação como traço distintivo (F2); todas as quatro letras do recorte são configurações estáticas (F5); o movimento como traço adicional cobre o par I×J. | **Fiel após ajuste** (corrigido em `draft-3`, revisão automatizada do PR). | — |
| 15 | Blocos de mídia por letra (draft-4): "Demonstração visual da configuração da letra X ... A imagem candidata está em curadoria e só será exibida quando houver licença confirmada e revisão especializada." | — | Estado real do projeto: as imagens Fiocruz são candidatas em curadoria (`docs/curadoria-midia-fiocruz.md`), sem `permissionEvidence` registrado. | **Fiel — estado honesto.** O painel "em produção" exibe descrição + atribuição do candidato (autor, acervo, licença declarada), sem fingir mídia disponível. | A descrição dentro do slot replica a descrição pedagógica da letra — mesma pendência de confirmação visual. |
| 16 | Texto de comparação (draft-4): "a letra B usa a mão aberta e plana ... a L estende o indicador e abre o polegar; a A fecha a mão em punho; e a I estende somente o dedo mínimo. As quatro são configurações estáticas — nenhuma depende de movimento." | F3, F5 | Consolidação das descrições já rastreadas (itens 4, 6, 8, 10); curadoria registra as quatro como estáticas. | **Fiel.** | Mantém as cautelas S/G/J como "pontos de atenção a confirmar". |
| 17 | Intro: "As demonstrações visuais de cada letra estão em produção: enquanto elas não chegam, a descrição de cada passo cobre o conteúdo." / Recap: "Quando as demonstrações visuais estiverem licenciadas, os exercícios de identificação passam a mostrar as imagens reais; até lá, a versão por descrição mantém a prática sem fingir avaliar o olhar." | — | Estado real do projeto (nenhum arquivo incorporado; gate bloqueado). | **Fiel — estado honesto.** Não promete reconhecimento visual; o recap distingue explicitamente o que a variante por descrição avalia. | — |
| 18 | Intro (draft-2/3, mantida): "você vai dar os primeiros passos no alfabeto manual de Libras conhecendo quatro letras — B, L, A e I". | — | Redação interna; corrigida em `draft-3` (revisão automatizada do PR #38) para não sugerir ordem alfabética. | **Fiel após ajuste.** | — |
| 19 | Bloco "Recursos complementares" (draft-5): "Os links abaixo levam a sites externos ... Não são conteúdo do Sinaliza e ainda não passaram pela revisão da especialista — se um site estiver fora do ar, a lição continua completa sem ele." | F1, F7 | Estado real: são apenas hiperlinks https, opcionais, marcados como externos e não revisados; INES (F1) publica o alfabeto manual oficial; a videoaula Unesp (F7) apresenta o alfabeto entre outros conteúdos introdutórios. | **Fiel — estado honesto.** Nenhum conteúdo externo é reproduzido; a indisponibilidade dos sites não afeta a lição. | Candidato descartado: WikiLibras — dicionário de sinais lexicais sem caminho verificado para as configurações do alfabeto manual; a regra é não descrever recurso como demonstração de letras específicas sem verificação. |

## Alterações aplicadas ao rascunho

`draft-1` → `draft-2` (19/11/2026), ajustes aprovados pelo responsável
antes do push:

1. **Objetivo da lição** reformulado para "Identificar, a partir de
   descrições, características das configurações de mão das letras B, L,
   A e I, preparando-se para reconhecê-las em demonstrações visuais" —
   alinhamento com o que os exercícios de fato avaliam (compreensão
   textual, não habilidade visual).
2. **Cautelas A×S, L×G e I×J** reformuladas de explicações diferenciais
   para "pontos de atenção a confirmar nas demonstrações" — a redação
   anterior transmitia certeza maior que a evidência das fontes.

`draft-2` → `draft-3` (19/11/2026), correções da revisão automatizada
do PR #38:

1. **Introdução:** "as quatro primeiras letras do alfabeto manual"
   sugeria ordem alfabética — reformulada para "dar os primeiros passos
   ... conhecendo quatro letras".
2. **Feedback do exercício 2:** incluído o movimento como traço que
   também diferencia letras (par I×J), em vez de forma+orientação como
   únicas distinções.

Demais afirmações mantidas: eram adequadamente fundamentadas ou já
formuladas com cautela. Próxima versão deve incorporar as correções que
a revisão especializada indicar.

`draft-4` → `draft-5` (20/11/2026), recursos complementares externos
(fase 8D.3):

1. **Novo último bloco** `LessonResourcesBlock` "Recursos
   complementares": dois links externos https (INES, Unesp) com fonte,
   descrição do motivo de ajuda e indicação de "site externo — abre em
   nova aba"; opcional, não bloqueia a conclusão e não registra
   progresso.

`draft-3` → `draft-4` (19/11/2026), integração da experiência visual
(fase 8C.3):

1. **Slots de demonstração por letra:** cada explicação ganhou um
   `LessonMediaBlock` com caminho planejado, `alt` descritivo e a
   atribuição do candidato Fiocruz — sem arquivo e sem
   `permissionEvidence`, portanto sempre no estado "em produção".
2. **Dois exercícios de identificação visual** (estímulo `promptMedia`
   da letra B; opções com `option.media` B/I/A) com
   `descriptionVariant` honesta — o exercício visual fica bloqueado e a
   variante avalia a compreensão da descrição, sem fingir medir
   reconhecimento visual.
3. **Substituição dos exercícios textuais 1 e 3** (descrição da letra B
   e dedo mínimo da letra I) pelos exercícios visuais com variante — a
   cobertura textual desses pontos permanece nas variantes e nos textos
   de explicação.
4. **Novo texto de comparação** consolidando as quatro configurações e
   mantendo as cautelas S/G/J; **recapitulação final** declarando que a
   prática atual é por descrição.

## Pendências e dúvidas para a especialista

- **Posição exata do polegar em B e A:** descrever "sobre a palma" (B) e
  "ao lado dos dedos, por fora" (A) foi redação baseada nas referências;
  confirmar contra o alfabeto do INES ou demonstração autorizada.
- **Variantes documentadas:** UFRB registra "B com polegar destacado" e
  "I com polegar dobrado" como configurações distintas — confirmar qual
  forma canônica ensinar e se a variação deve ser mencionada.
- **Orientação da palma por letra:** por decisão pedagógica, nenhuma regra
  universal foi escrita; a descrição da orientação de cada letra deve ser
  adicionada quando houver evidência visual adequada — a especialista pode
  indicar a formulação correta na próxima revisão do rascunho.
- **Distinções A×S, L×G, I×J:** registradas como cautelas; confirmar as
  características que realmente separam cada par (posição do polegar,
  orientação, movimento).
- **Variantes regionais:** verificar se alguma das quatro letras tem
  variação regional relevante para mencionar (fonte disponível: artigo
  CECIERJ sobre variação linguística).
- **Mídia:** as imagens Fiocruz (CC BY-NC declarada) estão em curadoria
  separada (`docs/curadoria-midia-fiocruz.md`) — a especialista pode
  avaliar adequação linguística das fotos; a decisão de licenciamento é
  do responsável. Com o draft-4, incorporar os arquivos e registrar
  `permissionEvidence` **desbloqueia apenas a exibição técnica** — a
  publicação continua exigindo as verificações humanas do checklist de
  ativação (licença exata, direitos de imagem, correção linguística,
  coerência ativo × texto × gabarito, revisão especializada da versão
  final).
- **Fidelidade descrição × foto:** quando a mídia chegar, conferir se
  cada `descriptionVariant` descreve de fato a imagem incorporada
  (itens 12–13).

## Limitações da pesquisa

- A página do INES (F1) respondeu com verificação anti-bot; as
  ilustrações oficiais de cada letra não foram extraídas — por isso as
  descrições ficam marcadas como "pendentes de confirmação visual".
- Nenhuma fonte consultada fornece descrição dedo-a-dedo em texto para as
  quatro letras; o UFRB documenta as configurações por nome e parâmetros,
  não por descrição textual do alfabeto.
- Ferramenta Firecrawl indisponível nesta sessão; fontes obtidas por
  download direto, busca web e leitura de PDF local.
