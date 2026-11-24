"use client";

import Link from "next/link";

import type { LearningPath } from "@/data/learning-paths";
import {
  getNextLesson,
  getPathProgress,
  type ResumeTarget,
} from "@/lib/progression";

import { useAtlasProgress } from "./atlas-progress";
import { IconArrowRight } from "./icons";

/**
 * Path-scoped resume affordance — the learning recommendation for this
 * trail, distinct from the lesson pager's editorial navigation:
 * - a completable incomplete lesson exists → "Começar"/"Continuar" link;
 * - every completable lesson recorded → honest "all walked" note;
 * - nothing completable → editorial preparation state (a catalog fact —
 *   no personal progress involved — so it renders even while the
 *   identity resolves).
 */
export function PathResumeCtaView({
  resume,
  hasProgress,
  allWalked,
}: {
  resume: ResumeTarget | undefined;
  hasProgress: boolean;
  allWalked: boolean;
}) {
  if (resume) {
    return (
      <Link href={resume.url} className="btn-primary">
        {hasProgress ? "Continuar" : "Começar"}: {resume.lesson.title}
        <IconArrowRight className="h-4 w-4" />
      </Link>
    );
  }
  if (allWalked) {
    return (
      <p className="max-w-xl text-sm leading-relaxed text-muted">
        Você percorreu todas as atividades publicadas desta trilha. Novos
        conteúdos poderão ampliar seu caminho.
      </p>
    );
  }
  return null;
}

/**
 * Zero completable lessons: editorial preparation state instead of a CTA.
 * A catalog fact — renders regardless of identity/loading state.
 */
export function PathPreparationNote() {
  return (
    <div className="flex max-w-xl flex-col gap-1.5 rounded-2xl border border-dashed border-border px-5 py-4">
      <p className="text-sm font-medium text-foreground">
        Uma trilha em construção
      </p>
      <p className="text-xs leading-relaxed text-muted">
        Explore o percurso planejado enquanto preparamos as primeiras
        atividades.
      </p>
    </div>
  );
}

export function PathResumeCta({ path }: { path: LearningPath }) {
  const { completed, loading } = useAtlasProgress();

  const progress = getPathProgress(path, completed);
  const resume = getNextLesson(path, completed);

  // No completable lesson: no fake CTA — the editorial preparation state
  // is a catalog fact and renders even while the identity resolves.
  if (progress.availableCount === 0) return <PathPreparationNote />;
  // Loading is not empty progress: hide the personalized affordance until
  // the active identity's completions resolve.
  if (loading) return null;

  return (
    <PathResumeCtaView
      resume={resume}
      hasProgress={progress.completedCount > 0}
      allWalked={!resume}
    />
  );
}
