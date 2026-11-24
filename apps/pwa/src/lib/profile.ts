import type { SupabaseClient } from "@supabase/supabase-js";

export const DISPLAY_NAME_MAX_LENGTH = 80;

/**
 * Client-side mirror of the database contract
 * (`check (char_length(display_name) between 1 and 80)`). Returns the pt-BR
 * field error, or null when the value is valid after trimming.
 */
export function validateDisplayName(rawValue: string): string | null {
  const name = rawValue.trim();
  if (name.length === 0) {
    return "Informe um nome de exibição.";
  }
  if (name.length > DISPLAY_NAME_MAX_LENGTH) {
    return `O nome de exibição pode ter no máximo ${DISPLAY_NAME_MAX_LENGTH} caracteres.`;
  }
  return null;
}

export type DisplayNameSavePlan =
  | { kind: "invalid"; message: string }
  | { kind: "unchanged" }
  | { kind: "submit"; displayName: string };

/**
 * Decides what a submit should do before any request is made: reject
 * invalid input, skip a no-op write when the trimmed value already matches
 * the persisted name, or submit the normalized name.
 */
export function planDisplayNameSave(
  rawValue: string,
  savedName: string | null,
): DisplayNameSavePlan {
  const message = validateDisplayName(rawValue);
  if (message) return { kind: "invalid", message };
  const displayName = rawValue.trim();
  if (savedName !== null && displayName === savedName) {
    return { kind: "unchanged" };
  }
  return { kind: "submit", displayName };
}

/**
 * pt-BR mapping for profile write failures. PostgREST exposes SQLSTATE and
 * `PGRST*` codes — raw server messages are never shown. Network failures
 * arrive as `TypeError`/fetch errors; an expired JWT surfaces as
 * `PGRST301`/auth errors mid-write.
 */
export function describeProfileError(error: unknown): string {
  if (
    error instanceof TypeError ||
    (error instanceof Error && /fetch|network/i.test(error.message))
  ) {
    return "Não foi possível conectar. Verifique sua conexão com a internet e tente novamente.";
  }
  const code =
    typeof (error as { code?: unknown } | null)?.code === "string"
      ? (error as { code: string }).code
      : null;
  const message = error instanceof Error ? error.message : "";
  if (code === "PGRST301" || /jwt|token|expired/i.test(message)) {
    return "Sua sessão expirou. Entre novamente para salvar a alteração.";
  }
  if (code === "23514") {
    return "O nome de exibição precisa ter entre 1 e 80 caracteres.";
  }
  if (code === "42501") {
    return "Você não tem permissão para alterar este perfil.";
  }
  return "Não foi possível salvar o nome de exibição agora. Tente novamente.";
}

/** A synchronous re-entrancy flag (e.g. a React `useRef`). */
export interface SubmitGuard {
  current: boolean;
}

/**
 * Claims a synchronous submit guard: returns true and sets the flag when
 * free, false when a submission is already in flight. Unlike React state
 * (which only applies on the next render), a claimed ref blocks a second
 * submit fired in the same task — release it with `guard.current = false`
 * in a `finally` block so failures never leave it held.
 */
export function claimSubmit(guard: SubmitGuard): boolean {
  if (guard.current) return false;
  guard.current = true;
  return true;
}

export interface SaveDisplayNameResult {
  ok: boolean;
  /** The normalized name submitted (echoed for UI state on success). */
  displayName: string;
  message: string | null;
}

/**
 * Persists the display name for the given profile row. `upsert` covers two
 * cases with one explicit user action: the normal UPDATE for existing
 * profiles, and INSERT for legacy accounts the creation trigger predates —
 * a plain update would silently affect zero rows there.
 *
 * `userId` comes from server-verified claims (never from form input), and
 * RLS rejects anything that is not the caller's own row anyway.
 */
export async function saveDisplayName(
  client: SupabaseClient,
  userId: string,
  rawName: string,
): Promise<SaveDisplayNameResult> {
  const displayName = rawName.trim();
  const { error } = await client
    .from("profiles")
    .upsert({ id: userId, display_name: displayName }, { onConflict: "id" });
  if (error) {
    return { ok: false, displayName, message: describeProfileError(error) };
  }
  return { ok: true, displayName, message: null };
}
