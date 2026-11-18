import type { LessonValidationStatus } from "@/data/lesson-catalog";

import { Badge } from "./badge";
import { HonestNote } from "./honest-note";
import { IconFlask } from "./icons";

/**
 * pt-BR label for each validation state. Deliberately literal — the badge
 * names the furthest completed review stage and never implies validation
 * that has not happened.
 */
export const VALIDATION_STATUS_LABEL: Record<LessonValidationStatus, string> =
  {
    draft: "Rascunho",
    "research-reviewed": "Revisão de pesquisa",
    "technical-reviewed": "Revisão técnica",
    "expert-validated": "Validado por especialista",
  };

export function ValidationStatusBadge({
  status,
}: {
  status: LessonValidationStatus;
}) {
  return (
    <Badge tone={status === "expert-validated" ? "success" : "accent"}>
      {VALIDATION_STATUS_LABEL[status]}
    </Badge>
  );
}

/**
 * Explicit pending-review warning shown above provisional lesson content
 * (AGENTS.md §18): draft material may be previewed for review, but it is
 * not pedagogically or linguistically validated and records no progress.
 */
export function DraftReviewNote({
  status,
}: {
  status: LessonValidationStatus;
}) {
  return (
    <HonestNote
      title="Prévia em revisão — conteúdo não validado"
      icon={<IconFlask className="h-5 w-5" />}
    >
      Este material é uma prévia de trabalho no estado{" "}
      <strong className="font-semibold text-foreground">
        “{VALIDATION_STATUS_LABEL[status]}”
      </strong>
      . Ele ainda aguarda revisão pedagógica e linguística especializada e pode
      mudar antes da publicação. Navegar por ele não registra progresso nem
      marca a lição como concluída.
    </HonestNote>
  );
}
