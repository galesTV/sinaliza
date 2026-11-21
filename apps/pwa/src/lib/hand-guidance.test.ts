import { describe, expect, it, vi } from "vitest";

import type { HandLandmarkerResultLike } from "./hand-tracking";
import {
  GUIDANCE_ATTEMPT_TIMEOUT_MS,
  GUIDANCE_MAX_OBSERVATION_GAP_MS,
  GUIDANCE_STABILITY_MS,
  GUIDANCE_TARGET_ZONE,
  createHandGuidance,
  guidanceHandCenter,
  isInsideGuidanceZone,
  type HandGuidanceSnapshot,
} from "./hand-guidance";

const NO_HAND: HandLandmarkerResultLike = { landmarks: [], handedness: [] };

function handAt(x: number, y: number): HandLandmarkerResultLike {
  return {
    landmarks: [Array.from({ length: 21 }, () => ({ x, y, z: 0 }))],
    handedness: [[{ categoryName: "Right" }]],
  };
}

function makeGuidance() {
  let clock = 0;
  const snapshots: HandGuidanceSnapshot[] = [];
  const ticks: Array<() => void> = [];
  const guidance = createHandGuidance({
    now: () => clock,
    setInterval: (cb) => {
      ticks.push(cb);
      return ticks.length;
    },
    clearInterval: vi.fn(),
    onChange: (snapshot) => snapshots.push(snapshot),
  });
  const fire = () => ticks.forEach((cb) => cb());
  return { guidance, snapshots, fire, setClock: (ms: number) => (clock = ms) };
}

function statusOf(guidance: ReturnType<typeof createHandGuidance>) {
  return guidance.getSnapshot().status;
}

describe("guidanceHandCenter / isInsideGuidanceZone", () => {
  it("computes the bounding-box center of the landmarks", () => {
    const center = guidanceHandCenter([
      { x: 0.2, y: 0.4, z: 0 },
      { x: 0.6, y: 0.8, z: 0 },
    ]);
    expect(center?.x).toBeCloseTo(0.4);
    expect(center?.y).toBeCloseTo(0.6);
  });

  it("accepts centers on the zone edges and rejects points just outside", () => {
    const { xMin, xMax, yMin, yMax } = GUIDANCE_TARGET_ZONE;
    const yMid = (yMin + yMax) / 2;
    const xMid = (xMin + xMax) / 2;
    expect(isInsideGuidanceZone({ x: xMin, y: yMid })).toBe(true);
    expect(isInsideGuidanceZone({ x: xMax, y: yMid })).toBe(true);
    expect(isInsideGuidanceZone({ x: xMid, y: yMin })).toBe(true);
    expect(isInsideGuidanceZone({ x: xMid, y: yMax })).toBe(true);
    expect(isInsideGuidanceZone({ x: xMin - 0.001, y: yMid })).toBe(false);
    expect(isInsideGuidanceZone({ x: xMax + 0.001, y: yMid })).toBe(false);
    expect(isInsideGuidanceZone({ x: xMid, y: yMin - 0.001 })).toBe(false);
    expect(isInsideGuidanceZone({ x: xMid, y: yMax + 0.001 })).toBe(false);
  });
});

