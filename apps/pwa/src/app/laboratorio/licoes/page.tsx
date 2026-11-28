import type { Metadata } from "next";
import Link from "next/link";

import {
  ValidationStatusBadge,
} from "@/components/draft-preview";
import { Eyebrow } from "@/components/eyebrow";
import { HonestNote } from "@/components/honest-note";
import { IconArrowRight, IconFlask } from "@/components/icons";
import {
  getLessonDraftUrl,
  isPublishable,
  lessonCatalog,
} from "@/data/lesson-catalog";

export const metadata: Metadata = {
  title: "Laboratório — Prévia de lições em revisão",
  description:
    "Rascunhos de lições do catálogo pedagógico do Sinaliza: conteúdo em revisão, ainda não validado pedagógica e linguisticamente.",
  robots: { index: false, follow: false },
};

export default function DraftLessonsPage() {
  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="drafts-title" className="flex flex-col gap-6">
        <Eyebrow>Laboratório experimental</Eyebrow>
        <h1
          id="drafts-title"
          className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Lições em revisão
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted">
          Rascunhos do catálogo pedagógico: conteúdo preparado que ainda não
          passou por validação especializada.
        </p>

        <HonestNote
          title="O que estas prévias são — e o que não são"
          icon={<IconFlask className="h-5 w-5" />}
        >
          <ul className="flex max-w-2xl flex-col gap-2.5">
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              Material de trabalho do catálogo pedagógico, aberto para revisão
              — cada prévia mostra seu estado de validação.
            </li>
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              Não é conteúdo publicado: nenhuma lição aparece aqui como
              validada, e a navegação não registra progresso.
            </li>
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              A publicação só acontece após a validação especializada, quando a
              lição passa a constar como disponível na trilha.
            </li>
          </ul>
        </HonestNote>
      </section>

      <ul className="flex flex-col gap-3" aria-label="Rascunhos do catálogo">
        {lessonCatalog.map((entry) => (
          <li key={entry.id}>
            {entry.draft ? (
              <Link
                href={getLessonDraftUrl(entry.lessonKey)}
                className="group flex min-h-11 items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-4 transition-colors duration-200 hover:bg-control-quiet-hover"
              >
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="flex flex-wrap items-center gap-2.5">
                    <span className="font-display text-base font-semibold text-foreground">
                      {entry.title}
                    </span>
                    <ValidationStatusBadge status={entry.validationStatus} />
                  </span>
                  <span className="text-sm text-muted">{entry.objective}</span>
                </span>
                <IconArrowRight className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-foreground" />
              </Link>
            ) : (
              <div className="flex min-h-11 items-center gap-4 rounded-2xl border border-dashed border-border bg-surface/50 px-5 py-4">
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="flex flex-wrap items-center gap-2.5">
                    <span className="font-display text-base font-semibold text-muted">
                      {entry.title}
                    </span>
                    <ValidationStatusBadge status={entry.validationStatus} />
                  </span>
                  <span className="text-sm text-muted">
                    {isPublishable(entry)
                      ? "Validado — publicação acompanha a trilha."
                      : "Sem rascunho preparado ainda."}
                  </span>
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
