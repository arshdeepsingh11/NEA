"use client";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useEffect, useRef, useState } from "react";
import { useThree } from "./use-three";
import { onThemeChange, themeColor } from "./theme-colors";
import { cn } from "@/lib/utils";

export type AnatomyMode = "body" | "face";
export type AnatomyView = "skin" | "holo" | "inside" | "systems";
export type AnatomyRegion = { id: string; name: string; color: string; inside?: boolean };

type Props = {
  mode: AnatomyMode;
  regions: AnatomyRegion[];
  view?: AnatomyView;
  selected?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
  /** Hero use: no zoom (keeps page scrolling), slower auto-rotate, compact labels */
  compact?: boolean;
  showLabels?: boolean;
  /** Move the camera to the selected region (default true). The hero keeps the whole body in frame. */
  focus?: boolean;
};

const MODEL = {
  body: { url: "/models/body.glb" },
  face: { url: "/models/head.glb", map: "/models/head-color.jpg", normal: "/models/head-normal.jpg" },
};

/** Region rules for the 1.8 m CC0 body (front faces +Z, arms in A-pose). */
function classifyBody(x: number, y: number, z: number): string | null {
  const ax = Math.abs(x);
  if (y > 1.56 && ax < 0.13) return y > 1.735 || z < -0.075 ? "scalp" : "face";
  if (y > 1.43 && ax < 0.1) return "neck";
  if (y > 0.9 && y < 1.5 && ax > 0.2) return "arms";
  if (y > 1.22 && y <= 1.5) return "chest";
  if (y > 0.98 && y <= 1.22) return "gut";
  if (y > 0.82 && y <= 0.98) return "pelvis";
  if (y > 0.56 && y <= 0.82) return "thighs";
  if (y > 0.3 && y <= 0.56) return "knees";
  if (y <= 0.1) return "feet";
  return null;
}

/** Face zones from normalised head coordinates (u: -1..1 across, v: 0..1 up, w: -1..1 back→front). */
function classifyFace(u: number, v: number, w: number): string | null {
  const au = Math.abs(u);
  // Landmarks measured on the mesh: chin v≈0.47, lips v≈0.54, nose tip v≈0.64, eyes v≈0.69, brow v≈0.76.
  if (w < 0.3 || v < 0.4 || v > 0.95) return null; // back of head, neck and shoulders stay neutral
  if (v > 0.765) return au < 0.42 ? "forehead" : null;
  if (v > 0.58 && au < 0.085) return "tzone";
  if (v > 0.685) return null; // eyelids and brows stay neutral so the under-eye reads clearly
  if (v > 0.635 && au < 0.36) return "undereye";
  if (v > 0.55 && au >= 0.16 && au < 0.44) return "cheeks";
  if (v > 0.49 && au < 0.2) return w > 0.6 ? "mouth" : null; // skip the inner mouth cavity
  if (v > 0.4) return "jaw";
  return null;
}

