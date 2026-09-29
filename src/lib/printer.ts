// The halftone canvases (HeroPlate, FieldScreen) print through this: WebGL where the browser has
// it, canvas 2D otherwise. Dots arrive bucketed by slot, and both printers lay them down in slot
// order, so overlaps resolve the same way.

export type Box = { x: number; y: number; w: number; h: number };
export type Hole = { x: number; y: number; r: number } | null;
export type Fade = readonly [number, number];
export type Slots = {
  x: Float32Array;
  y: Float32Array;
  held: Int32Array;
  cap: number;
  radius: (slot: number) => number;
  ink: (slot: number) => number;
};

export interface Printer {
  size(w: number, h: number, dpr: number): void;
  clear(): void;
  ground(ox: number, oy: number, cell: number, r: number, colour: string, hole?: Hole, fade?: Fade): void;
  dots(s: Slots, from: number, to: number, palette: string[]): void;
  photo(img: HTMLImageElement, at: Box, mask: Float32Array, cols: number, rows: number, cell: number): void;
  circle(x: number, y: number, r: number, colour: string, alpha: number, stroke?: number): void;
  dispose(): void;
}

export function printer(canvas: HTMLCanvasElement, restored: () => void): Printer | null {
  return glPrinter(canvas, restored) ?? flatPrinter(canvas);
}

