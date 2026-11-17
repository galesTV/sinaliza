/**
 * Client-side auth form validation. These checks improve UX only — the
 * authoritative rules live on the Supabase Auth server (e.g. password
 * strength) and in database constraints (display name 1–80).
 */

export const PASSWORD_MIN_LENGTH = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

/** Returns a pt-BR error message or `null` when the password is acceptable. */
export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `A senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
  return null;
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): string | null {
  if (password !== confirmation) return "As senhas não coincidem.";
  return null;
}
