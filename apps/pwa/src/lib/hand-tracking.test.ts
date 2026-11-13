import { describe, expect, it, vi } from "vitest";

import {
  HAND_CONNECTIONS,
  HAND_LANDMARK_COUNT,
  createHandTracker,
  type HandLandmarkerResultLike,
} from "./hand-tracking";

const RESULT_TWO_HANDS: HandLandmarkerResultLike = {
  landmarks: [
    Array.from({ length: HAND_LANDMARK_COUNT }, () => ({ x: 0, y: 0, z: 0 })),
    Array.from({ length: HAND_LANDMARK_COUNT }, () => ({ x: 1, y: 1, z: 1 })),
  ],
  handedness: [[{ categoryName: "Left" }], [{ categoryName: "Right" }]],
};

function domException(name: string) {
  return new DOMException("mock", name);
}

function makeVideo() {
  return {
    currentTime: 0,
    readyState: 4,
    srcObject: null as unknown,
    play: vi.fn(async () => undefined),
  } as unknown as HTMLVideoElement;
}

function makeStream() {
  const track = {
    stop: vi.fn(),
    listeners: new Map<string, () => void>(),
    addEventListener(type: string, cb: () => void) {
      this.listeners.set(type, cb);
    },
    removeEventListener(type: string) {
      this.listeners.delete(type);
    },
    emitEnded() {
      this.listeners.get("ended")?.();
    },
  };
  return {
    stream: { getTracks: () => [track] } as unknown as MediaStream,
    track,
  };
}

function makeDeps(overrides: Partial<Parameters<typeof createHandTracker>[0]> = {}) {
  const { stream, track } = makeStream();
  const video = makeVideo();
  const frames: FrameRequestCallback[] = [];
  const landmarker = {
    detectForVideo: vi.fn(() => RESULT_TWO_HANDS),
    close: vi.fn(),
  };
  let clock = 0;

  const deps = {
    getUserMedia: vi.fn(async () => stream),
    createLandmarker: vi.fn(async () => landmarker),
    getVideo: () => video,
    onResult: vi.fn(),
    requestFrame: vi.fn((cb: FrameRequestCallback) => {
      frames.push(cb);
      return frames.length;
    }),
    cancelFrame: vi.fn(),
    now: () => (clock += 5),
    ...overrides,
  };

  const runFrame = () => {
    const cb = frames.shift();
    cb?.(clock);
  };

  return { deps, video, stream, track, landmarker, runFrame, frames };
}

describe("hand landmark topology", () => {
  it("references only the 21 landmarks", () => {
    const indices = HAND_CONNECTIONS.flat();
    expect(Math.min(...indices)).toBe(0);
    expect(Math.max(...indices)).toBe(HAND_LANDMARK_COUNT - 1);
    expect(new Set(indices).size).toBe(HAND_LANDMARK_COUNT);
  });
});

