"use client";

import { useRef, useState } from "react";

import { claimSubmit, type SubmitGuard } from "@/lib/profile";

import {
  claimGuestProgress,
  dismissGuestClaim,
  useGuestClaimState,
} from "./use-progress";

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/**
 * Copy for the guest-claim card — pure functions so the strings stay
 * unit-testable without a DOM.
 *
 * Honesty rules:
 * - "Atividades" means lessons marked as completed on this device — never
 *   a claim of Libras proficiency or pedagogical evaluation.
 * - "Transferidas" is only claimed after remote verification, never on
 *   enqueue or local state alone.
 * - The warning names the shared-device caveat explicitly: the guest
 *   activities may belong to someone else who used this browser.
 */
export function claimOfferLeadCopy(
  eligible: number,
  email: string | null,
): string {
  const count = plural(eligible, "atividade foi", "atividades foram");
  const destination = email
    ? ` Você pode transferi-las para ${email}.`
    : " Você pode transferi-las para a sua conta.";
  return `${count} marcada${eligible === 1 ? "" : "s"} como concluída${
    eligible === 1 ? "" : "s"
  } neste dispositivo sem uma conta.${destination}`;
}

export const CLAIM_WARNING_COPY =
  "Essas atividades foram registradas neste dispositivo e podem ter sido " +
  "feitas por outra pessoa que também o usou. Elas indicam lições marcadas " +
  "como concluídas — não são uma avaliação do seu domínio em Libras.";

export function claimAwaitingCopy(awaiting: number): string {
  return `Transferência em andamento: ${plural(
    awaiting,
    "atividade aguardando",
    "atividades aguardando",
  )} confirmação na sua conta — a sincronização acontece automaticamente.`;
}

export function claimFailedCopy(failed: number): string {
  return `${plural(failed, "atividade ainda não", "atividades ainda não")} ${
    failed === 1 ? "foi confirmada" : "foram confirmadas"
  } — a sincronização tenta novamente ao reconectar.`;
}

export const CLAIM_CONFIRMED_COPY =
  "As atividades deste dispositivo foram transferidas para a sua conta.";

/**
 * Consent card for transferring guest completions into the signed-in
 * account — the ONLY trigger of `claimGuestProgress` in the app.
 *
 * Renders nothing during SSR/first paint (claim state only exists
 * client-side), for guests, for unconfigured remotes, and when there is
 * nothing offerable or in flight.
 */
export function GuestClaimCard({
  userId,
  email,
}: {
  userId: string;
  email: string | null;
}) {
  const claim = useGuestClaimState();
  const submitGuard: SubmitGuard = useRef(false);
  const [busy, setBusy] = useState(false);
  const [justConfirmed, setJustConfirmed] = useState(false);
  const [prevAwaiting, setPrevAwaiting] = useState(claim.initiated.size);

  // Detect the initiated → confirmed transition of this session to show a
  // one-shot confirmation note (the marker alone cannot distinguish "just
  // confirmed" from claims confirmed in earlier sessions). Adjusted during
  // render — the documented alternative to setState-in-effect.
  if (prevAwaiting !== claim.initiated.size) {
    setPrevAwaiting(claim.initiated.size);
    if (prevAwaiting > 0 && claim.initiated.size === 0) {
      setJustConfirmed(true);
    }
    if (claim.initiated.size > 0) {
      setJustConfirmed(false);
    }
  }

  const awaiting = claim.initiated.size;
  const eligible = claim.eligible.size;

  function handleClaim() {
    if (!claimSubmit(submitGuard)) return;
    setBusy(true);
    try {
      claimGuestProgress(userId);
    } finally {
      submitGuard.current = false;
      setBusy(false);
    }
  }

  function handleDismiss() {
    if (!claimSubmit(submitGuard)) return;
    try {
      dismissGuestClaim(userId);
    } finally {
      submitGuard.current = false;
    }
  }

  if (awaiting > 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-foreground"
      >
        <p>{claimAwaitingCopy(awaiting)}</p>
        {claim.failed > 0 && (
          <p className="mt-1 text-muted">{claimFailedCopy(claim.failed)}</p>
        )}
      </div>
    );
  }

  if (eligible > 0) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-4 py-3">
        <p className="text-sm leading-relaxed text-foreground">
          {claimOfferLeadCopy(eligible, email)}
        </p>
        <p className="text-sm leading-relaxed text-muted">
          {CLAIM_WARNING_COPY}
        </p>
        <div aria-live="polite">
          {justConfirmed && (
            <p
              role="status"
              className="mb-1 text-sm leading-relaxed text-muted"
            >
              {CLAIM_CONFIRMED_COPY}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="btn-primary flex-1"
            onClick={handleClaim}
            disabled={busy}
          >
            {busy ? "Transferindo…" : "Transferir atividades"}
          </button>
          <button
            type="button"
            className="btn-secondary flex-1"
            onClick={handleDismiss}
            disabled={busy}
          >
            Manter separado
          </button>
        </div>
      </div>
    );
  }

  if (justConfirmed) {
    return (
      <p
        role="status"
        aria-live="polite"
        className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm leading-relaxed text-foreground"
      >
        {CLAIM_CONFIRMED_COPY}
      </p>
    );
  }

  return null;
}
