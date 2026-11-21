import { AuthError } from "@supabase/supabase-js";

/**
 * pt-BR auth error mapping. Supabase `AuthError.code` values are stable
 * public identifiers; unknown and network failures fall back to safe
 * generic copy that never exposes internals (tokens, URLs, stack data).
 */
const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials:
    "E-mail ou senha incorretos. Confira os dados e tente novamente.",
  email_not_confirmed:
    "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada e o link que enviamos.",
  over_email_send_rate_limit:
    "Muitas tentativas em sequência. Aguarde alguns instantes e tente novamente.",
  over_request_rate_limit:
    "Muitas tentativas em sequência. Aguarde alguns instantes e tente novamente.",
  weak_password: "A senha não atende aos requisitos de segurança.",
  same_password: "A nova senha precisa ser diferente da atual.",
  otp_expired: "O link é inválido ou já expirou. Solicite um novo e tente novamente.",
  user_already_exists: "Não foi possível concluir o cadastro com esses dados.",
};

const GENERIC_MESSAGE =
  "Não foi possível concluir a operação agora. Tente novamente.";
const NETWORK_MESSAGE =
  "Não foi possível conectar. Verifique sua conexão com a internet e tente novamente.";

export function describeAuthError(error: unknown): string {
  if (error instanceof AuthError && error.code) {
    return ERROR_MESSAGES[error.code] ?? GENERIC_MESSAGE;
  }
  if (
    error instanceof TypeError ||
    (error instanceof Error && /fetch|network/i.test(error.message))
  ) {
    return NETWORK_MESSAGE;
  }
  return GENERIC_MESSAGE;
}

/** Messages shown for `?erro=` values set by internal redirects. */
const NOTICE_MESSAGES: Record<string, string> = {
  "link-invalido":
    "O link de confirmação é inválido, expirou ou já foi usado. Se você acabou de confirmar o e-mail em outro navegador, sua conta já pode estar ativa — tente entrar. Caso contrário, solicite um novo e-mail.",
};

export function resolveAuthNotice(code: unknown): string | null {
  if (typeof code !== "string") return null;
  return NOTICE_MESSAGES[code] ?? null;
}
