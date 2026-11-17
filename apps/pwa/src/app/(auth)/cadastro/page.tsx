import type { Metadata } from "next";
import { Suspense } from "react";

import { RegisterForm } from "@/components/auth/register-form";
import { Eyebrow } from "@/components/eyebrow";
import { sanitizeRedirect } from "@/lib/auth/redirect";

export const metadata: Metadata = {
  title: "Criar conta",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function CadastroPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <>
      <div className="flex flex-col gap-3">
        <Eyebrow>Conta</Eyebrow>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Criar conta
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          Crie sua conta para guardar seu acesso. Após o cadastro, pode ser
          necessário confirmar o e-mail antes de entrar — a gente avisa o que
          fazer.
        </p>
      </div>
      <Suspense fallback={<RegisterForm next="/conta" />}>
        <RegisterFormWithParams searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function RegisterFormWithParams({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  return (
    <RegisterForm next={sanitizeRedirect(first(params.next), "/conta")} />
  );
}
