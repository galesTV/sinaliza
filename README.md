# Sinaliza

**Aprender Libras de forma acessível, interativa e prática.**

O Sinaliza é uma plataforma de aprendizagem de Língua Brasileira de Sinais (Libras) que busca aproximar educação, tecnologia e inclusão. A proposta combina conteúdos educacionais, exercícios práticos e experimentação com visão computacional para tornar o processo de aprendizagem mais envolvente.

🌐 **[Acesse a plataforma](https://sinaliza-eta.vercel.app/)**

## 🎯 Objetivo

Tornar o aprendizado de Libras mais acessível por meio de uma experiência digital que incentive o desenvolvimento gradual do conhecimento, a prática e o acompanhamento da evolução do estudante.

O projeto não tem como objetivo substituir a interação humana ou a vivência cultural da comunidade surda, mas utilizar a tecnologia como ferramenta de apoio à aprendizagem.

## ✨ Projeto

O Sinaliza está sendo desenvolvido com foco inicial no alfabeto manual e no vocabulário básico de Libras.

Entre as experiências previstas estão:

- **Aprendizagem:** conteúdos visuais e organizados em etapas.
- **Prática:** exercícios para reforçar o conhecimento adquirido.
- **Visão computacional:** experimentação com análise de características das mãos para apoiar atividades práticas.
- **Evolução:** acompanhamento do progresso e elementos de gamificação.

### Estado atual

| Componente                                       | Situação                   |
| ------------------------------------------------ | -------------------------- |
| Landing page                                     | Publicada                  |
| Identidade visual e apresentação do projeto      | Implementadas              |
| Demonstração experimental de visão computacional | Desenvolvida separadamente |
| Plataforma de aprendizagem                       | Em desenvolvimento         |
| Exercícios interativos                           | Planejados                 |
| Acompanhamento de progresso e gamificação        | Planejados                 |

## 🧪 Prova de conceito

O projeto conta com uma prova de conceito independente desenvolvida em Python, utilizando:

- Python
- MediaPipe
- OpenCV

O experimento utiliza a câmera para detectar mãos, extrair landmarks e calcular características geométricas selecionadas.

Essa prova de conceito é experimental e independente da landing page. Ela não realiza reconhecimento completo de sinais, tradução automática ou avaliação de fluência em Libras.

## 🛠️ Tecnologias

A landing page utiliza:

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Motion](https://motion.dev/)
- [Three.js](https://threejs.org/)

## 📁 Estrutura do repositório

```text
sinaliza/
├── apps/
│   └── landing/
│       ├── public/
│       ├── src/
│       ├── package.json
│       └── README.md
├── docs/
│   ├── product-overview.md
│   ├── architecture.md
│   └── computer-vision-poc.md
├── .gitignore
└── README.md
```

- `apps/landing`: aplicação responsável pela landing page.
- `docs/`: documentação de produto, arquitetura e experimentos técnicos.
- `README.md`: apresentação geral do Sinaliza.

## 📚 Documentação

A documentação do projeto está organizada em três documentos principais:

| Documento                                                               | Descrição                                                                              |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [Visão do Produto](docs/product-overview.md)                            | Apresenta o propósito, o público-alvo, a proposta de valor e o escopo do Sinaliza.     |
| [Arquitetura do Sistema](docs/architecture.md)                          | Descreve a arquitetura atual, as tecnologias utilizadas e as decisões técnicas.        |
| [Prova de Conceito de Visão Computacional](docs/computer-vision-poc.md) | Documenta os experimentos com Python, MediaPipe, OpenCV e análise geométrica das mãos. |

## 🚀 Executando localmente

### Pré-requisitos

- Node.js
- npm

### Instalação

Clone o repositório:

```bash
git clone https://github.com/galesTV/sinaliza.git
```

Entre no diretório da landing page:

```bash
cd sinaliza/apps/landing
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

Para verificar o código e gerar a versão de produção:

```bash
npm run lint
npm run build
```

Consulte o [`README.md` da landing page](apps/landing/README.md) para instruções específicas.

## 🗺️ Roadmap

O desenvolvimento do Sinaliza está organizado em etapas:

- [x] Definição da proposta e identidade visual.
- [x] Desenvolvimento da landing page.
- [x] Demonstração experimental de visão computacional.
- [x] Publicação da landing page.
- [ ] Desenvolvimento da experiência de aprendizagem.
- [ ] Implementação de conteúdos do alfabeto e vocabulário básico.
- [ ] Desenvolvimento de exercícios interativos.
- [ ] Evolução da experimentação com visão computacional.
- [ ] Acompanhamento de progresso e gamificação.

## 👨‍💻 Desenvolvimento

Projeto desenvolvido por [galesTV](https://github.com/galesTV).

---

_Sinaliza — tecnologia como ferramenta para aproximar pessoas e ampliar o acesso à aprendizagem de Libras._
