import { describe, expect, it } from "vitest";

import { parseConfirmParams } from "./confirm-params";

function params(query: string): URLSearchParams {
  return new URLSearchParams(query);
}

describe("parseConfirmParams", () => {
  it("parses a PKCE code", () => {
    expect(parseConfirmParams(params("code=abc123"))).toEqual({
      kind: "code",
      code: "abc123",
    });
  });

  it("parses a signup OTP link", () => {
    expect(
      parseConfirmParams(params("token_hash=xyz&type=signup")),
    ).toEqual({ kind: "otp", tokenHash: "xyz", type: "signup" });
  });

  it("parses a recovery OTP link", () => {
    expect(
      parseConfirmParams(params("token_hash=xyz&type=recovery")),
    ).toEqual({ kind: "otp", tokenHash: "xyz", type: "recovery" });
  });

  it("code takes precedence when both styles are present", () => {
    expect(
      parseConfirmParams(params("code=c&token_hash=t&type=signup")),
    ).toEqual({ kind: "code", code: "c" });
  });

  it.each([
    "",
    "token_hash=xyz",
    "type=signup",
    "token_hash=xyz&type=hacker",
    "token_hash=&type=signup",
    "error=access_denied&error_code=otp_expired&error_description=expired",
  ])("rejects query %j", (query) => {
    expect(parseConfirmParams(params(query)).kind).toBe("invalid");
  });
});
