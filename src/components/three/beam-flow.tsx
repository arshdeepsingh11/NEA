"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { onThemeChange, themeColor } from "./theme-colors";

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.0,1.0); }`;

// Laser flow: a bundle of beams with fog turbulence, cursor tilt and micro-wisps.
const FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform vec3 uA; uniform vec3 uB;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.02; a*=0.5; } return v; }
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / uRes.y;
  // cursor tilts the beam direction
  float tilt = (uMouse.y - 0.5) * 0.9;
  float ang = -0.12 + tilt*0.35;
  mat2 R = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  vec2 q = R * uv;
  q.y += (uMouse.x - 0.5) * 0.08 * q.x;
  // fog turbulence
  float fog = fbm(q*vec2(1.4,3.2) + vec2(-uTime*0.25, uTime*0.05));
  float fog2 = fbm(q*vec2(3.0,6.0) + vec2(-uTime*0.6, 0.0));
  vec3 col = vec3(0.0);
  // beam bundle
  for(int i=0;i<5;i++){
    float fi = float(i);
    float off = (fi-2.0)*0.055 + sin(uTime*0.7+fi*1.7)*0.012;
    float y = q.y - off + (fog-0.5)*0.05;
    float w = 0.0025 + 0.0016*fi;
    float core = w / (abs(y) + 0.0008);
    float halo = exp(-abs(y)*28.0) * 0.35;
    float flow = 0.55 + 0.45*sin(q.x*14.0 - uTime*6.0 + fi*2.0);
    vec3 c = mix(uA, uB, fi/4.0);
    col += c * (core*0.06 + halo) * flow;
  }
  // micro-wisps: thin streaks pulled along the beam
  float wisp = smoothstep(0.62, 1.0, fog2) * exp(-abs(q.y)*7.0);
  col += mix(uA,uB,0.5) * wisp * 0.55;
  // volumetric fog lit by the beam
  col += vec3(0.25,0.35,0.5) * fog * exp(-abs(q.y)*3.2) * 0.35;
  // fade at the left edge where the laser starts
  col *= smoothstep(-1.2, -0.4, q.x);
  // vignette
  col *= 1.0 - 0.45*dot(uv,uv);
  // Light page: brightness becomes opacity, so beams tint the page instead of sitting on black.
  float l = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
  gl_FragColor = vec4(col / max(l, 0.001), l * 0.9);
}`;

/** Beam Flow — WebGL laser shader with fog, cursor tilt and wisps. */
/** Beam colours follow the theme: --viz-2 and --c-accent. */
export function BeamFlow({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const gl = cv.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!gl) return;
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uA = gl.getUniformLocation(prog, "uA");
    const uB = gl.getUniformLocation(prog, "uB");
    const tint = () => {
      const a = themeColor("--viz-2");
      const b = themeColor("--c-accent");
      gl.uniform3f(uA, a.r, a.g, a.b);
      gl.uniform3f(uB, b.r, b.g, b.b);
    };
    tint();
    const offTheme = onThemeChange(tint);

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / r.width;
      mouse.ty = 1 - (e.clientY - r.top) / r.height;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      cv.width = Math.max(1, cv.clientWidth * dpr);
      cv.height = Math.max(1, cv.clientHeight * dpr);
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(uRes, cv.width, cv.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(cv);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!visible || document.hidden) return;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      gl.uniform1f(uTime, reduce ? 3.0 : (performance.now() - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (reduce) cancelAnimationFrame(raf);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      offTheme();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvas} aria-hidden className={cn("block h-full w-full", className)} />;
}
