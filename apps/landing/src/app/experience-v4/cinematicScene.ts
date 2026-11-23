import * as THREE from "three";
import type { SkinnedHandAsset } from "./handAsset";
import { createHandRig } from "./handRig";
import {
  LANDMARK_AMBER,
  LANDMARK_CONNECTIONS,
  LANDMARK_TIPS,
  clamp01,
  smooth,
} from "./landmarks";

export type CinematicLayout = "desktop" | "tablet" | "mobile";

// One timeline `t` for both acts: [0, 1] is Act 1 (the hero stages below),
// [1, 2] is Act 2. Every visual value is a pure function of `t`.
export const STAGE_BOUNDS = [0, 0.26, 0.52, 0.76, 1] as const;
export const STAGE_IDS = [
  "birth",
  "materialization",
  "gesture",
  "transition",
] as const;
export type StageId = (typeof STAGE_IDS)[number] | "connection";

export function stageAt(t: number): StageId {
  if (t > 1) return "connection";
  for (let i = STAGE_IDS.length - 1; i >= 0; i -= 1) {
    if (t >= STAGE_BOUNDS[i]) return STAGE_IDS[i];
  }
  return STAGE_IDS[0];
}

// Act 2: wireframe opacity while the hand sits beside the text.
const WIRE_TRACE_OPACITY = 0.1;

const range = (p: number, start: number, end: number) =>
  smooth(clamp01((p - start) / (end - start)));

interface CameraKey {
  position: [number, number, number];
  target: [number, number, number];
  // Screen-space offset of the hand, as a fraction of the viewport
  // (x → right, y → up). Keeps the perspective independent from the layout.
  shift: [number, number];
}

interface LayoutPreset {
  fov: number;
  landmarkScale: number;
  keys: [CameraKey, CameraKey, CameraKey, CameraKey, CameraKey];
  // Act 2: the hand recedes toward the edge, then leaves the frame. The
  // move starts from the last Act 1 key, so there is no cut between acts.
  connection: {
    keys: [CameraKey, CameraKey];
    // Share of the act spent reaching the first key.
    split: number;
    // Share of the act over which surface and landmarks fade.
    recede: number;
    // Span of the act over which the remaining wireframe fades out. Stacked
    // layouts end it before the text scrolls over the hand.
    exit: [number, number];
  };
}

