# Sinaliza — Arquitetura do Sistema

## 1. Visão geral

O Sinaliza é um projeto de plataforma de aprendizagem de Língua Brasileira de Sinais (Libras), desenvolvido com uma abordagem incremental.

A arquitetura atual prioriza uma aplicação web responsável pela apresentação do produto. A evolução planejada contempla uma plataforma de aprendizagem, com conteúdos educacionais, exercícios interativos, acompanhamento de progresso e experimentação com visão computacional.

O sistema está organizado em um monorepositório, permitindo manter diferentes aplicações e documentações dentro de uma estrutura compartilhada.

A arquitetura deverá evoluir conforme as necessidades reais do produto, priorizando separação de responsabilidades, manutenibilidade, escalabilidade e simplicidade operacional.

## 2. Estrutura do repositório

O projeto utiliza uma estrutura de monorepositório:

```text
sinaliza/
├── apps/
│   ├── landing/          # Landing page institucional (publicada)
│   └── pwa/              # Plataforma de aprendizagem (planejada)
├── supabase/
│   ├── migrations/       # Migrações versionadas do banco (planejado)
│   └── seed/             # Dados iniciais de desenvolvimento (planejado)
├── docs/
│   ├── product-overview.md
│   ├── product-scope.md
│   ├── architecture.md
│   ├── computer-vision-poc.md
│   └── decisions/        # Registros de decisões arquiteturais (ADRs)
├── AGENTS.md
├── .gitignore
└── README.md
```

### Responsabilidades

| Diretório | Responsabilidade |
|---|---|
| `apps/landing/` | Aplicação web de apresentação do Sinaliza. |
| `apps/pwa/` | Aplicação educacional (PWA) da plataforma de aprendizagem. |
| `supabase/` | Migrações e seed do banco de dados da plataforma. |
| `docs/` | Documentação de produto, arquitetura, decisões e experimentos técnicos. |
| Raiz do repositório | Configurações compartilhadas e documentação geral. |

O monorepositório é organizado **apenas por diretórios**: não há `package.json` raiz nem ferramenta de workspaces (npm workspaces, Turborepo). Cada aplicação em `apps/` é um pacote npm independente, com `package.json` e lockfile próprios, implantável de forma isolada. Essa decisão está registrada em [ADR 0001](decisions/0001-monorepo-layout-sem-workspaces.md).

Um diretório `packages/shared/` somente será criado quando existir código efetivamente compartilhado entre as aplicações; não será criado de forma especulativa.

## 3. Arquitetura atual

### 3.1. Landing page

A landing page é a aplicação atualmente implementada e publicada.

**URL de produção:** https://sinaliza-eta.vercel.app/

Sua responsabilidade é apresentar a proposta do Sinaliza, explicar a experiência de aprendizagem planejada e demonstrar a experimentação inicial com visão computacional.

### 3.2. Stack tecnológica

| Tecnologia | Responsabilidade |
|---|---|
| Next.js 16.4.5 | Framework da aplicação web (App Router, Turbopack, Cache Components). |
| React 19.3 | Construção da interface. |
| TypeScript | Tipagem estática e segurança durante o desenvolvimento (modo `strict`). |
| Tailwind CSS 4 | Estilização e sistema visual, via `@tailwindcss/turbopack`. |
| Motion | Animações e transições. |
| Three.js | Elementos e experiências visuais tridimensionais. |
| npm | Gerenciador de pacotes (lockfile versionado). |
| Node.js | Runtime de desenvolvimento/build. Requisito do Next.js 16: `>=20.9.0`; verificado na VM do Devin com `v24.22.2` via nvm. |
| Vercel | Hospedagem e publicação da landing page. |

### 3.3. Organização da aplicação

A aplicação utiliza Next.js com App Router.

A estrutura de páginas e recursos segue as convenções do diretório `src/app/`.

A implementação prioriza:

- Server Components por padrão.
- Client Components somente quando necessários para interatividade.
- Componentização e separação de responsabilidades.
- Tipagem com TypeScript.
- Responsividade e acessibilidade.
- Animações com atenção à preferência por movimento reduzido.
- Otimização de recursos e carregamento.

A landing page também utiliza recursos nativos do Next.js para disponibilizar metadados e arquivos de SEO, incluindo `robots.ts` e `sitemap.ts`.

## 4. Prova de conceito de visão computacional

A experimentação com visão computacional é mantida separadamente da aplicação web.

