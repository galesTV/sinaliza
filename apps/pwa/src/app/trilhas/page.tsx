import type { Metadata } from "next";

import { Eyebrow } from "@/components/eyebrow";
import { IconClock } from "@/components/icons";
import { PathCard } from "@/components/path-card";
import { getLearningPaths } from "@/data/learning-paths";

export const metadata: Metadata = {
  title: "Trilhas de aprendizagem",
  description:
    "Trilhas de aprendizagem de Libras: alfabeto manual e vocabulário básico, organizadas em módulos curtos.",
};

export default function PathsPage() {
  const paths = getLearningPaths();

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-5">
        <Eyebrow>Aprendizagem</Eyebrow>
        <h1 className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Trilhas de aprendizagem
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted">
          Cada trilha organiza um bloco do seu aprendizado em módulos curtos —
          escolha por onde começar.
        </p>
      </div>

      <ul className="grid gap-5 sm:grid-cols-2">
        {paths.map((path) => (
          <li key={path.slug} className="h-full">
            <PathCard path={path} />
          </li>
        ))}
      </ul>

      <div className="flex items-start gap-3.5 rounded-2xl border border-dashed border-border bg-surface/50 p-5">
        <IconClock
          className="mt-0.5 h-4 w-4 shrink-0 text-muted"
          aria-hidden="true"
        />
        <p className="text-sm leading-relaxed text-muted">
          Novas trilhas — exercícios interativos e prática experimental com
          câmera — chegam nos próximos marcos do projeto.
        </p>
      </div>
    </div>
  );
}
