"use client";
/**
 * Live face tracking in the visitor's own browser (Google MediaPipe Face Landmarker, Apache 2.0).
 * The camera picture never leaves the device: frames are read locally and only 468 points come out.
 * The library (about 9 MB including the model) loads on demand, the first time someone turns the camera on.
 */
const VERSION = "0.10.14";
const LIB = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}/vision_bundle.mjs`;
const WASM = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}/wasm`;
const MODEL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

export type Pt = { x: number; y: number; z: number };
type Landmarker = { detectForVideo: (v: HTMLVideoElement, t: number) => { faceLandmarks: Pt[][] }; close: () => void };

let loading: Promise<Landmarker> | null = null;

export function loadLandmarker(): Promise<Landmarker> {
  loading ??= (async () => {
    const V = await import(/* webpackIgnore: true */ LIB);
    const files = await V.FilesetResolver.forVisionTasks(WASM);
    const make = (delegate: "GPU" | "CPU") =>
      V.FaceLandmarker.createFromOptions(files, { baseOptions: { modelAssetPath: MODEL, delegate }, runningMode: "VIDEO", numFaces: 1 }) as Promise<Landmarker>;
    try {
      return await make("GPU");
    } catch {
      return await make("CPU");
    }
  })().catch((e) => {
    loading = null;
    throw e;
  });
  return loading;
}

/** Opens the front camera into `video`. Resolves to a stop() function. */
export async function startCamera(video: HTMLVideoElement): Promise<() => void> {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false });
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  await video.play();
  return () => {
    stream.getTracks().forEach((t) => t.stop());
    video.srcObject = null;
  };
}

/** Runs face tracking on every video frame until stop() is called. `onFace` gets 468+ points (0–1 of the video size) or null. */
export function track(video: HTMLVideoElement, lm: Landmarker, onFace: (pts: Pt[] | null) => void) {
  let raf = 0;
  let last = -1;
  const loop = () => {
    if (video.readyState >= 2 && video.currentTime !== last) {
      last = video.currentTime;
      try {
        const r = lm.detectForVideo(video, performance.now());
        onFace(r.faceLandmarks[0] ?? null);
      } catch {
        /* a dropped frame is fine */
      }
    }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(raf);
}

export const cameraSupported = () => typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);
