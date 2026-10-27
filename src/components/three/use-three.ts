"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export type ThreeCtx = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  pointer: THREE.Vector2; // -1..1, smoothed
  size: { w: number; h: number };
};

type Setup = (ctx: ThreeCtx) => { tick: (t: number, dt: number) => void; dispose?: () => void; resize?: (w: number, h: number) => void };

/**
 * Shared Three.js lifecycle: renderer, resize, pointer tracking,
 * pause when off-screen or tab hidden, reduced-motion still frame, full disposal.
 */
export function useThree(setup: Setup, opts: { fov?: number; z?: number; alpha?: boolean } = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const setupRef = useRef(setup);
  setupRef.current = setup;

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: opts.alpha ?? true, powerPreference: "high-performance" });
    } catch {
      host.dataset.webgl = "unavailable";
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.setAttribute("aria-hidden", "true");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(opts.fov ?? 40, 1, 0.1, 100);
    camera.position.set(0, 0, opts.z ?? 6);
    const pointer = new THREE.Vector2();
    const target = new THREE.Vector2();
    const size = { w: 1, h: 1 };

    const api = setupRef.current({ renderer, scene, camera, pointer, size });

    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      size.w = w;
      size.h = h;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      api.resize?.(w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      target.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "100px" });
    io.observe(host);

    const clock = new THREE.Clock();
    let raf = 0;
    let elapsed = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!visible || document.hidden) return;
      elapsed += dt;
      pointer.lerp(target, Math.min(1, dt * 3));
      api.tick(elapsed, dt);
      renderer.render(scene, camera);
    };
    if (reduce) {
      api.tick(2.0, 0);
      renderer.render(scene, camera);
    } else loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      api.dispose?.();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose?.();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
