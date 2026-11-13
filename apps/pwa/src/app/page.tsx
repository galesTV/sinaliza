import Link from "next/link";

import { Eyebrow } from "@/components/eyebrow";
import {
  IconActivity,
  IconArrowRight,
  IconGraduationCap,
} from "@/components/icons";
import { PathCard } from "@/components/path-card";
import { getLearningPaths } from "@/data/learning-paths";

export default function Home() {
  const paths = getLearningPaths();
  const firstPath = paths[0];

  return (
    <div className="flex flex-col gap-14">
      <section aria-labelledby="home-title" className="flex flex-col gap-6">
        <Eyebrow>Aprender Libras. Praticar. Evoluir.</Eyebrow>
        <h1
          id="home-title"
          className="max-w-2xl font-display text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl"
        >
          Sua jornada em Libras começa aqui
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted">
          Trilhas curtas e visuais para aprender Língua Brasileira de Sinais no
          seu ritmo — sem precisar de câmera.
        </p>

        <div className="mt-2 flex flex-col gap-6 rounded-3xl border border-border bg-surface p-7 shadow-[0_20px_60px_rgba(0,0,0,0.2)] sm:p-9 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-lg flex-col gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              Primeiro passo
            </span>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Comece pelo alfabeto manual
            </h2>
            <p className="text-sm leading-relaxed text-muted">
              A datilologia — a soletração de palavras com as mãos — é a porta
              de entrada para a Libras: 26 configurações de mão, uma para cada
              letra.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row lg:flex-col">
            <Link
              href={`/trilhas/${firstPath.slug}`}
              className="inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[11px] border border-white/15 bg-gradient-to-r from-primary to-[#8272f2] px-5 text-sm font-semibold text-on-primary shadow-[0_10px_30px_rgba(105,87,232,0.25)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(105,87,232,0.35)]"
            >
              Começar pelo alfabeto
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/trilhas"
              className="inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[11px] border border-border bg-white/[0.025] px-5 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-white/[0.07]"
            >
              Explorar trilhas
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="paths-title" className="flex flex-col gap-6">
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
        <h2
          id="activity-title"
          className="font-display text-2xl font-semibold tracking-tight text-foreground"
        >
          Sua atividade
        </h2>
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-border bg-surface/50 p-7">
          <span
            aria-hidden="true"
            className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-surface-elevated text-muted"
          >
            <IconActivity className="h-5 w-5" />
          </span>
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-semibold text-foreground">
              Nenhuma atividade ainda
            </p>
            <p className="max-w-lg text-sm leading-relaxed text-muted">
              Quando as primeiras lições forem liberadas e você concluir uma
              delas, lições concluídas, sequência de estudo e XP aparecem aqui.
            </p>
          </div>
          <Link
            href="/trilhas"
            className="inline-flex min-h-10 items-center gap-2 rounded-[10px] border border-primary/35 bg-primary/10 px-4 text-xs font-semibold text-primary-soft transition-colors duration-200 hover:border-primary/60"
          >
            <IconGraduationCap className="h-4 w-4" />
            Ver o que vem por aí
          </Link>
        </div>
      </section>
    </div>
  );
}
