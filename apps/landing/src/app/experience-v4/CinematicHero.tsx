"use client";

import { useEffect, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { HAND_ASSET_URL, loadSkinnedHandAsset } from "./handAsset";
import {
  createCinematicHand,
  stageAt,
  type CinematicHand,
  type CinematicLayout,
} from "./cinematicScene";

const REDUCED_MOTION_PROGRESS = 0.5;
const SMOOTHING = 9;
// Progress per second: a fling still plays every intermediate state.
const MAX_SPEED = 1.8;

function layoutFor(width: number): CinematicLayout {
  if (width < 600) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function CinematicHero({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const viewport = viewportRef.current;
    const host = hostRef.current;
    if (!root || !stage || !viewport || !host) return;

    const fail = () => {
      root.dataset.mode = "static";
      root.dataset.canvas = "failed";
    };

    // Probe first: constructing WebGLRenderer without WebGL logs an error.
    const probe = document.createElement("canvas");
    if (!probe.getContext("webgl2")) {
      fail();
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      fail();
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const debug = new URLSearchParams(window.location.search).has("debug");
    const hud = hudRef.current;
    if (hud) hud.hidden = !debug;

    root.dataset.mode = reducedMotion ? "reduced" : "live";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 60);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = "v4c-canvas";
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = new RoomEnvironment();
    const environmentTexture = pmrem.fromScene(environment, 0.04).texture;
    scene.environment = environmentTexture;

    let hand: CinematicHand | null = null;
    let layout: CinematicLayout = layoutFor(window.innerWidth);
    let pixelRatio = 1;
    let viewWidth = 1;
    let viewHeight = 1;
    let disposed = false;
    let frame = 0;
    let running = false;
    let visible = true;
    let dirty = true;
    let target = reducedMotion ? REDUCED_MOTION_PROGRESS : 0;
    let current = target;
    let lastTime = performance.now();
    let frameMs = 16.7;
    let workMs = 0;
    let loadMs = 0;
    const loadStart = performance.now();

    const debugInfo = renderer.getContext().getExtension("WEBGL_debug_renderer_info");
    const gpu = debugInfo
      ? String(renderer.getContext().getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
      : "unknown";

    const readTarget = () => {
      if (reducedMotion) return REDUCED_MOTION_PROGRESS;
      const travel = stage.offsetHeight - viewport.offsetHeight;
      if (travel <= 0) return 0;
      const offset = -stage.getBoundingClientRect().top;
      return Math.min(1, Math.max(0, offset / travel));
    };

    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      viewWidth = width;
      viewHeight = height;
      layout = layoutFor(width);
      root.dataset.layout = layout;
      pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        layout === "mobile" ? 1.5 : layout === "tablet" ? 1.5 : 1.75,
      );
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      dirty = true;
    };

    const writeHud = () => {
      if (!debug || !hud) return;
      const info = renderer.info;
      const size = renderer.getDrawingBufferSize(new THREE.Vector2());
      const entry = performance
        .getEntriesByType("resource")
        .find((item) => item.name.endsWith(HAND_ASSET_URL)) as
        | PerformanceResourceTiming
        | undefined;
      const stats = {
        p: Number(current.toFixed(4)),
        target: Number(target.toFixed(4)),
        stage: stageAt(current),
        layout,
        frameMs: Number(frameMs.toFixed(2)),
        workMs: Number(workMs.toFixed(2)),
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
        lines: info.render.lines,
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        dpr: pixelRatio,
        deviceDpr: window.devicePixelRatio,
        buffer: `${size.x}x${size.y}`,
        assetLoadMs: Math.round(loadMs),
        assetBytes: entry?.encodedBodySize ?? 0,
        gpu,
      };
      (window as unknown as { __v4c?: typeof stats }).__v4c = stats;
      hud.textContent = Object.entries(stats)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");
    };

    const render = () => {
      if (!hand) return;
      const start = performance.now();
      hand.update(current, layout, camera, viewWidth, viewHeight);
      renderer.render(scene, camera);
      workMs += (performance.now() - start - workMs) * 0.2;
      stage.style.setProperty("--v4c-p", current.toFixed(4));
      root.dataset.stage = stageAt(current);
      writeHud();
    };

    // The loop only runs while the stage is on screen.
    const schedule = () => {
      if (disposed || frame || !running || !visible) return;
      lastTime = performance.now();
      frame = window.requestAnimationFrame(tick);
    };

    const tick = (now: number) => {
      frame = 0;
      if (disposed || !visible) return;
      frame = window.requestAnimationFrame(tick);
      const delta = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      frameMs += (delta * 1000 - frameMs) * 0.1;

      target = readTarget();
      const gap = target - current;
      if (Math.abs(gap) > 0.00005) {
        const limit = MAX_SPEED * delta;
        const step = gap * (1 - Math.exp(-delta * SMOOTHING));
        current += Math.min(limit, Math.max(-limit, step));
        if (Math.abs(target - current) < 0.0002) current = target;
        dirty = true;
      }
      if (dirty || debug) {
        dirty = false;
        render();
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        current = readTarget();
        dirty = true;
        schedule();
      }
    });
    visibilityObserver.observe(stage);

    const onContextLost = (event: Event) => {
      event.preventDefault();
      fail();
    };
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);

    loadSkinnedHandAsset()
      .then((asset) => {
        if (disposed) {
          asset.geometry.dispose();
          return;
        }
        loadMs = performance.now() - loadStart;
        hand = createCinematicHand(asset, scene);
        // Start on the real scroll position so a reload mid-page does not replay.
        target = readTarget();
        current = target;
        render();
        root.dataset.canvas = "ready";
        if (reducedMotion) {
          dirty = false;
        } else {
          running = true;
          schedule();
        }
      })
      .catch(() => {
        if (!disposed) fail();
      });

    const reducedResize = () => {
      if (reducedMotion && dirty) {
        dirty = false;
        render();
      }
    };
    const reducedObserver = new ResizeObserver(reducedResize);
    if (reducedMotion) reducedObserver.observe(host);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      reducedObserver.disconnect();
      visibilityObserver.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      hand?.dispose();
      environmentTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      delete root.dataset.mode;
      delete root.dataset.canvas;
    };
  }, []);

  return (
    <div ref={rootRef} className="v4c">
      <section
        ref={stageRef}
        className="v4c-stage"
        aria-labelledby="v4c-title"
      >
        <div ref={viewportRef} className="v4c-viewport">
          <div className="v4c-poster" aria-hidden="true" />
          <div ref={hostRef} className="v4c-canvasHost" />
          {children}
          <pre ref={hudRef} className="v4c-hud" hidden aria-hidden="true" />
        </div>
      </section>
    </div>
  );
}
