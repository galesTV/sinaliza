import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import {
  describeProfileError,
  planDisplayNameSave,
  saveDisplayName,
  validateDisplayName,
} from "./profile";

describe("validateDisplayName", () => {
  it("accepts a normal name", () => {
    expect(validateDisplayName("Ana")).toBeNull();
  });

  it("rejects an empty name", () => {
    expect(validateDisplayName("")).toBe("Informe um nome de exibição.");
  });

  it("rejects a whitespace-only name", () => {
    expect(validateDisplayName("   \t  ")).toBe(
      "Informe um nome de exibição.",
    );
  });

  it("accepts exactly 80 characters", () => {
    expect(validateDisplayName("a".repeat(80))).toBeNull();
  });

  it("rejects more than 80 characters (the database contract)", () => {
    expect(validateDisplayName("a".repeat(81))).toContain("80 caracteres");
  });

  it("validates the trimmed value", () => {
    expect(validateDisplayName("  Ana  ")).toBeNull();
  });
});

describe("planDisplayNameSave", () => {
  it("rejects invalid input without planning a write", () => {
    const plan = planDisplayNameSave("   ", "Ana");
    expect(plan).toEqual({ kind: "invalid", message: expect.any(String) });
  });

  it("skips the request when the trimmed value is unchanged", () => {
    expect(planDisplayNameSave("Ana", "Ana")).toEqual({ kind: "unchanged" });
    expect(planDisplayNameSave("  Ana  ", "Ana")).toEqual({
      kind: "unchanged",
    });
  });

  it("plans a write when the name changed", () => {
    expect(planDisplayNameSave("Ana Beatriz", "Ana")).toEqual({
      kind: "submit",
      displayName: "Ana Beatriz",
    });
  });

  it("normalizes edges before submitting", () => {
    expect(planDisplayNameSave("  Ana Beatriz  ", "Ana")).toEqual({
      kind: "submit",
      displayName: "Ana Beatriz",
    });
  });

  it("plans a write when there is no persisted name yet", () => {
    expect(planDisplayNameSave("Ana", null)).toEqual({
      kind: "submit",
      displayName: "Ana",
    });
  });
});

describe("describeProfileError", () => {
  it("reports connectivity failures", () => {
    expect(describeProfileError(new TypeError("fetch failed"))).toContain(
      "conexão",
    );
    expect(describeProfileError(new Error("network error"))).toContain(
      "conexão",
    );
  });

  it("reports an expired session mid-write", () => {
    expect(describeProfileError({ code: "PGRST301" })).toContain(
      "sessão expirou",
    );
    expect(describeProfileError(new Error("JWT expired"))).toContain(
      "sessão expirou",
    );
  });

  it("reports the server-side length constraint honestly", () => {
    expect(describeProfileError({ code: "23514" })).toContain("1 e 80");
  });

  it("reports permission failures (RLS)", () => {
    expect(describeProfileError({ code: "42501" })).toContain("permissão");
  });

  it("falls back to a generic message without leaking internals", () => {
    expect(describeProfileError({ code: "XX000" })).toBe(
      "Não foi possível salvar o nome de exibição agora. Tente novamente.",
    );
  });
});

function stubClient(error: unknown = null) {
  const upsert = vi.fn().mockResolvedValue({ error });
  const from = vi.fn().mockReturnValue({ upsert });
  return { client: { from } as unknown as SupabaseClient, from, upsert };
}

describe("saveDisplayName", () => {
  it("upserts the trimmed name scoped to the session user id", async () => {
    const { client, from, upsert } = stubClient();
    const result = await saveDisplayName(client, "user-1", "  Ana  ");
    expect(result).toEqual({
      ok: true,
      displayName: "Ana",
      message: null,
    });
    expect(from).toHaveBeenCalledWith("profiles");
    expect(upsert).toHaveBeenCalledWith(
      { id: "user-1", display_name: "Ana" },
      { onConflict: "id" },
    );
  });

  it("maps write failures to a pt-BR message without claiming success", async () => {
    const { client } = stubClient({ code: "42501" });
    const result = await saveDisplayName(client, "user-1", "Ana");
    expect(result.ok).toBe(false);
    expect(result.message).toContain("permissão");
  });
});
