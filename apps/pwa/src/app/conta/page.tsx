import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Eyebrow } from "@/components/eyebrow";
import { ProgressSyncNote } from "@/components/progress-sync-note";
import { SignOutButton } from "@/components/sign-out-button";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Minha conta",
};

/**
 * /conta — the only route that enforces authentication server-side.
 * The claims read happens inside Suspense (Cache Components requirement);
 * unauthenticated visitors are redirected to /login with a safe `next`.
 */
export default function ContaPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-7">
      <div className="flex flex-col gap-3">
        <Eyebrow>Conta</Eyebrow>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Minha conta
        </h1>
      </div>
      <Suspense
        fallback={
          <p role="status" className="text-sm text-muted">
            Carregando sua conta…
          </p>
        }
      >
        <AccountPanel />
      </Suspense>
    </div>
  );
}

async function AccountPanel() {
  if (!isSupabaseConfigured()) redirect("/");

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login?next=/conta");

  const email =
    typeof data.claims.email === "string" ? data.claims.email : null;

  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-border bg-surface-elevated p-7 sm:p-9">
      <dl className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            E-mail
          </dt>
          <dd className="text-sm font-medium text-foreground">
            {email ?? "Conta conectada"}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Progresso
          </dt>
          <dd className="flex flex-col gap-1.5">
            <ProgressSyncNote />
            <p className="text-sm leading-relaxed text-muted">
              O progresso acumulado sem conta continua neste dispositivo,
              separado do progresso da sua conta.
            </p>
          </dd>
        </div>
      </dl>
      <div className="flex flex-col gap-3">
        <Link href="/trilhas" className="btn-secondary w-full text-sm">
          Continuar aprendendo
        </Link>
        <SignOutButton className="w-full text-sm" />
      </div>
    </div>
  );
}
