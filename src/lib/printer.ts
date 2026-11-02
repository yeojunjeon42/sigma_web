// WebGL and Canvas 2D renderers preserve slot order so overlaps match. Every mark is a square.
import { SQUARE, square } from "./halftone";

export type Box = { x: number; y: number; w: number; h: number };
export type Fade = readonly [number, number];
// Dots that show the photograph: x, y, radius, alpha, turn per dot. The lens is the one the dots moved through.
export type Veil = { data: Float32Array; n: number };
export type Lens = { x: number; y: number; r: number; power: number };
export type Slots = {
  x: Float32Array;
  y: Float32Array;
  // Per mark, indexed like x and y.
  turn: Float32Array;
  held: Int32Array;
  cap: number;
  radius: (slot: number) => number;
  ink: (slot: number) => number;
};

export interface Printer {
  size(w: number, h: number, dpr: number): void;
  clear(): void;
  ground(ox: number, oy: number, cell: number, r: number, colour: string): void;
  dots(s: Slots, from: number, to: number, palette: string[]): void;
  prime(img: HTMLImageElement, at: Box, file: Blob): Promise<void>;
  photo(img: HTMLImageElement, at: Box, veil: Veil, lens: Lens): void;
  mark(x: number, y: number, r: number, colour: string, alpha: number): void;
  dispose(): void;
}

// Scale an image file on a worker: on the page's own thread this took a frame or more, mid-motion.
let scaler: Worker | null = null;
let asked = 0;
const waiting = new Map<number, { go: (b: ImageBitmap) => void; no: (e: unknown) => void }>();
const SCALER = `onmessage=async({data:{id,file,o}})=>{try{const b=await createImageBitmap(file,o);postMessage({id,b},[b])}catch(e){postMessage({id})}}`;

export function scaled(file: Blob, resizeWidth: number, resizeHeight: number, resizeQuality: ResizeQuality): Promise<ImageBitmap> {
  const o: ImageBitmapOptions = { resizeWidth, resizeHeight, resizeQuality, premultiplyAlpha: "premultiply" };
  if (!scaler && typeof Worker === "function") {
    try {
      scaler = new Worker(URL.createObjectURL(new Blob([SCALER], { type: "text/javascript" })));
      scaler.onmessage = ({ data: { id, b } }: MessageEvent<{ id: number; b?: ImageBitmap }>) => {
        const w = waiting.get(id);
        waiting.delete(id);
        if (b) w?.go(b);
        else w?.no(new Error("scale"));
      };
    } catch {}
  }
  if (!scaler) return createImageBitmap(file, o);
  const id = asked++;
  return new Promise((go, no) => {
    waiting.set(id, { go, no });
    scaler?.postMessage({ id, file, o });
  });
}

export function printer(canvas: HTMLCanvasElement, restored: () => void): Printer | null {
  return glPrinter(canvas, restored) ?? flatPrinter(canvas);
}

const PALETTE = 16;
// Floats per mark: x, y, radius, ink or alpha, turn.
export const STRIDE = 5;

const FULL = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const CLIP = `
uniform vec2 u_px;
uniform float u_dpr;
vec4 clip(vec2 p) {
  vec2 d = p * u_dpr;
  return vec4(d.x / u_px.x * 2.0 - 1.0, 1.0 - d.y / u_px.y * 2.0, 0.0, 1.0);
}`;

const GROUND = `#version 300 es
precision highp float;
uniform vec2 u_px;
uniform float u_dpr;
uniform vec2 u_origin;
uniform float u_cell;
uniform float u_r;
uniform vec4 u_ink;
out vec4 o;
void main() {
  vec2 p = vec2(gl_FragCoord.x, u_px.y - gl_FragCoord.y) / u_dpr;
  vec2 c = abs(p - u_origin - floor((p - u_origin) / u_cell + 0.5) * u_cell);
  float k = clamp((u_r - max(c.x, c.y)) * u_dpr + 0.5, 0.0, 1.0);
  if (k <= 0.0) discard;
  o = u_ink * k;
}`;

const DOT_V = `#version 300 es
layout(location = 0) in vec2 a_corner;
layout(location = 1) in vec4 a_dot;
layout(location = 2) in float a_turn;
${CLIP}
out vec2 v_off;
flat out float v_r;
flat out float v_k;
void main() {
  v_off = a_corner * (a_dot.z + 1.0 / u_dpr);
  v_r = a_dot.z;
  v_k = a_dot.w;
  float c = cos(a_turn);
  float s = sin(a_turn);
  gl_Position = clip(a_dot.xy + vec2(v_off.x * c - v_off.y * s, v_off.x * s + v_off.y * c));
}`;

