# Curadoria do alfabeto manual — letras candidatas

Documento de trabalho da Fase 2. Registra a matriz de curadoria das cinco
letras candidatas (A, B, C, L, I), o procedimento de produção de mídia e a
checklist de publicação.

> **Nada aqui valida conteúdo.** As estimativas de complexidade são
> análises técnicas de engenharia e não substituem a avaliação linguística.
> Todos os espécimes estão em `draft` — sem mídia licenciada, sem descrição
> de configuração de mão redigida e sem revisão especializada.

## Matriz de curadoria

| Letra | Referências | Complexidade estimada* | Dependências de mídia | Pendências de revisão linguística | Licenciamento | Implementação |
|---|---|---|---|---|---|---|
| A | INES Alfabeto; INES Gramática; Gramática UFSC | Baixa: configuração fechada e estável para captura estática | Vídeo ou foto da configuração, poster, legendas, alt | Confirmar descrição e distinguir da letra S (forma similar, movimento em algumas fontes) | Não confirmada — mídia INES sem licença explícita na página; preferir produção própria | Espécime catalogado; prévia em `/laboratorio/alfabeto/a` |
| B | Idem | Baixa: mão aberta e plana, landmark contrast alto | Idem | Confirmar posição do polegar na descrição final | Idem | Idem (`/laboratorio/alfabeto/b`) |
| C | Idem | Média: forma curvada é menos estável em classificação geométrica por distância | Idem | Avaliar se a curva é legível em captura estática de webcam | Idem | Idem (`/laboratorio/alfabeto/c`) |
| L | Idem | Baixa–média: assinatura geométrica clara (polegar + indicador) | Idem | Checar ambiguidade potencial com G (indicador estendido em outra orientação) | Idem | Idem (`/laboratorio/alfabeto/l`) |
| I | Idem | Média: visibilidade do dedo mínimo pode degradar em baixa resolução | Idem | I é estático; J usa a mesma configuração com movimento — J fica fora do recorte justamente por exigir captura de movimento | Idem | Idem (`/laboratorio/alfabeto/i`) |

\* Estimativa técnica de captura/demonstração — pendente de confirmação na
revisão linguística.

### Justificativa do recorte

- As cinco letras usam configurações estáticas — compatível com a abordagem
  de demonstração visual e com a captura de landmarks do MediaPipe (a PoC
  classifica apenas configurações estáticas).
- O conjunto cobre formas distintas (punho fechado, mão aberta plana, forma
  curvada, forma em L, dedo mínimo estendido), úteis para avaliar a
  infraestrutura com variação real.
- Alteração do recorte exige aprovação do responsável.

## Fontes consultadas

| Fonte | URL | Consulta | Finalidade | Direitos de uso |
|---|---|---|---|---|
| INES — Alfabeto de Libras e Configuração de Mãos | https://www.gov.br/ines/pt-br/central-de-conteudos/publicacoes-1/todas-as-publicacoes/alfabeto-manual-e-configuracao-de-maos | 2026-11-18 | Referência primária das configurações de mão | Página ativa (publicada 2022, atualizada 2024); **nenhuma licença declarada — reprodução não presumida** |
| INES — Gramática da Libras, Volume 1 | https://www.gov.br/ines/pt-br/central-de-conteudos/publicacoes-1/todas-as-publicacoes/gramatica-da-libras-volume-1 | 2026-11-18 | Fundamentação dos parâmetros fonológicos | Idem — uso como referência, não reprodução |
| UFSC — Gramática da Libras (repositório) | https://repositorio.ufsc.br/handle/123456789/262318 | 2026-11-18 | Descrição acadêmica das configurações | Termos do repositório a verificar |

**Limitação da pesquisa:** o servidor Firecrawl (MCP) não iniciou no
ambiente (`npx` indisponível), então a consulta foi feita por acesso direto
às páginas públicas. Metadados de licenciamento não foram encontrados nas
páginas — situação registrada como "não confirmada" em cada fonte.

## Procedimento de produção de mídia

1. **Roteiro de demonstração** — redigir o enquadramento, a orientação da
   mão e o texto de apoio a partir das referências catalogadas; marcar o
   roteiro como pendente de revisão.
2. **Revisão linguística** — especialista em Libras aprova o roteiro e a
   descrição da configuração antes de qualquer gravação.
3. **Captura autorizada** — gravar/fotografar com intérprete ou sinalizador
   que assine autorização de uso de imagem; registrar quem executou o sinal.
4. **Registro de autoria e direitos** — preencher `attribution` no espécime:
   `source` (autor/instituição), `license`, `licenseUrl` (quando houver) e
   `permissionEvidence` (referência ao termo de autorização ou licença).
5. **Legendas e texto alternativo** — produzir o `.vtt` em pt-BR e o `alt`
   descritivo; o texto deve sustentar o conteúdo sem depender do vídeo.
6. **Validação da versão final** — revisão técnica do arquivo renderizado
   (codec, poster, legendas) e revisão especializada do material didático;
   registrar cada revisão no espécime com a versão correta.
7. **Integração** — mover o ativo para `public/media/<trilha>/<modulo>/`,
   referenciar no espécime e, só após `expert-validated`, preparar a
   publicação da lição na trilha.

## Checklist de publicação

- [ ] `media` presente e arquivo real commitado em `public/media/`
- [ ] `attribution.source` + `license` + `permissionEvidence` preenchidos
- [ ] `alt` (imagem) ou `captions` (vídeo) produzidos
- [ ] Descrição da configuração fundamentada nas referências
- [ ] Revisões de pesquisa, técnica e especializada registradas cobrindo a
      versão atual (`version`)
- [ ] `validateSpecimen()` retorna `[]` e `isSpecimenPublishable()` é `true`
- [ ] `npm run lint`, `npm run test`, `npm run build`, `git diff --check` limpos
- [ ] Revisão visual local conferida em `next dev`; `next start` reservado à verificação do bloqueio de mídia local-restrita em produção
- [ ] Status da lição alterado para `available` somente após os itens acima

## Pendências

- Licenciamento das fontes institucionais não confirmado — decisão entre
  produção própria (recomendado) ou obtenção de autorização explícita.
- Descrições das configurações de mão aguardam especialista em Libras.
- Matriz de ambiguidades (A×S, L×G, I×J, B×mão aberta) precisa de revisão
  linguística antes de orientar o design de feedback visual.

## Atualização — Fase 8B (19/11/2026)

- **Recorte provisório da lição "Primeiras letras do alfabeto manual"
  aprovado pelo responsável:** B → L → A → I. A letra C, embora
  catalogada, ficou fora do primeiro recorte didático (curva menos
  estável em demonstração estática); os cinco espécimes continuam
  registrados no catálogo para trabalho futuro.
- **Nova fonte de mídia candidata:** série "Alfabeto em Libras" do acervo
  Fiocruz Imagens (autoria Mauro Campello, licença declarada "Uso não
  comercial (by-nc)", direito patrimonial Fundação Oswaldo Cruz). A
  curadoria completa — itens 127847 (A), 127848 (B), 127856 (I), 127859
  (L), licença, atribuição, restrições e adequação — está em
  `docs/curadoria-midia-fiocruz.md`, aguardando aprovação separada.
  **Nenhuma imagem foi incorporada.**
- **Novas referências textuais:** UFRB (*Dicionário de Configurações das
  Mãos em Libras*, tabela de Felipe & Monteiro 2001) e artigo do IFSC
  (26 configurações = letras do alfabeto português) registrados em
  `docs/pesquisa-pedagogica.md`.
