import * as THREE from "three";
import type { SkinnedHandAsset } from "./handAsset";

const FINGER_CHAINS = {
  index: ["Index_Proximal_R", "Index_Intermediate_R", "Index_Distal_R"],
  middle: ["Middle_Proximal_R", "Middle_Intermediate_R", "Middle_Distal_R"],
  ring: ["Ring_Proximal_R", "Ring_Intermediate_R", "Ring_Distal_R"],
  little: ["Little_Proximal_R", "Little_Intermediate_R", "Little_Distal_R"],
} as const;

const THUMB_CHAIN = [
  "Thumb_Metacarpal_R",
  "Thumb_Proximal_R",
  "Thumb_Distal_R",
];

const FINGER_DELTAS = [0.38, 0.62, 0.5] as const;
const THUMB_DELTAS = [0.22, 0.55, 0.45] as const;

interface RestRotation {
  x: number;
  y: number;
  z: number;
}

export interface HandRig {
  // `finger` is one amount for all fingers or [index, middle, ring, little].
  setAmounts: (finger: number | readonly number[], thumb: number) => void;
}

export function createHandRig(asset: SkinnedHandAsset): HandRig {
  const animatedNames = [
    ...Object.values(FINGER_CHAINS).flat(),
    ...THUMB_CHAIN,
  ];
  const rest = new Map<string, RestRotation>();

  for (const name of animatedNames) {
    const bone = asset.bones.get(name);
    if (!bone) continue;
    rest.set(name, {
      x: bone.rotation.x,
      y: bone.rotation.y,
      z: bone.rotation.z,
    });
  }

  const resetBone = (name: string) => {
    const bone = asset.bones.get(name);
    const restRotation = rest.get(name);
    if (!bone || !restRotation) return;
    bone.rotation.set(restRotation.x, restRotation.y, restRotation.z);
  };

  const applyChain = (
    names: readonly string[],
    deltas: readonly number[],
    amount: number,
  ) => {
    names.forEach((name, index) => {
      resetBone(name);
      const bone = asset.bones.get(name);
      const delta = deltas[Math.min(index, deltas.length - 1)] * amount;
      if (bone && delta !== 0) bone.rotation.z += delta;
    });
  };

  return {
    setAmounts(finger: number | readonly number[], thumb: number) {
      Object.values(FINGER_CHAINS).forEach((chain, index) => {
        const amount = typeof finger === "number" ? finger : (finger[index] ?? 0);
        applyChain(chain, FINGER_DELTAS, THREE.MathUtils.clamp(amount, 0, 1));
      });
      applyChain(THUMB_CHAIN, THUMB_DELTAS, THREE.MathUtils.clamp(thumb, 0, 1));
    },
  };
}
