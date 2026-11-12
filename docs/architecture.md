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

Um diretório `packages/shared/` poderá ser criado futuramente caso exista código realmente compartilhado entre as aplicações; não será criado de forma especulativa.

## 3. Arquitetura atual

### 3.1. Landing page

A landing page é a aplicação atualmente implementada e publicada.

**URL de produção:** https://sinaliza-eta.vercel.app/

Sua responsabilidade é apresentar a proposta do Sinaliza, explicar a experiência de aprendizagem planejada e demonstrar a experimentação inicial com visão computacional.

### 3.2. Stack tecnológica

| Tecnologia | Responsabilidade |
|---|---|
| Next.js 16 | Framework da aplicação web. |
| React 19 | Construção da interface. |
| TypeScript | Tipagem estática e segurança durante o desenvolvimento. |
| Tailwind CSS 4 | Estilização e sistema visual. |
| Motion | Animações e transições. |
| Three.js | Elementos e experiências visuais tridimensionais. |
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

## 5. Arquitetura evolutiva da plataforma

A arquitetura futura deverá contemplar responsabilidades distintas para as principais áreas do produto.

### 5.1. Camada de apresentação

Responsável pela experiência do estudante:

- Navegação e interface.
- Exibição de conteúdos educacionais.
- Apresentação de exercícios.
- Visualização do progresso.
- Interação com recursos de prática.

A tecnologia definitiva dessa camada deverá ser avaliada conforme a evolução da plataforma.

### 5.2. Camada de aplicação e regras de negócio

Responsável por coordenar as operações do produto:

- Gerenciamento de usuários e perfis.
- Organização de cursos, módulos e lições.
- Controle de atividades e exercícios.
- Registro de tentativas e resultados.
- Acompanhamento da evolução do estudante.

A implementação deverá manter as regras de negócio separadas das particularidades da interface e da persistência de dados.

### 5.3. Camada de dados

Responsável pela persistência das informações necessárias à plataforma, como:

- Usuários e perfis.
- Conteúdos educacionais.
- Lições e exercícios.
- Histórico de atividades.
- Progresso dos estudantes.

O banco de dados e a estratégia de persistência ainda serão definidos.

### 5.4. Camada de visão computacional

Responsável pela experimentação e eventual processamento de informações visuais relacionadas à prática dos sinais.

Essa camada deverá possuir responsabilidades bem delimitadas, evitando acoplamento desnecessário com a interface e com as regras de negócio.

Uma futura integração poderá ocorrer por meio de uma API ou serviço especializado, caso a complexidade técnica justifique essa separação.

A escolha da abordagem dependerá de requisitos de desempenho, privacidade, latência, custo e capacidade de processamento.

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

### Ambiente atual

A landing page está publicada na Vercel.

O diretório configurado como raiz da aplicação na implantação é:

`apps/landing`

### Ambientes futuros

Com a evolução da plataforma, poderão ser definidos ambientes separados para:

- Desenvolvimento local.
- Testes e validação.
- Produção.

A estratégia de implantação dos futuros serviços ainda será definida conforme a arquitetura da plataforma.

## 8. Decisões técnicas e pontos em aberto

As decisões abaixo registram o estado atual do projeto.

| Tema | Situação |
|---|---|
| Organização em monorepositório | Definida (apenas diretórios, sem workspaces — ADR 0001) |
| Framework da landing page | Next.js 16 (App Router, Turbopack, Cache Components) |
| Linguagem principal da landing page | TypeScript |
| Hospedagem da landing page | Vercel (projeto próprio, Root Directory `apps/landing`) |
| Separação da PoC Python | Definida |
| Framework da plataforma de aprendizagem | Next.js 16 + React 19 em `apps/pwa` (mesmas versões da landing) |
| Backend e API | Supabase + funcionalidade server-side do Next.js — ADR 0002 |
| Banco de dados | PostgreSQL via Supabase, migrações em `supabase/migrations` — ADR 0002 |
| Autenticação | Supabase Auth — ADR 0002 |
| Deploy do PWA | Projeto Vercel separado, Root Directory `apps/pwa` — ADR 0003 |
| Integração da visão computacional | Em investigação (MediaPipe no navegador, processamento local) |
| Estratégia de armazenamento de imagens e vídeos | Em aberto (Supabase Storage quando necessário) |
| Infraestrutura dos futuros serviços | Definida para o MVP: sem serviço dedicado |

Novas decisões deverão ser registradas e atualizadas conforme o projeto evoluir.

## 9. Arquitetura planejada da plataforma (PWA)

A plataforma de aprendizagem será implementada em `apps/pwa/` como uma aplicação Next.js independente, reutilizando as mesmas versões principais da landing page.

### 9.1. Componentes planejados

- **Interface (App Router):** páginas de autenticação, dashboard educacional, trilhas/módulos/lições, exercícios e prática experimental com câmera.
- **Supabase:** Auth para contas, PostgreSQL para perfil, conteúdo, progresso e gamificação; RLS em todas as tabelas com dados de usuário; Storage apenas se houver necessidade real de mídia.
- **Visão computacional no navegador:** MediaPipe executado localmente no cliente para detecção de mãos e extração de landmarks — sem envio de imagens para o backend.
- **PWA:** manifest, ícones, service worker com cache do shell e de conteúdo já carregado, fallback offline e sincronização básica de progresso pendente.

### 9.2. Hierarquia educacional

Trilha de aprendizagem → módulos → lições → exercícios. Conteúdo inicial: alfabeto manual e vocabulário básico de Libras (ver [product-scope.md](product-scope.md)).

## 10. Próximas evoluções arquiteturais

As próximas etapas técnicas deverão contemplar:

1. Definição da arquitetura da plataforma de aprendizagem.
2. Modelagem das entidades e relações necessárias ao produto.
3. Definição das responsabilidades do backend e das APIs.
4. Planejamento da autenticação e do gerenciamento de usuários.
5. Estruturação dos conteúdos educacionais.
6. Implementação dos exercícios e do acompanhamento de progresso.
7. Avaliação de alternativas para integrar a visão computacional.
8. Definição de estratégias de testes, observabilidade e implantação.

Essas etapas não representam funcionalidades já implementadas. São diretrizes para orientar o planejamento técnico.

---

**Sinaliza — arquitetura evolutiva para uma experiência de aprendizagem acessível, prática e inclusiva.**