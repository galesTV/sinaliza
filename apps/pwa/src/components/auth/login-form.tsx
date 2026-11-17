"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { describeAuthError } from "@/lib/auth/messages";
import { isValidEmail } from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

import { AuthField } from "./auth-field";
import { AuthNotice } from "./auth-notice";
import { AuthUnavailable } from "./auth-unavailable";

/**
 * E-mail + password sign-in. `next` is already sanitized by the page.
 * On success the browser client stores the session in cookies; we then
 * navigate and refresh so server components pick up the new session.
 */
export function LoginForm({
  next,
  notice,
}: {
  next: string;
  notice: string | null;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!isSupabaseConfigured()) return <AuthUnavailable />;

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
      const { error } = await createClient().auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setFormError(describeAuthError(error));
        return;
      }
      router.replace(next);
      router.refresh();
    } catch (error) {
      setFormError(describeAuthError(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <AuthNotice message={notice ?? formError} />
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
        <AuthField
          id="senha"
          label="Senha"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          disabled={pending}
        />
        <button type="submit" className="btn-primary w-full" disabled={pending}>
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>
      <div className="flex flex-col items-center gap-2 text-sm">
        <Link
          href="/recuperar"
          className="font-medium text-accent hover:underline"
        >
          Esqueci minha senha
        </Link>
        <p className="text-muted">
          Ainda não tem conta?{" "}
          <Link
            href="/cadastro"
            className="font-medium text-accent hover:underline"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
