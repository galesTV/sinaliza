import Link from "next/link";

/**
 * Shown by auth entry points when Supabase env vars are absent — guest
 * mode stays the primary experience and no auth client is constructed.
 */
export function AuthUnavailable() {
  return (
    <div
      role="status"
      className="rounded-2xl border border-border bg-surface-elevated p-6"
    >
      <p className="text-sm leading-relaxed text-muted">
        O acesso por conta ainda não está disponível neste ambiente. Você pode
        continuar aprendendo normalmente — seu progresso fica salvo neste
        dispositivo.
      </p>
      <Link
        href="/trilhas"
        className="btn-secondary mt-4 w-full text-sm"
      >
        Explorar as trilhas
      </Link>
    </div>
  );
}
