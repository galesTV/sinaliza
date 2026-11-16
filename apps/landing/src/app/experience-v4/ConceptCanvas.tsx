"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  buildConceptA,
  buildConceptB,
  disposeObject,
  type BuiltConcept,
  type ConceptId,
} from "./scenes";
import { buildHandConcept, isHandTreatment } from "./handScene";
import { loadHandAsset } from "./handAsset";

type ViewMode = "composition" | "study";

interface ShotConfig {
  objectPosition: [number, number, number];
  cameraPosition: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const HAND_SHOTS: Record<string, ShotConfig> = {
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

function shotConfig(concept: ConceptId, shot: string): ShotConfig {
  if (isHandTreatment(concept)) {
    return HAND_SHOTS[shot] ?? HAND_SHOTS.hero;
  }

  const configs: Record<"a" | "b", Record<string, ShotConfig>> = {
    a: {
      hero: {
        objectPosition: [0.78, 0.08, 0],
        cameraPosition: [3.35, 0.55, 7.45],
        target: [0.18, 0.08, 0],
        fov: 34,
      },
      low: {
        objectPosition: [0, 0, 0],
        cameraPosition: [0.35, -1.65, 5.35],
        target: [0, 0.38, 0],
        fov: 38,
      },
      aperture: {
        objectPosition: [0, 0.08, 0],
        cameraPosition: [0.12, 0.18, 3.15],
        target: [0, 0.08, 0.52],
        fov: 42,
      },
      silhouette: {
        objectPosition: [0, 0, 0],
        cameraPosition: [0, 0.72, 9.2],
        target: [0, 0.18, 0],
        fov: 30,
      },
    },
    b: {
      hero: {
        objectPosition: [0.95, 0, 0],
        cameraPosition: [3.45, 0.42, 7.35],
        target: [0.22, 0, 0],
        fov: 34,
      },
      low: {
        objectPosition: [0, 0, 0],
        cameraPosition: [0.2, -2.05, 5.25],
        target: [0, 0.32, 0],
        fov: 38,
      },
      strata: {
        objectPosition: [0, 0, 0],
        cameraPosition: [2.35, 0.35, 4.45],
        target: [0, 0.05, 0],
        fov: 42,
      },
      detail: {
        objectPosition: [0, 0, 0],
        cameraPosition: [0.85, 0.58, 2.85],
        target: [0, 0.16, 0],
        fov: 46,
      },
    },
  };

  const phaseConcept = concept === "a" ? "a" : "b";
  return configs[phaseConcept][shot] ?? configs[phaseConcept].hero;
}

function setupHandLights(scene: THREE.Scene) {
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

function setupLights(scene: THREE.Scene, concept: ConceptId) {
  if (isHandTreatment(concept)) {
    setupHandLights(scene);
    return;
  }

  if (concept === "a") {
    const key = new THREE.DirectionalLight(0xfff0dd, 2.7);
    key.position.set(-4.2, 5.2, 4.2);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -4;
    key.shadow.camera.right = 4;
    key.shadow.camera.top = 4;
    key.shadow.camera.bottom = -4;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 18;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x35c9e8, 0.55);
    rim.position.set(4.5, 1.5, -3.5);
    scene.add(rim);

    scene.add(new THREE.AmbientLight(0x3a4152, 0.55));
    const coreLight = new THREE.PointLight(0xf0a848, 5.5, 6.5, 2);
    coreLight.position.set(0, 0.15, 0.55);
    scene.add(coreLight);
    return;
  }

  const key = new THREE.DirectionalLight(0xffe7c7, 3.1);
  key.position.set(-5, 4.2, 3.2);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -4.5;
  key.shadow.camera.right = 4.5;
  key.shadow.camera.top = 4.5;
  key.shadow.camera.bottom = -4.5;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 18;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xffd9a8, 0.55);
  fill.position.set(4.5, 2, -2.5);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xfff4e6, 0.7);
  rim.position.set(3.5, -1, -4);
  scene.add(rim);

  scene.add(new THREE.AmbientLight(0x302b24, 0.7));
}

function fallbackLabel(concept: ConceptId) {
  if (concept === "a") return "Corpo do sinal";
  if (concept === "b") return "Estratos do gesto";
  return concept.replace("hand-", "Mão ");
}

function Fallback({ concept, shot }: { concept: ConceptId; shot: string }) {
  return (
    <div className="v4-fallback" role="img" aria-label={`Estudo ${concept} ${shot} sem WebGL`}>
      <span>WebGL indisponível</span>
      <strong>{fallbackLabel(concept)}</strong>
      <small>{shot}</small>
    </div>
  );
}

export function ConceptCanvas({
  concept,
  shot,
  view,
}: {
  concept: ConceptId;
  shot: string;
  view: ViewMode;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      const timeout = window.setTimeout(() => setFailed(true), 0);
      return () => window.clearTimeout(timeout);
    }

    const handTreatment = isHandTreatment(concept) ? concept : null;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(
      handTreatment ? "#0b1020" : concept === "a" ? 0x0d0b09 : 0x12100d,
    );

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);
    const config = shotConfig(concept, shot);
    camera.position.fromArray(config.cameraPosition);
    camera.fov = config.fov;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.25 : 1.5));
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = handTreatment ? 1.14 : concept === "a" ? 1.08 : 1.04;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = "v4-canvas";
    host.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = new RoomEnvironment();
    const environmentTexture = pmrem.fromScene(environment, 0.04).texture;
    scene.environment = environmentTexture;

    setupLights(scene, concept);

    let built: BuiltConcept | null = null;
    const start = performance.now();
    let frame = 0;
    let disposed = false;
    let didSetReady = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderFrame = () => {
      if (!built) return;
      const time = (performance.now() - start) / 1000;
      built.update(time, reducedMotion);
      camera.lookAt(new THREE.Vector3(...config.target));
      renderer.render(scene, camera);
      if (!didSetReady) {
        didSetReady = true;
        setReady(true);
      }
    };

    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      if (reducedMotion) renderFrame();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    if (handTreatment) {
      loadHandAsset()
        .then((asset) => {
          if (disposed) {
            asset.geometry.dispose();
            return;
          }
          built = buildHandConcept(handTreatment, asset);
          built.group.position.fromArray(config.objectPosition);
          scene.add(built.group);
          if (reducedMotion) renderFrame();
        })
        .catch(() => {
          if (!disposed) setFailed(true);
        });
    } else {
      built = concept === "a" ? buildConceptA() : buildConceptB();
      built.group.position.fromArray(config.objectPosition);
      scene.add(built.group);
      if (reducedMotion) renderFrame();
    }

    if (!reducedMotion) {
      const loop = () => {
        if (disposed) return;
        frame = window.requestAnimationFrame(loop);
        renderFrame();
      };
      loop();
    }

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      if (built) {
        scene.remove(built.group);
        disposeObject(built.group);
      }
      environmentTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [concept, shot]);

  if (failed) return <Fallback concept={concept} shot={shot} />;

  return (
    <div
      ref={hostRef}
      className={`v4-canvasHost ${view === "composition" ? "v4-canvasHostComposition" : "v4-canvasHostStudy"}`}
      data-v4-canvas
      data-concept={concept}
      data-shot={shot}
      data-view={view}
      data-ready={ready ? "true" : "false"}
      aria-hidden="true"
    />
  );
}