**Repositório experimental:** `sinaliza-poc`

**Ambiente:** Python 3.13.7.

### 4.1. Tecnologias

| Tecnologia | Responsabilidade |
|---|---|
| Python | Linguagem utilizada no experimento. |
| MediaPipe Hand Landmarker | Detecção e localização de pontos de referência das mãos. |
| OpenCV | Captura e processamento de imagens da câmera. |

### 4.2. Fluxo experimental

O fluxo atual da prova de conceito é:

1. Captura de imagens pela webcam.
2. Processamento dos quadros com OpenCV.
3. Detecção das mãos com MediaPipe.
4. Extração dos landmarks.
5. Cálculo de características geométricas selecionadas.
6. Utilização dessas características em experimentos de análise.

As características geométricas incluem medidas relativas e proporções normalizadas, buscando reduzir a dependência de distâncias absolutas e diferenças de escala.

### 4.3. Limitações

A prova de conceito é independente da landing page e não representa um serviço integrado à plataforma.

O experimento atual não realiza reconhecimento completo de sinais, tradução automática de Libras ou avaliação de fluência.

Uma eventual integração deverá ser precedida por validações técnicas e educacionais, além da definição de uma interface clara de comunicação entre os componentes.

## 5. Arquitetura planejada da plataforma (PWA)

A plataforma de aprendizagem será implementada em `apps/pwa/` como uma aplicação Next.js independente, reutilizando as mesmas versões principais da landing page (ver [ADR 0002](decisions/0002-backend-supabase.md)).

### 5.1. Camada de apresentação

Responsável pela experiência do estudante, implementada com App Router (Server Components por padrão, Client Components apenas onde a interatividade exige):

- Autenticação e páginas públicas.
- Dashboard educacional.
- Trilhas, módulos, lições e exercícios.
- Visualização de progresso e gamificação.
- Prática experimental com câmera.

### 5.2. Camada de aplicação e regras de negócio

Responsável por coordenar as operações do produto, implementada em módulos dentro da própria aplicação Next.js (route handlers e server actions) — sem serviço de backend dedicado:

- Gerenciamento de usuários e perfis.
- Organização de trilhas, módulos e lições.
- Controle de atividades e exercícios.
- Registro de tentativas e resultados.
- Acompanhamento da evolução do estudante.

As regras de negócio ficam separadas das particularidades da interface e da persistência.

### 5.3. Camada de dados (Supabase)

Responsável pela persistência das informações da plataforma (ver [ADR 0002](decisions/0002-backend-supabase.md)):

- **PostgreSQL** para usuários/perfis, conteúdos educacionais, lições, exercícios, histórico de atividades e progresso.
- **Migrações versionadas** em `supabase/migrations/` — nenhuma alteração de schema fora de migração.
- **RLS habilitado** em todas as tabelas, com políticas diferenciadas por tipo de dado: tabelas de dados pessoais/progresso (perfil, lições concluídas, resultados, XP, streak, conquistas) isoladas por usuário via `auth.uid()`; tabelas de conteúdo educacional (trilhas, módulos, lições, exercícios, sinais, vocabulário) com leitura pública ou restrita a autenticados, e escrita limitada a contextos administrativos. Não aplicar política genérica de propriedade a todas as tabelas.
- **Chaves de API:** seguir a nomenclatura atual do Supabase — chave *publishable* (`sb_publishable_...`, sucessora da `anon`) apenas em variáveis `NEXT_PUBLIC_*`, e chaves *secret* (`sb_secret_...`, sucessoras da `service_role`) somente no servidor. Nenhuma chave secreta pode ser exposta ao navegador ou contornar RLS no código da aplicação.
- **Storage** somente quando houver necessidade real de mídia.

### 5.4. Camada de visão computacional (navegador)

Responsável pela experimentação com prática assistida por câmera:

- MediaPipe executado **localmente no navegador** para detecção de mãos e extração dos 21 landmarks — sem envio de imagens ao backend.
- Normalização de coordenadas, extração de características geométricas e comparação experimental contra exemplos de referência validados.
- Feedback visual honesto sobre limitações: a comparação geométrica não equivale a compreensão linguística de Libras.

Responsabilidades bem delimitadas, evitando acoplamento com a interface e com as regras de negócio.

### 5.5. Capacidades de PWA

