import * as THREE from "three";
import {
  LANDMARK_AMBER,
  LANDMARK_CONNECTIONS,
  LANDMARK_POINTS,
  LANDMARK_TIPS,
} from "./landmarks";

export type ConceptId =
  | "a"
  | "b"
  | "hand-wireframe"
  | "hand-anatomy"
  | "hand-constellation";

export interface BuiltConcept {
  group: THREE.Group;
  update: (time: number, reducedMotion: boolean) => void;
}

type LandmarkVector = THREE.Vector3;

function fitLandmarks(
  points: [number, number, number][],
  size: { height: number; width: number; depth: number },
  center = new THREE.Vector3(0, 0, 0),
): LandmarkVector[] {
  const vectors = points.map((point) => new THREE.Vector3(...point));
  const box = new THREE.Box3().setFromPoints(vectors);
  const boxSize = box.getSize(new THREE.Vector3());
  const boxCenter = box.getCenter(new THREE.Vector3());
  const scale = new THREE.Vector3(
    size.width / Math.max(0.0001, boxSize.x),
    size.height / Math.max(0.0001, boxSize.y),
    size.depth / Math.max(0.0001, boxSize.z),
  );

  return vectors.map((point) =>
    point.sub(boxCenter).multiply(scale).add(center),
  );
}

function disposeMaterial(material: THREE.Material) {
  const anyMaterial = material as THREE.Material & {
    map?: THREE.Texture | null;
    normalMap?: THREE.Texture | null;
    roughnessMap?: THREE.Texture | null;
    metalnessMap?: THREE.Texture | null;
    emissiveMap?: THREE.Texture | null;
  };
  anyMaterial.map?.dispose();
  anyMaterial.normalMap?.dispose();
  anyMaterial.roughnessMap?.dispose();
  anyMaterial.metalnessMap?.dispose();
  anyMaterial.emissiveMap?.dispose();
  material.dispose();
}

export function disposeObject(root: THREE.Object3D) {
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    mesh.geometry?.dispose();
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(material)) material.forEach(disposeMaterial);
    else if (material) disposeMaterial(material);
  });
}

function createGround(radius: number, y: number, color: string) {
  const geometry = new THREE.CircleGeometry(radius, 64);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.96,
    metalness: 0,
  });
  const ground = new THREE.Mesh(geometry, material);
  ground.position.y = y;
  ground.receiveShadow = true;
  return ground;
}

function createPodGeometry() {
  const geometry = new THREE.SphereGeometry(1, 96, 64);
  const position = geometry.attributes.position;
  const vertex = new THREE.Vector3();

  for (let index = 0; index < position.count; index += 1) {
    vertex.fromBufferAttribute(position, index);

    const theta = Math.atan2(vertex.z, vertex.x);
    const phi = Math.acos(THREE.MathUtils.clamp(vertex.y, -1, 1));
    const ribs = Math.sin(theta * 5 + Math.sin(phi * 3) * 0.7);
    const equator = Math.sin(phi * Math.PI);
    const crown = Math.cos(phi * Math.PI * 0.5);

    const radius =
      1 + ribs * 0.028 + equator * 0.022 - crown * crown * 0.018;
    vertex.multiplyScalar(radius);

    vertex.x *= 1.06;
    vertex.y *= 1.52;
    vertex.z *= 0.82;

    position.setXYZ(index, vertex.x, vertex.y, vertex.z);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function createLineNetwork(points: LandmarkVector[], color: number, opacity: number) {
  const positions: number[] = [];
  for (const [from, to] of LANDMARK_CONNECTIONS) {
    positions.push(points[from].x, points[from].y, points[from].z);
    positions.push(points[to].x, points[to].y, points[to].z);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const lines = new THREE.LineSegments(geometry, material);
  lines.renderOrder = 3;
  return lines;
}

function createPointsNetwork(
  points: LandmarkVector[],
  tipIndices: number[],
  color: number,
  size: number,
  opacity: number,
) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.PointsMaterial({
    color,
    size,
    sizeAttenuation: true,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  const pointsObject = new THREE.Points(geometry, material);
  pointsObject.renderOrder = 4;

  const tips = tipIndices.map((index) => points[index]);
  const tipGeometry = new THREE.BufferGeometry().setFromPoints(tips);
  const tipMaterial = new THREE.PointsMaterial({
    color,
    size: size * 1.55,
    sizeAttenuation: true,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  const tipObject = new THREE.Points(tipGeometry, tipMaterial);
  tipObject.renderOrder = 5;

  const wrapper = new THREE.Group();
  wrapper.add(pointsObject, tipObject);
  return wrapper;
}

export function buildConceptA(): BuiltConcept {
  const group = new THREE.Group();

  const shellMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xd9cfc1,
    metalness: 0,
    roughness: 0.16,
    transmission: 0.58,
    thickness: 1.15,
    ior: 1.42,
    attenuationColor: new THREE.Color(0xf3c48c),
    attenuationDistance: 2.4,
    clearcoat: 0.55,
    clearcoatRoughness: 0.22,
    envMapIntensity: 1.2,
    specularIntensity: 1,
  });

  const shell = new THREE.Mesh(createPodGeometry(), shellMaterial);
  shell.castShadow = true;
  shell.receiveShadow = true;
  shell.renderOrder = 1;
  group.add(shell);

  const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0x120d08,
    emissive: 0xf0a848,
    emissiveIntensity: 1.8,
    roughness: 0.42,
    metalness: 0,
  });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 1), coreMaterial);
  core.position.set(0, 0.08, 0);
  core.renderOrder = 2;
  group.add(core);

  const aperture = new THREE.Group();
  aperture.position.set(0, 0.08, 0.78);

  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0x211d18,
    metalness: 0.88,
    roughness: 0.34,
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.048, 32, 128), ringMaterial);
  ring.scale.set(1, 1.28, 1);
  ring.castShadow = true;
  aperture.add(ring);

  const seamMaterial = new THREE.MeshBasicMaterial({
    color: 0xf0a848,
    transparent: true,
    opacity: 0.95,
  });
  const seam = new THREE.Mesh(new THREE.TorusGeometry(0.665, 0.011, 12, 128), seamMaterial);
  seam.scale.set(1, 1.28, 1);
  seam.renderOrder = 6;
  aperture.add(seam);
  group.add(aperture);

  const landmarks = fitLandmarks(LANDMARK_POINTS, {
    height: 2.0,
    width: 1.62,
    depth: 0.92,
  }, new THREE.Vector3(0, 0.06, 0));

  group.add(createLineNetwork(landmarks, 0x9fdcff, 0.38));
  group.add(createPointsNetwork(landmarks, LANDMARK_TIPS, 0xcdf2ff, 0.042, 0.92));

  group.add(createGround(3.4, -2.38, "#0b0a08"));

  const update = (time: number, reducedMotion: boolean) => {
    if (reducedMotion) return;
    const breath = Math.sin(time * 0.55) * 0.5 + 0.5;
    coreMaterial.emissiveIntensity = 1.35 + breath * 0.75;
    aperture.rotation.z = Math.sin(time * 0.22) * 0.025;
    shell.rotation.y = Math.sin(time * 0.16) * 0.04;
  };

  return { group, update };
}

