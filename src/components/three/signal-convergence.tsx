"use client";
import * as THREE from "three";
import { useThree } from "./use-three";
import { onThemeChange, themeColor } from "./theme-colors";
import { cn } from "@/lib/utils";

// Deep tones that read on the light page (premultiplied normal blending, not additive light).
const COLORS = ["--viz-1", "--viz-2", "--viz-3", "--c-accent"]; // theme variables

/**
 * Signal Convergence — streams of light travel along curved lines from
 * scattered data points into one hub. The scene follows your pointer.
 * Used to show many biomarkers (skin, gut, hormones, DNA) becoming one plan.
 */
export function SignalConvergence({ className, lines = 140, offsetX = 0 }: { className?: string; lines?: number; offsetX?: number }) {
  const ref = useThree(
    ({ scene, camera, pointer }) => {
      const group = new THREE.Group();
      group.position.x = offsetX;
      scene.add(group);
      const SEG = 64;
      const total = lines * SEG;
      const positions = new Float32Array(total * 3);
      const ts = new Float32Array(total);
      const offsets = new Float32Array(total);
      const speeds = new Float32Array(total);
      const colors = new Float32Array(total * 3);
      const indices: number[] = [];
      const sources: THREE.Vector3[] = [];
      const c = new THREE.Color();
      const p0 = new THREE.Vector3();
      const p1 = new THREE.Vector3();
      const p2 = new THREE.Vector3(0, 0, 0);
      const pt = new THREE.Vector3();

      for (let l = 0; l < lines; l++) {
        // sources on a wide, flattened shell
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        const r = 3.2 + Math.random() * 2.4;
        p0.set(r * Math.sin(ph) * Math.cos(th) * 1.6, r * Math.cos(ph) * 0.75, r * Math.sin(ph) * Math.sin(th));
        sources.push(p0.clone());
        // control point bends the line around the hub
        p1.copy(p0).multiplyScalar(0.45).add(new THREE.Vector3((Math.random() - 0.5) * 2.2, (Math.random() - 0.5) * 2.2, (Math.random() - 0.5) * 2.2));
        const off = Math.random();
        const spd = 0.18 + Math.random() * 0.35;
        c.copy(themeColor(COLORS[l % COLORS.length]));
        for (let s = 0; s < SEG; s++) {
          const t = s / (SEG - 1);
          // quadratic bezier
          const a = (1 - t) * (1 - t);
          const b = 2 * (1 - t) * t;
          const d = t * t;
          pt.set(a * p0.x + b * p1.x + d * p2.x, a * p0.y + b * p1.y + d * p2.y, a * p0.z + b * p1.z + d * p2.z);
          const i = l * SEG + s;
          positions.set([pt.x, pt.y, pt.z], i * 3);
          ts[i] = t;
          offsets[i] = off;
          speeds[i] = spd;
          colors.set([c.r, c.g, c.b], i * 3);
          if (s < SEG - 1) indices.push(i, i + 1);
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("aT", new THREE.BufferAttribute(ts, 1));
      geo.setAttribute("aOff", new THREE.BufferAttribute(offsets, 1));
      geo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
      geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
      geo.setIndex(indices);

      const mat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: /* glsl */ `
          attribute float aT; attribute float aOff; attribute float aSpeed; attribute vec3 aColor;
          varying float vT; varying float vOff; varying float vSpeed; varying vec3 vColor;
          void main(){ vT=aT; vOff=aOff; vSpeed=aSpeed; vColor=aColor; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `
          uniform float uTime; varying float vT; varying float vOff; varying float vSpeed; varying vec3 vColor;
          void main(){
            float head = fract(uTime*vSpeed + vOff);
            float d = vT - head;
            float pulse = smoothstep(-0.16, 0.0, d) * (1.0 - smoothstep(0.0, 0.012, d));
            float base = 0.06 + vT*0.10;
            float a = base + pulse*0.85;
            gl_FragColor = vec4(vColor * a, a);
          }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
      });
      group.add(new THREE.LineSegments(geo, mat));

      // source nodes
      const nodeGeo = new THREE.BufferGeometry().setFromPoints(sources);
      const nodes = new THREE.Points(nodeGeo, new THREE.PointsMaterial({ size: 0.06, color: 0x334155, transparent: true, opacity: 0.45, depthWrite: false }));
      group.add(nodes);

      // hub: core + glow sprite + expanding rings
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.26, 48, 48), new THREE.MeshBasicMaterial({ color: themeColor("--c-accent") }));
      group.add(core);
      const glowTex = (() => {
        const cv = document.createElement("canvas");
        cv.width = cv.height = 128;
        const g = cv.getContext("2d")!;
        const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
        grd.addColorStop(0, "rgba(255,255,255,0.9)");
        grd.addColorStop(0.4, "rgba(255,255,255,0.35)");
        grd.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = grd;
        g.fillRect(0, 0, 128, 128);
        return new THREE.CanvasTexture(cv);
      })();
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false }));
      glow.scale.set(2.6, 2.6, 1);
      group.add(glow);
      const rings = [0, 1, 2].map(() => {
        const m = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.315, 96), new THREE.MeshBasicMaterial({ color: themeColor("--c-accent"), transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false }));
        group.add(m);
        return m;
      });

      const recolor = () => {
        for (let l = 0; l < lines; l++) {
          c.copy(themeColor(COLORS[l % COLORS.length]));
          for (let k = 0; k < SEG; k++) colors.set([c.r, c.g, c.b], (l * SEG + k) * 3);
        }
        (geo.getAttribute("aColor") as THREE.BufferAttribute).needsUpdate = true;
        (core.material as THREE.MeshBasicMaterial).color.copy(themeColor("--c-accent"));
        rings.forEach((r) => (r.material as THREE.MeshBasicMaterial).color.copy(themeColor("--c-accent")));
      };
      const offTheme = onThemeChange(recolor);

      camera.position.set(0, 0.4, 9.5);
      camera.lookAt(0, 0, 0);

      return {
        resize: (w) => {
          group.position.x = w < 768 ? 0 : offsetX;
        },
        tick: (t) => {
          mat.uniforms.uTime.value = t;
          group.rotation.y = t * 0.05 + pointer.x * 0.6;
          group.rotation.x = -pointer.y * 0.35;
          const s = 1 + Math.sin(t * 2.2) * 0.06;
          core.scale.setScalar(s);
          glow.scale.setScalar(2.4 + Math.sin(t * 2.2) * 0.25);
          rings.forEach((r, i) => {
            const k = (t * 0.5 + i / 3) % 1;
            r.scale.setScalar(1 + k * 5);
            (r.material as THREE.MeshBasicMaterial).opacity = 0.45 * (1 - k);
            r.lookAt(camera.position);
          });
        },
        dispose: () => {
          offTheme();
          glowTex.dispose();
        },
      };
    },
    { fov: 40, z: 9.5 }
  );

  return <div ref={ref} className={cn("relative", className)} />;
}