const DOT_F = `#version 300 es
precision highp float;
uniform vec4 u_pal[${PALETTE}];
uniform float u_dpr;
in vec2 v_off;
flat in float v_r;
flat in float v_k;
out vec4 o;
void main() {
  float k = clamp((v_r - max(abs(v_off.x), abs(v_off.y))) * u_dpr + 0.5, 0.0, 1.0);
  if (k <= 0.0) discard;
  o = u_pal[int(v_k + 0.5)] * k;
}`;

// Each fragment reads the photograph where the lens took it from (d(1 + p(1 - (d/R)^2)^2) = d', by
// Newton), so the picture runs on through the dots without a seam and is untouched at the lens's edge.
const PHOTO_F = `#version 300 es
precision highp float;
uniform sampler2D u_img;
uniform vec4 u_rect;
uniform vec4 u_lens;
uniform vec2 u_px;
uniform float u_dpr;
in vec2 v_off;
flat in float v_r;
flat in float v_k;
out vec4 o;
void main() {
  float k = clamp((v_r - max(abs(v_off.x), abs(v_off.y))) * u_dpr + 0.5, 0.0, 1.0);
  if (k <= 0.0) discard;
  vec2 p = vec2(gl_FragCoord.x, u_px.y - gl_FragCoord.y) / u_dpr;
  vec2 v = p - u_lens.xy;
  float seen = length(v);
  float d = seen / (1.0 + u_lens.w);
  for (int i = 0; i < 3; i++) {
    float u = d / u_lens.z;
    float s = max(1.0 - u * u, 0.0);
    d -= (d * (1.0 + u_lens.w * s * s) - seen) / (1.0 + u_lens.w * s * s - 4.0 * u_lens.w * u * u * s);
  }
  vec2 q = seen < u_lens.z ? u_lens.xy + v * (d / max(seen, 0.001)) : p;
  vec2 uv = (q - u_rect.xy) / u_rect.zw;
  vec2 inside = step(vec2(0.0), uv) * step(uv, vec2(1.0));
  // Cutouts carry a faint residue of their old background: ease it away instead of printing a halo.
  vec4 c = texture(u_img, uv);
  c *= smoothstep(0.2, 0.75, c.a) / max(c.a, 0.001);
  o = c * k * v_k * inside.x * inside.y;
}`;

type Program = { p: WebGLProgram; u: (name: string) => WebGLUniformLocation | null };

