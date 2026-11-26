type DigitValues = readonly [
  index: number, middle: number, ring: number, little: number, thumb: number,
];

/** Rig amounts in anatomical order. The first four channels feed setAmounts' finger array. */
export type HandPose = DigitValues;

export const RELAXED: HandPose = [0.08, 0.08, 0.08, 0.08, 0.06];
const EXTENDED: HandPose = [0, 0, 0, 0, 0];
const FLEXED: HandPose = [0.66, 0.70, 0.72, 0.74, 0.38];

function isolated(channel: 0 | 1 | 2 | 3 | 4): HandPose {
  const pose: [...HandPose] = [...RELAXED];
  pose[channel] = FLEXED[channel];
  return pose;
}

export const HAND_POSES = {
  relaxed: RELAXED,
  extended: EXTENDED,
  flexed: FLEXED,
  index: isolated(0),
  middle: isolated(1),
  ring: isolated(2),
  little: isolated(3),
  thumb: isolated(4),
} satisfies Record<string, HandPose>;

export interface PoseStep {
  target: HandPose;
  durationMs: number;
  /** Per-channel start offsets, in the same order as the pose. */
  delaysMs?: DigitValues;
}

export const FLEX_SEQUENCE: readonly PoseStep[] = [
  { target: FLEXED, durationMs: 720, delaysMs: [270, 180, 90, 0, 340] },
  { target: RELAXED, durationMs: 800, delaysMs: [200, 280, 360, 440, 320] },
];

/** Sampled only by the scene's frame loop. A new command starts at the last displayed pose. */
export class HandPosePlayer {
  pose: HandPose = RELAXED;
  private origin: HandPose = RELAXED;
  private steps: readonly PoseStep[] = [];
  private index = 0;
  private startedAt = 0;

  get active() {
    return this.index < this.steps.length;
  }

  play(steps: readonly PoseStep[], now: number) {
    this.origin = this.pose;
    this.steps = steps;
    this.index = 0;
    this.startedAt = now;
    while (this.active && this.steps[this.index].target.every((v, i) => v === this.pose[i])) {
      this.index += 1;
    }
  }

  reset() {
    this.steps = [];
    this.index = 0;
    this.origin = RELAXED;
    this.pose = RELAXED;
  }

  sample(now: number): HandPose {
    while (this.active) {
      const { target, durationMs, delaysMs } = this.steps[this.index];
      const elapsed = Math.max(0, now - this.startedAt);
      const end = durationMs + (delaysMs ? Math.max(...delaysMs) : 0);
      if (elapsed < end) {
        const bend = (channel: number) => {
          const time = elapsed - (delaysMs?.[channel] ?? 0);
          if (time <= 0) return this.origin[channel];
          if (time >= durationMs) return target[channel];
          const t = time / durationMs;
          const eased = t * t * (3 - 2 * t);
          return this.origin[channel] + (target[channel] - this.origin[channel]) * eased;
        };
        this.pose = [bend(0), bend(1), bend(2), bend(3), bend(4)];
        break;
      }

      this.pose = target;
      this.origin = target;
      this.index += 1;
      this.startedAt += end;
    }
    return this.pose;
  }
}
