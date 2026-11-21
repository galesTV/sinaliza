import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/breadcrumb";
import { Eyebrow } from "@/components/eyebrow";
import { HonestNote } from "@/components/honest-note";
import { IconArrowRight, IconFlask } from "@/components/icons";

export const metadata: Metadata = {
  title: "Laboratório — Demonstrações do Sinaliza",
  description:
    "Hub de demonstrações do MVP do Sinaliza: experiência guiada de aprendizagem, lições em revisão, curadoria do alfabeto manual e experimentos de visão computacional — nada disso é conteúdo publicado ou validado.",
  robots: { index: false, follow: false },
};

interface DemoEntry {
  href: string;
  title: string;
  description: string;
  status: string;
}

/** Suggested order for discovering and presenting the MVP. */
const DEMO_JOURNEY: readonly DemoEntry[] = [
  {
    href: "/laboratorio/experiencia",
    title: "Experiência guiada de aprendizagem",
    description:
      "Uma atividade completa do motor de aprendizagem — objetivo, explicações, demonstração visual e exercícios com retorno imediato — com conteúdo sobre a própria plataforma.",
    status: "Demonstração do motor de aprendizagem",
  },
  {
    href: "/laboratorio/licoes",
    title: "Lições em revisão",
    description:
      "Rascunhos do catálogo pedagógico abertos para revisão, cada um com seu estado de validação. Nenhum é conteúdo publicado.",
    status: "Rascunhos em revisão pedagógica",
  },
  {
    href: "/laboratorio/alfabeto",
    title: "Curadoria do alfabeto manual",
    description:
      "Espécimes visuais das primeiras letras, com licença de mídia e revisão linguística ainda pendentes — sem imagens provisórias.",
    status: "Espécimes em curadoria",
  },
  {
    href: "/laboratorio/maos",
    title: "Detecção e posicionamento de mãos",
    description:
      "Visão computacional no navegador: 21 pontos de referência da mão e prática guiada de posicionamento. Não reconhece sinais de Libras.",
    status: "Prova técnica, sem reconhecimento de sinais",
  },
];

/** Optional technical examples that exercise parts of the lesson engine. */
const TECHNICAL_EXAMPLES: readonly DemoEntry[] = [
  {
    href: "/laboratorio/licao",
    title: "Demonstração da interface de lição",
    description:
      "Passos de explicação, exercícios de múltipla escolha e conclusão — sem conteúdo educacional de Libras.",
    status: "Exemplo de interface",
  },
  {
    href: "/laboratorio/licao-visual",
    title: "Exercícios com estímulo visual",
    description:
      "Mecânica de exercícios visuais com formas geométricas sintéticas, incluindo o bloqueio por falta de licença de mídia.",
    status: "Exemplo de interface",
  },
  {
    href: "/laboratorio/licao-visual-bloqueada",
    title: "Exercício visual bloqueado",
    description:
      "Comportamento fail-closed: sem permissão de mídia nem alternativa por descrição, o exercício não pode ser concluído.",
    status: "Exemplo de interface",
  },
];

function DemoCard({ entry, index }: { entry: DemoEntry; index?: number }) {
  return (
    <Link
      href={entry.href}
      className="group flex h-full items-start gap-4 rounded-2xl border border-border bg-surface px-5 py-4 transition-colors duration-200 hover:bg-white/[0.04]"
    >
      {typeof index === "number" && (
        <span
          aria-hidden="true"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-primary-soft/45 bg-surface-elevated font-display text-sm font-semibold tabular-nums text-primary-soft"
        >
          {index + 1}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="font-display text-base font-semibold text-foreground">
          {entry.title}
        </span>
        <span className="text-sm leading-relaxed text-muted">
          {entry.description}
        </span>
        <span className="text-xs font-medium uppercase tracking-[0.08em] text-muted/80">
          {entry.status}
        </span>
      </span>
      <IconArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-foreground" />
    </Link>
  );
}

export default function LaboratorioPage() {
  return (
    <div className="flex flex-col gap-10">
      <Breadcrumb
        items={[
          { label: "Início", href: "/" },
          { label: "Laboratório" },
        ]}
      />

      <section aria-labelledby="lab-title" className="flex flex-col gap-6">
        <Eyebrow>Laboratório experimental</Eyebrow>
        <h1
          id="lab-title"
          className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Demonstrações do Sinaliza
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted">
          As demonstrações do MVP em uma sequência sugerida — para conhecer o
          projeto e apresentar o que já existe.
        </p>

        <HonestNote
          title="O que as demonstrações são — e o que não são"
          icon={<IconFlask className="h-5 w-5" />}
        >
          <ul className="flex max-w-2xl flex-col gap-2.5">
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              Não são lições publicadas nem material pedagógico validado: o
              conteúdo de Libras segue em revisão especializada.
            </li>
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              Nenhuma demonstração reconhece sinais de Libras nem avalia a
              produção de quem usa — os experimentos de câmera detectam apenas
              a posição geométrica das mãos.
            </li>
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              Navegar pelas demonstrações não registra progresso nem conclui
              lições das trilhas.
            </li>
          </ul>
        </HonestNote>
      </section>

      <section
        aria-labelledby="journey-title"
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col gap-2">
          <h2
            id="journey-title"
            className="font-display text-2xl font-semibold tracking-tight text-foreground"
          >
            Sequência sugerida
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted">
            Da mecânica de aprendizagem ao estado real do conteúdo e dos
            experimentos técnicos.
          </p>
        </div>
        <ol className="grid gap-3 sm:grid-cols-2" aria-label="Demonstrações em sequência">
          {DEMO_JOURNEY.map((entry, index) => (
            <li key={entry.href} className="h-full">
              <DemoCard entry={entry} index={index} />
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="technical-title"
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col gap-2">
          <h2
            id="technical-title"
            className="font-display text-2xl font-semibold tracking-tight text-foreground"
          >
            Exemplos técnicos adicionais
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted">
            Demonstrações opcionais que exercitam partes da interface de lição
            — úteis para avaliar a plataforma, não o conteúdo.
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Exemplos técnicos">
          {TECHNICAL_EXAMPLES.map((entry) => (
            <li key={entry.href} className="h-full">
              <DemoCard entry={entry} />
            </li>
          ))}
        </ul>
      </section>

      <HonestNote>
        Para a estrutura de aprendizagem planejada, visite as{" "}
        <Link
          href="/trilhas"
          className="font-medium text-accent underline-offset-4 hover:underline"
        >
          trilhas de aprendizagem
        </Link>
        : o material pedagógico só aparece nelas após a validação
        especializada.
      </HonestNote>
    </div>
  );
}
