"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  DemoConstellation,
  DemoConstellationMini,
} from "@/components/demo-constellation";
import { LessonRunner } from "@/components/lesson-runner";
import { guidedExperience } from "@/data/lesson-content";
import {
  initialDemoConstellationState,
  reduceDemoConstellation,
} from "@/lib/demo-constellation";
import type { LessonRunnerSnapshot } from "@/lib/lesson-runner";

import { IconArrowRight, IconFlask, IconGraduationCap } from "./icons";

/**
 * Guided public demo wiring. The only mutable state is React memory owned
 * by this mounted page: reloads, navigation away and abandonment drop it.
 * Nothing here names or derives a real lesson key.
 */
export function GuidedExperienceDemo() {
  const exerciseStepIndexes = useMemo(
    () =>
      guidedExperience.blocks.flatMap((block, index) =>
        block.kind === "exercise" ? [index] : [],
      ),
    [],
  );
  const [demoState, setDemoState] = useState(() =>
    initialDemoConstellationState(
      guidedExperience.blocks.length,
      exerciseStepIndexes.length,
    ),
  );

  const completionHeadingRef = useRef<HTMLHeadingElement>(null);
  const [runId, setRunId] = useState(0);

  const resetDemonstration = useCallback(() => {
    setRunId((current) => current + 1);
    setDemoState(
      initialDemoConstellationState(
        guidedExperience.blocks.length,
        exerciseStepIndexes.length,
      ),
    );
  }, [exerciseStepIndexes.length]);

  const handleSnapshot = useCallback((snapshot: LessonRunnerSnapshot) => {
    setDemoState((current) => reduceDemoConstellation(current, snapshot));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.sinalizaGuidedDemoHydrated = "true";
    return () => {
      delete document.documentElement.dataset.sinalizaGuidedDemoHydrated;
    };
  }, []);

  useEffect(() => {
    if (demoState.completed) completionHeadingRef.current?.focus();
  }, [demoState.completed]);

  // Client-side route caching can preserve a hidden page's React state.
  // When those effects disconnect, retire this run so a later visit mounts
  // a fresh runner instead of resuming an abandoned demonstration.
  useEffect(() => {
    return () => {
      setRunId((current) => current + 1);
      setDemoState(
        initialDemoConstellationState(
          guidedExperience.blocks.length,
          exerciseStepIndexes.length,
        ),
      );
    };
  }, [exerciseStepIndexes.length]);

  return (
    <div className="flex flex-col gap-6">
      {demoState.completed && (
        <section
          aria-labelledby="demo-completion-title"
          className="flex flex-col gap-5 rounded-2xl border border-success/30 bg-success/[0.06] p-6"
        >
          <div className="flex flex-col gap-2">
            <h2
              ref={completionHeadingRef}
              tabIndex={-1}
              id="demo-completion-title"
              className="font-display text-xl font-semibold tracking-tight text-foreground focus-visible:outline-none"
            >
              Demonstração concluída
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted">
              Você percorreu {demoState.stepCount} etapas e respondeu{" "}
              {demoState.correctExercises} de {demoState.totalExercises}{" "}
              exercícios demonstrativos corretamente. Essa constelação é
              apenas uma simulação visual: nenhuma lição oficial foi concluída
              e nenhum progresso foi salvo.
            </p>
          </div>
          <DemoConstellation
            state={demoState}
            exerciseStepIndexes={exerciseStepIndexes}
            compact
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/laboratorio/maos" className="btn-primary">
              <IconFlask className="h-4 w-4" />
              Experimentar laboratório de mãos
            </Link>
            <Link href="/trilhas" className="btn-secondary">
              <IconGraduationCap className="h-4 w-4" />
              Explorar trilhas
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="order-2 xl:order-1">
          <LessonRunner
            key={runId}
            content={guidedExperience}
            completionLabel="Experiência demonstrativa concluída"
            onSnapshot={handleSnapshot}
            onRestart={resetDemonstration}
            headerAccessory={
              <DemoConstellationMini
                state={demoState}
                exerciseStepIndexes={exerciseStepIndexes}
              />
            }
          />
        </div>
        {!demoState.completed && (
          <aside className="order-1 xl:sticky xl:top-24 xl:order-2">
            <DemoConstellation
              state={demoState}
              exerciseStepIndexes={exerciseStepIndexes}
            />
          </aside>
        )}
      </div>

    </div>
  );
}
