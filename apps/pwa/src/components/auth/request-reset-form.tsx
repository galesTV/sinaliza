"use client";

import Link from "next/link";
import { useState } from "react";

import { describeAuthError } from "@/lib/auth/messages";
import { isValidEmail } from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

import { AuthField } from "./auth-field";
import { AuthNotice } from "./auth-notice";
import { AuthUnavailable } from "./auth-unavailable";

/**
 * Password recovery request. The confirmation copy is deliberately
 * identical whether the e-mail exists or not — never revealing account
 * existence through the UI.
 */
export function RequestResetForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isSupabaseConfigured()) return <AuthUnavailable />;

  if (sent) {
    return (
      <div
        role="status"
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-elevated p-6"
      >
        <h2 className="font-display text-xl font-semibold text-foreground">
          Verifique seu e-mail
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          Se{" "}
          <span className="font-medium text-foreground">{email.trim()}</span>{" "}
          estiver cadastrado, você receberá um link para redefinir a senha.
          O link leva a uma tela segura de nova senha.
        </p>
        <Link href="/login" className="btn-secondary mt-1 w-full text-sm">
          Voltar para a entrada
        </Link>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    if (!isValidEmail(email)) {
      setEmailError("Informe um e-mail válido.");
      return;
    }
    setEmailError(null);
    setFormError(null);
    setPending(true);
    try {
      const { error } = await createClient().auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${window.location.origin}/auth/confirm` },
      );
      if (error) {
        setFormError(describeAuthError(error));
        return;
      }
      setSent(true);
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
          id="email"
          label="E-mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          error={emailError}
          disabled={pending}
        />
        <button type="submit" className="btn-primary w-full" disabled={pending}>
          {pending ? "Enviando…" : "Enviar link de redefinição"}
        </button>
      </form>
      <p className="text-center text-sm text-muted">
        Lembrou a senha?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Voltar para entrar
        </Link>
      </p>
    </div>
  );
}