function createStrut(
  from: LandmarkVector,
  to: LandmarkVector,
  radius: number,
  material: THREE.Material,
) {
  const direction = to.clone().sub(from);
  const length = direction.length();
  const geometry = new THREE.CylinderGeometry(radius, radius, length, 10);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(from).add(to).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize(),
  );
  mesh.castShadow = true;
  return mesh;
}

export function buildConceptB(): BuiltConcept {
  const group = new THREE.Group();

  const ceramicMaterial = new THREE.MeshStandardMaterial({
    color: 0xcfc3b2,
    roughness: 0.84,
    metalness: 0.06,
  });
  const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0x7d7468,
    roughness: 0.36,
    metalness: 0.86,
  });
  const spineMaterial = new THREE.MeshStandardMaterial({
    color: 0x181410,
    roughness: 0.92,
    metalness: 0.08,
  });

  const ringSpecs = [
    { y: -2.12, radius: 1.3, tube: 0.1, material: ceramicMaterial, spin: 0.0 },
    { y: -1.42, radius: 1.18, tube: 0.086, material: metalMaterial, spin: 0.46 },
    { y: -0.72, radius: 1.08, tube: 0.076, material: ceramicMaterial, spin: 0.92 },
    { y: -0.02, radius: 0.98, tube: 0.066, material: metalMaterial, spin: 1.38 },
    { y: 0.68, radius: 1.04, tube: 0.074, material: ceramicMaterial, spin: 1.84 },
    { y: 1.38, radius: 1.14, tube: 0.086, material: metalMaterial, spin: 2.3 },
    { y: 2.08, radius: 1.24, tube: 0.098, material: ceramicMaterial, spin: 2.76 },
  ];

  for (const spec of ringSpecs) {
    const geometry = new THREE.TorusGeometry(spec.radius, spec.tube, 22, 120);
    const mesh = new THREE.Mesh(geometry, spec.material);
    mesh.rotation.x = Math.PI / 2;
    mesh.rotation.y = spec.spin;
    mesh.scale.set(1.24, 0.68, 1);
    mesh.position.y = spec.y;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  const spineGeometry = new THREE.CapsuleGeometry(0.34, 2.85, 8, 32);
  const spine = new THREE.Mesh(spineGeometry, spineMaterial);
  spine.castShadow = true;
  spine.receiveShadow = true;
  group.add(spine);

  const landmarks = fitLandmarks(LANDMARK_POINTS, {
    height: 2.75,
    width: 2.05,
    depth: 0.72,
  }, new THREE.Vector3(0, 0.05, 0));

  const nodeMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8cdb8,
    roughness: 0.34,
    metalness: 0.82,
  });
  const amberMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a1a0c,
    emissive: 0xf0a848,
    emissiveIntensity: 2.1,
    roughness: 0.48,
    metalness: 0.2,
  });
  const threadMaterial = new THREE.MeshStandardMaterial({
    color: 0x3b322a,
    roughness: 0.56,
    metalness: 0.72,
  });

  landmarks.forEach((point, index) => {
    const isTip = LANDMARK_TIPS.includes(index);
    const isAmber = index === LANDMARK_AMBER;
    const radius = isTip ? 0.072 : isAmber ? 0.082 : 0.055;
    const material = isAmber ? amberMaterial : nodeMaterial;
    const node = new THREE.Mesh(new THREE.SphereGeometry(radius, 20, 20), material);
    node.position.copy(point);
    node.castShadow = true;
    group.add(node);
  });

  for (const [from, to] of LANDMARK_CONNECTIONS) {
    group.add(createStrut(landmarks[from], landmarks[to], 0.013, threadMaterial));
  }

  group.add(createGround(3.2, -2.48, "#100e0b"));

  const update = (time: number, reducedMotion: boolean) => {
    if (reducedMotion) return;
    const breath = Math.sin(time * 0.7) * 0.5 + 0.5;
    amberMaterial.emissiveIntensity = 1.7 + breath * 0.8;
    group.rotation.y = Math.sin(time * 0.12) * 0.025;
  };

  return { group, update };
}