// Keyframes sit on the stage bounds: birth start, birth end, materialized,
// gesture settled, transition end.
const PRESETS: Record<CinematicLayout, LayoutPreset> = {
  desktop: {
    fov: 31,
    landmarkScale: 1,
    keys: [
      { position: [0.4, 0.1, 10.6], target: [0, 0, 0], shift: [0.17, 0] },
      { position: [1.6, 0.35, 10.0], target: [0, 0, 0], shift: [0.19, 0] },
      { position: [3.9, 0.9, 8.6], target: [0, 0, 0], shift: [0.21, 0] },
      { position: [4.5, 1.4, 7.8], target: [0, 0.15, 0], shift: [0.21, 0] },
      { position: [2.9, 1.6, 3.4], target: [0, 0.9, 0], shift: [0.24, 0.1] },
    ],
    connection: {
      keys: [
        { position: [4.0, 1.3, 6.4], target: [0, 0.35, 0], shift: [0.31, 0.02] },
        { position: [4.6, 1.0, 7.6], target: [0, 0.2, 0], shift: [0.66, -0.04] },
      ],
      split: 0.5,
      recede: 0.28,
      exit: [0.5, 0.78],
    },
  },
  tablet: {
    fov: 36,
    landmarkScale: 1.05,
    keys: [
      { position: [0.3, 0.1, 13.6], target: [0, 0, 0], shift: [0, 0.17] },
      { position: [1.3, 0.3, 13.0], target: [0, 0, 0], shift: [0, 0.17] },
      { position: [3.9, 0.9, 11.4], target: [0, 0, 0], shift: [0.02, 0.17] },
      { position: [4.6, 1.3, 10.0], target: [0, 0.15, 0], shift: [0.02, 0.17] },
      { position: [3.2, 2.0, 5.0], target: [0.1, 1.4, 0], shift: [0.06, 0.2] },
    ],
    connection: {
      keys: [
        { position: [4.4, 1.5, 9.6], target: [0, 0.4, 0], shift: [0.27, 0.16] },
        { position: [4.8, 1.2, 10.6], target: [0, 0.3, 0], shift: [0.68, 0.2] },
      ],
      split: 0.3,
      recede: 0.16,
      exit: [0.12, 0.3],
    },
  },
  mobile: {
    fov: 40,
    landmarkScale: 1.2,
    keys: [
      { position: [0.2, 0.1, 13.8], target: [0, 0, 0], shift: [0, 0.19] },
      { position: [1.0, 0.3, 13.4], target: [0, 0, 0], shift: [0, 0.19] },
      { position: [3.6, 0.8, 12.4], target: [0, 0, 0], shift: [0, 0.19] },
      { position: [4.2, 1.1, 11.2], target: [0, 0.1, 0], shift: [0, 0.19] },
      { position: [3.0, 1.8, 6.2], target: [0.1, 1.3, 0], shift: [0.04, 0.2] },
    ],
    connection: {
      keys: [
        { position: [4.0, 1.3, 11.6], target: [0, 0.3, 0], shift: [0.24, 0.22] },
        { position: [4.4, 1.1, 12.4], target: [0, 0.2, 0], shift: [0.74, 0.26] },
      ],
      split: 0.3,
      recede: 0.16,
      exit: [0.12, 0.3],
    },
  },
};

// Landmark depth along each finger chain: wrist 0, then 1..4 outward.
const LANDMARK_DEPTH = Array.from({ length: 21 }, (_, index) =>
  index === 0 ? 0 : ((index - 1) % 4) + 1,
);
const landmarkTime = (index: number) => LANDMARK_DEPTH[index] / 4;

function addRevealAttribute(asset: SkinnedHandAsset) {
  const geometry = asset.geometry;
  const position = geometry.getAttribute("position");
  const reveal = new Float32Array(position.count);
  const point = new THREE.Vector3();
  const reach = 0.03;

  // Reveal time grows along the skeleton (wrist → fingertips) and, locally,
  // outward from the bones, so the mesh is drawn from the landmarks.
  let max = 0;
  for (let i = 0; i < position.count; i += 1) {
    point.fromBufferAttribute(position, i);
    let nearest = Infinity;
    let weightSum = 0;
    let timeSum = 0;
    asset.modelLandmarks.forEach((landmark, index) => {
      const distance = point.distanceTo(landmark);
      if (distance < nearest) nearest = distance;
      const weight = 1 / (distance ** 4 + 1e-9);
      weightSum += weight;
      timeSum += weight * landmarkTime(index);
    });
    reveal[i] = 0.8 * (timeSum / weightSum) + 0.2 * Math.min(1, nearest / reach);
    if (reveal[i] > max) max = reveal[i];
  }
  for (let i = 0; i < reveal.length; i += 1) reveal[i] /= max || 1;

  geometry.setAttribute("aReveal", new THREE.BufferAttribute(reveal, 1));
}

