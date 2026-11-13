/**
 * Hand-tracking lifecycle for the experimental lab page.
 *
 * Deliberately free of React and of MediaPipe imports so it stays testable:
 * the camera stream, the landmarker and the frame scheduler are injected.
 *
 * Model provenance: hand_landmarker.task (float16), published by Google as part
 * of MediaPipe Models under the Apache License 2.0.
 * Source: https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task
 * Docs: https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker
 */

export const HAND_LANDMARK_COUNT = 21;

export const HAND_LANDMARKER_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export const TASKS_VISION_VERSION = "0.10.21";

export const TASKS_VISION_WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${TASKS_VISION_VERSION}/wasm`;

/** Skeleton edges between the 21 hand landmarks (MediaPipe topology). */
export const HAND_CONNECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4], // thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // index
  [5, 9], [9, 10], [10, 11], [11, 12], // middle
  [9, 13], [13, 14], [14, 15], [15, 16], // ring
  [13, 17], [17, 18], [18, 19], [19, 20], // pinky
  [0, 17], // palm
];

export type CameraStatus =
  | "idle"
  | "requesting"
  | "active"
  | "denied"
  | "unavailable"
  | "error";

export interface NormalizedLandmarkLike {
  x: number;
  y: number;
  z: number;
}

export interface HandLandmarkerResultLike {
  landmarks: NormalizedLandmarkLike[][];
  handedness: Array<Array<{ categoryName: string }>>;
}

export interface HandLandmarkerLike {
  detectForVideo(
    video: HTMLVideoElement,
    timestampMs: number,
  ): HandLandmarkerResultLike;
  close(): void;
}

export interface HandTrackingSnapshot {
  cameraStatus: CameraStatus;
  handsDetected: number;
  landmarksVisible: boolean;
  /** Duration of the last inference call, in milliseconds. */
  inferenceMs: number | null;
  error: string | null;
}

export const IDLE_SNAPSHOT: HandTrackingSnapshot = {
  cameraStatus: "idle",
  handsDetected: 0,
  landmarksVisible: false,
  inferenceMs: null,
  error: null,
};

export interface HandTrackerDeps {
  getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
  createLandmarker(): Promise<HandLandmarkerLike>;
  getVideo(): HTMLVideoElement | null;
  /** Called after every inference result, and with `null` when the view clears. */
  onResult?(result: HandLandmarkerResultLike | null): void;
  /** Called whenever the snapshot changes. */
  onChange?(snapshot: HandTrackingSnapshot): void;
  requestFrame?(callback: FrameRequestCallback): number;
  cancelFrame?(id: number): void;
  now?(): number;
}

function classifyGetUserMediaError(error: unknown): {
  cameraStatus: CameraStatus;
  message: string;
} {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return {
      cameraStatus: "denied",
      message:
        "Permissão de câmera negada. Libere o acesso nas configurações do navegador e tente novamente.",
    };
  }
  if (
    name === "NotFoundError" ||
    name === "OverconstrainedError" ||
    name === "NotReadableError"
  ) {
    return {
      cameraStatus: "unavailable",
      message:
        "Nenhuma câmera disponível. Verifique se há um dispositivo conectado e livre.",
    };
  }
  return {
    cameraStatus: "error",
    message:
      "Não foi possível acessar a câmera. Este experimento exige um contexto seguro (localhost ou HTTPS).",
  };
}

export function createHandTracker(deps: HandTrackerDeps) {
  const requestFrame =
    deps.requestFrame ??
    ((cb: FrameRequestCallback) => requestAnimationFrame(cb));
  const cancelFrame =
    deps.cancelFrame ?? ((id: number) => cancelAnimationFrame(id));
  const now = deps.now ?? (() => performance.now());

  const listeners = new Set<() => void>();
  let snapshot = IDLE_SNAPSHOT;
  let stream: MediaStream | null = null;
  let landmarker: HandLandmarkerLike | null = null;
  let frameId: number | null = null;
  let lastVideoTime = -1;
  let running = false;
  let starting = false;
  let disposed = false;
  // Bumped by stop()/dispose() so an in-flight start() aborts after its
  // next await instead of re-activating a session the user just ended.
  let generation = 0;

  function onTrackEnded() {
    // Fired when the camera source ends externally (e.g. unplugged).
    // track.stop() does not fire it, so this only runs on real loss.
    if (running || starting) {
      fail("unavailable", "A câmera foi desconectada.");
    }
  }

  function emit(patch: Partial<HandTrackingSnapshot>) {
    snapshot = { ...snapshot, ...patch };
    for (const listener of listeners) listener();
    deps.onChange?.(snapshot);
  }

  function stopTracks() {
    if (stream) {
      for (const track of stream.getTracks()) {
        track.removeEventListener("ended", onTrackEnded);
        track.stop();
      }
      stream = null;
    }
    const video = deps.getVideo();
    if (video) video.srcObject = null;
  }

  function stopLoop() {
    running = false;
    if (frameId !== null) {
      cancelFrame(frameId);
      frameId = null;
    }
  }

  function releaseResources() {
    stopLoop();
    stopTracks();
    if (landmarker) {
      landmarker.close();
      landmarker = null;
    }
    lastVideoTime = -1;
  }

  function fail(cameraStatus: CameraStatus, message: string) {
    generation += 1;
    starting = false;
    releaseResources();
    emit({
      cameraStatus,
      handsDetected: 0,
      landmarksVisible: false,
      inferenceMs: null,
      error: message,
    });
    deps.onResult?.(null);
  }

  function loop() {
    if (!running) return;
    const video = deps.getVideo();
    if (video && landmarker && video.readyState >= 2) {
      // Skip inference while the video frame has not advanced.
      if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        try {
          const startedAt = now();
          const result = landmarker.detectForVideo(video, startedAt);
          const hands = result.landmarks.length;
          emit({
            handsDetected: hands,
            landmarksVisible: hands > 0,
            inferenceMs: now() - startedAt,
          });
          deps.onResult?.(result);
        } catch {
          fail("error", "A detecção falhou durante a execução.");
          return;
        }
      }
    }
    frameId = requestFrame(loop);
  }

  async function start() {
    if (disposed || running || starting) return;
    starting = true;
    emit({ cameraStatus: "requesting", error: null });

    const myGeneration = ++generation;
    // A start() cancelled mid-flight must never publish state, touch shared
    // fields (stream/landmarker) or schedule work after its next await.
    const stale = () => disposed || myGeneration !== generation;

    let acquired: MediaStream;
    try {
      acquired = await deps.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
    } catch (error) {
      if (stale()) return;
      const classified = classifyGetUserMediaError(error);
      fail(classified.cameraStatus, classified.message);
      return;
    }

    if (stale()) {
      // The stream resolved after stop(): release it directly since
      // releaseResources() no longer knows about it.
      for (const track of acquired.getTracks()) track.stop();
      return;
    }

    stream = acquired;
    for (const track of stream.getTracks()) {
      track.addEventListener("ended", onTrackEnded);
    }

    const video = deps.getVideo();
    if (!video) {
      fail("error", "Elemento de vídeo indisponível na página.");
      return;
    }
    video.srcObject = stream;
    try {
      await video.play();
    } catch {
      if (!stale()) {
        fail("error", "Não foi possível iniciar a prévia da câmera.");
      }
      return;
    }
    // Cancelled while play() was pending: stop() already released the
    // stream; do not start landmarker initialization.
    if (stale()) return;

    let created: HandLandmarkerLike;
    try {
      created = await deps.createLandmarker();
    } catch {
      if (!stale()) {
        fail(
          "error",
          "Falha ao inicializar o detector de mãos. Verifique sua conexão e tente novamente.",
        );
      }
      return;
    }
    if (stale()) {
      created.close();
      return;
    }

    landmarker = created;
    starting = false;
    running = true;
    lastVideoTime = -1;
    emit({ cameraStatus: "active", error: null });
    frameId = requestFrame(loop);
  }

  function stop() {
    generation += 1;
    starting = false;
    releaseResources();
    emit({ ...IDLE_SNAPSHOT });
    deps.onResult?.(null);
  }

  function dispose() {
    disposed = true;
    listeners.clear();
    stop();
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => snapshot,
    start,
    stop,
    dispose,
  };
}

export type HandTracker = ReturnType<typeof createHandTracker>;
