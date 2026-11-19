import type { Metadata } from "next";

import { Eyebrow } from "@/components/eyebrow";
import { HonestNote } from "@/components/honest-note";
import { IconFlask } from "@/components/icons";
import { LessonRunner } from "@/components/lesson-runner";
import { visualExerciseDemo } from "@/data/lesson-content";

export const metadata: Metadata = {
  title: "Laboratório — Exercícios visuais",
  description:
    "Demonstração da infraestrutura de exercícios visuais do Sinaliza com ativos sintéticos: estímulo em imagem, opções com imagem, gate de permissão e alternativa por descrição — sem conteúdo de Libras.",
};

export default function VisualLessonDemoPage() {
  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="demo-title" className="flex flex-col gap-6">
        <Eyebrow>Laboratório experimental</Eyebrow>
        <h1
          id="demo-title"
          className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Exercícios com estímulo visual
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted">
          Uma prévia da mecânica de exercícios visuais, usando formas
          geométricas sintéticas no lugar de demonstrações de Libras.
        </p>

        <HonestNote
          title="O que esta demonstração é — e o que não é"
          icon={<IconFlask className="h-5 w-5" />}
        >
          <ul className="flex max-w-2xl flex-col gap-2.5">
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              Exercita a infraestrutura visual: estímulo em imagem, opções com
              imagem, bloqueio por falta de permissão e a alternativa por
              descrição.
            </li>
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              Não é conteúdo de Libras: os estímulos são formas geométricas
              sintéticas. Nenhuma imagem real de sinais entra sem licença
              confirmada.
            </li>
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              Não registra progresso: concluir esta demonstração não marca
              nenhuma lição das trilhas.
            </li>
          </ul>
        </HonestNote>
      </section>

      <LessonRunner
        content={visualExerciseDemo}
        completionLabel="Demonstração concluída"
      />
    </div>
  );
}
