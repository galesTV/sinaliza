import Link from "next/link";

import { ActivitySummary } from "@/components/activity-panel";
import { AtlasProgressProvider } from "@/components/atlas-progress";
import { ConstellationFigure } from "@/components/constellation";
import { Eyebrow } from "@/components/eyebrow";
import { IconArrowRight, IconFlask } from "@/components/icons";
import {
  CONSTELLATION_HOME_SUBTITLE,
  CONSTELLATION_HOME_TITLE,
  LearningConstellationSection,
} from "@/components/learning-constellation-section";
import { MilestonesSection } from "@/components/milestones-section";
import { PathCard } from "@/components/path-card";
import { ResumeCta } from "@/components/resume-cta";
import { getLearningPaths } from "@/data/learning-paths";

export default function Home() {
  const paths = getLearningPaths();
  const firstPath = paths[0];

  return (
    <div className="flex flex-col gap-14 sm:gap-16">
      <section
        aria-labelledby="home-title"
        className="relative flex flex-col gap-6"
      >
        <ConstellationFigure className="pointer-events-none hidden opacity-80 lg:absolute lg:-top-10 lg:right-0 lg:block lg:w-80" />
        <Eyebrow>Aprender Libras. Praticar. Evoluir.</Eyebrow>
        <h1
          id="home-title"
          className="max-w-2xl font-display text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-[2.75rem]"
        >
          Sua jornada em Libras começa aqui
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          Trilhas curtas e visuais para aprender Língua Brasileira de Sinais no
          seu ritmo — sem precisar de câmera.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/laboratorio/experiencia" className="btn-primary">
            Experimentar o Sinaliza
            <IconArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/trilhas" className="btn-secondary">
            Explorar trilhas
          </Link>
        </div>
      </section>

      <section aria-labelledby="next-step-title">
        <div className="rounded-3xl border border-border bg-surface-elevated p-7 shadow-[0_20px_60px_rgba(0,0,0,0.2)] sm:p-9">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex max-w-lg flex-col gap-3">
              <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-highlight">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-highlight shadow-[0_0_10px_rgba(240,168,72,0.6)]"
                />
                Primeiro passo
              </span>
              <h2
                id="next-step-title"
                className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
              >
                Comece pelo alfabeto manual
              </h2>
              <p className="text-sm leading-relaxed text-muted sm:text-base">
                A datilologia — a soletração de palavras com as mãos — é a porta
                de entrada para a Libras: 26 configurações de mão, uma para cada
                letra.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-stretch gap-3 sm:flex-row lg:flex-col">
              <ResumeCta firstPathSlug={firstPath.slug} />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="lab-title" className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Eyebrow>Laboratório experimental</Eyebrow>
          <h2
            id="lab-title"
            className="font-display text-2xl font-semibold tracking-tight text-foreground"
          >
            Comece experimentando
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted">
            Demonstrações públicas do mecanismo de aprendizagem e da visão
            computacional — não são lições validadas nem fazem parte das trilhas.
          </p>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2">
          <li className="sm:col-span-2">
            <Link
              href="/laboratorio/experiencia"
              className="group flex h-full flex-col gap-5 rounded-2xl border border-accent/30 bg-surface-elevated p-6 transition-colors duration-200 hover:border-accent/50 sm:flex-row sm:items-center sm:justify-between sm:p-7"
            >
              <span className="flex min-w-0 items-start gap-3.5">
                <span
                  aria-hidden="true"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-accent/40 bg-accent/10 text-accent"
                >
                  <IconFlask className="h-5 w-5" />
                </span>
                <span className="flex min-w-0 flex-col gap-1.5">
                  <span className="font-display text-lg font-semibold tracking-tight text-foreground">
                    Experimente o Sinaliza
                  </span>
                  <span className="max-w-lg text-sm leading-relaxed text-muted">
                    Conheça uma demonstração interativa do funcionamento das
                    atividades, com exercícios e feedback.
                  </span>
                  <span className="text-xs leading-relaxed text-muted/80">
                    Experiência experimental — ainda não é uma lição validada de
                    Libras.
                  </span>
                </span>
              </span>
              <span className="btn-secondary shrink-0 self-start sm:self-center">
                Iniciar demonstração
                <IconArrowRight aria-hidden="true" className="h-4 w-4" />
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/laboratorio/licao"
              className="group flex h-full items-start gap-3.5 rounded-2xl border border-dashed border-border bg-surface/50 p-5 transition-colors duration-200 hover:border-accent/40 hover:bg-surface"
            >
              <span
                aria-hidden="true"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-surface-elevated text-muted transition-colors duration-200 group-hover:text-accent"
              >
                <IconFlask className="h-5 w-5" />
              </span>
              <span className="flex min-w-0 flex-col gap-1.5">
                <span className="text-sm font-semibold text-foreground">
                  Demonstração de lição
                </span>
                <span className="text-sm leading-relaxed text-muted">
                  Prévia da interface de lição — sem conteúdo educacional de
                  Libras.
                </span>
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/laboratorio/maos"
              className="group flex h-full items-start gap-3.5 rounded-2xl border border-dashed border-border bg-surface/50 p-5 transition-colors duration-200 hover:border-accent/40 hover:bg-surface"
            >
              <span
                aria-hidden="true"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-surface-elevated text-muted transition-colors duration-200 group-hover:text-accent"
              >
                <IconFlask className="h-5 w-5" />
              </span>
              <span className="flex min-w-0 flex-col gap-1.5">
                <span className="text-sm font-semibold text-foreground">
                  Detecção de mãos
                </span>
                <span className="text-sm leading-relaxed text-muted">
                  Detecta pontos da mão com MediaPipe — não reconhece sinais de
                  Libras.
                </span>
              </span>
            </Link>
          </li>
        </ul>
      </section>

      <AtlasProgressProvider>
        <section aria-labelledby="paths-title" className="flex flex-col gap-7">
          <div className="flex flex-col gap-2">
            <h2
              id="paths-title"
              className="font-display text-2xl font-semibold tracking-tight text-foreground"
            >
              Trilhas de aprendizagem
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-muted">
              Cada trilha organiza um bloco do seu aprendizado em módulos curtos.
            </p>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2">
            {paths.map((path) => (
              <li key={path.slug} className="h-full">
                <PathCard path={path} />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="activity-title" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2
              id="activity-title"
              className="font-display text-2xl font-semibold tracking-tight text-foreground"
            >
              Sua atividade
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-muted">
              As lições que você concluir aparecem aqui — só progresso real.
            </p>
          </div>
          <ActivitySummary />
          <LearningConstellationSection
            paths={paths}
            eyebrow="Observatório Pessoal"
            title={CONSTELLATION_HOME_TITLE}
            subtitle={CONSTELLATION_HOME_SUBTITLE}
          />
          <MilestonesSection />
        </section>
      </AtlasProgressProvider>

    </div>
  );
}
