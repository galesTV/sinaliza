import { describe, expect, it } from "vitest";

import { resolveCallbackTarget } from "./callback-target";

const code = { kind: "code", code: "abc" } as const;
const recoveryOtp = {
  kind: "otp",
  tokenHash: "h",
  type: "recovery",
} as const;
const signupOtp = {
  kind: "otp",
  tokenHash: "h",
  type: "signup",
} as const;

describe("resolveCallbackTarget", () => {
  it("always sends recovery-purpose links to /nova-senha", () => {
    expect(resolveCallbackTarget("recovery", code, "/conta")).toBe(
      "/nova-senha",
    );
    expect(resolveCallbackTarget("recovery", signupOtp, "/conta")).toBe(
      "/nova-senha",
    );
  });

  it("ignores next entirely for the recovery purpose", () => {
    expect(resolveCallbackTarget("recovery", code, "/trilhas")).toBe(
      "/nova-senha",
    );
  });

  it("routes OTP recovery links on the generic callback to /nova-senha", () => {
    expect(resolveCallbackTarget("confirm", recoveryOtp, "/conta")).toBe(
      "/nova-senha",
    );
  });

  it("sends verified confirmations to the sanitized next destination", () => {
    expect(resolveCallbackTarget("confirm", code, "/conta")).toBe("/conta");
    expect(resolveCallbackTarget("confirm", code, "/trilhas")).toBe(
      "/trilhas",
    );
    expect(resolveCallbackTarget("confirm", signupOtp, "/conta")).toBe(
      "/conta",
    );
  });
});
