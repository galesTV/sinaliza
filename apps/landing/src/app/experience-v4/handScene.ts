import * as THREE from "three";
import {
  LANDMARK_AMBER,
  LANDMARK_CONNECTIONS,
  LANDMARK_TIPS,
} from "./landmarks";
import type { SkinnedHandAsset } from "./handAsset";
import type { BuiltConcept } from "./scenes";
import { createHandRig, type HandRig } from "./handRig";

export type HandTreatmentId =
  | "hand-wireframe"
  | "hand-anatomy"
  | "hand-constellation";

export function isHandTreatment(concept: string): concept is HandTreatmentId {
  return (
    concept === "hand-wireframe" ||
    concept === "hand-anatomy" ||
    concept === "hand-constellation"
  );
}

export interface HandConcept extends BuiltConcept {
  rig: HandRig | null;
}

interface WireframeOptions {
  opacity: number;
  renderOrder?: number;
  dynamic?: boolean;
}

function createSkinnedWireframe(
  asset: SkinnedHandAsset,
  options: WireframeOptions,
) {
  const geometry = asset.geometry;
  const position = geometry.getAttribute("position") as THREE.BufferAttribute;
  const color = geometry.getAttribute("color") as THREE.BufferAttribute | undefined;
  const index = geometry.getIndex();
  const edges = new Map<string, [number, number]>();

  const addEdge = (a: number, b: number) => {
    if (a === b) return;
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    if (!edges.has(key)) edges.set(key, [a, b]);
  };

  if (index) {
    const indices = index.array as ArrayLike<number>;
    for (let i = 0; i < indices.length; i += 3) {
      addEdge(indices[i], indices[i + 1]);
      addEdge(indices[i + 1], indices[i + 2]);
      addEdge(indices[i + 2], indices[i]);
    }
  } else {
    for (let i = 0; i < position.count; i += 3) {
      addEdge(i, i + 1);
      addEdge(i + 1, i + 2);
      addEdge(i + 2, i);
    }
  }

  const vertexIndices: number[] = [];
  const colors: number[] = [];
  const fallback = new THREE.Color(0x35c9e8);

  for (const [a, b] of edges.values()) {
    for (const vertex of [a, b]) {
      vertexIndices.push(vertex);
      if (color) {
        colors.push(color.getX(vertex), color.getY(vertex), color.getZ(vertex));
      } else {
        colors.push(fallback.r, fallback.g, fallback.b);
      }
    }
  }

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(new Float32Array(vertexIndices.length * 3), 3),
  );
  lineGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  lineGeometry.computeBoundingSphere();

  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: options.opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  material.toneMapped = false;

  const lines = new THREE.LineSegments(lineGeometry, material);
  lines.renderOrder = options.renderOrder ?? 6;
  lines.frustumCulled = false;

  const toModel = new THREE.Matrix4()
    .copy(asset.model.matrixWorld)
    .invert()
    .multiply(asset.skinnedMesh.matrixWorld);
  const skinned = new Float32Array(position.count * 3);
  const vector = new THREE.Vector3();
  const positionAttribute = lineGeometry.getAttribute(
    "position",
  ) as THREE.BufferAttribute;
  const dynamic = options.dynamic ?? false;
  let updated = false;

  const update = () => {
    if (!dynamic && updated) return;
    updated = true;

    for (let i = 0; i < position.count; i += 1) {
      asset.skinnedMesh.getVertexPosition(i, vector);
      vector.applyMatrix4(toModel);
      skinned[i * 3] = vector.x;
      skinned[i * 3 + 1] = vector.y;
      skinned[i * 3 + 2] = vector.z;
    }

    for (let i = 0; i < vertexIndices.length; i += 1) {
      const source = vertexIndices[i] * 3;
      positionAttribute.setXYZ(i, skinned[source], skinned[source + 1], skinned[source + 2]);
    }
    positionAttribute.needsUpdate = true;
  };

  return { object: lines, update };
}

interface LandmarkOptions {
  opacity: number;
  renderOrder?: number;
  dynamic?: boolean;
  sizeScale?: number;
}

