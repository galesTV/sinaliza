"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { describeAuthError } from "@/lib/auth/messages";
import {
  isValidEmail,
  validatePassword,
  validatePasswordConfirmation,
} from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

import { AuthField } from "./auth-field";
import { AuthNotice } from "./auth-notice";
import { AuthUnavailable } from "./auth-unavailable";

/**
 * Registration with e-mail confirmation. Because "Confirm email" is on,
 * a successful sign-up usually yields `data.session === null` — that is
 * NOT an authenticated session and is never presented as one: the UI
 * moves to the "check your e-mail" state instead. The E.3 database
 * trigger creates the profile; the frontend never inserts it.
 */
export function RegisterForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string | null;
    senha?: string | null;
    confirmacao?: string | null;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  if (!isSupabaseConfigured()) return <AuthUnavailable />;

  if (checkEmail) {
    return (
      <div
        role="status"
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-elevated p-6"
      >
        <h2 className="font-display text-xl font-semibold text-foreground">
          Verifique seu e-mail
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          Enviamos um link de confirmação para{" "}
          <span className="font-medium text-foreground">{email.trim()}</span>.
          Abra o link para ativar sua conta e depois entre com e-mail e senha.
        </p>
        <p className="text-sm leading-relaxed text-muted">
          Não encontrou? Confira a pasta de spam ou tente se cadastrar de novo
          em alguns minutos.
        </p>
        <Link href="/login" className="btn-secondary mt-1 w-full text-sm">
          Ir para a página de entrada
        </Link>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const errors = {
      email: isValidEmail(email) ? null : "Informe um e-mail válido.",
      senha: validatePassword(password),
      confirmacao: validatePasswordConfirmation(password, confirmation),
    };
    setFieldErrors(errors);
    if (errors.email || errors.senha || errors.confirmacao) return;

    setFormError(null);
    setPending(true);
    try {
      const { data, error } = await createClient().auth.signUp({
        email: email.trim(),
        password,
        options: {
          // `next` travels inside the callback URL so /auth/confirm can
          // land on the requested destination after verification.
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) {
        setFormError(describeAuthError(error));
        return;
      }
      if (data.session) {
        // E-mail confirmation disabled or auto-confirmed: real session.
        router.replace(next);
        router.refresh();
        return;
      }
      setCheckEmail(true);
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
          error={fieldErrors.email}
          disabled={pending}
        />
        <AuthField
          id="senha"
          label="Senha"
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
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          value={confirmation}
          onChange={setConfirmation}
          error={fieldErrors.confirmacao}
          disabled={pending}
        />
        <button type="submit" className="btn-primary w-full" disabled={pending}>
          {pending ? "Criando conta…" : "Criar conta"}
        </button>
      </form>
      <p className="text-center text-sm text-muted">
        Já tem uma conta?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
