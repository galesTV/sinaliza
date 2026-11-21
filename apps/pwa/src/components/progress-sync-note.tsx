"use client";

import type { ProgressSyncSnapshot } from "@/lib/progress-orchestrator";

import { useProgressSyncState } from "./use-progress";

/**
 * Copy for the account-page sync note — a pure function so the strings stay
 * unit-testable without a DOM.
 *
 * Honesty rules (hackathon scope):
 * - "sincronizado" is only claimed when hydration for this account ran AND
 *   there is nothing pending or failed.
 * - pending/failed counts come from the sync queue, never from the
 *   completion store — the two are kept strictly separate.
 * - Hydration not yet confirmed reads as "não confirmada", not as synced.
 */
export function syncNoteCopy(sync: ProgressSyncSnapshot): string {
  if (!sync.configured || sync.failed > 0) {
    if (sync.failed > 0) {
      return `${sync.failed === 1 ? "1 conclusão ainda não foi" : `${sync.failed} conclusões ainda não foram`} sincronizada${sync.failed === 1 ? "" : "s"} — uma nova tentativa acontece ao reconectar.`;
    }
    return "Sincronização com a conta indisponível — o progresso continua salvo neste dispositivo.";
  }
  if (sync.pending > 0) {
    return `${sync.pending === 1 ? "1 conclusão aguardando" : `${sync.pending} conclusões aguardando`} envio para a sua conta — a sincronização acontece automaticamente.`;
  }
  if (!sync.hydrated) {
    return "Sincronização com a sua conta ainda não confirmada nesta sessão — seu progresso está salvo neste dispositivo.";
  }
  return "Seu progresso está sincronizado com a sua conta neste dispositivo.";
}

/**
 * Account-page progress note. Renders nothing during SSR/first paint (the
 * sync state only exists client-side), then states the real sync condition —
 * never claiming synchronization that did not happen.
 */
export function ProgressSyncNote() {
  const sync = useProgressSyncState();
  const text = syncNoteCopy(sync);
  return (
    <p className="text-sm leading-relaxed text-muted" role="status">
      {text}
    </p>
  );
}
