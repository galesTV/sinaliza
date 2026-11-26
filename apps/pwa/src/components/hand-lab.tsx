"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  HAND_CONNECTIONS,
  HAND_LANDMARKER_MODEL_URL,
  IDLE_SNAPSHOT,
  TASKS_VISION_WASM_URL,
  createHandTracker,
  type HandLandmarkerLike,
  type HandLandmarkerResultLike,
  type HandTracker,
} from "@/lib/hand-tracking";
import {
  GUIDANCE_IDLE_SNAPSHOT,
  GUIDANCE_TARGET_ZONE,
  createHandGuidance,
  type GuidanceStatus,
  type HandGuidance,
} from "@/lib/hand-guidance";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    /**
     * Dev/test-only hook (never present in production builds): when set, the
     * lab swaps the real MediaPipe landmarker for this deterministic source,
     * letting Playwright drive the guided flow with synthetic landmarks.
     */
    __sinalizaHandLabSim?: () => HandLandmarkerResultLike | null;
  }
}

const STATUS_LABEL: Record<string, string> = {
  idle: "Câmera desligada",
  requesting: "Solicitando acesso…",
  active: "Câmera ativa",
  denied: "Permissão negada",
  unavailable: "Câmera indisponível",
  error: "Erro",
};

// Decorative state dot — the text label always carries the status; the node
// is additive (MASTER.md §8: never status through color alone).
const STATUS_DOT: Record<string, string> = {
  idle: "bg-muted",
  requesting: "bg-accent",
  active: "bg-success",
  denied: "bg-destructive",
  unavailable: "bg-destructive",
  error: "bg-destructive",
};

// Learner-facing copy keyed by the guidance state machine — the module
// stays copy-free so it can be tested without UI strings.
const GUIDANCE_LABEL: Record<GuidanceStatus, string> = {
  idle: "Mostre uma mão dentro da área",
  searching: "Procurando uma mão...",
  centering: "Mão detectada — centralize-a na área",
  holding: "Mantenha a mão parada por 2 segundos",
  lost: "Perdemos a detecção — tente posicionar novamente",
  completed: "Posicionamento estável confirmado!",
  timedOut: "Não foi possível confirmar a estabilidade — tente novamente",
};

function drawLandmarks(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  result: HandLandmarkerResultLike | null,
) {
  const context = canvas.getContext("2d");
  if (!context) return;

  // Always clear first: a null result or a detached stream must leave no
  // residual skeleton on screen.
  context.clearRect(0, 0, canvas.width, canvas.height);

  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!result || width === 0 || height === 0) return;

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
  }

  result.landmarks.forEach((landmarks, index) => {
    const category = result.handedness[index]?.[0]?.categoryName;
    const lineColor =
      category === "Left" ? "rgba(53, 201, 232, 0.85)" : "rgba(199, 192, 255, 0.85)";
    const pointColor =
      category === "Left" ? "#35c9e8" : "#c7c0ff";

    context.strokeStyle = lineColor;
    context.lineWidth = Math.max(2, width / 240);
    context.beginPath();
    for (const [from, to] of HAND_CONNECTIONS) {
      const a = landmarks[from];
      const b = landmarks[to];
      context.moveTo(a.x * width, a.y * height);
      context.lineTo(b.x * width, b.y * height);
    }
    context.stroke();

    context.fillStyle = pointColor;
    const radius = Math.max(2.5, width / 160);
    for (const point of landmarks) {
      context.beginPath();
      context.arc(point.x * width, point.y * height, radius, 0, Math.PI * 2);
      context.fill();
    }
  });
}

function createLandmarkerForPage(): Promise<HandLandmarkerLike> {
  if (
    process.env.NODE_ENV === "development" &&
    typeof window !== "undefined" &&
    window.__sinalizaHandLabSim
  ) {
    const sim = window.__sinalizaHandLabSim;
    return Promise.resolve({
      detectForVideo: () => sim() ?? { landmarks: [], handedness: [] },
      close() {},
    });
  }
  return createHandLandmarker();
}

/**
 * Positions the target-zone overlay exactly over the zone's area in video
 * coordinates. The <video>/<canvas> pair uses `object-contain` and a mirrored
 * -scale-x-100 transform, so the zone rect must be computed from the video's
 * real rendered rect (letterboxing + mirroring), not the container's.
 */
