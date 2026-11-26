import type { Metadata } from "next";
import Link from "next/link";

import { SpecimenViewer } from "@/components/alphabet-specimen";
import { Breadcrumb } from "@/components/breadcrumb";
import {
  ValidationStatusBadge,
} from "@/components/draft-preview";
import { Eyebrow } from "@/components/eyebrow";
import { HonestNote } from "@/components/honest-note";
import { IconArrowRight, IconFlask } from "@/components/icons";
import { LessonRunner } from "@/components/lesson-runner";
import {
  alphabetSpecimens,
  getSpecimenUrl,
} from "@/data/alphabet-specimens";
import { guidedExperience } from "@/data/lesson-content";

export const metadata: Metadata = {
  title: "Laboratório — Experiência guiada de aprendizagem",
  description:
    "Experiência integrada do laboratório do Sinaliza: fluxo completo de uma atividade de aprendizagem, sem conteúdo validado e sem registro de progresso.",
  robots: { index: false, follow: false },
};

export default function GuidedExperiencePage() {
  return (
    <div className="flex flex-col gap-10">
      <Breadcrumb
        items={[
          { label: "Trilhas", href: "/trilhas" },
          { label: "Experiência guiada" },
        ]}
      />

      <section aria-labelledby="experience-title" className="flex flex-col gap-6">
        <Eyebrow>Laboratório experimental</Eyebrow>
        <h1
          id="experience-title"
          className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Experiência guiada de aprendizagem
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted">
          Percorra uma atividade completa — do objetivo à conclusão — e depois
          navegue pelos espécimes do alfabeto manual em curadoria.
        </p>

        <HonestNote
          title="O que esta experiência é — e o que não é"
          icon={<IconFlask className="h-5 w-5" />}
        >
          <ul className="flex max-w-2xl flex-col gap-2.5">
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              Demonstra o fluxo completo de uma atividade de aprendizagem:
              objetivo, explicação, demonstração visual, exercícios com
              retorno imediato e conclusão.
            </li>
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              O conteúdo fala sobre a própria plataforma — não é material
              pedagógico validado de Libras, e a mídia é um ativo sintético de
              teste, não uma demonstração de sinal.
            </li>
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              Não registra progresso: concluir esta experiência não marca
              lições, não desbloqueia espécimes e não altera nada nas trilhas.
            </li>
          </ul>
        </HonestNote>
      </section>

      <LessonRunner
        content={guidedExperience}
        completionLabel="Experiência concluída"
      />

      <section
        aria-labelledby="specimens-title"
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col gap-2">
          <h2
            id="specimens-title"
            className="font-display text-2xl font-semibold tracking-tight text-foreground"
          >
            Espécimes do alfabeto manual
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted">
            As primeiras letras em curadoria — cada espécime mostra seu estado
            de validação e a situação honesta da mídia.
          </p>
        </div>

        <ul className="flex flex-col gap-3" aria-label="Espécimes em curadoria">
          {alphabetSpecimens.map((specimen) => (
            <li key={specimen.id}>
              <Link
                href={getSpecimenUrl(specimen.letter)}
                className="group flex min-h-11 items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-4 transition-colors duration-200 hover:bg-white/[0.04]"
              >
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="flex flex-wrap items-center gap-2.5">
                    <span className="font-display text-base font-semibold text-foreground">
                      {specimen.title}
                    </span>
                    <ValidationStatusBadge status={specimen.validationStatus} />
                  </span>
                  <span className="text-sm text-muted">
                    {specimen.media
                      ? "Demonstração disponível para revisão."
                      : "Mídia em produção — licença não confirmada."}
                  </span>
                </span>
                <IconArrowRight className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-foreground" />
              </Link>
            </li>
          ))}
        </ul>

        <HonestNote title="Demonstrações visuais em curadoria">
          Quatro espécimes já exibem fotografias licenciadas para uso educativo
          não comercial (acervo Fiocruz Imagens) nesta prévia local — a letra C
          segue sem mídia licenciada. Os visores abaixo mostram o estado real
          de cada espécime, sem imagens provisórias ou demonstrações
          inventadas.
        </HonestNote>

        <ul
          className="grid gap-5 sm:grid-cols-2"
          aria-label="Visores dos espécimes"
        >
          {alphabetSpecimens.map((specimen) => (
            <li key={specimen.id} className="flex flex-col gap-2">
              <SpecimenViewer specimen={specimen} />
              <p className="text-xs leading-relaxed text-muted">
                {specimen.title} ·{" "}
                <Link
                  href={getSpecimenUrl(specimen.letter)}
                  className="font-medium text-accent underline-offset-4 hover:underline"
                >
                  Ver espécime e referências
                </Link>
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
