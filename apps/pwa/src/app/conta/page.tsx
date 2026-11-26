import type { Metadata } from "next";
import { io } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import {
  ActivityHistory,
  HistoryErrorNote,
} from "@/components/activity-history";
import { DisplayNameForm } from "@/components/display-name-form";
import { Eyebrow } from "@/components/eyebrow";
import { GuestClaimCard } from "@/components/guest-claim-card";
import { MilestonesSection } from "@/components/milestones-section";
import { ProgressSyncNote } from "@/components/progress-sync-note";
import { SignOutButton } from "@/components/sign-out-button";
import {
  HISTORY_DISPLAY_LIMIT,
  sortHistoryRows,
  validateHistoryRows,
} from "@/lib/progress-history";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Minha conta",
};

const sectionTitleClass =
  "text-xs font-semibold uppercase tracking-[0.12em] text-muted";

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

  // Supabase Auth reads wall-clock time while loading/validating a session;
  // keep those request-specific reads out of the partial-prerender shell.
  await io();

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login?next=/conta");

  // Identity comes from the verified JWT claims — never from a
  // browser-provided id. The profiles table is only queried after the
  // claims check, and RLS scopes it to the caller's own row.
  const userId = data.claims.sub;
  if (typeof userId !== "string" || userId.length === 0) {
    redirect("/login?next=/conta");
  }

  const email =
    typeof data.claims.email === "string" ? data.claims.email : null;

  // Profile and history are independent reads sharing one loading
  // boundary — fetching them in parallel keeps a slow history query
  // from delaying the profile form and the sign-out button.
  const [profileResult, historyResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle(),
    // Activity history: the account's own completion rows, newest
    // first. RLS already scopes to auth.uid(); the explicit filter
    // keeps the query self-documenting. limit+1 detects truncation
    // without a count query.
    supabase
      .from("lesson_completions")
      .select("lesson_key, completed_at")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .order("lesson_key", { ascending: true })
      .limit(HISTORY_DISPLAY_LIMIT + 1),
  ]);
  const { data: profile, error: profileError } = profileResult;
  const { data: historyRows, error: historyError } = historyResult;

  const savedName =
    !profileError && typeof profile?.display_name === "string"
      ? profile.display_name
      : null;

  const validHistory = sortHistoryRows(validateHistoryRows(historyRows));
  const history = validHistory.slice(0, HISTORY_DISPLAY_LIMIT);
  const historyTruncated = validHistory.length > HISTORY_DISPLAY_LIMIT;

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-border bg-surface-elevated p-7 sm:p-9">
      <section
        aria-labelledby="conta-perfil"
        className="flex flex-col gap-4"
      >
        <h2 id="conta-perfil" className={sectionTitleClass}>
          Perfil
        </h2>
        {profileError ? (
          <p role="status" className="text-sm leading-relaxed text-muted">
            Não foi possível carregar seu nome de exibição agora — seus dados
            continuam seguros. Recarregue a página para tentar novamente.
          </p>
        ) : (
          <DisplayNameForm userId={userId} savedName={savedName} />
        )}
        <dl className="flex flex-col gap-1">
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            E-mail
          </dt>
          <dd className="text-sm font-medium text-foreground">
            {email ?? "Conta conectada"}
          </dd>
        </dl>
      </section>
      <section
        aria-labelledby="conta-atividade"
        className="flex flex-col gap-1.5"
      >
        <h2 id="conta-atividade" className={sectionTitleClass}>
          Atividade e sincronização
        </h2>
        <ProgressSyncNote />
        <GuestClaimCard userId={userId} email={email} />
        <p className="text-sm leading-relaxed text-muted">
          O progresso acumulado sem conta continua neste dispositivo,
          separado do progresso da sua conta.
        </p>
      </section>
      <MilestonesSection titleAs="h2" />
      <section
        aria-labelledby="conta-historico"
        className="flex flex-col gap-3"
      >
        <h2 id="conta-historico" className={sectionTitleClass}>
          Histórico de atividades
        </h2>
        {historyError ? (
          <HistoryErrorNote />
        ) : (
          <ActivityHistory
            userId={userId}
            rows={history}
            truncated={historyTruncated}
            // Emitted once per successful query: a delivered snapshot is
            // provable evidence — an array-reference change alone is not.
            snapshotId={crypto.randomUUID()}
          />
        )}
      </section>
      <section
        aria-labelledby="conta-navegacao"
        className="flex flex-col gap-3"
      >
        <h2 id="conta-navegacao" className={sectionTitleClass}>
          Navegação
        </h2>
        <Link href="/trilhas" className="btn-secondary w-full text-sm">
          Continuar aprendendo
        </Link>
        <SignOutButton className="w-full text-sm" />
      </section>
    </div>
  );
}
