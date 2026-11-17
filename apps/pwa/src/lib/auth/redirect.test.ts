import { describe, expect, it } from "vitest";

import { sanitizeRedirect } from "./redirect";

const FALLBACK = "/conta";

describe("sanitizeRedirect", () => {
  it.each(["/conta", "/trilhas", "/trilhas/alfabeto/modulo/licao", "/?x=1"])(
    "keeps internal path %s",
    (path) => {
      expect(sanitizeRedirect(path, FALLBACK)).toBe(path);
    },
  );

  it.each([
    "//evil.com",
    "//evil.com/path",
    "https://evil.com",
    "https://evil.com/phishing",
    "http://evil.com",
    "javascript:alert(1)",
    "\\\\evil.com",
    "/\\evil.com",
    "/path\\..\\evil",
    "evil.com",
    "",
    "   ",
    "/\n/evil.com",
    "/\tevil.com",
    "/\revil.com",
    "/ evil.com",
  ])("rejects unsafe target %s", (target) => {
    expect(sanitizeRedirect(target, FALLBACK)).toBe(FALLBACK);
  });

  it.each([undefined, null, 42, {}, ["/conta"]])(
    "rejects non-string target %s",
    (target) => {
      expect(sanitizeRedirect(target, FALLBACK)).toBe(FALLBACK);
    },
  );
});
