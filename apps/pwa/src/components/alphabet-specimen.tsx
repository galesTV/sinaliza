import type { AlphabetSpecimen } from "@/data/alphabet-specimens";
import type { LessonMediaBlock } from "@/data/lesson-content";

import { HonestNote } from "./honest-note";
import { IconFlask } from "./icons";
import { LessonMedia } from "./lesson-media";

/**
 * Maps a specimen onto the media block the accessible `LessonMedia`
 * renderer already knows how to present (native controls, captions,
 * attribution, error fallback). Only called when licensed media exists.
 */
function toMediaBlock(
  specimen: AlphabetSpecimen,
): LessonMediaBlock | undefined {
  if (!specimen.media || !specimen.attribution) return undefined;
  return {
    kind: "media",
    title: specimen.title,
    description:
      specimen.description ??
      `Demonstração visual da letra ${specimen.letter} do alfabeto manual de Libras.`,
    media: specimen.media,
    attribution: specimen.attribution,
  };
}

/**
 * Demonstration slot for one catalogued letter. With licensed media it
 * delegates to `LessonMedia`; without it the letter still renders — as an
 * honest "in production" panel, never placeholder imagery or an invented
 * demonstration.
 */
export function SpecimenViewer({
  specimen,
}: {
  specimen: AlphabetSpecimen;
}) {
  const block = toMediaBlock(specimen);

  if (!block) {
    return (
      <div
        role="status"
        className="grid aspect-video w-full place-items-center rounded-2xl border border-dashed border-border bg-surface/50 p-6"
      >
        <p className="max-w-sm text-center text-sm leading-relaxed text-muted">
          Demonstração visual da letra {specimen.letter} em produção —
          nenhum material com licença confirmada está disponível ainda.
        </p>
      </div>
    );
  }

  return <LessonMedia block={block} />;
}

/**
 * Pending-validation warning specific to specimens: the preview may show
 * media still awaiting linguistic review and/or license confirmation.
 */
export function SpecimenReviewNote({
  specimen,
}: {
  specimen: AlphabetSpecimen;
}) {
  return (
    <HonestNote
      title="Prévia em revisão — espécime não validado"
      icon={<IconFlask className="h-5 w-5" />}
    >
      Este espécime visual da letra {specimen.letter} está em curadoria: a
      demonstração ainda depende
      de revisão linguística especializada e de confirmação de direitos de
      uso antes de ser publicada na lição. Visualizar esta página não
      registra progresso nem marca a lição como concluída.
    </HonestNote>
  );
}