function glPrinter(canvas: HTMLCanvasElement, restored: () => void): Printer | null {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
  });
  if (!gl) return null;

  let dpr = 1;
  let ok = false;
  let ground: Program;
  let dot: Program;
  let photo: Program;
  let corners: WebGLBuffer;
  let inst: WebGLBuffer;
  let vao: WebGLVertexArrayObject;
  let data = new Float32Array(1 << 14);
  const pal = new Float32Array(PALETTE * 4);
  const photos = new Map<HTMLImageElement, { tex: WebGLTexture; w: number; h: number }>();
  const stage = document.createElement("canvas");

  const compile = (vs: string, fs: string): Program => {
    const p = gl.createProgram();
    for (const [type, src] of [
      [gl.VERTEX_SHADER, vs],
      [gl.FRAGMENT_SHADER, fs],
    ] as const) {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost())
        throw new Error(gl.getShaderInfoLog(s) ?? "shader");
      gl.attachShader(p, s);
      gl.deleteShader(s);
    }
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS) && !gl.isContextLost())
      throw new Error(gl.getProgramInfoLog(p) ?? "program");
    const at = new Map<string, WebGLUniformLocation | null>();
    return {
      p,
      u: (name) => {
        if (!at.has(name)) at.set(name, gl.getUniformLocation(p, name));
        return at.get(name)!;
      },
    };
  };

  const texture = () => {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  };

  const init = () => {
    ok = false;
    if (gl.isContextLost()) return;
    ground = compile(FULL, GROUND);
    dot = compile(DOT_V, DOT_F);
    photo = compile(DOT_V, PHOTO_F);
    corners = gl.createBuffer();
    inst = gl.createBuffer();
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, corners);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, inst);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, STRIDE * 4, 0);
    gl.vertexAttribDivisor(1, 1);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, STRIDE * 4, 16);
    gl.vertexAttribDivisor(2, 1);
    gl.bindVertexArray(null);
    photos.clear();
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    ok = true;
  };

  const frame = (pr: Program) => {
    gl.useProgram(pr.p);
    gl.uniform2f(pr.u("u_px"), canvas.width, canvas.height);
    gl.uniform1f(pr.u("u_dpr"), dpr);
  };

  const premul = (colour: string, alpha: number, into: Float32Array, at: number) => {
    const [r, g, b, a] = rgba(colour);
    const k = a * alpha;
    into[at] = r * k;
    into[at + 1] = g * k;
    into[at + 2] = b * k;
    into[at + 3] = k;
  };

  const draw = (n: number) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, inst);
    gl.bufferData(gl.ARRAY_BUFFER, data.subarray(0, n * STRIDE), gl.DYNAMIC_DRAW);
    frame(dot);
    gl.uniform4fv(dot.u("u_pal"), pal);
    gl.bindVertexArray(vao);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, n);
    gl.bindVertexArray(null);
  };

  const upload = (img: HTMLImageElement, source: TexImageSource, w: number, h: number) => {
    const tex = photos.get(img)?.tex ?? texture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    const shot = { tex, w, h };
    photos.delete(img);
    photos.set(img, shot);
    // Keep the outgoing plate, the shown one and the next.
    for (const [k, v] of photos) {
      if (photos.size <= 3) break;
      gl.deleteTexture(v.tex);
      photos.delete(k);
    }
    return shot;
  };

  const lost = (e: Event) => {
    e.preventDefault();
    ok = false;
  };
  const back = () => {
    try {
      init();
      restored();
    } catch {}
  };
  canvas.addEventListener("webglcontextlost", lost);
  canvas.addEventListener("webglcontextrestored", back);

  try {
    init();
  } catch {
    canvas.removeEventListener("webglcontextlost", lost);
    canvas.removeEventListener("webglcontextrestored", back);
    return null;
  }

  return {
    size(w, h, d) {
      dpr = d;
      fit(canvas, w, h, d);
    },

    clear() {
      if (!ok) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    },

    ground(ox, oy, cell, r, colour) {
      if (!ok) return;
      frame(ground);
      gl.uniform2f(ground.u("u_origin"), ox, oy);
      gl.uniform1f(ground.u("u_cell"), cell);
      gl.uniform1f(ground.u("u_r"), r * SQUARE);
      premul(colour, 1, pal, 0);
      gl.uniform4f(ground.u("u_ink"), pal[0], pal[1], pal[2], pal[3]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },

    dots(s, from, to, palette) {
      if (!ok) return;
      let n = 0;
      for (let slot = from; slot < to; slot++) n += s.held[slot];
      if (!n) return;
      if (data.length < n * STRIDE) data = new Float32Array(1 << Math.ceil(Math.log2(n * STRIDE)));
      let o = 0;
      for (let slot = from; slot < to; slot++) {
        const c = s.held[slot];
        if (!c) continue;
        const r = s.radius(slot) * SQUARE;
        const k = s.ink(slot);
        const base = slot * s.cap;
        for (let j = 0; j < c; j++) {
          data[o++] = s.x[base + j];
          data[o++] = s.y[base + j];
          data[o++] = r;
          data[o++] = k;
          data[o++] = s.turn[base + j];
        }
      }
      for (let i = 0; i < Math.min(PALETTE, palette.length); i++) premul(palette[i], 1, pal, i * 4);
      draw(n);
    },

    // Upload ahead of time, so a change of plate costs nothing.
    async prime(img, at, file) {
      const pw = Math.max(1, Math.ceil(at.w * dpr));
      const ph = Math.max(1, Math.ceil(at.h * dpr));
      const had = photos.get(img);
      if (!ok || (had && had.w === pw && had.h === ph)) return;
      const bmp = await scaled(file, pw, ph, "high");
      if (ok) upload(img, bmp, pw, ph);
      bmp.close();
    },

    photo(img, at, veil, lens) {
      if (!ok || !veil.n) return;
      const pw = Math.max(1, Math.ceil(at.w * dpr));
      const ph = Math.max(1, Math.ceil(at.h * dpr));
      let shot = photos.get(img);
      if (!shot || shot.w !== pw || shot.h !== ph) {
        stage.width = pw;
        stage.height = ph;
        stage.getContext("2d")?.drawImage(img, 0, 0, pw, ph);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        shot = upload(img, stage, pw, ph);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        stage.width = stage.height = 1;
      }
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, shot.tex);

      gl.bindBuffer(gl.ARRAY_BUFFER, inst);
      gl.bufferData(gl.ARRAY_BUFFER, veil.data.subarray(0, veil.n * STRIDE), gl.DYNAMIC_DRAW);
      frame(photo);
      gl.uniform4f(photo.u("u_rect"), at.x, at.y, at.w, at.h);
      gl.uniform4f(photo.u("u_lens"), lens.x, lens.y, lens.r, lens.power);
      gl.uniform1i(photo.u("u_img"), 0);
      gl.bindVertexArray(vao);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, veil.n);
      gl.bindVertexArray(null);
    },

    mark(x, y, r, colour, alpha) {
      if (!ok) return;
      data[0] = x;
      data[1] = y;
      data[2] = r;
      data[3] = 0;
      data[4] = 0;
      premul(colour, alpha, pal, 0);
      draw(1);
    },

    dispose() {
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", back);
      if (!ok) return;
      ok = false;
      for (const v of photos.values()) gl.deleteTexture(v.tex);
      photos.clear();
      gl.deleteBuffer(corners);
      gl.deleteBuffer(inst);
      gl.deleteVertexArray(vao);
      for (const pr of [ground, dot, photo]) gl.deleteProgram(pr.p);
    },
  };
}