function createWire(asset: SkinnedHandAsset) {
  const uniforms = {
    uReveal: { value: 0 },
    uFront: { value: 1 },
  };

  const material = new THREE.MeshBasicMaterial({
    wireframe: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  material.toneMapped = false;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uReveal = uniforms.uReveal;
    shader.uniforms.uFront = uniforms.uFront;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nattribute float aReveal;\nvarying float vReveal;",
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvReveal = aReveal;",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform float uReveal;\nuniform float uFront;\nvarying float vReveal;",
      )
      .replace(
        "#include <color_fragment>",
        [
          "#include <color_fragment>",
          "float revealEdge = uReveal * 1.14 - vReveal;",
          "if (revealEdge < 0.0) discard;",
          "float revealFront = 1.0 - smoothstep(0.0, 0.09, revealEdge);",
          "diffuseColor.rgb += vec3(0.5, 0.86, 1.0) * revealFront * uFront;",
        ].join("\n"),
      );
  };

  // Same geometry and skeleton as the surface: skinning runs on the GPU and
  // no line buffer is rebuilt per frame.
  const mesh = new THREE.SkinnedMesh(asset.geometry, material);
  mesh.bind(asset.skinnedMesh.skeleton, asset.skinnedMesh.bindMatrix);
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  (asset.skinnedMesh.parent ?? asset.model).add(mesh);

  return { mesh, material, uniforms };
}

function createGlow() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, "rgba(53, 201, 232, 0.55)");
    gradient.addColorStop(0.35, "rgba(105, 87, 232, 0.2)");
    gradient.addColorStop(1, "rgba(11, 16, 32, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  material.toneMapped = false;
  const sprite = new THREE.Sprite(material);
  sprite.position.set(0, 0, -2.4);
  sprite.renderOrder = 0;
  return { sprite, material, texture };
}

export interface CinematicHand {
  group: THREE.Group;
  update: (
    t: number,
    layout: CinematicLayout,
    camera: THREE.PerspectiveCamera,
    width: number,
    height: number,
  ) => void;
  dispose: () => void;
}

