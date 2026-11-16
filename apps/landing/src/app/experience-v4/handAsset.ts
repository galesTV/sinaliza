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
const HAND_LANDMARK_NODES = [
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

export interface HandAsset {
  geometry: THREE.BufferGeometry;
  landmarks: THREE.Vector3[];
}

function addVertexColors(
  geometry: THREE.BufferGeometry,
  landmarks: THREE.Vector3[],
) {
  const position = geometry.getAttribute("position");
  const box = geometry.boundingBox;
  if (!box) return;
  const size = box.getSize(new THREE.Vector3());
  const minY = box.min.y;
  const height = Math.max(0.0001, size.y);

  const wristColor = new THREE.Color(0x27356f);
  const midColor = new THREE.Color(0x35c9e8);
  const tipColor = new THREE.Color(0x8f6bff);
  const jointColor = new THREE.Color(0xd8f6ff);
  const color = new THREE.Color();
  const point = new THREE.Vector3();
  const colors = new Float32Array(position.count * 3);

  for (let index = 0; index < position.count; index += 1) {
    point.fromBufferAttribute(position, index);
    const t = THREE.MathUtils.clamp((point.y - minY) / height, 0, 1);
    if (t < 0.58) color.lerpColors(wristColor, midColor, t / 0.58);
    else color.lerpColors(midColor, tipColor, (t - 0.58) / 0.42);

    let nearest = Infinity;
    for (const landmark of landmarks) {
      const distance = point.distanceTo(landmark);
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

export async function loadHandAsset(): Promise<HandAsset> {
  const gltf = await new GLTFLoader().loadAsync(HAND_ASSET_URL);
  gltf.scene.updateMatrixWorld(true);

  let sourceMesh: THREE.Mesh | undefined;
  const nodes = new Map<string, THREE.Object3D>();
  gltf.scene.traverse((object) => {
    if (object.name) nodes.set(object.name, object);
    if (!sourceMesh && (object as THREE.Mesh).isMesh) {
      sourceMesh = object as THREE.Mesh;
    }
  });

  if (!sourceMesh) throw new Error("Sinaliza hand asset has no mesh");

  const geometry = sourceMesh.geometry.clone();
  geometry.applyMatrix4(sourceMesh.matrixWorld);
  for (const attribute of ["JOINTS_0", "WEIGHTS_0", "JOINTS_1", "WEIGHTS_1"]) {
    geometry.deleteAttribute(attribute);
  }

  const sourceLandmarks = HAND_LANDMARK_NODES.map((name) => {
    const node = nodes.get(name);
    if (!node) throw new Error(`Sinaliza hand asset is missing ${name}`);
    const point = new THREE.Vector3();
    node.getWorldPosition(point);
    return point;
  });

  // Rotate the GLB's rest pose into the study space: fingers up, palm toward +z,
  // thumb toward +x, wrist near the origin.
  const orientation = new THREE.Matrix4().set(
    0, 1, 0, 0,
    0, 0, -1, 0,
    -1, 0, 0, 0,
    0, 0, 0, 1,
  );
  geometry.applyMatrix4(orientation);
  geometry.computeBoundingBox();

  const bounds = geometry.boundingBox;
  if (!bounds) throw new Error("Sinaliza hand asset has no bounds");
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const scale = 4.35 / Math.max(0.0001, size.y);
  const placement = new THREE.Matrix4().compose(
    new THREE.Vector3(-center.x * scale, -center.y * scale, -center.z * scale),
    new THREE.Quaternion(),
    new THREE.Vector3(scale, scale, scale),
  );

  geometry.applyMatrix4(placement);
  geometry.computeBoundingBox();
  geometry.computeVertexNormals();

  const landmarks = sourceLandmarks.map((point) =>
    point.applyMatrix4(orientation).applyMatrix4(placement).clone(),
  );
  addVertexColors(geometry, landmarks);

  return { geometry, landmarks };
}
