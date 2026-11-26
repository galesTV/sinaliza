import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/breadcrumb";
import {
  DraftReviewNote,
  ValidationStatusBadge,
} from "@/components/draft-preview";
import { Eyebrow } from "@/components/eyebrow";
import { IconArrowRight } from "@/components/icons";
import { LessonRunner } from "@/components/lesson-runner";
import { getCatalogEntry, lessonCatalog } from "@/data/lesson-catalog";
import { getLessonContext } from "@/data/learning-paths";

interface DraftPreviewProps {
  params: Promise<{ key: string[] }>;
}

export function generateStaticParams() {
  return lessonCatalog
    .filter((entry) => entry.draft)
    .map((entry) => ({ key: entry.lessonKey.split("/") }));
}

export async function generateMetadata({
  params,
}: DraftPreviewProps): Promise<Metadata> {
  const { key } = await params;
  const entry = getCatalogEntry(key.join("/"));
  if (!entry) return {};
  return {
    title: `Laboratório — ${entry.title} (prévia)`,
    description: entry.objective,
    robots: { index: false, follow: false },
  };
}

export default async function DraftPreviewPage({
  params,
}: DraftPreviewProps) {
  const { key } = await params;
  if (key.length !== 3) notFound();
  const entry = getCatalogEntry(key.join("/"));
  const context =
    entry && getLessonContext(key[0], key[1], key[2]);
  if (!entry?.draft || !context) notFound();

  const { path, module } = context;

  return (
    <div className="flex flex-col gap-10">
      <Breadcrumb
        items={[
          { label: "Trilhas", href: "/trilhas" },
          { label: "Lições em revisão", href: "/laboratorio/licoes" },
          { label: entry.title },
        ]}
      />

      <header className="flex flex-col gap-5">
        <Eyebrow>
          Laboratório · {path.title} · {module.title}
        </Eyebrow>
        <h1 className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {entry.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2.5">
          <ValidationStatusBadge status={entry.validationStatus} />
        </div>
        <p className="max-w-xl text-base leading-relaxed text-muted">
          {entry.objective}
        </p>
      </header>

      <DraftReviewNote status={entry.validationStatus} />

      <LessonRunner
        content={entry.draft}
        completionLabel="Prévia concluída"
      />

      {/* Native details/summary: keyboard-operable, with the open state
          announced to assistive tech — no custom disclosure logic. */}
      <details className="group rounded-2xl border border-border bg-surface">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-6 font-display text-lg font-semibold tracking-tight text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
          Referências do catálogo
          <IconArrowRight className="h-4 w-4 shrink-0 text-muted transition-transform duration-200 group-open:rotate-90" />
        </summary>
        <div className="px-6 pb-6">
          <ul className="flex flex-col gap-3">
            {entry.references.map((reference) => (
              <li key={reference.url} className="flex flex-col gap-0.5">
                <a
                  href={reference.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-accent underline-offset-4 hover:underline"
                >
                  {reference.institution}
                </a>
                <span className="text-xs leading-relaxed text-muted">
                  {reference.purpose} Consultado em {reference.consultedAt}.
                </span>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </div>
  );
}
