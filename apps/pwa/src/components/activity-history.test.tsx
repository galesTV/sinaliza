import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mutable harness state — the mocked hooks read it fresh per render, so
// each test can flip identity or queue contents before rendering.
const harness = vi.hoisted(() => ({
  auth: {
    status: "loading",
    user: null,
  } as
    | { status: "loading"; user: null }
    | { status: "user"; user: { id: string; email: string | null } },
  sync: {
    configured: true,
    hydrated: true,
    pending: 0,
    failed: 0,
    pendingKeys: [] as string[],
    failedKeys: [] as string[],
    syncing: false,
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: () => {} }),
}));

vi.mock("./use-auth-session", () => ({
  useAuthSession: () => harness.auth,
}));

vi.mock("./use-progress", () => ({
  useProgressSyncState: () => harness.sync,
}));

import {
  ActivityHistory,
  HISTORY_EMPTY_COPY,
  HISTORY_FAILED_COPY,
  HISTORY_NOTE_COPY,
  HISTORY_PENDING_LABEL,
  HISTORY_REFRESH_COPY,
  HISTORY_STATE_PRESENTATION,
  HISTORY_TRUNCATED_COPY,
  HISTORY_UPDATING_COPY,
  resolveHistoryTitle,
  transientGroupLabel,
} from "./activity-history";

const REAL_KEY = "alfabeto/primeiros-passos/libras-e-uma-lingua";

beforeEach(() => {
  harness.auth = { status: "loading", user: null };
  harness.sync.pendingKeys = [];
  harness.sync.failedKeys = [];
  harness.sync.pending = 0;
  harness.sync.failed = 0;
});

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

  it("keeps the recovery copy honest — retry, never confirmed", () => {
    expect(HISTORY_FAILED_COPY).toContain("Nova tentativa");
    expect(HISTORY_UPDATING_COPY).toBe("Atualizando histórico");
  });
});

describe("HISTORY_STATE_PRESENTATION", () => {
  it("gives every transient state a distinct neutral treatment", () => {
    const states = ["pending", "updating", "failed"] as const;
    const icons = new Set(states.map((s) => HISTORY_STATE_PRESENTATION[s].Icon));
    const classes = new Set(
      states.map((s) => HISTORY_STATE_PRESENTATION[s].className),
    );
    expect(icons.size).toBe(3);
    expect(classes.size).toBe(3);
    // Success is reserved for real remote records — never for queue
    // states, so a transient item can never masquerade as recorded.
    expect(HISTORY_STATE_PRESENTATION.registered.className).toBe(
      "text-success",
    );
    for (const state of states) {
      expect(HISTORY_STATE_PRESENTATION[state].className).not.toBe(
        "text-success",
      );
    }
  });
});

describe("transientGroupLabel", () => {
  it("says 'atualizando' only when no entry is really in the queue", () => {
    expect(transientGroupLabel([{ state: "updating" }])).toBe(
      HISTORY_UPDATING_COPY,
    );
    expect(
      transientGroupLabel([{ state: "pending" }, { state: "updating" }]),
    ).toBe(HISTORY_PENDING_LABEL);
    expect(transientGroupLabel([{ state: "failed" }])).toBe(
      HISTORY_PENDING_LABEL,
    );
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
        snapshotId="s1"
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

  it("keeps a manual refresh available when the history is empty", () => {
    harness.auth = { status: "user", user: { id: "user-1", email: null } };
    const html = renderToStaticMarkup(
      <ActivityHistory
        userId="user-1"
        rows={[]}
        truncated={false}
        snapshotId="s1"
      />,
    );
    // A learner awaiting their first record must be able to re-query
    // without reloading the whole page.
    expect(html).toContain(HISTORY_EMPTY_COPY);
    expect(html).toContain(HISTORY_REFRESH_COPY);
    // The button closes the tree: the same trailing slot in every
    // render state is what lets React preserve the instance (and its
    // focus) across the empty→populated transition.
    expect(html.endsWith("</button></div>")).toBe(true);
  });

  it("keeps the refresh button in the same trailing slot when populated", () => {
    harness.auth = { status: "user", user: { id: "user-1", email: null } };
    const html = renderToStaticMarkup(
      <ActivityHistory
        userId="user-1"
        rows={[
          { lessonKey: REAL_KEY, completedAt: "2026-11-24T12:00:00Z" },
        ]}
        truncated={false}
        snapshotId="s1"
      />,
    );
    // Same invariant as the empty state: refresh stays the trailing
    // element, so the DOM node — and keyboard focus on it — survives
    // the refresh that fills the list in. DOM focus itself is not
    // exercised here (no browser/jsdom in this suite).
    expect(html).toContain(HISTORY_REFRESH_COPY);
    expect(html.indexOf(HISTORY_REFRESH_COPY)).toBeGreaterThan(
      html.indexOf("Registrado às"),
    );
    expect(html.endsWith("</button></div>")).toBe(true);
  });

  it("announces transient and remote changes in polite live regions", () => {
    harness.auth = { status: "user", user: { id: "user-1", email: null } };
    harness.sync.pendingKeys = [REAL_KEY];
    harness.sync.pending = 1;
    const html = renderToStaticMarkup(
      <ActivityHistory
        userId="user-1"
        rows={[{ lessonKey: "outra/trilha/licao", completedAt: "2026-11-24T12:00:00Z" }]}
        truncated={false}
        snapshotId="s1"
      />,
    );
    // Both the transient group and the remote list are live regions, so
    // queue→remote transitions are announced as they happen.
    expect(html).toContain(HISTORY_PENDING_LABEL);
    expect(html).toContain('aria-live="polite"');
  });
});
