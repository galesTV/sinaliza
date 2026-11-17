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

## 🔑 Autenticação

Rotas: `/cadastro` (registro), `/login` (entrada), `/auth/confirm` (callback de confirmação), `/auth/recovery` (callback exclusivo de redefinição — a rota determina o propósito da sessão, sem heurísticas), `/recuperar` + `/nova-senha` (redefinição de senha) e `/conta` (única rota que exige sessão, validada no servidor). Sem as variáveis de ambiente o app inteiro permanece em modo convidado.

Configuração necessária no dashboard do Supabase (Authentication → URL Configuration):

- **Redirect URLs** deve incluir `<origem-do-app>/auth/confirm**` **e** `<origem-do-app>/auth/recovery` — ex.: `https://<dominio-do-pwa>/auth/confirm**`, `https://<dominio-do-pwa>/auth/recovery`, e os equivalentes `http://localhost:3000/...` para desenvolvimento. O wildcard `**` após `/auth/confirm` é necessário porque o link de confirmação carrega `?next=<destino>` para preservar o destino pós-cadastro; `/auth/recovery` ignora `next` e não precisa de wildcard.
- **Confirm email** deve estar habilitado (decisão D1), caso contrário o cadastro entra direto sem verificação.
- Nenhuma alteração de template de e-mail é necessária: os links padrão (`{{ .ConfirmationURL }}`) funcionam com os dois callbacks.
