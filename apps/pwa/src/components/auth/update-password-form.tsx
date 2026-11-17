"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { describeAuthError } from "@/lib/auth/messages";
import {
  validatePassword,
  validatePasswordConfirmation,
} from "@/lib/auth/validation";
import { useAuthSession } from "@/components/use-auth-session";
import { createClient } from "@/lib/supabase/client";

import { AuthField } from "./auth-field";
import { AuthNotice } from "./auth-notice";
import { AuthUnavailable } from "./auth-unavailable";

/**
 * Sets a new password inside the session a recovery link established
 * (`/auth/confirm` → verifyOtp → here). Without a session the page shows
 * an expired-link state instead of a form that could never work.
 */
export function UpdatePasswordForm() {
  const router = useRouter();
  const { status } = useAuthSession();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    senha?: string | null;
    confirmacao?: string | null;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  if (status === "unconfigured") return <AuthUnavailable />;

  if (status === "loading") {
    return (
      <p role="status" className="text-sm text-muted">
        Verificando seu link…
      </p>
    );
  }

  if (status === "guest") {
    return (
      <div
        role="status"
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-elevated p-6"
      >
        <h2 className="font-display text-xl font-semibold text-foreground">
          Link inválido ou expirado
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          Este link de redefinição não é mais válido. Solicite um novo e-mail
          para escolher outra senha.
        </p>
        <Link href="/recuperar" className="btn-secondary mt-1 w-full text-sm">
          Solicitar novo link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div
        role="status"
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-elevated p-6"
      >
        <h2 className="font-display text-xl font-semibold text-foreground">
          Senha atualizada
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          Sua nova senha já está valendo. Você segue conectado neste
          dispositivo.
        </p>
        <Link href="/conta" className="btn-primary mt-1 w-full text-sm">
          Ir para minha conta
        </Link>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const errors = {
      senha: validatePassword(password),
      confirmacao: validatePasswordConfirmation(password, confirmation),
    };
    setFieldErrors(errors);
    if (errors.senha || errors.confirmacao) return;

    setFormError(null);
    setPending(true);
    try {
      const { error } = await createClient().auth.updateUser({ password });
      if (error) {
        setFormError(describeAuthError(error));
        return;
      }
      setDone(true);
      router.refresh();
    } catch (error) {
      setFormError(describeAuthError(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <AuthNotice message={formError} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <AuthField
          id="senha"
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          error={fieldErrors.senha}
          hint="Mínimo de 8 caracteres."
          disabled={pending}
        />
        <AuthField
          id="confirmacao"
          label="Confirmar nova senha"
          type="password"
          autoComplete="new-password"
          value={confirmation}
          onChange={setConfirmation}
          error={fieldErrors.confirmacao}
          disabled={pending}
        />
        <button type="submit" className="btn-primary w-full" disabled={pending}>
          {pending ? "Salvando…" : "Salvar nova senha"}
        </button>
      </form>
    </div>
  );
}
