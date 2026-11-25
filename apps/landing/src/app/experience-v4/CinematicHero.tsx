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
// Timeline units per second: a fling still plays every intermediate state.
const MAX_SPEED = 1.8;
const FRAME_SAMPLES = 120;

function percentile(sorted: number[], fraction: number) {
  if (sorted.length === 0) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];
}

function layoutFor(width: number): CinematicLayout {
  if (width < 600) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

interface CinematicHeroProps {
  // Decorative layer drawn behind the canvas.
  backdrop?: ReactNode;
  // Act 1 overlay, pinned while the hero plays.
  children: ReactNode;
  // Act 2, in normal document flow over the same canvas.
  connection: ReactNode;
}

export function CinematicHero({
  backdrop,
  children,
  connection,
}: CinematicHeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const actRef = useRef<HTMLElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const sceneLayer = sceneRef.current;
    const stage = stageRef.current;
    const act = actRef.current;
    const host = hostRef.current;
    if (!root || !sceneLayer || !stage || !act || !host) return;

    // The static layout is much shorter than the live one. Keep the reader
    // where they were: at the hero if it was pinned, else on the same text.
    const fail = () => {
      const wasLive = root.dataset.mode === "live";
      const pinned = wasLive && stage.getBoundingClientRect().bottom > 0;
      const before = act.getBoundingClientRect().top;
      root.dataset.mode = "static";
      root.dataset.canvas = "failed";
      if (!wasLive) return;
      if (pinned) {
        window.scrollBy(0, stage.getBoundingClientRect().top);
      } else {
        window.scrollBy(0, act.getBoundingClientRect().top - before);
      }
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

    const hashTarget = window.location.hash
      ? document.getElementById(decodeURIComponent(window.location.hash.slice(1)))
      : null;
    const anchor = hashTarget && !stage.contains(hashTarget) ? hashTarget : null;
    root.dataset.mode = reducedMotion ? "reduced" : "live";
    // Fragment navigation may still be heading for the static layout's
    // offset, so land on the target once the pinned layout applies.
    if (!reducedMotion && anchor) {
      const land = () =>
        anchor.scrollIntoView({ block: "start", behavior: "instant" });
      land();
      window.requestAnimationFrame(land);
    }

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
    let scenePaused = false;
    let target = reducedMotion ? REDUCED_MOTION_PROGRESS : 0;
    let current = target;
    let lastTime = performance.now();
    let lastFrame = lastTime;
    let frameMs = 16.7;
    let workMs = 0;
    const frameTimes: number[] = [];
    let loadMs = 0;
    const loadStart = performance.now();

    const debugInfo = renderer.getContext().getExtension("WEBGL_debug_renderer_info");
    const gpu = debugInfo
      ? String(renderer.getContext().getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
      : "unknown";

    // One timeline for both acts, derived only from the scroll position:
    // [0, 1] plays Act 1 while its stage is pinned, [1, 2] follows Act 2
    // scrolling through the window.
    const readTarget = () => {
      if (reducedMotion) return REDUCED_MOTION_PROGRESS;
      const windowHeight = sceneLayer.offsetHeight;
      const travel = stage.offsetHeight - windowHeight;
      if (travel <= 0) return 0;
      const hero = -stage.getBoundingClientRect().top / travel;
      const next =
        (windowHeight - act.getBoundingClientRect().top) /
        Math.max(1, act.offsetHeight);
      return (
        Math.min(1, Math.max(0, hero)) + Math.min(1, Math.max(0, next))
      );
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

    // The scene belongs to Acts 1–2 only, even while their last pixels are
    // still visible above Act 3. Hide the last frame after a fast scroll.
    const pastScene = () =>
      root.getBoundingClientRect().bottom < sceneLayer.offsetHeight;

    const writeHud = () => {
      if (!debug || !hud) return;
      const info = renderer.info;
      const size = renderer.getDrawingBufferSize(new THREE.Vector2());
      const entry = performance
        .getEntriesByType("resource")
        .find((item) => item.name.endsWith(HAND_ASSET_URL)) as
        | PerformanceResourceTiming
        | undefined;
      const sorted = [...frameTimes].sort((a, b) => a - b);
      const stats = {
        p: Number(current.toFixed(4)),
        target: Number(target.toFixed(4)),
        stage: stageAt(current),
        scenePaused,
        layout,
        frameMs: Number(frameMs.toFixed(2)),
        frameMedianMs: Number(percentile(sorted, 0.5).toFixed(2)),
        frameP95Ms: Number(percentile(sorted, 0.95).toFixed(2)),
        frameSamples: sorted.length,
        workMs: Number(workMs.toFixed(2)),
        drawCalls: scenePaused ? 0 : info.render.calls,
        triangles: scenePaused ? 0 : info.render.triangles,
        lines: scenePaused ? 0 : info.render.lines,
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

    const setScenePaused = (paused: boolean) => {
      if (scenePaused === paused) return;
      scenePaused = paused;
      host.style.visibility = paused ? "hidden" : "";
      if (paused) {
        if (!reducedMotion) current = target = 2;
        writeHud();
      }
    };

    const render = () => {
      if (!hand) return;
      if (scenePaused) return;
      const start = performance.now();
      hand.update(current, layout, camera, viewWidth, viewHeight);
      renderer.render(scene, camera);
      workMs += (performance.now() - start - workMs) * 0.2;
      root.style.setProperty("--v4c-p", Math.min(1, current).toFixed(4));
      root.dataset.stage = stageAt(current);
      writeHud();
    };

    // The loop only runs while the stage is on screen.
    const schedule = () => {
      if (disposed || frame || !running || !visible) return;
      lastTime = performance.now();
      lastFrame = lastTime;
      frame = window.requestAnimationFrame(tick);
    };

    const tick = (now: number) => {
      frame = 0;
      if (disposed || !visible) return;
      if (pastScene()) {
        setScenePaused(true);
        return;
      }
      setScenePaused(false);
      frame = window.requestAnimationFrame(tick);
      const delta = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      frameMs += (delta * 1000 - frameMs) * 0.1;
      if (debug) {
        frameTimes.push(now - lastFrame);
        if (frameTimes.length > FRAME_SAMPLES) frameTimes.shift();
      }
      lastFrame = now;

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

    const resumeScene = () => {
      if (!scenePaused || !visible || pastScene()) return;
      dirty = true;
      if (reducedMotion) {
        setScenePaused(false);
        render();
      } else {
        schedule();
      }
    };
    const onScroll = () => {
      if (reducedMotion && !scenePaused && pastScene()) setScenePaused(true);
      else resumeScene();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      resize();
      resumeScene();
    });
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
    visibilityObserver.observe(root);

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
        setScenePaused(pastScene());
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
        setScenePaused(pastScene());
        render();
      }
    };
    const reducedObserver = new ResizeObserver(reducedResize);
    if (reducedMotion) reducedObserver.observe(host);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
      reducedObserver.disconnect();
      visibilityObserver.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      hand?.dispose();
      environmentTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      setScenePaused(false);
      delete root.dataset.mode;
      delete root.dataset.canvas;
      delete root.dataset.stage;
      root.style.removeProperty("--v4c-p");
    };
  }, []);

  return (
    <div ref={rootRef} className="v4c">
      <div ref={sceneRef} className="v4c-scene" aria-hidden="true">
        {backdrop}
        <div className="v4c-poster" />
        <div ref={hostRef} className="v4c-canvasHost" />
        <pre ref={hudRef} className="v4c-hud" hidden />
      </div>

      <section className="v4c-stage" ref={stageRef} aria-labelledby="v4c-title">
        <div className="v4c-viewport">{children}</div>
      </section>

      <section className="v4c-act" ref={actRef} aria-labelledby="v4c-act2-title">
        {connection}
      </section>
    </div>
  );
}