describe("createHandGuidance", () => {
  it("walks searching → centering → holding → completed", () => {
    const { guidance, setClock } = makeGuidance();
    guidance.start();
    expect(statusOf(guidance)).toBe("searching");

    guidance.observe(handAt(0.1, 0.1), 0);
    expect(statusOf(guidance)).toBe("centering");

    setClock(100);
    guidance.observe(handAt(0.5, 0.5), 100);
    expect(statusOf(guidance)).toBe("holding");

    setClock(2_200);
    for (const at of [500, 1_000, 1_400, 1_900, 2_100]) {
      guidance.observe(handAt(0.5, 0.5), at);
    }
    expect(statusOf(guidance)).toBe("completed");
    expect(guidance.getSnapshot().progress).toBe(1);
    expect(guidance.getSnapshot().handSeen).toBe(true);
  });

  it("reports progress between 0 and 1 while holding", () => {
    const { guidance, setClock } = makeGuidance();
    guidance.start();
    guidance.observe(handAt(0.5, 0.5), 0);
    guidance.observe(handAt(0.5, 0.5), 400);
    guidance.observe(handAt(0.5, 0.5), 800);
    setClock(800);
    const progress = guidance.getSnapshot().progress;
    expect(progress).toBeCloseTo(0.4, 1);
  });

  it("completes with irregular observation intervals", () => {
    const { guidance } = makeGuidance();
    guidance.start();
    for (const at of [0, 300, 700, 1_200, 1_600, 2_100]) {
      guidance.observe(handAt(0.5, 0.5), at);
    }
    expect(statusOf(guidance)).toBe("completed");
  });

  it("does not complete with too little elapsed time", () => {
    const { guidance } = makeGuidance();
    guidance.start();
    for (const at of [0, 450, 900, 1_300]) {
      guidance.observe(handAt(0.5, 0.5), at);
    }
    expect(statusOf(guidance)).toBe("holding");
  });

  it("never certifies stability from a single observation", () => {
    const { guidance } = makeGuidance();
    guidance.start();
    guidance.observe(handAt(0.5, 0.5), 0);
    // One observation, then silence longer than the required duration.
    guidance.observe(handAt(0.5, 0.5), GUIDANCE_STABILITY_MS + 100);
    expect(statusOf(guidance)).not.toBe("completed");
    // The gap restarted the run at t=2100; only a new, fully-observed
    // 2-second window can complete it.
    for (const at of [2_500, 2_900, 3_300, 3_700, 4_150]) {
      guidance.observe(handAt(0.5, 0.5), at);
    }
    expect(statusOf(guidance)).toBe("completed");
  });

  it("restarts the run when the gap between observations is too large", () => {
    const { guidance } = makeGuidance();
    guidance.start();
    guidance.observe(handAt(0.5, 0.5), 0);
    guidance.observe(handAt(0.5, 0.5), 400);
    guidance.observe(handAt(0.5, 0.5), 800);
    // Inference stall longer than the permitted gap.
    const resume = 800 + GUIDANCE_MAX_OBSERVATION_GAP_MS + 1;
    guidance.observe(handAt(0.5, 0.5), resume);
    expect(statusOf(guidance)).toBe("holding");
    // The run restarted at `resume`; it cannot complete on the old clock.
    for (const at of [resume + 400, resume + 900, resume + 1_400, resume + 1_900]) {
      guidance.observe(handAt(0.5, 0.5), at);
    }
    expect(statusOf(guidance)).toBe("holding");
    guidance.observe(handAt(0.5, 0.5), resume + GUIDANCE_STABILITY_MS + 10);
    expect(statusOf(guidance)).toBe("completed");
  });

  it("restarts the run when the hand drifts too far from the anchor", () => {
    const { guidance } = makeGuidance();
    guidance.start();
    guidance.observe(handAt(0.4, 0.5), 0);
    guidance.observe(handAt(0.4, 0.5), 400);
    // Still inside the zone, but moved well beyond the tolerance: the run
    // restarts anchored at the new position (t=800).
    guidance.observe(handAt(0.55, 0.5), 800);
    for (const at of [1_200, 1_600, 2_000, 2_400]) {
      guidance.observe(handAt(0.55, 0.5), at);
    }
    expect(statusOf(guidance)).toBe("holding");
    guidance.observe(handAt(0.55, 0.5), 2_850);
    expect(statusOf(guidance)).toBe("completed");
  });

  it("reports lost when detection drops mid-hold, then recovers", () => {
    const { guidance } = makeGuidance();
    guidance.start();
    guidance.observe(handAt(0.5, 0.5), 0);
    guidance.observe(NO_HAND, 300);
    expect(statusOf(guidance)).toBe("lost");
    // Sticky while the hand stays out of the zone.
    guidance.observe(NO_HAND, 600);
    expect(statusOf(guidance)).toBe("lost");
    guidance.observe(handAt(0.1, 0.1), 900);
    expect(statusOf(guidance)).toBe("lost");
    // Re-entering the zone starts a fresh run.
    guidance.observe(handAt(0.5, 0.5), 1_200);
    expect(statusOf(guidance)).toBe("holding");
  });

  it("returns to centering from holding when the hand leaves the zone", () => {
    const { guidance } = makeGuidance();
    guidance.start();
    guidance.observe(handAt(0.5, 0.5), 0);
    guidance.observe(handAt(0.1, 0.1), 200);
    expect(statusOf(guidance)).toBe("lost");
  });

  it("reset restarts the attempt after completion", () => {
    const { guidance } = makeGuidance();
    guidance.start();
    for (const at of [0, 500, 900, 1_300, 1_700, 2_100]) {
      guidance.observe(handAt(0.5, 0.5), at);
    }
    expect(statusOf(guidance)).toBe("completed");

    guidance.reset();
    expect(statusOf(guidance)).toBe("searching");
    expect(guidance.getSnapshot().handSeen).toBe(false);

    for (const at of [5_000, 5_500, 6_000, 6_500, 7_000]) {
      guidance.observe(handAt(0.5, 0.5), at);
    }
    expect(statusOf(guidance)).toBe("completed");
  });

  it("stop cancels pending work and ignores late observations", () => {
    const { guidance } = makeGuidance();
    guidance.start();
    guidance.observe(handAt(0.5, 0.5), 0);
    guidance.stop();
    expect(statusOf(guidance)).toBe("idle");
    guidance.observe(handAt(0.5, 0.5), 100);
    expect(statusOf(guidance)).toBe("idle");
    // Restarting works cleanly afterwards.
    guidance.start();
    expect(statusOf(guidance)).toBe("searching");
  });

  it("times out honestly instead of faking success", () => {
    const { guidance, fire, setClock } = makeGuidance();
    guidance.start();
    // A few sparse observations, never enough for a stable run.
    guidance.observe(NO_HAND, 0);
    setClock(GUIDANCE_ATTEMPT_TIMEOUT_MS + 10);
    fire();
    const snapshot = guidance.getSnapshot();
    expect(snapshot.status).toBe("timedOut");
    expect(snapshot.handSeen).toBe(false);
    // Late observations do not flip it to completed.
    guidance.observe(handAt(0.5, 0.5), GUIDANCE_ATTEMPT_TIMEOUT_MS + 500);
    expect(statusOf(guidance)).toBe("timedOut");
  });

  it("remembers a hand was seen for the timed-out hint", () => {
    const { guidance, fire, setClock } = makeGuidance();
    guidance.start();
    guidance.observe(handAt(0.1, 0.1), 1_000);
    setClock(GUIDANCE_ATTEMPT_TIMEOUT_MS + 10);
    fire();
    const snapshot = guidance.getSnapshot();
    expect(snapshot.status).toBe("timedOut");
    expect(snapshot.handSeen).toBe(true);
  });

  it("only emits when the public snapshot changes", () => {
    const { guidance, snapshots } = makeGuidance();
    guidance.start();
    const baseline = snapshots.length;
    guidance.observe(handAt(0.5, 0.5), 0);
    expect(snapshots.length).toBeGreaterThan(baseline);
    const settled = snapshots.length;
    // Same status and progress bucket: no extra emits.
    guidance.observe(handAt(0.5, 0.5), 10);
    guidance.observe(handAt(0.5, 0.5), 20);
    expect(snapshots.length).toBe(settled);
  });
});
