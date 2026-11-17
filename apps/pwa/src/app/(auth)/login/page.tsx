import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { Eyebrow } from "@/components/eyebrow";
import { resolveAuthNotice } from "@/lib/auth/messages";
import { sanitizeRedirect } from "@/lib/auth/redirect";

export const metadata: Metadata = {
  title: "Entrar",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <>
      <div className="flex flex-col gap-3">
        <Eyebrow>Conta</Eyebrow>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Entrar
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          Acesse sua conta do Sinaliza. As trilhas continuam abertas mesmo sem
          login.
        </p>
      </div>
      <Suspense fallback={<LoginForm next="/conta" notice={null} />}>
        <LoginFormWithParams searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function LoginFormWithParams({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  return (
    <LoginForm
      next={sanitizeRedirect(first(params.next), "/conta")}
      notice={resolveAuthNotice(first(params.erro))}
    />
  );
}
