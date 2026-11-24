import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Milestone } from "@/lib/milestones";

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
  MILESTONES_ACHIEVED_LABEL,
  MILESTONES_EMPTY_COPY,
  MILESTONES_EMPTY_TITLE,
  MILESTONES_EYEBROW,
  MILESTONES_NOTE,
  MILESTONES_SOON_LABEL,
  MILESTONES_SUBTITLE,
  MILESTONES_TITLE,
  MilestonesSection,
  MilestonesView,
  progressLabel,
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

function milestone(partial: Partial<Milestone> & { id: string }): Milestone {
  return {
    title: `Marco ${partial.id}`,
    description: `Descrição de ${partial.id}.`,
    status: "available",
    ...partial,
  };
}

describe("MilestonesView", () => {
  it("renders the editorial starting state when every milestone is unavailable", () => {
    const milestones = [
      "primeiro-passo",
      "base",
      "novos-caminhos",
      "etapa-percorrida",
      "caminho-percorrido",
    ].map((id) => milestone({ id, status: "unavailable" }));
    const html = renderToStaticMarkup(<MilestonesView milestones={milestones} />);
    expect(html).toContain(MILESTONES_TITLE);
    expect(html).toContain(MILESTONES_SUBTITLE);
    expect(html).toContain(MILESTONES_EYEBROW);
    expect(html).toContain(MILESTONES_EMPTY_TITLE);
    expect(html).toContain(MILESTONES_EMPTY_COPY);
    expect(html.match(new RegExp(MILESTONES_SOON_LABEL, "g"))).toHaveLength(5);
    expect(html).toContain(MILESTONES_NOTE);
    // No summary fraction and no counters while nothing is reachable.
    expect(html).not.toContain("marcos disponíveis");
  });

  it("renders achieved, available and unavailable states together", () => {
    const milestones = [
      milestone({ id: "primeiro-passo", status: "achieved" }),
      milestone({
        id: "base",
        status: "available",
        progress: { current: 3, target: 5 },
      }),
      milestone({
        id: "novos-caminhos",
        status: "available",
        progress: { current: 1, target: 2 },
      }),
      milestone({
        id: "etapa-percorrida",
        status: "available",
        progress: { current: 3, target: 5 },
      }),
      milestone({ id: "caminho-percorrido", status: "unavailable" }),
    ];
    const html = renderToStaticMarkup(<MilestonesView milestones={milestones} />);
    // State labels.
    expect(html).toContain(MILESTONES_ACHIEVED_LABEL);
    expect(html).toContain(MILESTONES_SOON_LABEL);
    // Contextualized counters.
    expect(html).toContain("3 de 5 atividades");
    expect(html).toContain("1 de 2 módulos");
    expect(html).toContain("Módulo mais próximo: 3 de 5 atividades");
    // The unreachable milestone carries no counter.
    expect(html).not.toContain("Trilha mais próxima");
    // Summary over the reachable subset only: 4 reachable, 1 achieved.
    expect(html).toContain("1 de 4 marcos disponíveis alcançado");
    // Pedagogical honesty note is always present.
    expect(html).toContain(MILESTONES_NOTE);
  });

  it("pluralizes the summary correctly", () => {
    const milestones = [
      milestone({ id: "primeiro-passo", status: "achieved" }),
      milestone({ id: "base", status: "achieved" }),
      milestone({ id: "novos-caminhos", status: "available" }),
    ];
    const html = renderToStaticMarkup(<MilestonesView milestones={milestones} />);
    expect(html).toContain("2 de 3 marcos disponíveis alcançados");
  });
});

describe("progressLabel", () => {
  it("spells out the counter unit per milestone", () => {
    expect(
      progressLabel(
        milestone({ id: "base", progress: { current: 3, target: 5 } }),
      ),
    ).toBe("3 de 5 atividades");
    expect(
      progressLabel(
        milestone({
          id: "novos-caminhos",
          progress: { current: 1, target: 2 },
        }),
      ),
    ).toBe("1 de 2 módulos");
    expect(
      progressLabel(
        milestone({
          id: "etapa-percorrida",
          progress: { current: 3, target: 5 },
        }),
      ),
    ).toBe("Módulo mais próximo: 3 de 5 atividades");
    expect(
      progressLabel(
        milestone({
          id: "caminho-percorrido",
          progress: { current: 7, target: 10 },
        }),
      ),
    ).toBe("Trilha mais próxima: 7 de 10 atividades");
  });

  it("returns null without progress", () => {
    expect(progressLabel(milestone({ id: "base" }))).toBeNull();
  });
});

describe("MilestonesSection (identity/loading gates)", () => {
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
  });
});