const VERT = /* glsl */ `
attribute float aSel;
attribute float aHov;
attribute float aRegion;
attribute vec3 aCol;
varying float vSel;
varying float vHov;
varying float vReg;
varying vec3 vCol;
varying vec3 vN;
varying vec3 vV;
varying vec3 vW;
void main() {
  vSel = aSel;
  vHov = aHov;
  vReg = aRegion;
  vCol = aCol;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  vec4 mv = viewMatrix * wp;
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

const FRAG = /* glsl */ `
uniform float uTime;
uniform float uHolo;
uniform float uSystems;
uniform float uScanY;
uniform vec3 uActiveColor;
uniform vec3 uHoverColor;
uniform vec3 uBody;
uniform vec3 uRim;
varying float vSel;
varying float vHov;
varying float vReg;
varying vec3 vCol;
varying vec3 vN;
varying vec3 vV;
varying vec3 vW;
void main() {
  float fres = pow(1.0 - clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), 2.0);
  float isActive = smoothstep(0.05, 0.85, vSel);
  float isHover = smoothstep(0.05, 0.85, vHov) * (1.0 - isActive);
  float pulse = 0.75 + 0.25 * sin(uTime * 3.0);
  vec3 col = vec3(0.0);
  float a = 0.0;
  if (uSystems > 0.5) {
    // every system in its own colour, with the selected one brighter
    if (vReg < -0.5) discard;
    float lift = 0.55 + 0.45 * isActive + 0.25 * isHover;
    col = vCol * (0.75 + fres * 0.6) * lift;
    a = 0.42 + isActive * 0.3 + isHover * 0.12;
    gl_FragColor = vec4(col * a, a);
    return;
  }
  if (uHolo > 0.5) {
    // Light-page hologram: pale frosted aqua body, deeper teal rim, a soft scan sweep.
    vec3 body = uBody;
    vec3 rimC = uRim;
    float scan = 0.5 + 0.5 * sin(vW.y * 220.0 - uTime * 2.0);
    float sweep = smoothstep(0.08, 0.0, abs(vW.y - uScanY));
    col = mix(body, rimC, clamp(fres * 1.15, 0.0, 1.0)) - vec3(0.03) * scan + vec3(0.02, 0.35, 0.45) * sweep * 0.5;
    a = 0.34 + fres * 0.6 + sweep * 0.18;
    col = mix(col, uActiveColor, isActive * (0.7 + 0.2 * pulse));
    col = mix(col, uHoverColor, isHover * 0.45);
    a += isActive * 0.35 + isHover * 0.15;
    a = min(a, 0.96);
  } else {
    if (isActive + isHover < 0.02) discard;
    col = uActiveColor * isActive * (0.9 + fres * 1.4) * pulse + uHoverColor * isHover * (0.6 + fres);
    a = isActive * (0.28 + fres * 0.45) * pulse + isHover * 0.18;
    // Mostly additive: the zone glows on top of the skin texture instead of greying it.
    gl_FragColor = vec4(col * a, a * 0.35);
    return;
  }
  gl_FragColor = vec4(col * a, a);
}`;

/**
 * Anatomy Viewer — a real 3D human you can rotate, zoom and click.
 * Each click maps to a NEA region (skin, gut, hormones, scalp…) and calls onSelect.
 * Two looks: realistic skin with studio light, or an SI hologram with a scanning sweep.
 */
export function AnatomyViewer({ mode, regions, view = "skin", selected = null, onSelect, className, compact, showLabels = true, focus = true }: Props) {
  const [loaded, setLoaded] = useState(false);
  const labels = useRef<Record<string, HTMLButtonElement | null>>({});
  const props = useRef({ view, selected, onSelect, regions, focus });
  props.current = { view, selected, onSelect, regions, focus };

  const ref = useThree(
    ({ scene, camera, renderer, size }) => {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;

      const key = new THREE.DirectionalLight(0xffffff, 2.4);
      key.position.set(2.5, 4, 3);
      const rim = new THREE.DirectionalLight(0x93d5fb, 1.6);
      rim.position.set(-3, 2.5, -3);
      const fill = new THREE.DirectionalLight(0xe9a8f5, 0.6);
      fill.position.set(-2, 0.5, 2);
      scene.add(key, rim, fill, new THREE.AmbientLight(0xffffff, 0.15));

      const isFace = mode === "face";
      const ids = props.current.regions.map((r) => r.id);
      // Re-tint the hologram when the visitor switches theme.
      const offTheme = onThemeChange(() => {
        overlayMat.uniforms.uHoverColor.value.copy(themeColor("--c-accent2"));
        overlayMat.uniforms.uBody.value.copy(themeColor("--holo-body", "#f7e6f2"));
        overlayMat.uniforms.uRim.value.copy(themeColor("--holo-rim", "#6b4fc7"));
        if (points) (points.material as THREE.PointsMaterial).color.copy(themeColor("--holo-point", "#8e3fae"));
        recolour();
      });
      let recolour = () => {};
      const colorOf = (id: string) => {
        const c = props.current.regions.find((r) => r.id === id)?.color ?? "var(--r-1)";
        const m = c.match(/^var\((--[\w-]+)\)$/);
        return m ? themeColor(m[1]) : new THREE.Color(c);
      };

      const overlayMat = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uHolo: { value: 0 },
          uSystems: { value: 0 },
          uScanY: { value: 0 },
          uActiveColor: { value: themeColor("--c-accent") },
          uHoverColor: { value: themeColor("--c-accent2") },
          uBody: { value: themeColor("--holo-body", "#f7e6f2") },
          uRim: { value: themeColor("--holo-rim", "#6b4fc7") },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      });

      const group = new THREE.Group();
      scene.add(group);
      let skinMesh: THREE.Mesh | null = null;
      let overlay: THREE.Mesh | null = null;
      let points: THREE.Points | null = null;
      const anchors: Record<string, { p: THREE.Vector3; n: THREE.Vector3 }> = {};
      let bounds = new THREE.Box3();
      let paint: (attr: THREE.BufferAttribute, k: number) => void = () => {};
      let selA: THREE.BufferAttribute | null = null;
      let hovA: THREE.BufferAttribute | null = null;
      let lastSel = -2;
      let lastHov = -2;
      const disposables: { dispose: () => void }[] = [envTex, pmrem];

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.enablePan = false;
      controls.rotateSpeed = 0.7;
      controls.enableZoom = !compact;
      controls.minPolarAngle = 0.35;
      controls.maxPolarAngle = Math.PI - 0.35;
      controls.autoRotate = true;
      controls.autoRotateSpeed = compact ? 0.8 : 0.5;
      let lastInteract = -10;
      controls.addEventListener("start", () => (lastInteract = performance.now() / 1000));

      const organs = new THREE.Group();
      let skinBase: THREE.Material | null = null;
      const glassMat = new THREE.MeshPhysicalMaterial({ color: "#ffffff", transparent: true, opacity: 0.14, roughness: 0.12, metalness: 0, clearcoat: 1, depthWrite: false, side: THREE.FrontSide });
      disposables.push(glassMat);
      const home = { target: new THREE.Vector3(), dist: 3 };
      const goal = { target: new THREE.Vector3(), dist: 3 };

      const loader = new GLTFLoader();
      loader.load(MODEL[mode].url, (gltf) => {
        let src: THREE.Mesh | null = null;
        gltf.scene.traverse((o) => {
          if (!src && (o as THREE.Mesh).isMesh) src = o as THREE.Mesh;
        });
        if (!src) return;
        const mesh = src as THREE.Mesh;
        const geo = (mesh.geometry as THREE.BufferGeometry).clone();
        if (!geo.attributes.normal) geo.computeVertexNormals();
        geo.computeBoundingBox();
        const bb = geo.boundingBox!;

        // Normalise the head to ~0.26 m so cameras and lights behave the same in both modes.
        if (isFace) {
          const c = bb.getCenter(new THREE.Vector3());
          const s = 0.26 / (bb.max.y - bb.min.y);
          geo.translate(-c.x, -c.y, -c.z);
          geo.scale(s, s, s);
          geo.computeBoundingBox();
        }
        bounds = geo.boundingBox!.clone();
        const pos = geo.attributes.position as THREE.BufferAttribute;
        const nor = geo.attributes.normal as THREE.BufferAttribute;
        const region = new Float32Array(pos.count).fill(-1);
        const sums: Record<string, { x: number; y: number; z: number; n: number }> = {};
        const hx = Math.max(Math.abs(bounds.min.x), Math.abs(bounds.max.x));
        const hz = Math.max(Math.abs(bounds.min.z), Math.abs(bounds.max.z));
        const minY = bounds.min.y;
        const hY = bounds.max.y - bounds.min.y;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
          const id = isFace ? classifyFace(x / hx, (y - minY) / hY, z / hz) : classifyBody(x, y, z);
          const k = id ? ids.indexOf(id) : -1;
          region[i] = k;
          if (k >= 0 && id) {
            const sm = (sums[id] ??= { x: 0, y: 0, z: 0, n: 0 });
            // arms: anchor on the right arm only
            if (!(id === "arms" && x < 0) && !(id === "cheeks" && x < 0) && !(id === "undereye" && x > 0) && !(id === "thighs" && x < 0) && !(id === "knees" && x < 0) && !(id === "feet" && x < 0)) {
              sm.x += x; sm.y += y; sm.z += z; sm.n++;
            }
          }
        }
        geo.setAttribute("aRegion", new THREE.BufferAttribute(region, 1));
        const colAttr = new THREE.BufferAttribute(new Float32Array(pos.count * 3), 3);
        geo.setAttribute("aCol", colAttr);
        const fillCols = () => {
          const cache = ids.map((id) => colorOf(id));
          for (let i = 0; i < pos.count; i++) {
            const k = region[i];
            const c = k >= 0 ? cache[k] : null;
            colAttr.setXYZ(i, c ? c.r : 0, c ? c.g : 0, c ? c.b : 0);
          }
          colAttr.needsUpdate = true;
        };
        fillCols();
        const selAttr = new THREE.BufferAttribute(new Float32Array(pos.count), 1);
        const hovAttr = new THREE.BufferAttribute(new Float32Array(pos.count), 1);
        selAttr.setUsage(THREE.DynamicDrawUsage);
        hovAttr.setUsage(THREE.DynamicDrawUsage);
        geo.setAttribute("aSel", selAttr);
        geo.setAttribute("aHov", hovAttr);
        // Vertex adjacency (via the index buffer) lets us feather region edges instead of showing triangle steps.
        const index = geo.index;
        const nbr: number[][] = Array.from({ length: pos.count }, () => []);
        if (index) {
          for (let f = 0; f < index.count; f += 3) {
            const a = index.getX(f), b = index.getX(f + 1), c = index.getX(f + 2);
            nbr[a].push(b, c); nbr[b].push(a, c); nbr[c].push(a, b);
          }
        }
        paint = (attr, k) => {
          const arr = attr.array as Float32Array;
          for (let i = 0; i < arr.length; i++) arr[i] = region[i] === k && k >= 0 ? 1 : 0;
          if (k >= 0) {
            const tmpArr = new Float32Array(arr.length);
            for (let it = 0; it < 4; it++) {
              for (let i = 0; i < arr.length; i++) {
                const nb = nbr[i];
                let s = arr[i] * 2;
                for (let j = 0; j < nb.length; j++) s += arr[nb[j]];
                tmpArr[i] = s / (nb.length + 2);
              }
              arr.set(tmpArr);
            }
          }
          attr.needsUpdate = true;
        };
        selA = selAttr;
        hovA = hovAttr;

        // Anchor = the front-facing vertex of each region closest to its centroid.
        for (const id of ids) {
          const sm = sums[id];
          if (!sm || !sm.n) continue;
          const cx = sm.x / sm.n, cy = sm.y / sm.n;
          let best = -1, bestD = Infinity;
          for (let i = 0; i < pos.count; i++) {
            if (region[i] !== ids.indexOf(id)) continue;
            if (nor.getZ(i) < 0.25 && id !== "scalp") continue;
            const d = (pos.getX(i) - cx) ** 2 + (pos.getY(i) - cy) ** 2 - pos.getZ(i) * 0.02;
            if (d < bestD) { bestD = d; best = i; }
          }
          if (best >= 0) anchors[id] = { p: new THREE.Vector3(pos.getX(best), pos.getY(best), pos.getZ(best)), n: new THREE.Vector3(nor.getX(best), nor.getY(best), nor.getZ(best)) };
        }

        let skinMat: THREE.Material;
        if (isFace) {
          const tl = new THREE.TextureLoader();
          const map = tl.load(MODEL.face.map);
          map.colorSpace = THREE.SRGBColorSpace;
          const normalMap = tl.load(MODEL.face.normal);
          disposables.push(map, normalMap);
          skinMat = new THREE.MeshPhysicalMaterial({ map, normalMap, normalScale: new THREE.Vector2(0.9, 0.9), roughness: 0.62, sheen: 0.4, sheenColor: new THREE.Color("#ffd2c0"), sheenRoughness: 0.6, clearcoat: 0.08 });
        } else {
          skinMat = new THREE.MeshPhysicalMaterial({ color: "#c99581", roughness: 0.5, metalness: 0, sheen: 0.9, sheenRoughness: 0.45, sheenColor: new THREE.Color("#ffd9c9"), clearcoat: 0.12, clearcoatRoughness: 0.6 });
        }
        skinMesh = new THREE.Mesh(geo, skinMat);
        overlay = new THREE.Mesh(geo, overlayMat);
        overlay.renderOrder = 2;
        points = new THREE.Points(
          geo,
          new THREE.PointsMaterial({ size: isFace ? 0.0011 : 0.0045, color: themeColor("--holo-point", "#8e3fae"), transparent: true, opacity: 0.35, depthWrite: false, sizeAttenuation: true })
        );
        group.add(skinMesh, overlay, points);
        skinBase = skinMat;

        // ---------- Inside view: organs under a glass skin ----------
        if (!isFace) {
          const zc = -0.06;
          const ellipsoid = (rx: number, ry: number, rz: number, wobble = 0, seg = 40) => {
            const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.75));
            const p = g.attributes.position as THREE.BufferAttribute;
            for (let i = 0; i < p.count; i++) {
              const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
              const w = wobble ? 1 + wobble * Math.sin(x * 17) * Math.sin(y * 15 + 1) * Math.sin(z * 19 + 2) : 1;
              p.setXYZ(i, x * rx * w, y * ry * w, z * rz * w);
            }
            g.computeVertexNormals();
            return g;
          };
          const gut = new THREE.CatmullRomCurve3(
            [[-0.075, 1.1], [0.07, 1.09], [0.075, 1.05], [-0.07, 1.04], [-0.075, 1.0], [0.07, 0.99], [0.06, 0.955], [-0.04, 0.95]].map(([x, y], i) => new THREE.Vector3(x, y, zc + 0.03 + (i % 2) * 0.012))
          );
          const defs: { id: string; geo: THREE.BufferGeometry; at: [number, number, number]; rot?: [number, number, number] }[] = [
            { id: "brain", geo: ellipsoid(0.06, 0.048, 0.07, 0.05, 64), at: [0, 1.712, zc] },
            { id: "neck", geo: ellipsoid(0.024, 0.012, 0.012), at: [0, 1.462, zc + 0.03] },
            { id: "chest", geo: ellipsoid(0.052, 0.095, 0.058), at: [-0.066, 1.335, zc - 0.005] },
            { id: "chest", geo: ellipsoid(0.048, 0.09, 0.055), at: [0.068, 1.335, zc - 0.005] },
            { id: "chest", geo: ellipsoid(0.036, 0.044, 0.032), at: [0.016, 1.29, zc + 0.03], rot: [0, 0, -0.5] },
            { id: "liver", geo: ellipsoid(0.085, 0.038, 0.055), at: [-0.04, 1.18, zc + 0.01], rot: [0, 0, 0.18] },
            { id: "gut", geo: ellipsoid(0.044, 0.032, 0.034), at: [0.052, 1.165, zc + 0.02], rot: [0, 0, -0.4] },
            { id: "gut", geo: new THREE.TubeGeometry(gut, 140, 0.016, 12, false), at: [0, 0, 0] },
            { id: "adrenals", geo: ellipsoid(0.021, 0.04, 0.018), at: [-0.058, 1.12, zc - 0.05], rot: [0, 0, 0.25] },
            { id: "adrenals", geo: ellipsoid(0.021, 0.04, 0.018), at: [0.058, 1.12, zc - 0.05], rot: [0, 0, -0.25] },
            { id: "adrenals", geo: ellipsoid(0.014, 0.01, 0.012), at: [-0.052, 1.168, zc - 0.05] },
            { id: "adrenals", geo: ellipsoid(0.014, 0.01, 0.012), at: [0.052, 1.168, zc - 0.05] },
            { id: "pelvis", geo: ellipsoid(0.032, 0.026, 0.026), at: [0, 0.925, zc + 0.02] },
          ];
          const mats: Record<string, THREE.MeshPhysicalMaterial> = {};
          const matFor = (id: string) => {
            if (mats[id]) return mats[id];
            const c = colorOf(id);
            mats[id] = new THREE.MeshPhysicalMaterial({ color: c, emissive: c.clone().multiplyScalar(0.35), roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.2, sheen: 0.6, sheenColor: new THREE.Color("#ffffff") });
            disposables.push(mats[id]);
            return mats[id];
          };
          const sums2: Record<string, { v: THREE.Vector3; n: number }> = {};
          for (const d of defs) {
            if (!ids.includes(d.id)) continue;
            const m = new THREE.Mesh(d.geo, matFor(d.id));
            m.position.set(...d.at);
            if (d.rot) m.rotation.set(...d.rot);
            m.userData.region = d.id;
            organs.add(m);
            disposables.push(d.geo);
            const c = d.id === "gut" && d.geo instanceof THREE.TubeGeometry ? new THREE.Vector3(0, 1.03, zc + 0.03) : new THREE.Vector3(...d.at);
            const sm = (sums2[d.id] ??= { v: new THREE.Vector3(), n: 0 });
            sm.v.add(c);
            sm.n++;
          }
          // Organs-only regions (brain, liver, adrenals) get their hotspot on the organ itself.
          for (const id of Object.keys(sums2)) {
            const r = props.current.regions.find((x) => x.id === id);
            if (r?.inside) anchors[id] = { p: sums2[id].v.divideScalar(sums2[id].n), n: new THREE.Vector3(0, 0, 1) };
          }
          organs.visible = false;
          group.add(organs);
          recolour = () => {
            fillCols();
            for (const [id, m] of Object.entries(mats)) {
              const c = colorOf(id);
              m.color.copy(c);
              m.emissive.copy(c).multiplyScalar(0.35);
            }
          };
        } else {
          recolour = fillCols;
        }

        const centre = bounds.getCenter(new THREE.Vector3());
        const height = bounds.max.y - bounds.min.y;
        home.target.copy(centre);
        home.dist = isFace ? 0.62 : compact ? 3.6 : 4.1;
        goal.target.copy(home.target);
        goal.dist = home.dist;
        controls.target.copy(centre);
        camera.position.set(0, centre.y + height * (isFace ? 0.04 : 0.04), home.dist);
        camera.near = 0.01;
        camera.far = 50;
        camera.updateProjectionMatrix();
        controls.minDistance = isFace ? 0.28 : 0.7;
        controls.maxDistance = isFace ? 1.2 : 5;
        setLoaded(true);
      });

      // ---------- Picking ----------
      const ray = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const regionAt = (cx: number, cy: number) => {
        if (!skinMesh) return -1;
        const r = renderer.domElement.getBoundingClientRect();
        ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        if (organs.visible) {
          const o = ray.intersectObjects(organs.children, false)[0];
          if (o) return props.current.regions.findIndex((x) => x.id === o.object.userData.region);
        }
        const hit = ray.intersectObject(skinMesh, false)[0];
        if (!hit || !hit.face) return -1;
        const attr = (skinMesh.geometry as THREE.BufferGeometry).attributes.aRegion as THREE.BufferAttribute;
        return attr.getX(hit.face.a);
      };
      let down = { x: 0, y: 0 };
      let hoverPending: { x: number; y: number } | null = null;
      const el = renderer.domElement;
      const onDown = (e: PointerEvent) => (down = { x: e.clientX, y: e.clientY });
      const onUp = (e: PointerEvent) => {
        if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
        const k = regionAt(e.clientX, e.clientY);
        const id = k >= 0 ? props.current.regions[k]?.id : undefined;
        if (id) props.current.onSelect?.(id);
      };
      const onMove = (e: PointerEvent) => (hoverPending = { x: e.clientX, y: e.clientY });
      const onLeave = () => {
        hoverPending = null;
        if (hovA) paint(hovA, -1);
        lastHov = -1;
        el.style.cursor = "";
      };
      el.addEventListener("pointerdown", onDown);
      el.addEventListener("pointerup", onUp);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      el.style.touchAction = "none";

      const tmp = new THREE.Vector3();
      const tmpN = new THREE.Vector3();
      const camDir = new THREE.Vector3();

      return {
        tick: (t, dt) => {
          overlayMat.uniforms.uTime.value = t;
          const { view: v0, selected: sel } = props.current;
          // Picking an organ-only region opens the body automatically.
          const selInside = !!sel && !!props.current.regions.find((r) => r.id === sel)?.inside;
          const v = selInside && v0 !== "holo" ? "inside" : v0;
          const holo = v === "holo";
          const inside = v === "inside";
          overlayMat.uniforms.uHolo.value = holo ? 1 : 0;
          overlayMat.uniforms.uSystems.value = v === "systems" ? 1 : 0;
          if (skinMesh) {
            skinMesh.visible = !holo;
            const want = inside ? glassMat : skinBase;
            if (want && skinMesh.material !== want) skinMesh.material = want;
            skinMesh.renderOrder = inside ? 3 : 0;
          }
          organs.visible = inside || (holo && !isFace);
          if (points) points.visible = holo;
          if (overlay) overlay.visible = !inside;
          if (organs.visible) {
            for (const o of organs.children) {
              const m = (o as THREE.Mesh).material as THREE.MeshPhysicalMaterial;
              const on = o.userData.region === sel;
              m.emissiveIntensity = on ? 1.5 + 0.5 * Math.sin(t * 3) : sel ? 0.6 : 1;
              m.transparent = true;
              m.opacity = !sel || on ? 1 : 0.35;
            }
          }
          const h = bounds.max.y - bounds.min.y || 1;
          overlayMat.uniforms.uScanY.value = bounds.min.y + ((t * 0.18) % 1) * h * 1.1;

          const k = sel ? props.current.regions.findIndex((r) => r.id === sel) : -1;
          if (k !== lastSel && selA) {
            paint(selA, k);
            lastSel = k;
          }
          if (sel) overlayMat.uniforms.uActiveColor.value.copy(colorOf(sel));

          if (hoverPending) {
            const hk = regionAt(hoverPending.x, hoverPending.y);
            if (hk !== lastHov && hovA) {
              paint(hovA, hk === k ? -1 : hk);
              lastHov = hk;
            }
            el.style.cursor = hk >= 0 ? "pointer" : "grab";
            hoverPending = null;
          }

          // Focus the camera on the selected region.
          const a = sel && props.current.focus ? anchors[sel] : undefined;
          if (a) {
            goal.target.copy(a.p);
            goal.dist = mode === "face" ? 0.36 : sel === "face" || sel === "scalp" || sel === "neck" || sel === "brain" ? 1.0 : sel === "feet" ? 1.3 : selInside ? 1.25 : 1.6;
          } else {
            goal.target.copy(home.target);
            goal.dist = home.dist;
          }
          const ease = Math.min(1, dt * 2.6);
          controls.target.lerp(goal.target, ease);
          const offset = tmp.copy(camera.position).sub(controls.target);
          const curDist = offset.length();
          offset.setLength(curDist + (goal.dist - curDist) * ease);
          camera.position.copy(controls.target).add(offset);

          controls.autoRotate = (!sel || !props.current.focus) && t - lastInteract > 4;
          controls.update();

          // Hotspot labels follow the model.
          camera.getWorldDirection(camDir);
          for (const r of props.current.regions) {
            const node = labels.current[r.id];
            const an = anchors[r.id];
            if (!node) continue;
            if (!an) {
              node.style.opacity = "0";
              continue;
            }
            tmp.copy(an.p).applyMatrix4(group.matrixWorld);
            tmpN.copy(an.n).transformDirection(group.matrixWorld);
            const facing = tmpN.dot(tmp.clone().sub(camera.position).normalize()) < 0.15;
            tmp.project(camera);
            const x = (tmp.x * 0.5 + 0.5) * size.w;
            const y = (-tmp.y * 0.5 + 0.5) * size.h;
            // Regions anchored on the viewer's left get their label on the left, so labels never stack.
            const left = an.p.x < -0.005 || x > size.w - 200;
            node.dataset.side = left ? "l" : "r";
            node.style.transform = left ? `translate(${x}px, ${y}px) translateX(-100%)` : `translate(${x}px, ${y}px)`;
            const isSel = sel === r.id;
            node.style.opacity = facing ? "1" : isSel ? "0.5" : "0";
            node.style.pointerEvents = facing ? "auto" : "none";
          }
        },
        dispose: () => {
          offTheme();
          controls.dispose();
          el.removeEventListener("pointerdown", onDown);
          el.removeEventListener("pointerup", onUp);
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
          disposables.forEach((d) => d.dispose());
        },
      };
    },
    { fov: 32, z: 3 }
  );

  // Keep the canvas wheel from scrolling the page while zooming the model.
  useEffect(() => {
    if (!compact && ref.current) ref.current.setAttribute("data-lenis-prevent", "");
  }, [compact, ref]);

  return (
    <div className={cn("relative", className)}>
      <div ref={ref} className="absolute inset-0" />
      {!loaded && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="flex items-center gap-3 rounded-full border border-ink/10 bg-white/80 px-4 py-2 text-[13px] text-graphite shadow-sm backdrop-blur">
            <span className="h-2 w-2 animate-pulseglow rounded-full bg-flora" /> Loading 3D {mode === "face" ? "face" : "body"} model…
          </div>
        </div>
      )}
      {showLabels && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {regions.map((r) => (
            <button
              key={r.id}
              ref={(n) => {
                labels.current[r.id] = n;
              }}
              onClick={() => onSelect?.(r.id)}
              className="group/spot absolute left-0 top-0 opacity-0 transition-opacity duration-300"
              aria-label={`Explore ${r.name}`}
            >
              <span className="relative -ml-2 -mt-2 flex items-center gap-2 group-data-[side=l]/spot:-mr-2 group-data-[side=l]/spot:ml-0 group-data-[side=l]/spot:flex-row-reverse">
                <span className="relative grid h-4 w-4 place-items-center">
                  <span className="absolute inset-0 animate-ping rounded-full opacity-40" style={{ background: r.color }} />
                  <span className="h-2.5 w-2.5 rounded-full border-2 border-white" style={{ background: r.color, boxShadow: `0 0 14px ${r.color}` }} />
                </span>
                {!compact || selected === r.id ? (
                  <span className={cn("whitespace-nowrap rounded-full border px-2.5 py-1 text-[11.5px] backdrop-blur-md", selected === r.id ? "border-ink bg-ink text-white" : "border-ink/10 bg-white/85 text-ink shadow-sm")}>{r.name}</span>
                ) : null}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