function createLandmarkNodes(asset: SkinnedHandAsset, options: LandmarkOptions) {
  const geometry = new THREE.IcosahedronGeometry(1, 1);
  const material = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: options.opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  material.toneMapped = false;

  const mesh = new THREE.InstancedMesh(
    geometry,
    material,
    asset.landmarkBones.length,
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = options.renderOrder ?? 8;

  const dummy = new THREE.Object3D();
  const world = new THREE.Vector3();
  const sizeScale = options.sizeScale ?? 1;
  const scales = asset.landmarkBones.map((_, index) => {
    const isTip = LANDMARK_TIPS.includes(index);
    const isAmber = index === LANDMARK_AMBER;
    const scale = isAmber ? 0.095 : isTip ? 0.078 : 0.056;
    return (scale / asset.scale) * sizeScale;
  });
  const baseColors: THREE.Color[] = [];

  asset.landmarkBones.forEach((_, index) => {
    const isTip = LANDMARK_TIPS.includes(index);
    const isAmber = index === LANDMARK_AMBER;
    const color = isAmber
      ? new THREE.Color(0xf0a848)
      : isTip
        ? new THREE.Color(0x9ff0ff)
        : index % 3 === 0
          ? new THREE.Color(0x35c9e8)
          : new THREE.Color(0x7f8cff);
    baseColors.push(color);
    mesh.setColorAt(index, color);
  });
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  const dynamic = options.dynamic ?? false;
  let updated = false;

  const update = () => {
    if (!dynamic && updated) return;
    updated = true;

    asset.landmarkBones.forEach((bone, index) => {
      bone.getWorldPosition(world);
      asset.model.worldToLocal(world);
      dummy.position.copy(world);
      dummy.scale.setScalar(scales[index]);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };

  return { object: mesh, baseColors, material, update };
}

function createConstellationLines(asset: SkinnedHandAsset) {
  const positions: number[] = [];
  const colors: number[] = [];
  const start = new THREE.Color(0x35c9e8);
  const end = new THREE.Color(0x8f6bff);
  const color = new THREE.Color();

  LANDMARK_CONNECTIONS.forEach(([from, to], index) => {
    const a = asset.modelLandmarks[from];
    const b = asset.modelLandmarks[to];
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    const t =
      LANDMARK_CONNECTIONS.length === 1
        ? 0
        : index / (LANDMARK_CONNECTIONS.length - 1);
    color.lerpColors(start, end, t);
    colors.push(color.r, color.g, color.b, color.r, color.g, color.b);
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeBoundingSphere();

  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.58,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  material.toneMapped = false;

  const lines = new THREE.LineSegments(geometry, material);
  lines.renderOrder = 7;
  lines.frustumCulled = false;
  return { lines, material };
}

export function buildHandConcept(
  treatment: HandTreatmentId,
  asset: SkinnedHandAsset,
  options: { articulated?: boolean; initialPhase?: number } = {},
): HandConcept {
  const articulated = options.articulated ?? false;
  const group = new THREE.Group();
  group.add(asset.root);
  asset.skinnedMesh.frustumCulled = false;

  const wireOpacity =
    treatment === "hand-wireframe"
      ? 0.9
      : treatment === "hand-anatomy"
        ? 0.48
        : 0.6;
  const wire = createSkinnedWireframe(asset, {
    opacity: wireOpacity,
    renderOrder: 6,
    dynamic: articulated,
  });
  asset.model.add(wire.object);

  let surfaceMaterial: THREE.MeshPhysicalMaterial | null = null;
  if (treatment === "hand-anatomy") {
    asset.skinnedMesh.visible = true;
    surfaceMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x16233f,
      metalness: 0.08,
      roughness: 0.34,
      transparent: true,
      opacity: 0.14,
      envMapIntensity: 1.05,
      side: THREE.DoubleSide,
      depthWrite: false,
      flatShading: false,
      clearcoat: 0.18,
      clearcoatRoughness: 0.55,
    });
    asset.skinnedMesh.material = surfaceMaterial;
  } else {
    asset.skinnedMesh.visible = false;
  }

  const landmarkOpacity =
    treatment === "hand-wireframe" ? 0.78 : treatment === "hand-anatomy" ? 0.92 : 1;
  const landmarkSize =
    treatment === "hand-constellation" ? 1.28 : articulated ? 1.18 : 1;
  const landmarks = createLandmarkNodes(asset, {
    opacity: landmarkOpacity,
    renderOrder: 8,
    dynamic: articulated,
    sizeScale: landmarkSize,
  });
  asset.model.add(landmarks.object);

  const constellation =
    treatment === "hand-constellation" ? createConstellationLines(asset) : null;
  if (constellation) asset.model.add(constellation.lines);

  const rig = articulated ? createHandRig(asset) : null;
  if (rig && options.initialPhase !== undefined) {
    rig.setPhase(options.initialPhase);
  }

  let synced = false;
  let lastTime: number | null = null;
  let lastSyncedPhase: number | null = null;
  const syncHand = () => {
    group.updateMatrixWorld(true);
    wire.update();
    landmarks.update();
    synced = true;
  };

  const pulseColor = new THREE.Color();
  const update = (time: number, reducedMotion: boolean) => {
    let deltaTime = 0;
    if (lastTime !== null) {
      deltaTime = Math.min(0.1, Math.max(0, time - lastTime));
    }
    lastTime = time;

    if (rig) {
      const phaseChanged =
        lastSyncedPhase === null ||
        Math.abs(rig.phase - lastSyncedPhase) > 0.0005;
      if (!reducedMotion && rig.playing) {
        rig.update(deltaTime);
        syncHand();
        lastSyncedPhase = rig.phase;
      } else {
        rig.applyPose();
        if (phaseChanged) {
          syncHand();
          lastSyncedPhase = rig.phase;
        }
      }
    } else if (!synced) {
      syncHand();
    }

    if (reducedMotion) return;

    if (surfaceMaterial) {
      const breath = Math.sin(time * 0.55) * 0.5 + 0.5;
      surfaceMaterial.opacity = 0.125 + breath * 0.028;
    }

    if (constellation) {
      landmarks.baseColors.forEach((base, index) => {
        const pulse = 0.72 + 0.28 * Math.sin(time * 1.6 - index * 0.38);
        pulseColor.copy(base).multiplyScalar(pulse);
        landmarks.object.setColorAt(index, pulseColor);
      });
      if (landmarks.object.instanceColor) {
        landmarks.object.instanceColor.needsUpdate = true;
      }
      constellation.material.opacity = 0.46 + 0.14 * Math.sin(time * 0.9);
    }
  };

  return { group, update, rig };
}
