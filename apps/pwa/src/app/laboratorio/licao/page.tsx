import type { Metadata } from "next";

import { Eyebrow } from "@/components/eyebrow";
import { LessonRunner } from "@/components/lesson-runner";
import { demoLesson } from "@/data/lesson-content";

export const metadata: Metadata = {
  title: "Laboratório — Demonstração de lição",
  description:
    "Demonstração interativa da interface de lição do Sinaliza: passos, exercícios de múltipla escolha, retorno imediato e conclusão — sem conteúdo educacional de Libras.",
};

export default function LessonDemoPage() {
  return (
    <div className="flex flex-col gap-12">
      <section aria-labelledby="demo-title" className="flex flex-col gap-6">
        <Eyebrow>Laboratório experimental</Eyebrow>
        <h1
          id="demo-title"
          className="max-w-2xl font-display text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl"
        >
          Demonstração da experiência de lição
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted">
          Uma prévia interativa de como uma lição do Sinaliza funciona — criada
          para validar a interface e a mecânica antes do material real.
        </p>

        <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-border bg-surface/50 p-6 sm:p-7">
          <h2 className="text-sm font-semibold text-foreground">
            O que esta demonstração é — e o que não é
          </h2>
          <ul className="flex max-w-2xl flex-col gap-2.5 text-sm leading-relaxed text-muted">
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              Exercita a interface de lição: passos de explicação, exercícios de
              múltipla escolha com retorno imediato e estado de conclusão.
            </li>
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              Não é conteúdo de Libras: os exercícios falam sobre a própria
              mecânica da interface. O material pedagógico segue em validação.
            </li>
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              Não altera lições reais nem registra progresso: concluir a
              demonstração não marca nenhuma lição das trilhas como concluída.
            </li>
          </ul>
        </div>
      </section>

      <LessonRunner
        content={demoLesson}
        completionLabel="Demonstração concluída"
      />
    </div>
  );
}
