import * as THREE from "three";

export interface HandShotConfig {
  objectPosition: [number, number, number];
  cameraPosition: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export const HAND_SHOTS: Record<string, HandShotConfig> = {
  hero: {
    objectPosition: [0.58, 0, 0],
    cameraPosition: [3.7, 0.9, 7.5],
    target: [0.16, -0.05, 0],
    fov: 31,
  },
  anatomy: {
    objectPosition: [0, 0, 0],
    cameraPosition: [2.1, 1.75, 4.9],
    target: [0.2, 0.62, 0.12],
    fov: 43,
  },
  silhouette: {
    objectPosition: [0, 0, 0],
    cameraPosition: [-4.9, 0.5, 6.3],
    target: [0, 0.15, 0],
    fov: 34,
  },
};

export function setupHandLights(scene: THREE.Scene) {
  const key = new THREE.DirectionalLight(0xeaf6ff, 2.4);
  key.position.set(-4, 5, 3);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x35c9e8, 0.9);
  rim.position.set(4, 2, -4);
  scene.add(rim);

  const fill = new THREE.DirectionalLight(0x6957e8, 0.45);
  fill.position.set(3, -2, 2);
  scene.add(fill);

  scene.add(new THREE.AmbientLight(0x1b2743, 0.85));
  const core = new THREE.PointLight(0x35c9e8, 4, 8, 2);
  core.position.set(0, 1.4, 2);
  scene.add(core);
}