function updateZoneOverlay(
  video: HTMLVideoElement | null,
  zone: HTMLElement | null,
) {
  if (!video || !zone) return;
  const containerWidth = video.clientWidth;
  const containerHeight = video.clientHeight;
  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;
  if (!containerWidth || !containerHeight || !videoWidth || !videoHeight) {
    zone.style.display = "none";
    return;
  }
  const scale = Math.min(
    containerWidth / videoWidth,
    containerHeight / videoHeight,
  );
  const displayWidth = videoWidth * scale;
  const displayHeight = videoHeight * scale;
  const offsetX = (containerWidth - displayWidth) / 2;
  const offsetY = (containerHeight - displayHeight) / 2;
  // The video is horizontally mirrored: normalized x maps to (1 - x) on
  // screen, so the zone's left edge comes from its xMax boundary.
  zone.style.display = "";
  zone.style.left = `${offsetX + (1 - GUIDANCE_TARGET_ZONE.xMax) * displayWidth}px`;
  zone.style.top = `${offsetY + GUIDANCE_TARGET_ZONE.yMin * displayHeight}px`;
  zone.style.width = `${(GUIDANCE_TARGET_ZONE.xMax - GUIDANCE_TARGET_ZONE.xMin) * displayWidth}px`;
  zone.style.height = `${(GUIDANCE_TARGET_ZONE.yMax - GUIDANCE_TARGET_ZONE.yMin) * displayHeight}px`;
}

async function createHandLandmarker() {
  const vision = await import("@mediapipe/tasks-vision");
  const fileset = await vision.FilesetResolver.forVisionTasks(
    TASKS_VISION_WASM_URL,
  );
  return vision.HandLandmarker.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath: HAND_LANDMARKER_MODEL_URL,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 2,
  });
}

