/**
 * Guided hand-positioning practice for the hand lab.
 *
 * A small, pure state machine driven by MediaPipe results: the learner is
 * asked to keep one hand inside a target region of the frame, motionless
 * for ~2 seconds. It deliberately knows nothing about React, MediaPipe or
 * Libras — it only judges position and stability of normalized landmarks.
 *
 * Timing rules (monotonic timestamps, never frame counts):
 * - Stability is measured between the first and the current observation of
 *   a stable run, not by counting frames.
 * - A gap larger than GUIDANCE_MAX_OBSERVATION_GAP_MS between consecutive
 *   valid (inside-the-zone) observations discards the run — a long
 *   inference pause is not uninterrupted evidence of stillness.
 * - Completion requires GUIDANCE_STABILITY_MS elapsed inside the run AND
 *   at least GUIDANCE_MIN_STABLE_OBSERVATIONS valid observations; a single
 *   observation can never certify stability.
 * - If no run completes within GUIDANCE_ATTEMPT_TIMEOUT_MS the attempt
 *   ends as "timedOut" — honestly, never as success.
 */

import type {
  HandLandmarkerResultLike,
  NormalizedLandmarkLike,
} from "./hand-tracking";

/** Target region, in normalized video coordinates (0..1). */
export const GUIDANCE_TARGET_ZONE = {
  xMin: 0.35,
  xMax: 0.65,
  yMin: 0.3,
  yMax: 0.7,
} as const;

/** Required continuous stability inside the zone, in milliseconds. */
export const GUIDANCE_STABILITY_MS = 2_000;

/**
 * Maximum silence between two valid observations for them to count as one
 * continuous run. Generous enough for ~2 FPS inference, strict enough to
 * discard long pauses.
 *
 * PROVISIONAL: chosen before real-device testing; revisit once the flow has
 * been exercised on real hardware at its actual inference cadence.
 */
export const GUIDANCE_MAX_OBSERVATION_GAP_MS = 500;

/**
 * How far the hand center may drift from the run's anchor point before the
 * run is discarded, in normalized coordinate units.
 */
export const GUIDANCE_ANCHOR_TOLERANCE = 0.1;

/** Minimum valid observations inside a run before it can complete. */
export const GUIDANCE_MIN_STABLE_OBSERVATIONS = 2;

/** One attempt may last at most this long before it is declared timed out. */
export const GUIDANCE_ATTEMPT_TIMEOUT_MS = 30_000;

/** Interval at which the module re-checks the attempt timeout. */
export const GUIDANCE_TICK_MS = 250;

export type GuidanceStatus =
  | "idle"
  | "searching"
  | "centering"
  | "holding"
  | "lost"
  | "completed"
  | "timedOut";

export interface HandGuidanceSnapshot {
  status: GuidanceStatus;
  /** 0..1 progress of the current stability run; 0 outside "holding". */
  progress: number;
  /** Whether at least one hand was detected during this attempt. */
  handSeen: boolean;
}

export const GUIDANCE_IDLE_SNAPSHOT: HandGuidanceSnapshot = {
  status: "idle",
  progress: 0,
  handSeen: false,
};

export interface HandCenter {
  x: number;
  y: number;
}

/** Center of the hand's bounding box, in normalized coordinates. */
export function guidanceHandCenter(
  landmarks: readonly NormalizedLandmarkLike[],
): HandCenter | null {
  if (landmarks.length === 0) return null;
  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = Infinity;
  let yMax = -Infinity;
  for (const point of landmarks) {
    if (point.x < xMin) xMin = point.x;
    if (point.x > xMax) xMax = point.x;
    if (point.y < yMin) yMin = point.y;
    if (point.y > yMax) yMax = point.y;
  }
  return { x: (xMin + xMax) / 2, y: (yMin + yMax) / 2 };
}

export function isInsideGuidanceZone(center: HandCenter): boolean {
  return (
    center.x >= GUIDANCE_TARGET_ZONE.xMin &&
    center.x <= GUIDANCE_TARGET_ZONE.xMax &&
    center.y >= GUIDANCE_TARGET_ZONE.yMin &&
    center.y <= GUIDANCE_TARGET_ZONE.yMax
  );
}

/**
 * With several hands in frame, judge the best-positioned one: a hand
 * inside the zone wins; otherwise track the center nearest the zone so
 * the "center your hand" hint refers to the closest candidate.
 */
function selectGuidanceCenter(
  hands: readonly (readonly NormalizedLandmarkLike[])[],
): HandCenter | null {
  const zoneX = (GUIDANCE_TARGET_ZONE.xMin + GUIDANCE_TARGET_ZONE.xMax) / 2;
  const zoneY = (GUIDANCE_TARGET_ZONE.yMin + GUIDANCE_TARGET_ZONE.yMax) / 2;
  let nearest: HandCenter | null = null;
  let nearestDistance = Infinity;
  for (const landmarks of hands) {
    const center = guidanceHandCenter(landmarks);
    if (!center) continue;
    if (isInsideGuidanceZone(center)) return center;
    const distance = Math.hypot(center.x - zoneX, center.y - zoneY);
    if (distance < nearestDistance) {
      nearest = center;
      nearestDistance = distance;
    }
  }
  return nearest;
}

export interface HandGuidanceDeps {
  /** Called whenever the public snapshot changes (progress bucketed at 5%). */
  onChange?(snapshot: HandGuidanceSnapshot): void;
  now?(): number;
  setInterval?(callback: () => void, ms: number): unknown;
  clearInterval?(id: unknown): void;
}

