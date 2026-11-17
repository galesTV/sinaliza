import { describe, expect, it } from "vitest";

import {
  PASSWORD_MIN_LENGTH,
  isValidEmail,
  validatePassword,
  validatePasswordConfirmation,
} from "./validation";

describe("isValidEmail", () => {
  it.each([
    "ana@example.com",
    "ana.silva+teste@dominio.com.br",
    "a@b.co",
  ])("accepts %s", (email) => {
    expect(isValidEmail(email)).toBe(true);
  });

  it.each([
    "",
    "   ",
    "sem-arroba",
    "ana@",
    "@dominio.com",
    "ana@dominio",
    "ana @dominio.com",
    "ana@dominio .com",
  ])("rejects %s", (email) => {
    expect(isValidEmail(email)).toBe(false);
  });

  it("trims surrounding whitespace", () => {
    expect(isValidEmail("  ana@example.com  ")).toBe(true);
  });
});

describe("validatePassword", () => {
  it("rejects passwords shorter than the minimum", () => {
    expect(validatePassword("a".repeat(PASSWORD_MIN_LENGTH - 1))).toContain(
      `${PASSWORD_MIN_LENGTH} caracteres`,
    );
  });

  it("accepts a password at the minimum length", () => {
    expect(validatePassword("a".repeat(PASSWORD_MIN_LENGTH))).toBeNull();
  });
});

describe("validatePasswordConfirmation", () => {
  it("rejects mismatched confirmation", () => {
    expect(validatePasswordConfirmation("abcdefgh", "abcdefgi")).toBe(
      "As senhas não coincidem.",
    );
  });

  it("accepts a matching confirmation", () => {
    expect(validatePasswordConfirmation("abcdefgh", "abcdefgh")).toBeNull();
  });
});