const PALETTE = 16;

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
uniform vec3 u_hole;
uniform vec2 u_fade;
out vec4 o;
void main() {
  vec2 p = vec2(gl_FragCoord.x, u_px.y - gl_FragCoord.y) / u_dpr;
  vec2 c = u_origin + floor((p - u_origin) / u_cell + 0.5) * u_cell;
  if (u_hole.z > 0.0 && distance(c, u_hole.xy) < u_hole.z) discard;
  float y = c.y * u_dpr / u_px.y;
  float t = 1.0;
  if (u_fade.x > 0.0 && y < u_fade.x) t = clamp(y / u_fade.x, 0.0, 1.0);
  else if (u_fade.y < 1.0 && y > u_fade.y) t = clamp((1.0 - y) / (1.0 - u_fade.y), 0.0, 1.0);
  float k = clamp((u_r * t * t * (3.0 - 2.0 * t) - distance(p, c)) * u_dpr + 0.5, 0.0, 1.0);
  if (k <= 0.0) discard;
  o = u_ink * k;
}`;

const DOT_V = `#version 300 es
layout(location = 0) in vec2 a_corner;
layout(location = 1) in vec4 a_dot;
uniform float u_stroke;
${CLIP}
out vec2 v_off;
flat out float v_r;
flat out float v_k;
void main() {
  float ext = a_dot.z + u_stroke * 0.5 + 1.0 / u_dpr;
  v_off = a_corner * ext;
  v_r = a_dot.z;
  v_k = a_dot.w;
  gl_Position = clip(a_dot.xy + v_off);
}`;

const DOT_F = `#version 300 es
precision highp float;
uniform vec4 u_pal[${PALETTE}];
uniform float u_dpr;
uniform float u_stroke;
in vec2 v_off;
flat in float v_r;
flat in float v_k;
out vec4 o;
void main() {
  float d = length(v_off);
  float e = u_stroke > 0.0 ? u_stroke * 0.5 - abs(d - v_r) : v_r - d;
  float k = clamp(e * u_dpr + 0.5, 0.0, 1.0);
  if (k <= 0.0) discard;
  o = u_pal[int(v_k + 0.5)] * k;
}`;

const PHOTO_V = `#version 300 es
uniform vec4 u_rect;
${CLIP}
out vec2 v_uv;
out vec2 v_p;
void main() {
  v_uv = vec2(float(gl_VertexID & 1), float((gl_VertexID >> 1) & 1));
  v_p = u_rect.xy + v_uv * u_rect.zw;
  gl_Position = clip(v_p);
}`;

const PHOTO_F = `#version 300 es
precision highp float;
uniform sampler2D u_img;
uniform sampler2D u_mask;
uniform vec2 u_grid;
in vec2 v_uv;
in vec2 v_p;
out vec4 o;
void main() {
  o = texture(u_img, v_uv) * texture(u_mask, v_p / u_grid).r;
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
  let maskTex: WebGLTexture;
  let maskKey = "";
  let bytes = new Uint8Array(0);
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
    photo = compile(PHOTO_V, PHOTO_F);
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
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(1, 1);
    gl.bindVertexArray(null);
    maskTex = texture();
    maskKey = "";
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

  const draw = (n: number, stroke: number) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, inst);
    gl.bufferData(gl.ARRAY_BUFFER, data.subarray(0, n * 4), gl.DYNAMIC_DRAW);
    frame(dot);
    gl.uniform1f(dot.u("u_stroke"), stroke);
    gl.uniform4fv(dot.u("u_pal"), pal);
    gl.bindVertexArray(vao);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, n);
    gl.bindVertexArray(null);
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

    ground(ox, oy, cell, r, colour, hole, fade = NONE) {
      if (!ok) return;
      frame(ground);
      gl.uniform2f(ground.u("u_origin"), ox, oy);
      gl.uniform1f(ground.u("u_cell"), cell);
      gl.uniform1f(ground.u("u_r"), r);
      premul(colour, 1, pal, 0);
      gl.uniform4f(ground.u("u_ink"), pal[0], pal[1], pal[2], pal[3]);
      gl.uniform3f(ground.u("u_hole"), hole?.x ?? 0, hole?.y ?? 0, hole?.r ?? 0);
      gl.uniform2f(ground.u("u_fade"), fade[0], fade[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },

    dots(s, from, to, palette) {
      if (!ok) return;
      let n = 0;
      for (let slot = from; slot < to; slot++) n += s.held[slot];
      if (!n) return;
      if (data.length < n * 4) data = new Float32Array(1 << Math.ceil(Math.log2(n * 4)));
      let o = 0;
      for (let slot = from; slot < to; slot++) {
        const c = s.held[slot];
        if (!c) continue;
        const r = s.radius(slot);
        const k = s.ink(slot);
        const base = slot * s.cap;
        for (let j = 0; j < c; j++) {
          data[o++] = s.x[base + j];
          data[o++] = s.y[base + j];
          data[o++] = r;
          data[o++] = k;
        }
      }
      for (let i = 0; i < Math.min(PALETTE, palette.length); i++) premul(palette[i], 1, pal, i * 4);
      draw(n, 0);
    },

    photo(img, at, mask, cols, rows, cell) {
      if (!ok) return;
      const pw = Math.max(1, Math.ceil(at.w * dpr));
      const ph = Math.max(1, Math.ceil(at.h * dpr));
      let shot = photos.get(img);
      if (!shot || shot.w !== pw || shot.h !== ph) {
        stage.width = pw;
        stage.height = ph;
        stage.getContext("2d")?.drawImage(img, 0, 0, pw, ph);
        const tex = shot?.tex ?? texture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, stage);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        stage.width = stage.height = 1;
        shot = { tex, w: pw, h: ph };
      }
      photos.delete(img);
      photos.set(img, shot);
      for (const [k, v] of photos) {
        if (photos.size <= 2) break;
        gl.deleteTexture(v.tex);
        photos.delete(k);
      }

      if (bytes.length !== cols * rows) bytes = new Uint8Array(cols * rows);
      for (let k = 0; k < bytes.length; k++) bytes[k] = mask[k] * 255;
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, maskTex);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      const key = `${cols}x${rows}`;
      if (key !== maskKey) {
        maskKey = key;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, cols, rows, 0, gl.RED, gl.UNSIGNED_BYTE, bytes);
      } else gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, cols, rows, gl.RED, gl.UNSIGNED_BYTE, bytes);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, shot.tex);

      frame(photo);
      gl.uniform4f(photo.u("u_rect"), at.x, at.y, at.w, at.h);
      gl.uniform2f(photo.u("u_grid"), cols * cell, rows * cell);
      gl.uniform1i(photo.u("u_img"), 0);
      gl.uniform1i(photo.u("u_mask"), 1);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },

    circle(x, y, r, colour, alpha, stroke = 0) {
      if (!ok) return;
      data[0] = x;
      data[1] = y;
      data[2] = r;
      data[3] = 0;
      premul(colour, alpha, pal, 0);
      draw(1, stroke);
    },

    dispose() {
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", back);
      if (!ok) return;
      ok = false;
      for (const v of photos.values()) gl.deleteTexture(v.tex);
      photos.clear();
      gl.deleteTexture(maskTex);
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
  const mc = document.createElement("canvas");
  const pc = document.createElement("canvas");
  const mctx = mc.getContext("2d");
  const pctx = pc.getContext("2d");
  let mask: ImageData | null = null;

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

    ground(ox, oy, cell, r, colour, hole, fade = NONE) {
      const key = `${colour}|${cell}|${r}|${dpr}`;
      if (key !== patternKey) {
        patternKey = key;
        const c = document.createElement("canvas");
        tile = c.width = c.height = Math.max(1, Math.round(cell * dpr));
        const g = c.getContext("2d");
        if (g) {
          g.fillStyle = colour;
          g.beginPath();
          g.arc(tile / 2, tile / 2, (r * tile) / cell, 0, Math.PI * 2);
          g.fill();
        }
        pattern = g && ctx.createPattern(c, "repeat");
      }
      if (!pattern) return;
      pattern.setTransform(new DOMMatrix().translateSelf(ox - cell / 2, oy - cell / 2).scaleSelf(cell / tile));
      ctx.save();
      if (hole) {
        const cut = new Path2D();
        cut.rect(0, 0, W, H);
        const ph = hole.r / cell;
        const j0 = Math.floor((hole.y - oy) / cell - ph);
        const j1 = Math.ceil((hole.y - oy) / cell + ph);
        for (let j = j0; j <= j1; j++) {
          const dy = oy + j * cell - hole.y;
          if (dy * dy >= hole.r * hole.r) continue;
          const w = Math.sqrt(hole.r * hole.r - dy * dy) / cell;
          const i0 = Math.floor((hole.x - ox) / cell - w) + 1;
          const i1 = Math.ceil((hole.x - ox) / cell + w) - 1;
          if (i1 >= i0) cut.rect(ox + (i0 - 0.5) * cell, oy + (j - 0.5) * cell, (i1 - i0 + 1) * cell, cell);
        }
        ctx.clip(cut, "evenodd");
      }
      const ja = Math.ceil((fade[0] * H - oy) / cell);
      const jb = Math.floor((fade[1] * H - oy) / cell);
      const band = new Path2D();
      band.rect(0, oy + (ja - 0.5) * cell, W, (jb - ja + 1) * cell);
      ctx.clip(band);
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      ctx.fillStyle = colour;
      ctx.beginPath();
      const i0 = Math.floor(-ox / cell);
      const i1 = Math.ceil((W - ox) / cell);
      for (let j = Math.floor(-oy / cell); j <= Math.ceil((H - oy) / cell); j++) {
        if (j >= ja && j <= jb) continue;
        const cy = oy + j * cell;
        const e = r * vignette(cy / H, fade);
        if (e < 0.05) continue;
        for (let i = i0; i <= i1; i++) {
          const cx = ox + i * cell;
          if (hole && Math.hypot(cx - hole.x, cy - hole.y) < hole.r) continue;
          ctx.moveTo(cx + e, cy);
          ctx.arc(cx, cy, e, 0, Math.PI * 2);
        }
      }
      ctx.fill();
    },

    dots(s, from, to, palette) {
      for (let slot = from; slot < to; slot++) {
        const n = s.held[slot];
        if (!n) continue;
        const r = s.radius(slot);
        const base = slot * s.cap;
        ctx.fillStyle = palette[s.ink(slot)];
        ctx.beginPath();
        for (let k = 0; k < n; k++) {
          const x = s.x[base + k];
          const y = s.y[base + k];
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    },

    photo(img, at, rev, cols, rows, cell) {
      if (!mctx || !pctx) return;
      if (!mask || mask.width !== cols || mask.height !== rows) {
        mc.width = cols;
        mc.height = rows;
        mask = mctx.createImageData(cols, rows);
      }
      for (let k = 0; k < rev.length; k++) mask.data[k * 4 + 3] = rev[k] * 255;
      mctx.putImageData(mask, 0, 0);
      const pw = Math.max(1, Math.ceil(at.w * dpr));
      const ph = Math.max(1, Math.ceil(at.h * dpr));
      if (pc.width !== pw || pc.height !== ph) {
        pc.width = pw;
        pc.height = ph;
      }
      pctx.globalCompositeOperation = "source-over";
      pctx.clearRect(0, 0, pw, ph);
      pctx.drawImage(mc, -at.x * dpr, -at.y * dpr, cols * cell * dpr, rows * cell * dpr);
      pctx.globalCompositeOperation = "source-in";
      pctx.drawImage(img, 0, 0, pw, ph);
      ctx.drawImage(pc, at.x, at.y, at.w, at.h);
    },

    circle(x, y, r, colour, alpha, stroke = 0) {
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      if (stroke) {
        ctx.strokeStyle = colour;
        ctx.lineWidth = stroke;
        ctx.stroke();
      } else {
        ctx.fillStyle = colour;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },

    dispose() {},
  };
}

const NONE: Fade = [0, 1];

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