interface StabilityRun {
  anchorX: number;
  anchorY: number;
  startedAt: number;
  lastAt: number;
  observations: number;
}

export function createHandGuidance(deps: HandGuidanceDeps = {}) {
  const now = deps.now ?? (() => performance.now());
  const setTimer =
    deps.setInterval ??
    ((callback: () => void, ms: number) => setInterval(callback, ms));
  const clearTimer =
    deps.clearInterval ?? ((id: unknown) => clearInterval(id as number));

  let status: GuidanceStatus = "idle";
  let running = false;
  let disposed = false;
  let attemptStartedAt = 0;
  let handSeen = false;
  let run: StabilityRun | null = null;
  let timerId: unknown = null;
  let lastEmittedKey = "";

  function progressAt(at: number): number {
    if (status !== "holding" || !run) return status === "completed" ? 1 : 0;
    return Math.min(1, Math.max(0, (at - run.startedAt) / GUIDANCE_STABILITY_MS));
  }

  function emit(at: number) {
    const progress = progressAt(at);
    // Bucket progress so callers (React) rerender on 5% steps, not every
    // landmark frame.
    const key = `${status}|${Math.round(progress * 20)}|${handSeen}`;
    if (key === lastEmittedKey) return;
    lastEmittedKey = key;
    deps.onChange?.({ status, progress, handSeen });
  }

  function startRun(center: HandCenter, at: number) {
    run = {
      anchorX: center.x,
      anchorY: center.y,
      startedAt: at,
      lastAt: at,
      observations: 1,
    };
  }

  function checkTimeout(at: number) {
    if (
      status !== "completed" &&
      status !== "timedOut" &&
      at - attemptStartedAt > GUIDANCE_ATTEMPT_TIMEOUT_MS
    ) {
      run = null;
      status = "timedOut";
    }
  }

  function onInside(center: HandCenter, at: number) {
    if (!run) {
      startRun(center, at);
      status = "holding";
      return;
    }
    if (at - run.lastAt > GUIDANCE_MAX_OBSERVATION_GAP_MS) {
      // Too long without a valid observation: the pause cannot count as
      // uninterrupted stillness — restart the run from now.
      startRun(center, at);
      return;
    }
    const dx = center.x - run.anchorX;
    const dy = center.y - run.anchorY;
    if (Math.hypot(dx, dy) > GUIDANCE_ANCHOR_TOLERANCE) {
      // The hand moved inside the zone: restart the run anchored here.
      startRun(center, at);
      return;
    }
    run.lastAt = at;
    run.observations += 1;
    if (
      at - run.startedAt >= GUIDANCE_STABILITY_MS &&
      run.observations >= GUIDANCE_MIN_STABLE_OBSERVATIONS
    ) {
      run = null;
      status = "completed";
    }
  }

  function onAbsent(noHand: boolean) {
    if (run) {
      // An interrupted run: the positioning was lost mid-hold.
      run = null;
      status = "lost";
      return;
    }
    // "lost" stays sticky until the hand re-enters the zone; otherwise the
    // status reflects what is currently seen.
    if (status !== "lost") {
      status = noHand ? "searching" : "centering";
    }
  }

  /**
   * Feed one detection result. `at` defaults to the injected clock so tests
   * can drive the machine with synthetic timestamps.
   */
  function observe(result: HandLandmarkerResultLike | null, at = now()) {
    if (!running || disposed) return;

    checkTimeout(at);
    // Terminal states for this attempt: ignore further observations.
    if (status === "completed" || status === "timedOut") {
      emit(at);
      return;
    }

    const hands = result?.landmarks ?? [];
    if (hands.some((landmarks) => landmarks.length > 0)) handSeen = true;
    const center = selectGuidanceCenter(hands);

    if (center) {
      if (isInsideGuidanceZone(center)) {
        onInside(center, at);
      } else {
        onAbsent(false);
      }
    } else {
      onAbsent(true);
    }
    emit(at);
  }

  /** Periodic check used for the honest timeout path. */
  function tick() {
    if (!running || disposed) return;
    const at = now();
    checkTimeout(at);
    emit(at);
  }

  /** Begin (or restart) a positioning attempt. */
  function start() {
    if (disposed) return;
    running = true;
    status = "searching";
    attemptStartedAt = now();
    handSeen = false;
    run = null;
    lastEmittedKey = "";
    if (timerId === null) {
      timerId = setTimer(tick, GUIDANCE_TICK_MS);
    }
    emit(now());
  }

  /** Restart the current attempt; a no-op while stopped. */
  function reset() {
    if (!running || disposed) return;
    status = "searching";
    attemptStartedAt = now();
    handSeen = false;
    run = null;
    lastEmittedKey = "";
    emit(now());
  }

  /** Stop the attempt and the timeout timer (camera stopped). */
  function stop() {
    running = false;
    status = "idle";
    handSeen = false;
    run = null;
    if (timerId !== null) {
      clearTimer(timerId);
      timerId = null;
    }
    lastEmittedKey = "";
    emit(now());
  }

  function dispose() {
    disposed = true;
    stop();
  }

  return {
    observe,
    tick,
    start,
    reset,
    stop,
    dispose,
    getSnapshot: (): HandGuidanceSnapshot => ({
      status,
      progress: progressAt(now()),
      handSeen,
    }),
  };
}

export type HandGuidance = ReturnType<typeof createHandGuidance>;