export function HandLab() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const trackerRef = useRef<HandTracker | null>(null);
  const guidanceRef = useRef<HandGuidance | null>(null);
  const [snapshot, setSnapshot] = useState(IDLE_SNAPSHOT);
  const [guidance, setGuidance] = useState(GUIDANCE_IDLE_SNAPSHOT);

  useEffect(() => {
    document.documentElement.dataset.sinalizaHandLabHydrated = "true";
    return () => {
      delete document.documentElement.dataset.sinalizaHandLabHydrated;
    };
  }, []);

  // Only called from event handlers and effects — never during render.
  function ensureTracker() {
    let tracker = trackerRef.current;
    if (!tracker) {
      tracker = createHandTracker({
        getUserMedia: (constraints) =>
          navigator.mediaDevices.getUserMedia(constraints),
        createLandmarker: createLandmarkerForPage,
        getVideo: () => videoRef.current,
        onChange: setSnapshot,
        onResult: (result) => {
          guidanceRef.current?.observe(result);
          const canvas = canvasRef.current;
          const video = videoRef.current;
          if (canvas && video) drawLandmarks(canvas, video, result);
        },
      });
      trackerRef.current = tracker;
    }
    return tracker;
  }

  // Hydration-safe: getServerSnapshot keeps SSR and first client render
  // identical; the real value is read after hydration settles.
  const secureContext = useSyncExternalStore(
    () => () => {},
    () => window.isSecureContext,
    () => true,
  );

  // Keep the zone overlay glued to the video's rendered rect: layout
  // resizes (ResizeObserver) and stream resolution changes
  // (loadedmetadata → videoWidth/videoHeight).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const update = () => updateZoneOverlay(video, zoneRef.current);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(video);
    video.addEventListener("loadedmetadata", update);
    video.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      video.removeEventListener("loadedmetadata", update);
      video.removeEventListener("resize", update);
    };
  }, []);

  // The guided attempt follows the camera lifecycle: it only runs while the
  // camera is active, and stopping the camera cancels it (and its timer).
  useEffect(() => {
    let guidanceInstance = guidanceRef.current;
    if (!guidanceInstance) {
      guidanceInstance = createHandGuidance({ onChange: setGuidance });
      guidanceRef.current = guidanceInstance;
    }
    if (snapshot.cameraStatus === "active") {
      guidanceInstance.start();
    } else {
      guidanceInstance.stop();
    }
  }, [snapshot.cameraStatus]);

  useEffect(() => {
    return () => {
      // Dispose at cleanup time — the tracker may only exist by then —
      // and null the ref so a preserved (remounted) component can rebuild
      // a fresh tracker instead of reusing a disposed one.
      trackerRef.current?.dispose();
      trackerRef.current = null;
      guidanceRef.current?.dispose();
      guidanceRef.current = null;
    };
  }, []);

  const cameraOn = snapshot.cameraStatus === "active";
  const busy = snapshot.cameraStatus === "requesting";

  return (
    <div className="flex flex-col gap-8">
      <section
        aria-labelledby="lab-camera-title"
        className="flex flex-col gap-5 rounded-3xl border border-border bg-surface-elevated p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)] sm:p-8"
      >
        <div className="flex flex-col gap-1.5">
          <h2
            id="lab-camera-title"
            className="font-display text-xl font-semibold tracking-tight text-foreground"
          >
            Prévia da câmera
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            O vídeo é processado apenas no seu navegador. Nenhum frame é
            armazenado ou enviado.
          </p>
        </div>

        {!secureContext && (
          <p
            role="alert"
            className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-foreground"
          >
            Este experimento exige um contexto seguro. Abra a página em{" "}
            <code className="font-mono">localhost</code> ou HTTPS.
          </p>
        )}

        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black/40">
          <video
            ref={videoRef}
            playsInline
            muted
            aria-label="Prévia ao vivo da câmera"
            className="absolute inset-0 h-full w-full -scale-x-100 object-contain"
          />
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="absolute inset-0 h-full w-full -scale-x-100 object-contain"
          />
          <div
            ref={zoneRef}
            data-testid="guidance-zone"
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute rounded-xl border-2 border-dashed border-accent/80",
              !cameraOn && "hidden",
            )}
          >
            <span className="absolute -top-5 left-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">
              Área de posicionamento
            </span>
          </div>
          {!cameraOn && (
            <div className="absolute inset-0 grid place-items-center">
              <p className="max-w-xs px-6 text-center text-sm leading-relaxed text-muted">
                {busy
                  ? "Aguardando permissão do navegador…"
                  : "A câmera está desligada. Ative-a para ver os 21 pontos de referência da mão."}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => ensureTracker().start()}
            disabled={busy || cameraOn || !secureContext}
            className="btn-primary"
          >
            Ativar câmera
          </button>
          <button
            type="button"
            onClick={() => ensureTracker().stop()}
            disabled={!cameraOn && !busy}
            className="btn-secondary"
          >
            Parar câmera
          </button>
        </div>

        {snapshot.error && (
          <p
            role="alert"
            className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm leading-relaxed text-foreground"
          >
            {snapshot.error}
          </p>
        )}
      </section>

      <section
        aria-labelledby="lab-guidance-title"
        className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6 sm:p-8"
      >
        <div className="flex flex-col gap-1.5">
          <h2
            id="lab-guidance-title"
            className="font-display text-xl font-semibold tracking-tight text-foreground"
          >
            Prática guiada
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            Posicione uma mão dentro da área marcada no vídeo e mantenha-a
            parada por dois segundos.
          </p>
        </div>

        <p
          role="status"
          aria-live="polite"
          className="text-base font-semibold text-foreground"
        >
          {GUIDANCE_LABEL[guidance.status]}
        </p>

        {guidance.status === "holding" && (
          <div className="flex items-center gap-3">
            <div
              role="progressbar"
              aria-valuenow={Math.round(guidance.progress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progresso da estabilidade"
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-elevated"
            >
              <div
                className="h-full w-full origin-left rounded-full bg-success transition-transform duration-200 motion-reduce:transition-none"
                style={{ transform: `scaleX(${guidance.progress})` }}
              />
            </div>
            <span className="text-xs font-medium tabular-nums text-muted">
              {Math.round(guidance.progress * 100)}%
            </span>
          </div>
        )}

        {guidance.status === "timedOut" && (
          <p className="text-sm leading-relaxed text-muted">
            {guidance.handSeen
              ? "A mão foi detectada, mas não ficou parada por tempo suficiente. Centralize-a na área marcada e tente de novo."
              : "Nenhuma mão foi detectada dentro da área. Aproxime a mão da câmera e melhore a iluminação antes de tentar de novo."}
          </p>
        )}

        {guidance.status === "completed" && (
          <p className="rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm leading-relaxed text-foreground">
            Esta experiência detecta pontos de referência da mão. Ela não
            reconhece nem avalia sinais de Libras.
          </p>
        )}

        {guidance.status !== "idle" && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => guidanceRef.current?.reset()}
              className="btn-secondary"
            >
              Tentar novamente
            </button>
          </div>
        )}
      </section>

      <section
        aria-labelledby="lab-status-title"
        className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6 sm:p-8"
      >
        <h2
          id="lab-status-title"
          className="font-display text-xl font-semibold tracking-tight text-foreground"
        >
          Status
        </h2>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Câmera",
              value: STATUS_LABEL[snapshot.cameraStatus],
              live: true,
              dot: STATUS_DOT[snapshot.cameraStatus],
            },
            {
              label: "Mãos detectadas",
              value: String(snapshot.handsDetected),
            },
            {
              label: "Landmarks visíveis",
              value: snapshot.landmarksVisible ? "Sim" : "Não",
            },
            {
              label: "Inferência",
              value:
                snapshot.inferenceMs === null
                  ? "—"
                  : `${snapshot.inferenceMs.toFixed(1)} ms`,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border bg-surface-elevated/60 px-4 py-3"
            >
              <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                {item.label}
              </dt>
              <dd
                aria-live={item.live ? "polite" : undefined}
                className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground"
              >
                {"dot" in item && item.dot && (
                  <span
                    aria-hidden="true"
                    className={cn("h-2 w-2 shrink-0 rounded-full", item.dot)}
                  />
                )}
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
