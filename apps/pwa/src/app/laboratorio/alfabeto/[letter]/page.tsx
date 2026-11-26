import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  SpecimenReviewNote,
  SpecimenViewer,
} from "@/components/alphabet-specimen";
import { Breadcrumb } from "@/components/breadcrumb";
import { ValidationStatusBadge } from "@/components/draft-preview";
import { Eyebrow } from "@/components/eyebrow";
import { IconArrowRight, IconFlask } from "@/components/icons";
import {
  alphabetSpecimens,
  getSpecimen,
} from "@/data/alphabet-specimens";
import { getLessonContext } from "@/data/learning-paths";
import { parseLessonKey } from "@/lib/progress";

interface SpecimenPreviewProps {
  params: Promise<{ letter: string }>;
}

export function generateStaticParams() {
  return alphabetSpecimens.map((specimen) => ({
    letter: specimen.letter.toLowerCase(),
  }));
}

export async function generateMetadata({
  params,
}: SpecimenPreviewProps): Promise<Metadata> {
  const { letter } = await params;
  const specimen = getSpecimen(letter);
  if (!specimen) return {};
  return {
    title: `Laboratório — ${specimen.title} (prévia)`,
    description: `Espécime visual da letra ${specimen.letter} do alfabeto manual em curadoria.`,
    robots: { index: false, follow: false },
  };
}

export default async function SpecimenPreviewPage({
  params,
}: SpecimenPreviewProps) {
  const { letter } = await params;
  const specimen = getSpecimen(letter);
  if (!specimen) notFound();

  const parsed = parseLessonKey(specimen.lessonKey);
  const context =
    parsed &&
    getLessonContext(parsed.pathSlug, parsed.moduleSlug, parsed.lessonSlug);

  return (
    <div className="flex flex-col gap-10">
      <Breadcrumb
        items={[
          { label: "Trilhas", href: "/trilhas" },
          {
            label: "Curadoria do alfabeto",
            href: "/laboratorio/alfabeto",
          },
          { label: specimen.title },
        ]}
      />

      <header className="flex flex-col gap-5">
        <Eyebrow>
          Laboratório · Alfabeto manual
          {context ? ` · ${context.module.title}` : ""}
        </Eyebrow>
        <h1 className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {specimen.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2.5">
          <ValidationStatusBadge status={specimen.validationStatus} />
        </div>
      </header>

      <SpecimenReviewNote specimen={specimen} />

      <section aria-labelledby="media-title" className="flex flex-col gap-4">
        <h2
          id="media-title"
          className="font-display text-2xl font-semibold tracking-tight text-foreground"
        >
          Demonstração visual
        </h2>
        <SpecimenViewer specimen={specimen} />
        {specimen.description && (
          <p className="max-w-xl text-sm leading-relaxed text-muted">
            {specimen.description}
          </p>
        )}
      </section>

      <details className="group rounded-2xl border border-border bg-surface">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-6 font-display text-lg font-semibold tracking-tight text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
          Referências de curadoria
          <IconArrowRight className="h-4 w-4 shrink-0 text-muted transition-transform duration-200 group-open:rotate-90" />
        </summary>
        <div className="px-6 pb-6">
          <ul className="flex flex-col gap-3">
            {specimen.references.map((reference) => (
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

      <Link
        href="/laboratorio/experiencia"
        className="group inline-flex items-center gap-2 self-start text-sm font-medium text-accent transition-colors hover:text-foreground"
      >
        <IconFlask className="h-4 w-4" />
        Voltar à experiência guiada
      </Link>
    </div>
  );
}
