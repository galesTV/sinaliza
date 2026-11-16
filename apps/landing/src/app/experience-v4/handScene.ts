import * as THREE from "three";
import {
  LANDMARK_AMBER,
  LANDMARK_CONNECTIONS,
  LANDMARK_TIPS,
} from "./landmarks";
import type { HandAsset } from "./handAsset";
import type { BuiltConcept } from "./scenes";

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

function createWireLines(geometry: THREE.BufferGeometry, opacity: number) {
  const position = geometry.getAttribute("position");
  const color = geometry.getAttribute("color");
  const index = geometry.getIndex();
  const edges = new Map<string, [number, number]>();

  const addEdge = (a: number, b: number) => {
    if (a === b) return;
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    if (!edges.has(key)) edges.set(key, [a, b]);
  };

  if (index) {
    const indices = index.array;
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

  const positions: number[] = [];
  const colors: number[] = [];
  const fallback = new THREE.Color(0x35c9e8);

  for (const [a, b] of edges.values()) {
    for (const vertex of [a, b]) {
      positions.push(
        position.getX(vertex),
        position.getY(vertex),
        position.getZ(vertex),
      );
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
    new THREE.Float32BufferAttribute(positions, 3),
  );
  lineGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  lineGeometry.computeBoundingSphere();

  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  material.toneMapped = false;

  const lines = new THREE.LineSegments(lineGeometry, material);
  lines.renderOrder = 6;
  return lines;
}

function createLandmarkNodes(
  landmarks: THREE.Vector3[],
  opacity: number,
): {
  object: THREE.InstancedMesh;
  baseColors: THREE.Color[];
  material: THREE.MeshBasicMaterial;
} {
  const geometry = new THREE.IcosahedronGeometry(1, 1);
  const material = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  material.toneMapped = false;

  const mesh = new THREE.InstancedMesh(geometry, material, landmarks.length);
  const dummy = new THREE.Object3D();
  const baseColors: THREE.Color[] = [];

  landmarks.forEach((point, index) => {
    const isTip = LANDMARK_TIPS.includes(index);
    const isAmber = index === LANDMARK_AMBER;
    const scale = isAmber ? 0.095 : isTip ? 0.078 : 0.056;
    dummy.position.copy(point);
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);

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

  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.renderOrder = 8;
  return { object: mesh, baseColors, material };
}

function createConstellationLines(landmarks: THREE.Vector3[]) {
  const positions: number[] = [];
  const colors: number[] = [];
  const start = new THREE.Color(0x35c9e8);
  const end = new THREE.Color(0x8f6bff);
  const color = new THREE.Color();

  LANDMARK_CONNECTIONS.forEach(([from, to], index) => {
    const a = landmarks[from];
    const b = landmarks[to];
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    const t = LANDMARK_CONNECTIONS.length === 1 ? 0 : index / (LANDMARK_CONNECTIONS.length - 1);
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
    opacity: 0.46,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  material.toneMapped = false;

  const lines = new THREE.LineSegments(geometry, material);
  lines.renderOrder = 7;
  return { lines, material };
}

export function buildHandConcept(
  treatment: HandTreatmentId,
  asset: HandAsset,
): BuiltConcept {
  const group = new THREE.Group();
  const wireOpacity =
    treatment === "hand-wireframe"
      ? 0.92
      : treatment === "hand-anatomy"
        ? 0.46
        : 0.78;

  group.add(createWireLines(asset.geometry, wireOpacity));

  let surface: THREE.Mesh | null = null;
  if (treatment === "hand-anatomy") {
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x1c2a52,
      metalness: 0.12,
      roughness: 0.38,
      transparent: true,
      opacity: 0.12,
      envMapIntensity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false,
      flatShading: true,
    });
    surface = new THREE.Mesh(asset.geometry, material);
    surface.renderOrder = 1;
    group.add(surface);
  }

  const landmarkOpacity =
    treatment === "hand-wireframe" ? 0.82 : treatment === "hand-anatomy" ? 0.9 : 1;
  const landmarks = createLandmarkNodes(asset.landmarks, landmarkOpacity);
  group.add(landmarks.object);

  const constellation =
    treatment === "hand-constellation"
      ? createConstellationLines(asset.landmarks)
      : null;
  if (constellation) group.add(constellation.lines);

  const pulseColor = new THREE.Color();
  const update = (time: number, reducedMotion: boolean) => {
    if (reducedMotion) return;

    if (treatment === "hand-anatomy" && surface) {
      const breath = Math.sin(time * 0.55) * 0.5 + 0.5;
      (surface.material as THREE.MeshPhysicalMaterial).opacity =
        0.1 + breath * 0.035;
    }

    if (treatment === "hand-constellation") {
      landmarks.baseColors.forEach((base, index) => {
        const pulse = 0.68 + 0.32 * Math.sin(time * 1.35 - index * 0.32);
        pulseColor.copy(base).multiplyScalar(pulse);
        landmarks.object.setColorAt(index, pulseColor);
      });
      if (landmarks.object.instanceColor) {
        landmarks.object.instanceColor.needsUpdate = true;
      }
      if (constellation) {
        constellation.material.opacity = 0.34 + 0.14 * Math.sin(time * 0.8);
      }
    }
  };

  return { group, update };
}
