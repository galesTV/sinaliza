import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Badge } from "@/components/badge";
import { Breadcrumb } from "@/components/breadcrumb";
import { Eyebrow } from "@/components/eyebrow";
import {
  LessonContentArea,
  LessonStatusBadge,
} from "@/components/lesson-availability";
import { LessonPager } from "@/components/lesson-pager";
import {
  getLearningPaths,
  getLessonContext,
} from "@/data/learning-paths";

interface LessonPageProps {
  params: Promise<{
    slug: string;
    moduleSlug: string;
    lessonSlug: string;
  }>;
}

export function generateStaticParams() {
  return getLearningPaths().flatMap((path) =>
    path.modules.flatMap((module) =>
      module.lessons.map((lesson) => ({
        slug: path.slug,
        moduleSlug: module.slug,
        lessonSlug: lesson.slug,
      })),
    ),
  );
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { slug, moduleSlug, lessonSlug } = await params;
  const context = getLessonContext(slug, moduleSlug, lessonSlug);
  if (!context) return {};
  return {
    title: context.lesson.title,
    description: context.lesson.objective,
  };
}

export default function LessonPage({ params }: LessonPageProps) {
  return (
    <Suspense fallback={null}>
      <LessonContent params={params} />
    </Suspense>
  );
}

async function LessonContent({ params }: LessonPageProps) {
  const { slug, moduleSlug, lessonSlug } = await params;
  const context = getLessonContext(slug, moduleSlug, lessonSlug);
  if (!context) notFound();

  const { path, module, lesson, position, lessonCount } = context;

  return (
    <div className="flex flex-col gap-10">
      <Breadcrumb
        items={[
          { label: "Trilhas", href: "/trilhas" },
          { label: path.title, href: `/trilhas/${path.slug}` },
          {
            label: module.title,
            href: `/trilhas/${path.slug}#${module.slug}`,
          },
          { label: lesson.title },
        ]}
      />

      <header className="flex flex-col gap-5">
        <Eyebrow>
          {path.title} · {module.title}
        </Eyebrow>
        <h1 className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {lesson.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2.5">
          <LessonStatusBadge status={lesson.status} />
          <Badge>
            Lição {position} de {lessonCount}
          </Badge>
        </div>
      </header>

      <section
        aria-labelledby="objective-title"
        className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6"
      >
        <h2
          id="objective-title"
          className="font-display text-lg font-semibold tracking-tight text-foreground"
        >
          O que você vai aprender
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-muted">
          {lesson.objective}
        </p>
      </section>

      <section
        aria-labelledby="content-title"
        className="flex flex-col gap-5"
      >
        <h2
          id="content-title"
          className="font-display text-2xl font-semibold tracking-tight text-foreground"
        >
          Conteúdo da lição
        </h2>
        <LessonContentArea status={lesson.status} />
      </section>

      <LessonPager context={context} />
    </div>
  );
}
