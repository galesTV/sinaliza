import type { Metadata } from "next";

import { Eyebrow } from "@/components/eyebrow";
import { HonestNote } from "@/components/honest-note";
import { IconFlask } from "@/components/icons";
import { LessonRunner } from "@/components/lesson-runner";
import { blockedExerciseDemo } from "@/data/lesson-content";

export const metadata: Metadata = {
  title: "Laboratório — Exercício visual bloqueado",
  description:
    "Demonstração de um exercício visual cujo estímulo não tem permissão registrada e não possui alternativa por descrição: permanece bloqueado e a atividade não pode ser concluída.",
};

export default function BlockedVisualLessonDemoPage() {
  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="demo-title" className="flex flex-col gap-6">
        <Eyebrow>Laboratório experimental</Eyebrow>
        <h1
          id="demo-title"
          className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Exercício visual sem estímulo disponível
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted">
          Uma prévia do comportamento fail-closed: quando o estímulo visual
          não pode ser exibido e não há alternativa por descrição, o exercício
          fica bloqueado.
        </p>

        <HonestNote
          title="O que esta demonstração é — e o que não é"
          icon={<IconFlask className="h-5 w-5" />}
        >
          <ul className="flex max-w-2xl flex-col gap-2.5">
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              Mostra o bloqueio de um exercício visual sem evidência de
              permissão e sem alternativa por descrição: as opções não aceitam
              palpite e a atividade não pode ser concluída.
            </li>
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              Não é conteúdo de Libras e não registra progresso.
            </li>
          </ul>
        </HonestNote>
      </section>

      <LessonRunner
        content={blockedExerciseDemo}
        completionLabel="Demonstração concluída"
      />
    </div>
  );
}
