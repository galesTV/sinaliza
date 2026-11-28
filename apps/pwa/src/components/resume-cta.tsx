"use client";

import Link from "next/link";

import { getLearningPaths } from "@/data/learning-paths";
import {
  getPathProgress,
  getResumeLesson,
  type ResumeTarget,
} from "@/lib/progression";

import { IconArrowRight, IconCheck } from "./icons";
import { useProgressSnapshot } from "./use-progress";

/**
 * Dashboard "first step" actions, split so the store-free view stays
 * testable: `ResumeCta` only wires the progress snapshot in.
 */
export function ResumeCtaView({
  resume,
  availableCount,
  hasProgress,
  firstPathSlug,
}: {
  resume: ResumeTarget | undefined;
  /** Available lessons across all paths. */
  availableCount: number;
  /** Whether the learner already completed at least one lesson. */
  hasProgress: boolean;
  firstPathSlug: string;
}) {
  if (resume) {
    return (
      <>
        <Link href={resume.url} className="btn-primary">
          {hasProgress ? "Continuar" : "Começar"}: {resume.lesson.title}
          <IconArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/trilhas" className="btn-secondary">
          Explorar trilhas
        </Link>
      </>
    );
  }

  if (availableCount > 0) {
    // Every published lesson is done — honest "all caught up" state.
    return (
      <>
        <Link href="/trilhas" className="btn-primary">
          <IconCheck className="h-4 w-4" />
          Revisar trilhas
        </Link>
        <p className="max-w-xs basis-full text-xs leading-relaxed text-muted">
          Você concluiu todas as lições disponíveis — novas lições chegam
          após a validação pedagógica.
        </p>
      </>
    );
  }

  // Nothing published yet: keep the start-of-path navigation and say so.
  return (
    <>
      <Link href={`/trilhas/${firstPathSlug}`} className="btn-secondary">
        Ver alfabeto manual
        <IconArrowRight className="h-4 w-4" />
      </Link>
      <p className="max-w-xs basis-full text-xs leading-relaxed text-muted">
        Nenhuma lição publicada ainda — a demonstração no topo é interativa,
        mas não registra progresso nem substitui a validação pedagógica.
      </p>
    </>
  );
}

/**
 * Resume affordance: links to the next available, incomplete lesson when
 * one exists. Renders the start-or-honest-fallback view during SSR/first
 * paint (the store is client-only), so no fake resume target ever flashes.
 */
export function ResumeCta({ firstPathSlug }: { firstPathSlug: string }) {
  const snapshot = useProgressSnapshot();
  const paths = getLearningPaths();
  const resume = getResumeLesson(paths, snapshot.completed);
  let availableCount = 0;
  let hasProgress = false;
  for (const path of paths) {
    const progress = getPathProgress(path, snapshot.completed);
    availableCount += progress.availableCount;
    hasProgress ||= progress.completedCount > 0;
  }

  return (
    <ResumeCtaView
      resume={resume}
      availableCount={availableCount}
      hasProgress={hasProgress}
      firstPathSlug={firstPathSlug}
    />
  );
}
