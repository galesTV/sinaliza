"use client";

import { useEffect, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { HAND_ASSET_URL, loadSkinnedHandAsset } from "./handAsset";
import { FLEX_SEQUENCE, HAND_POSES, HandPosePlayer } from "./handPoses";
import { mountPracticeDiagnostics, type PracticeCommand } from "./practiceDiagnostics";
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
const ENTRY_VISIBILITY = 0.65;
const TILT_LIMIT = THREE.MathUtils.degToRad(5);
const TILT_DAMPING = 12;
const TILT_EPSILON = 0.0001;

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
  practiceCanvasId: string;
}

export function CinematicHero({
  backdrop,
  children,
  connection,
  practiceCanvasId,
}: CinematicHeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const actRef = useRef<HTMLElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const hudPanelRef = useRef<HTMLDetailsElement>(null);
  const hudRef = useRef<HTMLPreElement>(null);
  const entryPlayedRef = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    const sceneLayer = sceneRef.current;
    const stage = stageRef.current;
    const act = actRef.current;
    const host = hostRef.current;
    if (!root || !sceneLayer || !stage || !act || !host) return;
    const practiceHost = document.getElementById(practiceCanvasId);
    const actions = document.getElementById(`${practiceCanvasId}-actions`);
    const status = actions?.querySelector('[role="status"]');

    // The static layout is much shorter than the live one. Keep the reader
    // where they were: at the hero if it was pinned, else on the same text.
    const fail = () => {
      if (actions) actions.hidden = true;
      practiceHost?.removeAttribute("data-ready");
      const wasLive = root.dataset.mode === "live";
      const pinned = wasLive && stage.getBoundingClientRect().bottom > 0;
      const before = act.getBoundingClientRect().top;
      const practiceTop = practiceHost?.getBoundingClientRect().top;
      root.dataset.mode = "static";
      root.dataset.canvas = "failed";
      if (!wasLive) return;
      if (pinned) {
        window.scrollBy(0, stage.getBoundingClientRect().top);
      } else if (
        practiceHost &&
        practiceTop !== undefined &&
        practiceTop < window.innerHeight
      ) {
        const top = practiceHost.getBoundingClientRect().top;
        window.scrollTo({ top: window.scrollY + top - practiceTop, behavior: "instant" });
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

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const debug = new URLSearchParams(window.location.search).has("debug");
    const hudPanel = hudPanelRef.current;
    const hud = hudRef.current;
    if (hudPanel) hudPanel.hidden = !debug;

    const hashTarget = (() => {
      if (!window.location.hash) return null;
      try {
        return document.getElementById(
          decodeURIComponent(window.location.hash.slice(1)),
        );
      } catch {
        return null;
      }
    })();
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
    let dirty = true;
    let scenePaused = false;
    let canvasHost: HTMLElement = host;
    let playingPractice = false;
    const posePlayer = new HandPosePlayer();
    const tilt = new THREE.Vector2();
    const tiltTarget = new THREE.Vector2();
    let poseSource: "entry" | "control" | "debug" | null = null;
    let command: PracticeCommand = "relaxed";
    let diagnostics: ReturnType<typeof mountPracticeDiagnostics> | undefined;
    let practiceFrames = 0;
    let target = reducedMotion ? REDUCED_MOTION_PROGRESS : 0;
    let current = target;
    let lastTime = performance.now();
    let lastAnimatedFrame: number | null = null;
    let frameMs = 16.7;
    let workMs = 0;
    const frameTimes: number[] = [];
    let loadMs = 0;
    const loadStart = performance.now();

    const debugInfo = renderer.getContext().getExtension("WEBGL_debug_renderer_info");
    const gpu = debugInfo
      ? String(renderer.getContext().getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
      : "unknown";

    // Preserve the original 0–2 timeline for the hero and connection.
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

    // The base --v4c-p (0.5) is the static fallback's. Until the first
    // render writes the real progress, the choreography must read the
    // initial scroll position or the hero copy flashes while the hand
    // asset loads.
    root.style.setProperty("--v4c-p", String(Math.min(1, readTarget())));

    const resize = () => {
      const width = Math.max(1, canvasHost.clientWidth);
      const height = Math.max(1, canvasHost.clientHeight);
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

    // Pause the hero as Act 3 enters, even while Act 2's last pixels are visible.
    const pastScene = () =>
      root.getBoundingClientRect().bottom < sceneLayer.offsetHeight;

    const readPractice = () => {
      if (reducedMotion || !practiceHost || document.hidden) return null;
      const { top, bottom, height } = practiceHost.getBoundingClientRect();
      const viewport = sceneLayer.offsetHeight;
      if (top >= viewport || bottom <= 0) return null;
      return {
        progress: 2 + (viewport - top) / (viewport + height),
        visibility: (Math.min(bottom, viewport) - Math.max(top, 0)) / Math.min(height, viewport),
      };
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
      const sorted = [...frameTimes].sort((a, b) => a - b);
      const stats = {
        p: Number(current.toFixed(4)),
        target: Number(target.toFixed(4)),
        stage: stageAt(current),
        scenePaused,
        framePending: frame !== 0,
        practiceFrames,
        practicePose: posePlayer.pose,
        poseMoving: posePlayer.active,
        poseSource,
        entryPlayed: entryPlayedRef.current,
        practiceTilt: tilt.toArray(),
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
      diagnostics?.update(command, posePlayer.active, frame !== 0, practiceFrames);
    };

    const resetPractice = () => {
      posePlayer.reset();
      tilt.set(0, 0);
      tiltTarget.set(0, 0);
      poseSource = null;
      command = "relaxed";
      if (status) status.textContent = "";
    };

    const setScenePaused = (paused: boolean) => {
      if (scenePaused === paused) return;
      scenePaused = paused;
      host.style.visibility = paused ? "hidden" : "";
      renderer.domElement.style.visibility = paused ? "hidden" : "";
      if (paused) {
        if (!reducedMotion && !playingPractice) current = target = 2;
        writeHud();
      }
    };

    // Move the same canvas between the two disjoint viewports.
    const selectScene = (practiceTarget: number | null, initial = false) => {
      if (practiceHost && practiceTarget !== null) {
        if (!playingPractice || scenePaused) {
          current = initial ? practiceTarget : Math.round(practiceTarget);
        }
        playingPractice = true;
        if (canvasHost !== practiceHost) {
          canvasHost = practiceHost;
          canvasHost.appendChild(renderer.domElement);
          resize();
        }
        return practiceTarget;
      }
      if (playingPractice && !scenePaused) {
        resetPractice();
      }
      if (pastScene()) return null;
      if (playingPractice) {
        playingPractice = false;
        canvasHost = host;
        host.appendChild(renderer.domElement);
        current = 2;
        resize();
      }
      return readTarget();
    };

    const render = () => {
      if (!hand) return;
      if (scenePaused) return;
      const start = performance.now();
      hand.update(current, layout, camera, viewWidth, viewHeight, posePlayer.pose, tilt.x, tilt.y);
      renderer.render(scene, camera);
      if (debug && playingPractice) practiceFrames += 1;
      workMs += (performance.now() - start - workMs) * 0.2;
      root.style.setProperty("--v4c-p", Math.min(1, current).toFixed(4));
      root.dataset.stage = stageAt(current);
      writeHud();
    };

    // No animation loop between scenes.
    const schedule = () => {
      if (disposed || frame || !running) return;
      lastTime = performance.now();
      lastAnimatedFrame = null;
      frame = window.requestAnimationFrame(tick);
    };

    const tick = (now: number) => {
      frame = 0;
      if (disposed) return;
      const practice = readPractice();
      const nextTarget = selectScene(practice?.progress ?? null);
      if (nextTarget === null) {
        setScenePaused(true);
        return;
      }
      setScenePaused(false);
      target = nextTarget;
      const elapsed = Math.max(0, (now - lastTime) / 1000);
      const delta = Math.min(0.1, elapsed);
      lastTime = now;

      const gap = target - current;
      const scrolling = Math.abs(gap) > 0.00005;
      if (scrolling) {
        const limit = MAX_SPEED * delta;
        const step = gap * (1 - Math.exp(-delta * SMOOTHING));
        current += Math.min(limit, Math.max(-limit, step));
        if (Math.abs(target - current) < 0.0002) current = target;
        dirty = true;
      }
      // Wait for the scroll reveal to finish drawing the connections.
      if (
        practice && !entryPlayedRef.current && practice.visibility >= ENTRY_VISIBILITY &&
        current >= 2.45 && current <= 2.75
      ) {
        startPose("sequence", "entry", now);
      }
      const articulating = playingPractice && posePlayer.active;
      if (articulating) {
        posePlayer.sample(now);
        dirty = true;
        if (!posePlayer.active && poseSource === "control" && status) {
          status.textContent = "Mão na posição inicial.";
        }
      }
      const tilting = playingPractice && !tilt.equals(tiltTarget);
      if (tilting) {
        tilt.lerp(tiltTarget, 1 - Math.exp(-elapsed * TILT_DAMPING));
        if (tilt.distanceToSquared(tiltTarget) < TILT_EPSILON ** 2) tilt.copy(tiltTarget);
        dirty = true;
      }
      if (debug) {
        const animating = scrolling || articulating || tilting;
        if (animating && lastAnimatedFrame !== null) {
          const interval = now - lastAnimatedFrame;
          frameMs += (interval - frameMs) * 0.1;
          frameTimes.push(interval);
          if (frameTimes.length > FRAME_SAMPLES) frameTimes.shift();
        }
        lastAnimatedFrame = animating ? now : null;
      }
      if (posePlayer.active || !tilt.equals(tiltTarget) || Math.abs(target - current) > 0.00005) {
        frame = window.requestAnimationFrame(tick);
      }
      if (dirty) {
        dirty = false;
        render();
      }
    };

    const startPose = (next: PracticeCommand, source: typeof poseSource, now: number) => {
      entryPlayedRef.current = true;
      poseSource = source;
      command = next;
      posePlayer.play(
        next === "sequence" ? FLEX_SEQUENCE : [{ target: HAND_POSES[next], durationMs: 680 }],
        now,
      );
      if (source === "control" && status) {
        status.textContent = next === "sequence" ? "Demonstração em andamento."
          : posePlayer.active ? "Retornando à posição inicial." : "Mão na posição inicial.";
      }
      dirty = true;
    };

    const playPose = (next: PracticeCommand) => {
      if (!running || !readPractice()) return;
      startPose(next, "debug", performance.now());
      schedule();
    };

    const onAction = (event: MouseEvent) => {
      if (!running || !(event.target instanceof HTMLElement)) return;
      const next = event.target.closest("button")?.dataset.pose;
      if (next !== "sequence" && next !== "relaxed") return;
      const practice = readPractice();
      if (!practice || practice.visibility < ENTRY_VISIBILITY || practice.progress > 2.75) {
        practiceHost?.scrollIntoView({ block: "center", behavior: "instant" });
      }
      startPose(next, "control", performance.now());
      schedule();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!running || !playingPractice || scenePaused || !hover.matches ||
          event.pointerType !== "mouse" || !practiceHost) return;
      const { left, top, width, height } = practiceHost.getBoundingClientRect();
      tiltTarget.set(
        TILT_LIMIT * THREE.MathUtils.clamp(2 * (event.clientY - top) / height - 1, -1, 1),
        TILT_LIMIT * THREE.MathUtils.clamp(2 * (event.clientX - left) / width - 1, -1, 1),
      );
      if (!tilt.equals(tiltTarget)) schedule();
    };
    const releasePointer = () => {
      tiltTarget.set(0, 0);
      if (!tilt.equals(tiltTarget)) schedule();
    };
    actions?.addEventListener("click", onAction);
    practiceHost?.addEventListener("pointermove", onPointerMove, { passive: true });
    practiceHost?.addEventListener("pointerleave", releasePointer);
    hover.addEventListener("change", releasePointer);

    const resumeScene = () => {
      if (root.dataset.canvas === "failed") return;
      if (pastScene() && !readPractice()) return;
      dirty = true;
      if (reducedMotion) {
        if (scenePaused) {
          setScenePaused(false);
          render();
        }
      } else {
        schedule();
      }
    };
    const onScroll = () => {
      if (reducedMotion && !scenePaused && pastScene()) setScenePaused(true);
      else if (scenePaused) resumeScene();
      else if (!reducedMotion) schedule();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const onWindowResize = () => {
      if (scenePaused) resumeScene();
      else if (playingPractice) schedule();
    };
    window.addEventListener("resize", onWindowResize, { passive: true });

    const onVisibilityChange = () => {
      if (!document.hidden) {
        resumeScene();
      } else if (playingPractice) {
        window.cancelAnimationFrame(frame);
        frame = 0;
        resetPractice();
        setScenePaused(true);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries.some(({ target }) => target === canvasHost)) return;
      resize();
      if (reducedMotion || scenePaused) resumeScene();
      else schedule();
    });
    resizeObserver.observe(host);
    if (practiceHost && !reducedMotion) resizeObserver.observe(practiceHost);
    resize();

    const onContextLost = (event: Event) => {
      event.preventDefault();
      running = false;
      window.cancelAnimationFrame(frame);
      frame = 0;
      resetPractice();
      diagnostics?.remove();
      diagnostics = undefined;
      setScenePaused(true);
      practiceHost?.removeAttribute("data-ready");
      fail();
    };
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);

    loadSkinnedHandAsset()
      .then((asset) => {
        if (disposed || root.dataset.canvas === "failed") {
          asset.geometry.dispose();
          return;
        }
        loadMs = performance.now() - loadStart;
        hand = createCinematicHand(asset, scene);
        if (debug && !reducedMotion && practiceHost) {
          diagnostics = mountPracticeDiagnostics(practiceHost, playPose);
        }
        // Start on the real scroll position so a reload mid-page does not replay.
        const initial = selectScene(readPractice()?.progress ?? null, true);
        current = target = initial ?? 2;
        setScenePaused(initial === null);
        render();
        root.dataset.canvas = "ready";
        if (!reducedMotion) practiceHost?.setAttribute("data-ready", "");
        if (reducedMotion) {
          dirty = false;
        } else {
          running = true;
          if (actions) actions.hidden = false;
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
      window.removeEventListener("resize", onWindowResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      actions?.removeEventListener("click", onAction);
      if (actions) actions.hidden = true;
      if (hudPanel) hudPanel.hidden = true;
      practiceHost?.removeEventListener("pointermove", onPointerMove);
      practiceHost?.removeEventListener("pointerleave", releasePointer);
      hover.removeEventListener("change", releasePointer);
      resizeObserver.disconnect();
      reducedObserver.disconnect();
      diagnostics?.remove();
      practiceHost?.removeAttribute("data-ready");
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
  }, [practiceCanvasId]);

  return (
    <>
      <details ref={hudPanelRef} className="v4c-hud" hidden>
        <summary>Métricas da cena 3D</summary>
        <pre ref={hudRef} translate="no" />
      </details>
      <div ref={rootRef} className="v4c">
        <div ref={sceneRef} className="v4c-scene" aria-hidden="true">
          {backdrop}
          <div className="v4c-poster" />
          <div ref={hostRef} className="v4c-canvasHost" />
        </div>

        <section className="v4c-stage" ref={stageRef} aria-labelledby="v4c-title">
          <div className="v4c-viewport">{children}</div>
        </section>

        <section className="v4c-act" ref={actRef} aria-labelledby="v4c-act2-title">
          {connection}
        </section>
      </div>
    </>
  );
}
