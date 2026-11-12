# Sinaliza — PWA (plataforma de aprendizagem)

Aplicação educacional do Sinaliza: alfabeto manual, vocabulário básico, lições, exercícios e acompanhamento de progresso.

> Estado atual: **scaffold inicial**. Autenticação, banco de dados, exercícios, gamificação e visão computacional serão implementados em etapas futuras (ver `../../AGENTS.md` e `../../docs/`).

## 🛠️ Tecnologias

- [Next.js](https://nextjs.org/) 16 (App Router, Turbopack)
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/) (strict)
- [Tailwind CSS](https://tailwindcss.com/) 4
- [Vitest](https://vitest.dev/) — testes unitários

## 📋 Pré-requisitos

- Node.js `>=22.12.0` — `20.9` é o mínimo do Next.js, mas a suíte de testes (Vitest 5) exige `^22.12.0 || ^24.0.0 || >=26.0.0`; verificado com `v24.22.2`
- npm

## 🚀 Executando localmente

A partir deste diretório (`apps/pwa`):

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 🧰 Scripts disponíveis

| Comando         | Descrição                                   |
| --------------- | ------------------------------------------- |
| `npm run dev`   | Inicia o servidor de desenvolvimento.       |
| `npm run lint`  | Executa a análise estática do código.       |
| `npm run test`  | Executa os testes unitários (Vitest).       |
| `npm run build` | Gera a versão otimizada para produção.      |
| `npm run start` | Inicia o servidor de produção após o build. |

## 📂 Estrutura

```text
pwa/
├── public/
│   └── brand/          # Assets oficiais da marca Sinaliza
├── src/
│   ├── app/            # Rotas e layout (App Router)
│   ├── components/     # Componentes reutilizáveis
│   └── lib/            # Lógica e utilitários
├── .env.example        # Variáveis de ambiente (sem segredos)
├── package.json
└── package-lock.json
```

## 🔐 Variáveis de ambiente

Copie `.env.example` para `.env.local` ao configurar o Supabase. Apenas a chave *publishable* (`sb_publishable_...`) pode ser exposta via `NEXT_PUBLIC_*`; chaves *secret* nunca devem aparecer no navegador.
