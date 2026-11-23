"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import {
  DISPLAY_NAME_MAX_LENGTH,
  claimSubmit,
  describeProfileError,
  planDisplayNameSave,
  saveDisplayName,
} from "@/lib/profile";
import { createClient } from "@/lib/supabase/client";

import { AuthField } from "./auth/auth-field";
import { AuthNotice } from "./auth/auth-notice";

interface DisplayNameFormProps {
  /**
   * Server-verified `auth.users` id. It scopes the profile write — it is
   * never user input, and RLS rejects any row that is not the caller's own.
   */
  userId: string;
  /**
   * Persisted display name, or null when the profiles row is absent (a
   * legacy account predating the creation trigger). In that case the first
   * explicit save creates the row — nothing is written silently.
   */
  savedName: string | null;
}

/**
 * Display-name read/edit form for `/conta`. No optimistic UI: the success
 * state is only shown after Supabase confirms the write, and a failed save
 * keeps the typed value so it can be retried without retyping.
 */
export function DisplayNameForm({ userId, savedName }: DisplayNameFormProps) {
  const router = useRouter();
  const [persistedName, setPersistedName] = useState(savedName);
  const [value, setValue] = useState(savedName ?? "");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  // Synchronous re-entrancy guard: React state only applies after the next
  // render, so two submits fired in the same task could both pass a
  // `pending`-only check. The ref is claimed before the request starts and
  // released in `finally` (errors included).
  const submitGuard = useRef(false);

  function handleChange(next: string) {
    setValue(next);
    // A success/feedback message describes the last confirmed state, so it
    // is cleared as soon as the field diverges from it.
    setNotice(null);
    setFormError(null);
    setFieldError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const plan = planDisplayNameSave(value, persistedName);
    if (plan.kind === "invalid") {
      setFieldError(plan.message);
      setFormError(null);
      setNotice(null);
      return;
    }
    if (plan.kind === "unchanged") {
      setFieldError(null);
      setFormError(null);
      setNotice("O nome de exibição já está salvo — nada para atualizar.");
      return;
    }

    if (!claimSubmit(submitGuard)) return;

    setFieldError(null);
    setFormError(null);
    setNotice(null);
    setPending(true);
    try {
      const result = await saveDisplayName(
        createClient(),
        userId,
        plan.displayName,
      );
      if (!result.ok) {
        setFormError(result.message);
        return;
      }
      setPersistedName(result.displayName);
      setNotice("Nome de exibição atualizado.");
      router.refresh();
    } catch (error) {
      setFormError(describeProfileError(error));
    } finally {
      submitGuard.current = false;
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {persistedName === null && (
        <p className="text-sm leading-relaxed text-muted">
          Seu perfil ainda não tem um nome de exibição. Escolha um nome para
          completá-lo — ele só aparece para você.
        </p>
      )}
      <AuthNotice message={formError} />
      <div aria-live="polite">
        {notice && (
          <p
            role="status"
            className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm leading-relaxed text-foreground"
          >
            {notice}
          </p>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <AuthField
          id="nome-exibicao"
          label="Nome de exibição"
          type="text"
          autoComplete="nickname"
          inputMode="text"
          value={value}
          onChange={handleChange}
          error={fieldError}
          hint={`É assim que o Sinaliza te chama. Até ${DISPLAY_NAME_MAX_LENGTH} caracteres.`}
          disabled={pending}
        />
        <button type="submit" className="btn-primary w-full" disabled={pending}>
          {pending ? "Salvando…" : "Salvar nome"}
        </button>
      </form>
    </div>
  );
}
