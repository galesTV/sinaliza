import type { PathPublicationSummary } from "@/data/path-publication";

import { Badge } from "./badge";

/**
 * Derived publication status for a learning path. Replaces the old
 * "Aberta" badge, which implied content was ready: the count comes from
 * the catalog publication gates, so it can never promise material that
 * has not been validated and published.
 */
export function PublicationBadge({
  summary,
}: {
  summary: PathPublicationSummary;
}) {
  return (
    <Badge tone={summary.published > 0 ? "success" : "neutral"}>
      {summary.published} de {summary.total} publicadas
    </Badge>
  );
}
