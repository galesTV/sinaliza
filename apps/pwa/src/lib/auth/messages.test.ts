import { AuthError } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { describeAuthError, resolveAuthNotice } from "./messages";

describe("describeAuthError", () => {
  it("maps invalid credentials without revealing account existence", () => {
    const error = new AuthError("Invalid login credentials", 400, "invalid_credentials");
    expect(describeAuthError(error)).toBe(
      "E-mail ou senha incorretos. Confira os dados e tente novamente.",
    );
  });

  it("maps unconfirmed email", () => {
    const error = new AuthError("Email not confirmed", 400, "email_not_confirmed");
    expect(describeAuthError(error)).toContain("não foi confirmado");
  });

  it("maps rate limits", () => {
    const error = new AuthError("For security purposes", 429, "over_request_rate_limit");
    expect(describeAuthError(error)).toContain("Muitas tentativas");
  });

  it("maps network failures to a connectivity message", () => {
    expect(describeAuthError(new TypeError("fetch failed"))).toContain("conexão");
  });

  it.each([new Error("boom"), "string", null, undefined, { code: "unknown_code" }])(
    "falls back to generic copy for %j",
    (error) => {
      expect(describeAuthError(error)).toBe(
        "Não foi possível concluir a operação agora. Tente novamente.",
      );
    },
  );

  it("falls back for an unmapped AuthError code", () => {
    const error = new AuthError("something new", 500, "totally_new_code");
    expect(describeAuthError(error)).toBe(
      "Não foi possível concluir a operação agora. Tente novamente.",
    );
  });
});

describe("resolveAuthNotice", () => {
  it("resolves known internal error codes", () => {
    expect(resolveAuthNotice("link-invalido")).toContain("inválido");
  });

  it.each([undefined, null, "", "desconhecido", 12])(
    "ignores unknown code %j",
    (code) => {
      expect(resolveAuthNotice(code)).toBeNull();
    },
  );
});