describe("createHandTracker", () => {
  it("activates the camera and reports detected hands", async () => {
    const { deps, landmarker, runFrame } = makeDeps();
    const tracker = createHandTracker(deps);

    await tracker.start();
    expect(tracker.getSnapshot().cameraStatus).toBe("active");

    runFrame();
    const snap = tracker.getSnapshot();
    expect(landmarker.detectForVideo).toHaveBeenCalledTimes(1);
    expect(snap.handsDetected).toBe(2);
    expect(snap.landmarksVisible).toBe(true);
    expect(snap.inferenceMs).toBe(5);
    expect(deps.onResult).toHaveBeenCalledWith(RESULT_TWO_HANDS);
  });

  it("skips inference while the video frame has not changed", async () => {
    const { deps, video, landmarker, runFrame } = makeDeps();
    const tracker = createHandTracker(deps);

    await tracker.start();
    runFrame();
    runFrame();
    expect(landmarker.detectForVideo).toHaveBeenCalledTimes(1);

    video.currentTime = 0.5;
    runFrame();
    expect(landmarker.detectForVideo).toHaveBeenCalledTimes(2);
  });

  it("maps denied permission to the denied status", async () => {
    const { deps } = makeDeps({
      getUserMedia: vi.fn(async () => {
        throw domException("NotAllowedError");
      }),
    });
    const tracker = createHandTracker(deps);

    await tracker.start();
    const snap = tracker.getSnapshot();
    expect(snap.cameraStatus).toBe("denied");
    expect(snap.error).toContain("negada");
  });

  it("maps a missing camera to the unavailable status", async () => {
    const { deps } = makeDeps({
      getUserMedia: vi.fn(async () => {
        throw domException("NotFoundError");
      }),
    });
    const tracker = createHandTracker(deps);

    await tracker.start();
    expect(tracker.getSnapshot().cameraStatus).toBe("unavailable");
  });

  it("stops tracks and reports an error when landmarker init fails", async () => {
    const { deps, track } = makeDeps({
      createLandmarker: vi.fn(async () => {
        throw new Error("wasm failed");
      }),
    });
    const tracker = createHandTracker(deps);

    await tracker.start();
    const snap = tracker.getSnapshot();
    expect(snap.cameraStatus).toBe("error");
    expect(track.stop).toHaveBeenCalled();
  });

  it("stops tracks, closes the landmarker and clears the view on stop", async () => {
    const { deps, video, track, landmarker, runFrame } = makeDeps();
    const tracker = createHandTracker(deps);

    await tracker.start();
    runFrame();
    tracker.stop();

    const snap = tracker.getSnapshot();
    expect(snap.cameraStatus).toBe("idle");
    expect(snap.handsDetected).toBe(0);
    expect(track.stop).toHaveBeenCalledTimes(1);
    expect(landmarker.close).toHaveBeenCalledTimes(1);
    expect(deps.cancelFrame).toHaveBeenCalled();
    expect(video.srcObject).toBeNull();
    expect(deps.onResult).toHaveBeenLastCalledWith(null);
  });

  it("cleans up on dispose and stops notifying listeners", async () => {
    const { deps, track, landmarker } = makeDeps();
    const tracker = createHandTracker(deps);
    const listener = vi.fn();
    tracker.subscribe(listener);

    await tracker.start();
    listener.mockClear();
    tracker.dispose();

    expect(track.stop).toHaveBeenCalled();
    expect(landmarker.close).toHaveBeenCalled();

    // Disposed tracker ignores further starts and emits nothing.
    await tracker.start();
    expect(deps.getUserMedia).toHaveBeenCalledTimes(1);
    expect(listener).not.toHaveBeenCalled();
  });

  it("aborts an in-flight start when stop is called mid-load", async () => {
    let resolveLandmarker!: () => void;
    const { deps, track } = makeDeps({
      createLandmarker: vi.fn(
        () =>
          new Promise<never>((resolve) => {
            resolveLandmarker = () =>
              resolve({
                detectForVideo: () => RESULT_TWO_HANDS,
                close: vi.fn(),
              } as never);
          }),
      ),
    });
    const tracker = createHandTracker(deps);

    const pending = tracker.start();
    // Camera granted, detector still loading — the user hits stop.
    await vi.waitFor(() => expect(deps.createLandmarker).toHaveBeenCalled());
    tracker.stop();
    resolveLandmarker();
    await pending;

    const snap = tracker.getSnapshot();
    expect(snap.cameraStatus).toBe("idle");
    expect(track.stop).toHaveBeenCalled();
  });

  it("fails gracefully when the camera track ends externally", async () => {
    const { deps, track, runFrame } = makeDeps();
    const tracker = createHandTracker(deps);

    await tracker.start();
    runFrame();
    expect(tracker.getSnapshot().cameraStatus).toBe("active");

    track.emitEnded();
    const snap = tracker.getSnapshot();
    expect(snap.cameraStatus).toBe("unavailable");
    expect(snap.error).toContain("desconectada");
    expect(snap.handsDetected).toBe(0);
  });

  it("does not fail when the user stops the track themselves", async () => {
    const { deps, track } = makeDeps();
    const tracker = createHandTracker(deps);

    await tracker.start();
    tracker.stop();
    track.emitEnded();
    expect(tracker.getSnapshot().cameraStatus).toBe("idle");
  });

  it("ignores a second start while one is already running", async () => {
    const { deps } = makeDeps();
    const tracker = createHandTracker(deps);

    await tracker.start();
    await tracker.start();
    expect(deps.getUserMedia).toHaveBeenCalledTimes(1);
  });

  it("stays idle when getUserMedia rejects after stop()", async () => {
    let rejectGum!: (error: unknown) => void;
    const { deps } = makeDeps({
      getUserMedia: vi.fn(
        () =>
          new Promise<MediaStream>((_, reject) => {
            rejectGum = reject;
          }),
      ),
    });
    const tracker = createHandTracker(deps);

    const pending = tracker.start();
    await vi.waitFor(() => expect(deps.getUserMedia).toHaveBeenCalled());
    tracker.stop();
    rejectGum(domException("NotAllowedError"));
    await pending;

    const snap = tracker.getSnapshot();
    expect(snap.cameraStatus).toBe("idle");
    expect(snap.error).toBeNull();
  });

  it("releases a stream that resolves after stop()", async () => {
    let resolveGum!: (stream: MediaStream) => void;
    const { deps, stream, track } = makeDeps({
      getUserMedia: vi.fn(
        () =>
          new Promise<MediaStream>((resolve) => {
            resolveGum = resolve;
          }),
      ),
    });
    const tracker = createHandTracker(deps);

    const pending = tracker.start();
    await vi.waitFor(() => expect(deps.getUserMedia).toHaveBeenCalled());
    tracker.stop();
    resolveGum(stream);
    await pending;

    expect(track.stop).toHaveBeenCalled();
    const snap = tracker.getSnapshot();
    expect(snap.cameraStatus).toBe("idle");
    expect(snap.error).toBeNull();
  });

  it("stays idle when video.play() rejects after stop()", async () => {
    let rejectPlay!: (error?: unknown) => void;
    const { deps, video, track } = makeDeps();
    video.play = vi.fn(
      () =>
        new Promise<void>((_, reject) => {
          rejectPlay = reject;
        }),
    );
    const tracker = createHandTracker(deps);

    const pending = tracker.start();
    await vi.waitFor(() => expect(video.play).toHaveBeenCalled());
    tracker.stop();
    rejectPlay(new Error("play aborted"));
    await pending;

    const snap = tracker.getSnapshot();
    expect(snap.cameraStatus).toBe("idle");
    expect(snap.error).toBeNull();
    expect(track.stop).toHaveBeenCalled();
    expect(deps.createLandmarker).not.toHaveBeenCalled();
    expect(deps.requestFrame).not.toHaveBeenCalled();
  });

  it("does not start detection when video.play() resolves after stop()", async () => {
    let resolvePlay!: () => void;
    const { deps, video } = makeDeps();
    video.play = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolvePlay = resolve;
        }),
    );
    const tracker = createHandTracker(deps);

    const pending = tracker.start();
    await vi.waitFor(() => expect(video.play).toHaveBeenCalled());
    tracker.stop();
    resolvePlay();
    await pending;

    expect(tracker.getSnapshot().cameraStatus).toBe("idle");
    expect(deps.createLandmarker).not.toHaveBeenCalled();
    expect(deps.requestFrame).not.toHaveBeenCalled();
  });

  it("closes a landmarker that finishes initializing after stop()", async () => {
    const created = { detectForVideo: vi.fn(), close: vi.fn() };
    let resolveLandmarker!: (landmarker: typeof created) => void;
    const { deps, track } = makeDeps({
      createLandmarker: vi.fn(
        () =>
          new Promise<typeof created>((resolve) => {
            resolveLandmarker = resolve;
          }),
      ),
    });
    const tracker = createHandTracker(deps);

    const pending = tracker.start();
    await vi.waitFor(() => expect(deps.createLandmarker).toHaveBeenCalled());
    tracker.stop();
    resolveLandmarker(created);
    await pending;

    expect(created.close).toHaveBeenCalledTimes(1);
    expect(track.stop).toHaveBeenCalled();
    expect(tracker.getSnapshot().cameraStatus).toBe("idle");
    expect(deps.requestFrame).not.toHaveBeenCalled();
  });

  it("ignores a landmarker init failure after stop()", async () => {
    let rejectLandmarker!: (error: unknown) => void;
    const { deps, track } = makeDeps({
      createLandmarker: vi.fn(
        () =>
          new Promise<never>((_, reject) => {
            rejectLandmarker = reject;
          }),
      ),
    });
    const tracker = createHandTracker(deps);

    const pending = tracker.start();
    await vi.waitFor(() => expect(deps.createLandmarker).toHaveBeenCalled());
    tracker.stop();
    rejectLandmarker(new Error("wasm failed"));
    await pending;

    const snap = tracker.getSnapshot();
    expect(snap.cameraStatus).toBe("idle");
    expect(snap.error).toBeNull();
    expect(track.stop).toHaveBeenCalled();
  });

  it("allows restarting after stopping mid-load", async () => {
    const second = makeStream();
    let resolveGum!: (stream: MediaStream) => void;
    const { deps, stream, track } = makeDeps({
      getUserMedia: vi
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise<MediaStream>((resolve) => {
              resolveGum = resolve;
            }),
        )
        .mockImplementation(async () => second.stream),
    });
    const tracker = createHandTracker(deps);

    const first = tracker.start();
    await vi.waitFor(() => expect(deps.getUserMedia).toHaveBeenCalledTimes(1));
    tracker.stop();
    const restarted = tracker.start();
    resolveGum(stream);
    await Promise.all([first, restarted]);

    expect(tracker.getSnapshot().cameraStatus).toBe("active");
    // The cancelled attempt released its own stream without touching the
    // live one.
    expect(track.stop).toHaveBeenCalled();
    expect(second.track.stop).not.toHaveBeenCalled();
  });
});
