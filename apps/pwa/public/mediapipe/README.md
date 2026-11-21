# MediaPipe self-hosted assets

Static resources served by the PWA itself so the hand lab
(`/laboratorio/maos`) does not depend on external CDNs.

## Contents

| Path | Source | Version | Size | License |
|---|---|---|---|---|
| `wasm/vision_wasm_internal.js` | `node_modules/@mediapipe/tasks-vision` | 0.10.21 | ~200 KB | Apache-2.0 |
| `wasm/vision_wasm_internal.wasm` | `node_modules/@mediapipe/tasks-vision` | 0.10.21 | ~9.6 MB | Apache-2.0 |
| `wasm/vision_wasm_nosimd_internal.js` | `node_modules/@mediapipe/tasks-vision` | 0.10.21 | ~200 KB | Apache-2.0 |
| `wasm/vision_wasm_nosimd_internal.wasm` | `node_modules/@mediapipe/tasks-vision` | 0.10.21 | ~9.4 MB | Apache-2.0 |
| `models/hand_landmarker.task` | https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task | float16 v1 | 7,819,105 B | Apache-2.0 |

SHA-256 of `models/hand_landmarker.task` (verify after re-download):

```
fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1
```

Both MediaPipe Tasks Vision and the Hand Landmarker model are published by
Google under the Apache License 2.0, which permits redistribution; this notice
and the source links above serve as the required attribution. Apache-2.0 text:
https://www.apache.org/licenses/LICENSE-2.0

## Referenced by

- `src/lib/hand-tracking.ts` — `TASKS_VISION_WASM_URL` → `/mediapipe/wasm`,
  `HAND_LANDMARKER_MODEL_URL` → `/mediapipe/models/hand_landmarker.task`
- `src/components/hand-lab.tsx` — `FilesetResolver.forVisionTasks()` resolves
  the `wasm/` directory; it picks the SIMD or no-SIMD variant itself, so keep
  all four files and their original names.

## Updating

When `@mediapipe/tasks-vision` is bumped in `package.json`:

1. Copy the new `node_modules/@mediapipe/tasks-vision/wasm/*` over `wasm/`.
2. Update `TASKS_VISION_VERSION` in `src/lib/hand-tracking.ts` to match.
3. If the model version changes upstream, re-download `hand_landmarker.task`,
   recompute its SHA-256, and update the checksum and table above.

## Cache note

Files under `public/` are served as static assets by Next.js/Vercel. They are
versioned together with the code (a new deploy ships matching URLs), so no
extra cache headers are required for correctness; the ~27 MB total is
compressed/cached by the CDN after first fetch.
