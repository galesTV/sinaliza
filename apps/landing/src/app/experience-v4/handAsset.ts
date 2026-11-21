import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Hand mesh asset: Godot XR Tools right hand, CC0 1.0.
// Source: https://github.com/GodotVR/godot-xr-tools at commit
// 6fc5361db295c12b5e51ee5b9fee09751a4458e7, addons/godot-xr-tools/hands/model/hand_r.gltf
// Converted GLB via https://frametop.github.io/frametop/screens/assets/hands/godot/
// sha256 dc6e48ab1edb6f4f0bb952da2a83e39a13632eb857de901b16a4f500cfeb5322
// License: CC0 1.0 public-domain dedication in the Godot XR Tools hands License.md.

export const HAND_ASSET_URL = "/experience-v4/hand-right.glb";

// MediaPipe order: wrist, thumb 1-4, index 5-8, middle 9-12, ring 13-16, little 17-20.
export const HAND_LANDMARK_NODES = [
  "Wrist_R",
  "Thumb_Metacarpal_R",
  "Thumb_Proximal_R",
  "Thumb_Distal_R",
  "Thumb_Tip_R",
  "Index_Proximal_R",
  "Index_Intermediate_R",
  "Index_Distal_R",
  "Index_Tip_R",
  "Middle_Proximal_R",
  "Middle_Intermediate_R",
  "Middle_Distal_R",
  "Middle_Tip_R",
  "Ring_Proximal_R",
  "Ring_Intermediate_R",
  "Ring_Distal_R",
  "Ring_Tip_R",
  "Little_Proximal_R",
  "Little_Intermediate_R",
  "Little_Distal_R",
  "Little_Tip_R",
] as const;

export interface SkinnedHandAsset {
  root: THREE.Group;
  model: THREE.Group;
  skinnedMesh: THREE.SkinnedMesh;
  geometry: THREE.BufferGeometry;
  bones: Map<string, THREE.Bone>;
  landmarkBones: THREE.Bone[];
  modelLandmarks: THREE.Vector3[];
  scale: number;
}

const ORIENTATION = new THREE.Matrix4().set(
  0, 1, 0, 0,
  0, 0, -1, 0,
  -1, 0, 0, 0,
  0, 0, 0, 1,
);

function addVertexColors(
  geometry: THREE.BufferGeometry,
  landmarks: THREE.Vector3[],
  bounds: THREE.Box3,
) {
  const position = geometry.getAttribute("position");
  const minY = bounds.min.y;
  const height = Math.max(0.0001, bounds.max.y - bounds.min.y);

  const wristColor = new THREE.Color(0x27356f);
  const midColor = new THREE.Color(0x35c9e8);
  const tipColor = new THREE.Color(0x8f6bff);
  const jointColor = new THREE.Color(0xd8f6ff);
  const color = new THREE.Color();
  const point = new THREE.Vector3();
  const oriented = new THREE.Vector3();
  const colors = new Float32Array(position.count * 3);

  for (let index = 0; index < position.count; index += 1) {
    point.fromBufferAttribute(position, index);
    oriented.copy(point).applyMatrix4(ORIENTATION);
    const t = THREE.MathUtils.clamp((oriented.y - minY) / height, 0, 1);
    if (t < 0.58) color.lerpColors(wristColor, midColor, t / 0.58);
    else color.lerpColors(midColor, tipColor, (t - 0.58) / 0.42);

    let nearest = Infinity;
    for (const landmark of landmarks) {
      const distance = oriented.distanceTo(landmark);
      if (distance < nearest) nearest = distance;
    }
    if (nearest < 0.24) {
      color.lerp(jointColor, (1 - nearest / 0.24) * 0.38);
    }

    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }

  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
}

export async function loadSkinnedHandAsset(): Promise<SkinnedHandAsset> {
  const gltf = await new GLTFLoader().loadAsync(HAND_ASSET_URL);
  gltf.scene.updateMatrixWorld(true);

  let skinnedMesh: THREE.SkinnedMesh | undefined;
  gltf.scene.traverse((object) => {
    if (!skinnedMesh && (object as THREE.SkinnedMesh).isSkinnedMesh) {
      skinnedMesh = object as THREE.SkinnedMesh;
    }
  });

  if (!skinnedMesh) throw new Error("Sinaliza hand asset has no skinned mesh");

  const geometry = skinnedMesh.geometry;
  geometry.computeBoundingBox();
  const sourceBounds = geometry.boundingBox;
  if (!sourceBounds) throw new Error("Sinaliza hand asset has no bounds");

  const orientedBounds = sourceBounds.clone().applyMatrix4(ORIENTATION);
  const size = orientedBounds.getSize(new THREE.Vector3());
  const center = orientedBounds.getCenter(new THREE.Vector3());
  const scale = 4.35 / Math.max(0.0001, size.y);
  const placement = new THREE.Matrix4().compose(
    new THREE.Vector3(-center.x * scale, -center.y * scale, -center.z * scale),
    new THREE.Quaternion(),
    new THREE.Vector3(scale, scale, scale),
  );
  const rootMatrix = placement.clone().multiply(ORIENTATION);

  const bones = new Map<string, THREE.Bone>();
  gltf.scene.traverse((object) => {
    const bone = object as THREE.Bone;
    if (bone.isBone && object.name) bones.set(object.name, bone);
  });

  const landmarkBones = HAND_LANDMARK_NODES.map((name) => {
    const bone = bones.get(name);
    if (!bone) throw new Error(`Sinaliza hand asset is missing ${name}`);
    return bone;
  });

  const modelLandmarks = landmarkBones.map((bone) => {
    const point = new THREE.Vector3();
    bone.getWorldPosition(point);
    return gltf.scene.worldToLocal(point);
  });
  const orientedLandmarks = modelLandmarks.map((point) =>
    point.clone().applyMatrix4(ORIENTATION),
  );
  addVertexColors(geometry, orientedLandmarks, orientedBounds);

  const root = new THREE.Group();
  root.matrix.copy(rootMatrix);
  root.matrixAutoUpdate = false;
  root.add(gltf.scene);
  root.updateMatrixWorld(true);

  return {
    root,
    model: gltf.scene,
    skinnedMesh,
    geometry,
    bones,
    landmarkBones,
    modelLandmarks,
    scale,
  };
}
