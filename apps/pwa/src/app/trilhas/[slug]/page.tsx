import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Badge } from "@/components/badge";
import { Breadcrumb } from "@/components/breadcrumb";
import { ConstellationFigure } from "@/components/constellation";
import { Eyebrow } from "@/components/eyebrow";
import { IconClock } from "@/components/icons";
import { ModuleCard } from "@/components/module-card";
import {
  getLearningPath,
  getLearningPaths,
  getPathStats,
} from "@/data/learning-paths";

interface PathPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getLearningPaths().map((path) => ({ slug: path.slug }));
}

export async function generateMetadata({
  params,
}: PathPageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = getLearningPath(slug);
  if (!path) return {};
  return {
    title: path.title,
    description: path.summary,
  };
}

export default function PathPage({ params }: PathPageProps) {
  return (
    <div className="flex flex-col gap-10">
      <Suspense fallback={null}>
        <PathContent params={params} />
      </Suspense>
    </div>
  );
}

async function PathContent({ params }: PathPageProps) {
  const { slug } = await params;
  const path = getLearningPath(slug);
  if (!path) notFound();

  const stats = getPathStats(path);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Trilhas", href: "/trilhas" },
          { label: path.title },
        ]}
      />

      <header className="relative flex flex-col gap-5">
        <ConstellationFigure className="pointer-events-none absolute -top-8 right-0 hidden w-52 opacity-70 sm:block lg:w-64" />
        <Eyebrow>Trilha</Eyebrow>
        <h1 className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {path.title}
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted">
          {path.summary}
        </p>
        <p className="max-w-xl text-sm leading-relaxed text-muted">
          <span className="font-semibold text-foreground">Objetivo: </span>
          {path.goal}
        </p>
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge tone="accent">Aberta</Badge>
          <Badge>{stats.moduleCount} módulos</Badge>
          <Badge>{stats.lessonCount} lições</Badge>
        </div>
      </header>

      <section
        aria-labelledby="modules-title"
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-2">
          <h2
            id="modules-title"
            className="font-display text-2xl font-semibold tracking-tight text-foreground"
          >
            Módulos
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted">
            Os módulos abaixo seguem a sequência definida da trilha.
          </p>
        </div>
        <ol
          className="flex flex-col gap-4"
          aria-label="Módulos na sequência da trilha"
        >
          {path.modules.map((module, index) => (
            <ModuleCard
              key={module.slug}
              module={module}
              index={index}
              total={path.modules.length}
              isLast={index === path.modules.length - 1}
              pathSlug={path.slug}
            />
          ))}
        </ol>
      </section>

      <div className="flex items-start gap-3.5 rounded-2xl border border-dashed border-border bg-surface/50 p-5">
        <IconClock
          className="mt-0.5 h-4 w-4 shrink-0 text-muted"
          aria-hidden="true"
        />
        <p className="text-sm leading-relaxed text-muted">{path.contentNote}</p>
      </div>
    </>
  );
}
