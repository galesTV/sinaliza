import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AtlasProgressProvider } from "@/components/atlas-progress";
import { Badge } from "@/components/badge";
import { Breadcrumb } from "@/components/breadcrumb";
import { ConstellationFigure } from "@/components/constellation";
import { Eyebrow } from "@/components/eyebrow";
import { HonestNote } from "@/components/honest-note";
import { ModuleCard } from "@/components/module-card";
import { PathProgressLine } from "@/components/path-progress-line";
import { PathResumeCta } from "@/components/path-resume-cta";
import { PublicationBadge } from "@/components/publication-badge";
import {
  getLearningPath,
  getLearningPaths,
  getPathStats,
} from "@/data/learning-paths";
import { getPathPublicationSummary } from "@/data/path-publication";

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
  const publication = getPathPublicationSummary(path);

  return (
    <AtlasProgressProvider>
      <Breadcrumb
        items={[
          { label: "Trilhas", href: "/trilhas" },
          { label: path.title },
        ]}
      />

      <header className="relative flex flex-col gap-5">
        <ConstellationFigure className="pointer-events-none absolute -top-8 right-0 hidden w-52 opacity-70 sm:block lg:w-64" />
        <Eyebrow>Atlas de Aprendizagem</Eyebrow>
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
          <PublicationBadge summary={publication} />
          {publication.inReview > 0 && (
            <Badge tone="accent">{publication.inReview} em revisão</Badge>
          )}
          {publication.planned > 0 && (
            <Badge>{publication.planned} planejadas</Badge>
          )}
          <Badge>{stats.moduleCount} módulos</Badge>
          <PathProgressLine pathSlug={path.slug} />
        </div>
        <PathResumeCta path={path} />
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

      <HonestNote>{path.contentNote}</HonestNote>
    </AtlasProgressProvider>
  );
}
