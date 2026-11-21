"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { disposeObject } from "./scenes";
import { buildHandConcept, type HandConcept } from "./handScene";
import { loadSkinnedHandAsset } from "./handAsset";
import { setupHandLights } from "./handStage";

const SHOT = {
  objectPosition: [0, 0, 0] as [number, number, number],
  cameraPosition: [3.35, 0.72, 7.35] as [number, number, number],
  target: [0, 0.12, 0] as [number, number, number],
  fov: 33,
};

function poseLabel(phase: number) {
  if (phase < 0.12 || phase > 0.94) return "Neutro";
  if (phase < 0.42) return "Flexão parcial";
  if (phase < 0.78) return "Polegar em oposição";
  return "Retorno";
}

export function ArticulationLab({
  initialPhase = 0,
  autoplay = true,
}: {
  initialPhase?: number;
  autoplay?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const phaseLabelRef = useRef<HTMLSpanElement>(null);
  const renderFrameRef = useRef<(() => void) | null>(null);
  const conceptRef = useRef<HandConcept | null>(null);
  const playingRef = useRef(false);

  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [motionReduced, setMotionReduced] = useState(false);

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

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const motionTimeout = window.setTimeout(() => {
      setMotionReduced(reducedMotion);
    }, 0);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0b1020");

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);
    camera.position.fromArray(SHOT.cameraPosition);
    camera.fov = SHOT.fov;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.25 : 1.5),
    );
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = "v4-canvas";
    host.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = new RoomEnvironment();
    const environmentTexture = pmrem.fromScene(environment, 0.04).texture;
    scene.environment = environmentTexture;
    setupHandLights(scene);

    let built: HandConcept | null = null;
    const start = performance.now();
    let frame = 0;
    let disposed = false;
    let didSetReady = false;

    const renderFrame = () => {
      if (!built) return;
      const time = (performance.now() - start) / 1000;
      built.update(time, reducedMotion);
      camera.lookAt(new THREE.Vector3(...SHOT.target));
      renderer.render(scene, camera);

      const rig = built.rig;
      const phase = rig?.phase ?? initialPhase;
      if (
        rig &&
        sliderRef.current &&
        document.activeElement !== sliderRef.current
      ) {
        sliderRef.current.value = String(Math.round(rig.phase * 1000));
      }
      if (phaseLabelRef.current) {
        phaseLabelRef.current.textContent = poseLabel(phase);
      }

      if (!didSetReady) {
        didSetReady = true;
        setReady(true);
      }
    };
    renderFrameRef.current = renderFrame;

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

    loadSkinnedHandAsset()
      .then((asset) => {
        if (disposed) {
          disposeObject(asset.root);
          return;
        }
        built = buildHandConcept("hand-anatomy", asset, {
          articulated: true,
          initialPhase,
        });
        built.group.position.fromArray(SHOT.objectPosition);
        scene.add(built.group);
        conceptRef.current = built;

        const shouldPlay = playingRef.current || (autoplay && !reducedMotion);
        built.rig?.setPlaying(shouldPlay && !reducedMotion);
        playingRef.current = shouldPlay && !reducedMotion;
        setPlaying(playingRef.current);

        if (reducedMotion) renderFrame();
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });

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
      window.clearTimeout(motionTimeout);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      renderFrameRef.current = null;
      conceptRef.current = null;
      if (built) {
        scene.remove(built.group);
        disposeObject(built.group);
      }
      environmentTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [autoplay, initialPhase]);

  const togglePlay = () => {
    if (motionReduced) return;
    const next = !playingRef.current;
    playingRef.current = next;
    setPlaying(next);
    conceptRef.current?.rig?.setPlaying(next);
  };

  const scrub = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value) / 1000;
    const rig = conceptRef.current?.rig;
    if (!rig) return;
    rig.setPhase(value);
    if (phaseLabelRef.current) {
      phaseLabelRef.current.textContent = poseLabel(value);
    }
    renderFrameRef.current?.();
  };

  if (failed) {
    return (
      <main className="v4-shot">
        <div
          className="v4-fallback"
          role="img"
          aria-label="Prova de articulação sem WebGL"
        >
          <span>WebGL indisponível</span>
          <strong>Articulação da mão</strong>
          <small>fallback estático</small>
        </div>
      </main>
    );
  }

  return (
    <main className="v4-shot v4-articulation" data-ready={ready}>
      <div
        ref={hostRef}
        className="v4-canvasHost v4-canvasHostStudy v4-articulationCanvas"
        data-v4-canvas
        data-ready={ready ? "true" : "false"}
        aria-hidden="true"
      />

      <div className="v4-articulationPanel">
        <header className="v4-articulationHeader">
          <p className="v4-eyebrow">
            Sinaliza · V4 · Phase B.1 · prova de articulação
          </p>
          <h1>Flexão e polegar</h1>
          <p className="v4-lede">
            Malha skinned real: 26 ossos OpenXR e 21 landmarks MediaPipe
            acompanhando a deformação. Referência de visão computacional, não
            Libras.
          </p>
        </header>

        <div className="v4-articulationControls">
          <button
            type="button"
            className="v4-articulationButton"
            onClick={togglePlay}
            disabled={motionReduced}
          >
            {playing ? "Pausar" : "Reproduzir"}
          </button>
          <input
            ref={sliderRef}
            className="v4-articulationSlider"
            type="range"
            min="0"
            max="1000"
            defaultValue={String(Math.round(initialPhase * 1000))}
            onChange={scrub}
            aria-label="Fase da articulação"
          />
          <span ref={phaseLabelRef} className="v4-articulationPhase">
            {poseLabel(initialPhase)}
          </span>
        </div>

        <div className="v4-articulationMeta">
          <span>loop de 7s</span>
          <span>neutro → curl → polegar → retorno</span>
          <span>mão CC0 · Godot XR Tools</span>
          <Link href="/experience-v4">voltar ao índice</Link>
        </div>
      </div>
    </main>
  );
}
