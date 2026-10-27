"use client";
import * as THREE from "three";
import { useRef } from "react";
import { useThree } from "./use-three";
import { simplex3 } from "./glsl";
import { cn } from "@/lib/utils";

export type PlanetType = "biome" | "dermis" | "ocean";

const PALETTES: Record<PlanetType, { a: string; b: string; c: string; d: string; atmo: string }> = {
  // microbiome: deep teal lowlands, mineral greens, porcelain highlands
  biome: { a: "#0f3b35", b: "#2f7d6d", c: "#9fd3c1", d: "#f2efe9", atmo: "#7fe0c8" },
  // skin: rose dermis layers with pearl highlights
  dermis: { a: "#5b2c2a", b: "#b9826f", c: "#e7c3b5", d: "#fbf3ee", atmo: "#ffc9b8" },
  ocean: { a: "#0b1d3a", b: "#1f4f8a", c: "#6fa8dc", d: "#e8f1ff", atmo: "#8fb6ff" },
};

export type Moon = { label: string; radius: number; distance: number; speed: number; tilt: number; color: string };

const DEFAULT_MOONS: Moon[] = [
  { label: "Skin microbiome", radius: 0.16, distance: 2.35, speed: 0.32, tilt: 0.35, color: "#e7c3b5" },
  { label: "Gut microbiome", radius: 0.21, distance: 2.95, speed: 0.22, tilt: -0.22, color: "#9fd3c1" },
  { label: "DNA & hormones", radius: 0.12, distance: 3.55, speed: 0.15, tilt: 0.6, color: "#b9b7ff" },
];

/**
 * Planet System — a procedural planet with atmosphere scattering, specular
 * highlights and orbiting moons. The light follows your pointer.
 * Here it stands for your inner world: skin, gut and DNA orbiting one body.
 */