function flatPrinter(canvas: HTMLCanvasElement): Printer | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  let W = 0;
  let H = 0;
  let dpr = 1;
  let pattern: CanvasPattern | null = null;
  let patternKey = "";
  let tile = 1;

  return {
    size(w, h, d) {
      W = w;
      H = h;
      dpr = d;
      fit(canvas, w, h, d);
    },

    clear() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
    },

    ground(ox, oy, cell, r, colour) {
      const key = `${colour}|${cell}|${r}|${dpr}`;
      if (key !== patternKey) {
        patternKey = key;
        const c = document.createElement("canvas");
        tile = c.width = c.height = Math.max(1, Math.round(cell * dpr));
        const g = c.getContext("2d");
        if (g) {
          const half = (r * SQUARE * tile) / cell;
          g.fillStyle = colour;
          g.fillRect(tile / 2 - half, tile / 2 - half, half * 2, half * 2);
        }
        pattern = g && ctx.createPattern(c, "repeat");
      }
      if (!pattern) return;
      pattern.setTransform(new DOMMatrix().translateSelf(ox - cell / 2, oy - cell / 2).scaleSelf(cell / tile));
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, W, H);
    },

    dots(s, from, to, palette) {
      for (let slot = from; slot < to; slot++) {
        const n = s.held[slot];
        if (!n) continue;
        const r = s.radius(slot);
        const base = slot * s.cap;
        ctx.fillStyle = palette[s.ink(slot)];
        ctx.beginPath();
        for (let k = 0; k < n; k++) square(ctx, s.x[base + k], s.y[base + k], r, s.turn[base + k]);
        ctx.fill();
      }
    },

    async prime() {},

    photo(img, at, veil) {
      if (!veil.n) return;
      let sum = 0;
      ctx.save();
      ctx.beginPath();
      for (let k = 0; k < veil.n; k++) {
        const o = k * STRIDE;
        sum += veil.data[o + 3];
        square(ctx, veil.data[o], veil.data[o + 1], veil.data[o + 2] / SQUARE, veil.data[o + 4]);
      }
      ctx.clip();
      ctx.globalAlpha = sum / veil.n;
      ctx.drawImage(img, at.x, at.y, at.w, at.h);
      ctx.restore();
    },

    mark(x, y, r, colour, alpha) {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = colour;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
      ctx.globalAlpha = 1;
    },

    dispose() {},
  };
}

export function vignette(y: number, [top, bottom]: Fade) {
  const t =
    top > 0 && y < top ? Math.max(0, y / top) : bottom < 1 && y > bottom ? Math.max(0, (1 - y) / (1 - bottom)) : 1;
  return t * t * (3 - 2 * t);
}

function fit(canvas: HTMLCanvasElement, w: number, h: number, dpr: number) {
  const cw = Math.round(w * dpr);
  const ch = Math.round(h * dpr);
  if (canvas.width !== cw || canvas.height !== ch) {
    canvas.width = cw;
    canvas.height = ch;
  }
}

const parsed = new Map<string, number[]>();
let probe: CanvasRenderingContext2D | null = null;

function rgba(colour: string) {
  let v = parsed.get(colour);
  if (v) return v;
  if (!probe) {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    probe = c.getContext("2d", { willReadFrequently: true });
  }
  if (!probe) return [0, 0, 0, 1];
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#000";
  probe.fillStyle = colour;
  probe.fillRect(0, 0, 1, 1);
  const d = probe.getImageData(0, 0, 1, 1).data;
  v = [d[0] / 255, d[1] / 255, d[2] / 255, d[3] / 255];
  parsed.set(colour, v);
  return v;
}
