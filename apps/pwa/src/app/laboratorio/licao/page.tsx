import type { Metadata } from "next";

import { Eyebrow } from "@/components/eyebrow";
import { HonestNote } from "@/components/honest-note";
import { IconFlask } from "@/components/icons";
import { LessonRunner } from "@/components/lesson-runner";
import { demoLesson } from "@/data/lesson-content";

export const metadata: Metadata = {
  title: "Laboratório — Demonstração de lição",
  description:
    "Demonstração interativa da interface de lição do Sinaliza: passos, exercícios de múltipla escolha, retorno imediato e conclusão — sem conteúdo educacional de Libras.",
};

export default function LessonDemoPage() {
  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="demo-title" className="flex flex-col gap-6">
        <Eyebrow>Laboratório experimental</Eyebrow>
        <h1
          id="demo-title"
          className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Demonstração da experiência de lição
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted">
          Uma prévia interativa de como uma lição do Sinaliza funciona — criada
          para validar a interface e a mecânica antes do material real.
        </p>

        <HonestNote
          title="O que esta demonstração é — e o que não é"
          icon={<IconFlask className="h-5 w-5" />}
        >
          <ul className="flex max-w-2xl flex-col gap-2.5">
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
        </HonestNote>
      </section>

      <LessonRunner
        content={demoLesson}
        completionLabel="Demonstração concluída"
      />
    </div>
  );
}