- Web app manifest, ícones, cores de tema e instalabilidade — **prioridade** junto ao acesso a conteúdo previamente armazenado em cache.
- Service worker com cache do shell e de conteúdo já carregado, e fallback offline.
- Sincronização de progresso feito offline: **somente se couber no prazo e puder ser testada com segurança**, sem comprometer o núcleo educacional — cuidado com submissões duplicadas e atualizações conflitantes.
- A experiência educacional permanece utilizável sem câmera e com funcionalidade offline básica — sem promessas de sincronização completa não implementada.

### 5.6. Hierarquia educacional

Trilha de aprendizagem → módulos → lições → exercícios. Conteúdo inicial: alfabeto manual e vocabulário básico de Libras (ver [product-scope.md](product-scope.md)).

## 6. Diretrizes arquiteturais

A evolução do sistema deverá seguir estas diretrizes:

### Separação de responsabilidades

Cada componente deve possuir responsabilidades claras, reduzindo o acoplamento e facilitando manutenção e testes.

### Evolução incremental

A arquitetura deve atender às necessidades atuais sem introduzir complexidade prematura.

### Tipagem e previsibilidade

O uso de contratos bem definidos e tipagem estática deve contribuir para reduzir inconsistências entre componentes.

### Segurança e privacidade

Dados pessoais e informações relacionadas à prática dos estudantes deverão ser tratados com cuidado, considerando minimização de coleta, proteção de dados e transparência.

### Acessibilidade

As decisões técnicas devem considerar acessibilidade desde o início, e não apenas como uma etapa posterior de acabamento.

### Testabilidade

As regras de negócio e os componentes críticos deverão ser desenvolvidos de forma que possam ser testados independentemente sempre que possível.

## 7. Publicação e ambientes

### Ambientes atuais

A landing page está publicada na Vercel, em projeto próprio com Root Directory `apps/landing`.

### Ambientes planejados

- O PWA será implantado como um **segundo projeto na Vercel**, com Root Directory `apps/pwa`, preservando integralmente a configuração e o deploy da landing (ver [ADR 0003](decisions/0003-deploy-vercel-dois-projetos.md)).
- Ambientes locais, de validação e de produção serão detalhados conforme a evolução da plataforma.

## 8. Decisões técnicas e pontos em aberto

As decisões abaixo registram o estado atual do projeto. Decisões marcadas como "proposta" aguardam aprovação do owner.

| Tema | Situação |
|---|---|
| Organização em monorepositório | Definida (apenas diretórios, sem workspaces — ADR 0001) |
| Framework da landing page | Next.js 16 (App Router, Turbopack, Cache Components) |
| Linguagem principal | TypeScript |
| Hospedagem da landing page | Vercel (projeto próprio, Root Directory `apps/landing`) |
| Separação da PoC Python | Definida |
| Framework da plataforma de aprendizagem | Proposta: Next.js 16 + React 19 em `apps/pwa` (mesmas versões da landing) |
| Backend e API | Proposta: Supabase + funcionalidade server-side do Next.js — ADR 0002 |
| Banco de dados | Proposta: PostgreSQL via Supabase, migrações em `supabase/migrations` — ADR 0002 |
| Autenticação | Proposta: Supabase Auth — ADR 0002 |
| Deploy do PWA | Proposta: projeto Vercel separado, Root Directory `apps/pwa` — ADR 0003 |
| Integração da visão computacional | Em investigação (MediaPipe no navegador, processamento local) |
| Estratégia de armazenamento de imagens e vídeos | Em aberto (Supabase Storage quando necessário) |
| Infraestrutura dos futuros serviços | Proposta: sem serviço dedicado no MVP |

Novas decisões deverão ser registradas em `docs/decisions/` e atualizadas conforme o projeto evoluir.

## 9. Próximas evoluções arquiteturais

As próximas etapas técnicas deverão contemplar:

1. Criação do scaffold de `apps/pwa` e provisionamento do projeto Supabase.
2. Modelagem das entidades e relações (perfis, trilhas, lições, exercícios, progresso).
3. Implementação da autenticação e do gerenciamento de usuários.
4. Estruturação dos conteúdos educacionais.
5. Implementação dos exercícios e do acompanhamento de progresso.
6. Avaliação das alternativas para integrar a visão computacional.
7. Definição de estratégias de testes, observabilidade e implantação.

Essas etapas não representam funcionalidades já implementadas. São diretrizes para orientar o planejamento técnico.

---

**Sinaliza — arquitetura evolutiva para uma experiência de aprendizagem acessível, prática e inclusiva.**
