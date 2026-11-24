import type { LearningPath } from "@/data/learning-paths";

import { Eyebrow } from "./eyebrow";
import { LearningConstellation } from "./learning-constellation";

export const CONSTELLATION_HOME_TITLE = "Sua constelação";
export const CONSTELLATION_HOME_SUBTITLE =
  "Cada atividade percorrida ilumina uma parte da sua jornada.";
export const CONSTELLATION_PATH_TITLE = "Constelação da trilha";
export const CONSTELLATION_PATH_SUBTITLE =
  "Cada atividade percorrida ilumina uma parte desta jornada.";
export const CONSTELLATION_NOTE =
  "A constelação acompanha as atividades atualmente publicadas e representa sua participação na jornada de aprendizagem.";

/**
 * Panel hosting the dynamic learning constellation. On the home it lives
 * inside the Personal Observatory ("Sua atividade"), nested under that
 * section's h2 — so the title renders as h3; on a path page it is a peer
 * section and renders as h2.
 */
export function LearningConstellationSection({
  paths,
  eyebrow,
  title,
  subtitle,
  titleAs: Title = "h3",
}: {
  paths: readonly LearningPath[];
  eyebrow: string;
  title: string;
  subtitle: string;
  titleAs?: "h2" | "h3";
}) {
  return (
    <section
      aria-labelledby="learning-constellation-title"
      className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-7"
    >
      <div className="flex flex-col gap-2.5">
        <Eyebrow>{eyebrow}</Eyebrow>
        <Title
          id="learning-constellation-title"
          className="font-display text-lg font-semibold tracking-tight text-foreground"
        >
          {title}
        </Title>
        <p className="max-w-xl text-sm leading-relaxed text-muted">{subtitle}</p>
      </div>
      <LearningConstellation paths={paths} />
      <p className="text-xs leading-relaxed text-muted">{CONSTELLATION_NOTE}</p>
    </section>
  );
}