export function PlanetSystem({ type = "biome", moons = DEFAULT_MOONS, className, showLabels = true }: { type?: PlanetType; moons?: Moon[]; className?: string; showLabels?: boolean }) {
  const labels = useRef<(HTMLDivElement | null)[]>([]);

  const ref = useThree(
    ({ scene, camera, pointer, size }) => {
      const pal = PALETTES[type];
      const lightDir = new THREE.Vector3(-0.6, 0.45, 0.65).normalize();

      // ---- Planet --------------------------------------------------------
      const planetMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uLight: { value: lightDir.clone() },
          uA: { value: new THREE.Color(pal.a) },
          uB: { value: new THREE.Color(pal.b) },
          uC: { value: new THREE.Color(pal.c) },
          uD: { value: new THREE.Color(pal.d) },
          uAtmo: { value: new THREE.Color(pal.atmo) },
        },
        vertexShader: /* glsl */ `
          varying vec3 vN; varying vec3 vP; varying vec3 vW;
          void main(){
            vN = normalize(normalMatrix * normal);
            vP = position;
            vec4 w = modelViewMatrix * vec4(position,1.0);
            vW = w.xyz;
            gl_Position = projectionMatrix * w;
          }`,
        fragmentShader: /* glsl */ `
          uniform float uTime; uniform vec3 uLight; uniform vec3 uA,uB,uC,uD,uAtmo;
          varying vec3 vN; varying vec3 vP; varying vec3 vW;
          ${simplex3}
          void main(){
            vec3 p = normalize(vP);
            float n = fbm(p*2.2 + vec3(0.0, uTime*0.015, uTime*0.01));
            float cells = fbm(p*4.6 - vec3(uTime*0.02));
            float h = n*0.75 + cells*0.25;
            vec3 col = mix(uA, uB, smoothstep(-0.45, 0.05, h));
            col = mix(col, uC, smoothstep(0.05, 0.32, h));
            col = mix(col, uD, smoothstep(0.32, 0.6, h));
            // soft polar caps
            col = mix(col, uD, smoothstep(0.78, 0.95, abs(p.y)));
            vec3 N = normalize(vN);
            vec3 L = normalize(uLight);
            vec3 V = normalize(-vW);
            float diff = clamp(dot(N,L), 0.0, 1.0);
            float wrap = clamp((dot(N,L)+0.35)/1.35, 0.0, 1.0);
            // wet lowlands get specular, highlands stay matte
            float wet = 1.0 - smoothstep(-0.2, 0.15, h);
            vec3 H = normalize(L+V);
            float spec = pow(max(dot(N,H),0.0), 60.0) * (0.25 + wet*0.9);
            float rim = pow(1.0 - max(dot(N,V),0.0), 3.0);
            vec3 c = col * (0.08 + wrap*0.95) + spec*vec3(1.0) + rim*uAtmo*0.55*(0.3+diff);
            gl_FragColor = vec4(c, 1.0);
          }`,
      });
      const planet = new THREE.Mesh(new THREE.SphereGeometry(1.35, 128, 128), planetMat);
      planet.rotation.z = 0.32;
      scene.add(planet);

      // ---- Atmosphere (back-face fresnel shell) ---------------------------
      const atmoMat = new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(pal.atmo) }, uLight: { value: lightDir.clone() } },
        vertexShader: /* glsl */ `
          varying vec3 vN; varying vec3 vW;
          void main(){ vN = normalize(normalMatrix*normal); vec4 w = modelViewMatrix*vec4(position,1.0); vW=w.xyz; gl_Position = projectionMatrix*w; }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor; uniform vec3 uLight; varying vec3 vN; varying vec3 vW;
          void main(){
            vec3 V = normalize(-vW);
            // back faces: 0 at the outer silhouette, rising toward the planet limb
            float f = pow(clamp(-dot(normalize(vN), V), 0.0, 1.0), 2.2);
            float lit = 0.35 + 0.65*clamp(dot(normalize(vN), normalize(uLight))+0.4, 0.0, 1.0);
            vec3 c = uColor * f * 1.35 * lit;
            gl_FragColor = vec4(c, clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0));
          }`,
        side: THREE.BackSide,
        // premultiplied additive: glows over whatever is behind the transparent canvas
        blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneFactor,
        blendSrcAlpha: THREE.OneFactor,
        blendDstAlpha: THREE.OneFactor,
        transparent: true,
        depthWrite: false,
      });
      const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.35 * 1.16, 96, 96), atmoMat);
      scene.add(atmo);

      // ---- Moons and orbit rings ------------------------------------------
      const ambient = new THREE.AmbientLight(0xffffff, 0.18);
      const sun = new THREE.DirectionalLight(0xffffff, 2.2);
      sun.position.copy(lightDir).multiplyScalar(10);
      scene.add(ambient, sun);

      const moonObjs = moons.map((m, i) => {
        const pivot = new THREE.Group();
        pivot.rotation.x = m.tilt;
        pivot.rotation.z = m.tilt * 0.4;
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(m.radius, 48, 48),
          new THREE.MeshStandardMaterial({ color: m.color, roughness: 0.55, metalness: 0.05, emissive: new THREE.Color(m.color), emissiveIntensity: 0.08 })
        );
        mesh.position.x = m.distance;
        pivot.add(mesh);
        const ringGeo = new THREE.RingGeometry(m.distance - 0.004, m.distance + 0.004, 160);
        const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.09, side: THREE.DoubleSide }));
        ring.rotation.x = Math.PI / 2;
        pivot.add(ring);
        pivot.rotation.y = i * 2.1;
        scene.add(pivot);
        return { pivot, mesh, m };
      });

      // ---- Star dust -------------------------------------------------------
      const starGeo = new THREE.BufferGeometry();
      const N = 900;
      const pos = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const r = 9 + Math.random() * 14;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
        pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
        pos[i * 3 + 2] = -Math.abs(r * Math.cos(ph));
      }
      starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.035, color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false }));
      scene.add(stars);

      camera.position.set(0, 0.25, 9.4);
      const tmp = new THREE.Vector3();
      const light = new THREE.Vector3();

      return {
        resize: (w) => {
          camera.position.z = w < 640 ? 11.5 : 9.4;
        },
        tick: (t, dt) => {
          planetMat.uniforms.uTime.value = t;
          // pointer steers the light (interactive lighting) and tilts the system
          light.set(-0.6 + pointer.x * 1.1, 0.45 + pointer.y * 0.8, 0.65).normalize();
          planetMat.uniforms.uLight.value.copy(light);
          atmoMat.uniforms.uLight.value.copy(light);
          sun.position.copy(light).multiplyScalar(10);
          planet.rotation.y += dt * 0.06;
          scene.rotation.y += (pointer.x * 0.25 - scene.rotation.y) * 0.04;
          scene.rotation.x += (-pointer.y * 0.12 - scene.rotation.x) * 0.04;
          stars.rotation.y = t * 0.004;

          moonObjs.forEach(({ pivot, mesh, m }, i) => {
            pivot.rotation.y += dt * m.speed;
            mesh.rotation.y += dt * 0.4;
            const el = labels.current[i];
            if (el) {
              mesh.getWorldPosition(tmp);
              const depth = tmp.z;
              tmp.project(camera);
              const x = (tmp.x * 0.5 + 0.5) * size.w;
              const y = (-tmp.y * 0.5 + 0.5) * size.h;
              el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -170%)`;
              el.style.opacity = depth < -0.4 ? "0.25" : "1";
            }
          });
        },
      };
    },
    { fov: 35, z: 8.2 }
  );

  return (
    <div className={cn("relative", className)}>
      <div ref={ref} className="absolute inset-0" />
      {showLabels && (
        <div className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block" aria-hidden>
          {moons.map((m, i) => (
            <div
              key={m.label}
              ref={(n) => {
                labels.current[i] = n;
              }}
              className="absolute left-0 top-0 whitespace-nowrap rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] text-white/85 backdrop-blur-md transition-opacity duration-500"
            >
              {m.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