export function createCinematicHand(
  asset: SkinnedHandAsset,
  scene: THREE.Scene,
): CinematicHand {
  const group = new THREE.Group();
  group.add(asset.root);
  scene.add(group);

  addRevealAttribute(asset);
  const wire = createWire(asset);

  const surfaceMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x16233f,
    metalness: 0.08,
    roughness: 0.34,
    transparent: true,
    opacity: 0,
    envMapIntensity: 1.05,
    side: THREE.DoubleSide,
    depthWrite: false,
    clearcoat: 0.18,
    clearcoatRoughness: 0.55,
  });
  asset.skinnedMesh.material = surfaceMaterial;
  asset.skinnedMesh.frustumCulled = false;
  asset.skinnedMesh.renderOrder = 4;
  asset.skinnedMesh.visible = false;

  // Landmarks: 21 instances following the bones.
  const nodeGeometry = new THREE.IcosahedronGeometry(1, 1);
  const nodeMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 1,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  nodeMaterial.toneMapped = false;
  const nodes = new THREE.InstancedMesh(nodeGeometry, nodeMaterial, 21);
  nodes.frustumCulled = false;
  nodes.renderOrder = 8;
  const nodeBase = asset.landmarkBones.map((_, index) => {
    const isAmber = index === LANDMARK_AMBER;
    const isTip = LANDMARK_TIPS.includes(index);
    const color = isAmber
      ? new THREE.Color(0xf0a848)
      : isTip
        ? new THREE.Color(0x9ff0ff)
        : index % 3 === 0
          ? new THREE.Color(0x35c9e8)
          : new THREE.Color(0x7f8cff);
    nodes.setColorAt(index, color);
    return (isAmber ? 0.095 : isTip ? 0.078 : 0.056) / asset.scale;
  });
  if (nodes.instanceColor) nodes.instanceColor.needsUpdate = true;
  asset.model.add(nodes);

  // MediaPipe connections, drawn on from the wrist outward.
  const linkPositions = new Float32Array(LANDMARK_CONNECTIONS.length * 6);
  const linkGeometry = new THREE.BufferGeometry();
  const linkAttribute = new THREE.BufferAttribute(linkPositions, 3);
  linkAttribute.setUsage(THREE.DynamicDrawUsage);
  linkGeometry.setAttribute("position", linkAttribute);
  const linkMaterial = new THREE.LineBasicMaterial({
    color: 0x7fe3f7,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  linkMaterial.toneMapped = false;
  const links = new THREE.LineSegments(linkGeometry, linkMaterial);
  links.frustumCulled = false;
  links.renderOrder = 7;
  asset.model.add(links);

  const glow = createGlow();
  scene.add(glow.sprite);

  const key = new THREE.DirectionalLight(0xeaf6ff, 0);
  key.position.set(-4, 5, 3);
  const rim = new THREE.DirectionalLight(0x35c9e8, 0);
  rim.position.set(4, 2, -4);
  const fill = new THREE.DirectionalLight(0x6957e8, 0);
  fill.position.set(3, -2, 2);
  const ambient = new THREE.AmbientLight(0x1b2743, 0.85);
  scene.add(key, rim, fill, ambient);

  const rig = createHandRig(asset);
  const dummy = new THREE.Object3D();
  const landmarkPositions = asset.landmarkBones.map(() => new THREE.Vector3());
  const from = new THREE.Vector3();
  const to = new THREE.Vector3();
  const target = new THREE.Vector3();

  const update = (
    t: number,
    layout: CinematicLayout,
    camera: THREE.PerspectiveCamera,
    width: number,
    height: number,
  ) => {
    const preset = PRESETS[layout];
    const p = Math.min(1, t);
    const q = clamp01(t - 1);

    // Act 2 envelopes: annotations and surface go first, the mesh stays as
    // a faint trace beside the text and fades as it leaves the frame.
    const connection = preset.connection;
    const recede = range(q, 0, connection.recede);
    const exit = range(q, connection.exit[0], connection.exit[1]);

    // Stage envelopes.
    // A few landmarks (wrist and knuckles) are already present at p = 0.
    const nodesIn = 0.3 + 0.7 * clamp01(p / 0.1);
    const linksIn = clamp01((p - 0.04) / 0.12);
    const wireIn = range(p, 0.09, 0.26);
    const material = range(p, 0.26, 0.48);
    const annotate = range(p, 0.54, 0.66) * (1 - range(p, 0.8, 0.94));
    const leave = range(p, 0.78, 1);

    // Gesture: one settle into a relaxed partial flexion, held afterwards.
    // The little finger leads and the index follows, as a relaxed hand does.
    rig.setAmounts(
      [
        0.26 * range(p, 0.58, 0.74),
        0.34 * range(p, 0.565, 0.73),
        0.44 * range(p, 0.55, 0.72),
        0.52 * range(p, 0.54, 0.71),
      ],
      0.42 * range(p, 0.59, 0.75),
    );
    group.updateMatrixWorld(true);

    asset.landmarkBones.forEach((bone, index) => {
      const point = landmarkPositions[index];
      bone.getWorldPosition(point);
      asset.model.worldToLocal(point);

      const appear = smooth(clamp01((nodesIn - landmarkTime(index) * 0.7) / 0.3));
      const settle = 1.9 - 0.9 * range(p, 0.02, 0.26) - 0.28 * material + 0.15 * annotate;
      dummy.position.copy(point);
      dummy.scale.setScalar(
        Math.max(1e-6, nodeBase[index] * preset.landmarkScale * appear * settle),
      );
      dummy.updateMatrix();
      nodes.setMatrixAt(index, dummy.matrix);
    });
    nodes.instanceMatrix.needsUpdate = true;
    nodeMaterial.opacity =
      (0.95 - 0.2 * material + 0.2 * annotate) * (1 - 0.5 * leave) * (1 - recede);
    nodes.visible = nodeMaterial.opacity > 0.002;

    LANDMARK_CONNECTIONS.forEach(([a, b], index) => {
      const grow = smooth(clamp01((linksIn - landmarkTime(a) * 0.7) / 0.3));
      from.copy(landmarkPositions[a]);
      to.copy(landmarkPositions[b]).sub(from).multiplyScalar(grow).add(from);
      linkPositions.set([from.x, from.y, from.z, to.x, to.y, to.z], index * 6);
    });
    linkAttribute.needsUpdate = true;
    linkMaterial.opacity =
      (0.85 * (1 - 0.82 * material) + 0.5 * annotate) *
      (1 - 0.7 * leave) *
      (1 - recede);
    links.visible = linkMaterial.opacity > 0.002;

    wire.uniforms.uReveal.value = wireIn;
    wire.uniforms.uFront.value = 1 - range(p, 0.24, 0.3);
    // Shared edges are drawn twice by the wireframe index, hence the lower base.
    wire.material.opacity =
      THREE.MathUtils.lerp(
        THREE.MathUtils.lerp(0.46, 0.26, material),
        WIRE_TRACE_OPACITY,
        recede,
      ) *
      (1 - exit);
    wire.mesh.visible = wireIn > 0.001 && wire.material.opacity > 0.002;

    surfaceMaterial.opacity = 0.15 * material * (1 - recede);
    asset.skinnedMesh.visible = surfaceMaterial.opacity > 0.0003;

    key.intensity = 2.4 * material;
    rim.intensity = 0.2 + 0.7 * material;
    fill.intensity = 0.45 * material;
    key.position.set(-4 + 2.2 * range(p, 0.52, 0.76), 5, 3);

    glow.material.opacity =
      (0.28 + 0.32 * range(p, 0, 0.12) - 0.2 * material) *
      (1 - 0.6 * leave) *
      (1 - 0.5 * recede) *
      (1 - exit);
    glow.sprite.visible = glow.material.opacity > 0.002;
    group.rotation.y = 0.45 * q;
    glow.sprite.scale.setScalar(4 + 5.5 * range(p, 0, 0.3));

    // Camera: eased interpolation between the keys on the stage bounds,
    // continued in Act 2 from the last hero key.
    let keyA: CameraKey;
    let keyB: CameraKey;
    let blend: number;
    if (q > 0) {
      const second = q >= connection.split;
      keyA = second ? connection.keys[0] : preset.keys[4];
      keyB = second ? connection.keys[1] : connection.keys[0];
      blend = second
        ? range(q, connection.split, 1)
        : range(q, 0, connection.split);
    } else {
      let segment = 0;
      for (let i = 0; i < STAGE_BOUNDS.length - 1; i += 1) {
        if (p >= STAGE_BOUNDS[i]) segment = i;
      }
      keyA = preset.keys[segment];
      keyB = preset.keys[segment + 1];
      blend = range(p, STAGE_BOUNDS[segment], STAGE_BOUNDS[segment + 1]);
    }
    camera.position.set(
      THREE.MathUtils.lerp(keyA.position[0], keyB.position[0], blend),
      THREE.MathUtils.lerp(keyA.position[1], keyB.position[1], blend),
      THREE.MathUtils.lerp(keyA.position[2], keyB.position[2], blend),
    );
    target.set(
      THREE.MathUtils.lerp(keyA.target[0], keyB.target[0], blend),
      THREE.MathUtils.lerp(keyA.target[1], keyB.target[1], blend),
      THREE.MathUtils.lerp(keyA.target[2], keyB.target[2], blend),
    );
    camera.fov = preset.fov;
    camera.setViewOffset(
      width,
      height,
      -THREE.MathUtils.lerp(keyA.shift[0], keyB.shift[0], blend) * width,
      THREE.MathUtils.lerp(keyA.shift[1], keyB.shift[1], blend) * height,
      width,
      height,
    );
    camera.lookAt(target);
  };

  const dispose = () => {
    scene.remove(group, glow.sprite, key, rim, fill, ambient);
    wire.material.dispose();
    surfaceMaterial.dispose();
    nodeGeometry.dispose();
    nodeMaterial.dispose();
    linkGeometry.dispose();
    linkMaterial.dispose();
    glow.material.dispose();
    glow.texture.dispose();
    asset.geometry.dispose();
  };

  return { group, update, dispose };
}
