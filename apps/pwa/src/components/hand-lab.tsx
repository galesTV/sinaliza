"use client";

import { useEffect, useRef, useState } from "react";

import {
  HAND_CONNECTIONS,
  HAND_LANDMARKER_MODEL_URL,
  IDLE_SNAPSHOT,
  TASKS_VISION_WASM_URL,
  createHandTracker,
  type HandLandmarkerResultLike,
  type HandTracker,
} from "@/lib/hand-tracking";

const STATUS_LABEL: Record<string, string> = {
  idle: "Câmera desligada",
  requesting: "Solicitando acesso…",
  active: "Câmera ativa",
  denied: "Permissão negada",
  unavailable: "Câmera indisponível",
  error: "Erro",
};

function drawLandmarks(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  result: HandLandmarkerResultLike | null,
) {
  const context = canvas.getContext("2d");
  if (!context) return;

  const width = video.videoWidth;
  const height = video.videoHeight;
  if (width === 0 || height === 0) return;

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  context.clearRect(0, 0, width, height);
  if (!result) return;

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
  const trackerRef = useRef<HandTracker | null>(null);
  const [snapshot, setSnapshot] = useState(IDLE_SNAPSHOT);

  // Only called from event handlers and effects — never during render.
  function ensureTracker() {
    let tracker = trackerRef.current;
    if (!tracker) {
      tracker = createHandTracker({
        getUserMedia: (constraints) =>
          navigator.mediaDevices.getUserMedia(constraints),
        createLandmarker: createHandLandmarker,
        getVideo: () => videoRef.current,
        onChange: setSnapshot,
        onResult: (result) => {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          if (canvas && video) drawLandmarks(canvas, video, result);
        },
      });
      trackerRef.current = tracker;
    }
    return tracker;
  }

  useEffect(() => () => trackerRef.current?.dispose(), []);

  const cameraOn = snapshot.cameraStatus === "active";
  const busy = snapshot.cameraStatus === "requesting";
  const secureContext =
    typeof window !== "undefined" && window.isSecureContext;

  return (
    <div className="flex flex-col gap-8">
      <section
        aria-labelledby="lab-camera-title"
        className="flex flex-col gap-5 rounded-3xl border border-border bg-surface p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)] sm:p-8"
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
            className="inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[11px] border border-white/15 bg-gradient-to-r from-primary to-[#8272f2] px-5 text-sm font-semibold text-on-primary shadow-[0_10px_30px_rgba(105,87,232,0.25)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(105,87,232,0.35)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:shadow-[0_10px_30px_rgba(105,87,232,0.25)]"
          >
            Ativar câmera
          </button>
          <button
            type="button"
            onClick={() => ensureTracker().stop()}
            disabled={!cameraOn}
            className="inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[11px] border border-border bg-white/[0.025] px-5 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-white/[0.025]"
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
        aria-labelledby="lab-status-title"
        className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6 sm:p-8"
      >
        <h2
          id="lab-status-title"
          className="font-display text-xl font-semibold tracking-tight text-foreground"
        >
          Status
        </h2>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
          {[
            {
              label: "Câmera",
              value: STATUS_LABEL[snapshot.cameraStatus],
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
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
