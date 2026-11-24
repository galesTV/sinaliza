import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mutable harness state — the mocked hooks read it fresh per render, so
// each test can flip identity, snapshot contents or sync signals before
// rendering. Same pattern as activity-history.test.tsx; these are SSR
// markup assertions — no DOM interaction is exercised (no jsdom/browser).
const harness = vi.hoisted(() => ({
  auth: {
    status: "guest",
    user: null,
  } as
    | { status: "loading"; user: null }
    | { status: "guest"; user: null }
    | { status: "unconfigured"; user: null }
    | { status: "user"; user: { id: string; email: string | null } },
  progress: {
    completed: new Set<string>(),
  },
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

vi.mock("./use-auth-session", () => ({
  useAuthSession: () => harness.auth,
}));

vi.mock("./use-progress", () => ({
  useProgressSnapshot: () => harness.progress,
  useProgressSyncState: () => harness.sync,
}));

import {
  MILESTONES_EMPTY_COPY,
  MILESTONES_EMPTY_TITLE,
  MILESTONES_NOTE,
  MILESTONES_SOON_LABEL,
  MILESTONES_SUBTITLE,
  MILESTONES_TITLE,
  MilestonesSection,
} from "./milestones-section";

beforeEach(() => {
  harness.auth = { status: "guest", user: null };
  harness.progress = { completed: new Set<string>() };
  harness.sync = {
    configured: true,
    hydrated: true,
    pending: 0,
    failed: 0,
    pendingKeys: [],
    failedKeys: [],
    syncing: false,
  };
});

describe("MilestonesSection", () => {
  it("renders the editorial starting state when the catalog is fully planned", () => {
    const html = renderToStaticMarkup(<MilestonesSection />);
    expect(html).toContain(MILESTONES_TITLE);
    expect(html).toContain(MILESTONES_SUBTITLE);
    expect(html).toContain(MILESTONES_EMPTY_TITLE);
    expect(html).toContain(MILESTONES_EMPTY_COPY);
    // All five milestones listed discreetly as upcoming.
    expect(html).toContain("Primeiro passo");
    expect(html).toContain("Construindo uma base");
    expect(html).toContain("Novos caminhos");
    expect(html).toContain("Uma etapa percorrida");
    expect(html).toContain("Caminho percorrido");
    expect(html.match(new RegExp(MILESTONES_SOON_LABEL, "g"))).toHaveLength(5);
    // The honest participation note is always present.
    expect(html).toContain(MILESTONES_NOTE);
  });

  it("renders nothing while the session is still resolving", () => {
    harness.auth = { status: "loading", user: null };
    const html = renderToStaticMarkup(<MilestonesSection />);
    expect(html).toBe("");
  });

  it("renders nothing while an account's remote completions are still merging", () => {
    harness.auth = {
      status: "user",
      user: { id: "u1", email: "u@example.org" },
    };
    harness.sync = { ...harness.sync, hydrated: false, syncing: true };
    const html = renderToStaticMarkup(<MilestonesSection />);
    expect(html).toBe("");
  });

  it("still renders the local picture when account hydration failed", () => {
    harness.auth = {
      status: "user",
      user: { id: "u1", email: "u@example.org" },
    };
    // Remote merge failed this session: not hydrated and not syncing —
    // the local bucket is still an honest record of participation.
    harness.sync = { ...harness.sync, hydrated: false, syncing: false };
    const html = renderToStaticMarkup(<MilestonesSection />);
    expect(html).toContain(MILESTONES_TITLE);
  });

  it("renders for guests exactly like an unconfigured environment", () => {
    harness.auth = { status: "unconfigured", user: null };
    const html = renderToStaticMarkup(<MilestonesSection />);
    expect(html).toContain(MILESTONES_TITLE);
    expect(html).toContain(MILESTONES_EMPTY_TITLE);
  });
});
