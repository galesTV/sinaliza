import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  ActivityHistory,
  HISTORY_EMPTY_COPY,
  HISTORY_NOTE_COPY,
  HISTORY_PENDING_LABEL,
  HISTORY_TRUNCATED_COPY,
  resolveHistoryTitle,
} from "./activity-history";

const REAL_KEY = "alfabeto/primeiros-passos/libras-e-uma-lingua";

describe("history copy", () => {
  it("describes dates as registration, never as proven completion time", () => {
    expect(HISTORY_NOTE_COPY).toContain("registradas na sua conta");
    expect(HISTORY_NOTE_COPY).not.toContain("Concluída em");
    expect(HISTORY_NOTE_COPY).not.toContain("domínio");
  });

  it("labels the undated pending group as awaiting sync", () => {
    expect(HISTORY_PENDING_LABEL).toBe("Aguardando sincronização");
  });

  it("states truncation without promising completeness", () => {
    expect(HISTORY_TRUNCATED_COPY).toContain("mais recentes");
  });
});

describe("resolveHistoryTitle", () => {
  it("resolves a known key to title, context and no link while unpublished", () => {
    const resolved = resolveHistoryTitle(REAL_KEY);
    expect(resolved.title).toBe("Libras é uma língua");
    expect(resolved.context).toBe("Primeiros passos · Alfabeto manual");
    // Every catalog lesson is still `planned` — the same completability
    // rule as the rest of the app, so no link is offered.
    expect(resolved.url).toBeNull();
  });

  it("falls back to a neutral label for unknown or removed lessons", () => {
    const resolved = resolveHistoryTitle("trilha/modulo/inexistente");
    expect(resolved.title).toBe("Lição indisponível");
    expect(resolved.context).toBeNull();
    expect(resolved.url).toBeNull();
    // The raw internal key is never surfaced as a title substitute.
    expect(resolved.title).not.toContain("inexistente");
  });

  it("rejects malformed keys instead of exposing them", () => {
    expect(resolveHistoryTitle("uma-chave-quebrada").title).toBe(
      "Lição indisponível",
    );
  });
});

describe("ActivityHistory (SSR)", () => {
  it("renders nothing before a matching client session exists", () => {
    const html = renderToStaticMarkup(
      <ActivityHistory
        userId="user-1"
        rows={[
          { lessonKey: REAL_KEY, completedAt: "2026-11-24T12:00:00Z" },
        ]}
        truncated={false}
      />,
    );
    // Remote rows belong to the identity that fetched them: SSR/first
    // paint (auth still loading) shows nothing rather than another
    // account's history.
    expect(html).toBe("");
  });

  it("keeps the empty-state copy honest about what was recorded", () => {
    expect(HISTORY_EMPTY_COPY).toContain("registrada");
    expect(HISTORY_EMPTY_COPY).not.toContain("domínio");
  });
});
