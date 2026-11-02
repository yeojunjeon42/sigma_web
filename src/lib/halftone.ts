export const SCREEN = 7;

export const GROUND = 0.63;
export const DOT = 0.42;
export const GROUND_INK = "--color-rule-field";
// Marks are squares at the area of a round dot of the same radius, so tone holds.
export const SQUARE = 0.886;
// Persist the last hero index so the next visit starts with another build.
export const PLATE_KEY = "sigma_plate";

// Squares repeat where a picture is flat, so a flat panel must still vary. Two things vary it.
// Relief: how far a cell's tone follows its neighbourhood (radius in cells) over the whole picture.
const RELIEF = 0.7;
const RELIEF_R = 9;
// Turn: squares ease toward diamonds and back along one field across the page, this many px to a wave.
const TURN_SPAN = 150;
const TILE = 32;
const TILE_STEPS = 6;

let turns: Float32Array | null = null;

// Radians from 0 (square) to 45° (diamond) at a page position. A tile, so a frame can read it per mark.
export function turnAt(x: number, y: number) {
  if (!turns) {
    const n = TILE * TILE_STEPS;
    turns = new Float32Array(n * n);
    const hash = (i: number, j: number) => {
      const h = Math.sin(((i + TILE) % TILE) * 127.1 + ((j + TILE) % TILE) * 311.7) * 43758.5453;
      return h - Math.floor(h);
    };
    const ease = (v: number) => v * v * (3 - 2 * v);
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const fx = i / TILE_STEPS;
        const fy = j / TILE_STEPS;
        const x0 = Math.floor(fx);
        const y0 = Math.floor(fy);
        const u = ease(fx - x0);
        const v = ease(fy - y0);
        const a = hash(x0, y0) + (hash(x0 + 1, y0) - hash(x0, y0)) * u;
        const b = hash(x0, y0 + 1) + (hash(x0 + 1, y0 + 1) - hash(x0, y0 + 1)) * u;
        turns[j * n + i] = (Math.PI / 4) * ease(Math.min(1, Math.max(0, (a + (b - a) * v) * 2 - 0.5)));
      }
    }
  }
  const n = TILE * TILE_STEPS;
  const k = TILE_STEPS / TURN_SPAN;
  const i = ((Math.floor(x * k) % n) + n) % n;
  const j = ((Math.floor(y * k) % n) + n) % n;
  return turns[j * n + i];
}

// Pull out the shading already in a picture: each cell's lightness (0 dark, 1 paper) is compared with
// its neighbourhood, so a panel of nearly one tone prints as a surface. Cells off the object (solid
// under 0.5, when given) stay as they are and don't count.
export function relief(tone: Float32Array, cols: number, rows: number, solid?: Float32Array, amount = RELIEF) {
  const w = cols + 1;
  const sum = new Float64Array(w * (rows + 1));
  const sq = new Float64Array(w * (rows + 1));
  const num = new Float64Array(w * (rows + 1));
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const k = y * cols + x;
      const on = !solid || solid[k] > 0.5 ? 1 : 0;
      const t = (y + 1) * w + x + 1;
      const v = tone[k] * on;
      sum[t] = sum[t - w] + sum[t - 1] - sum[t - w - 1] + v;
      sq[t] = sq[t - w] + sq[t - 1] - sq[t - w - 1] + v * tone[k];
      num[t] = num[t - w] + num[t - 1] - num[t - w - 1] + on;
    }
  }
  const box = (a: Float64Array, x0: number, y0: number, x1: number, y1: number) =>
    a[y1 * w + x1] - a[y0 * w + x1] - a[y1 * w + x0] + a[y0 * w + x0];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const k = y * cols + x;
      if (solid && solid[k] <= 0.5) continue;
      const x0 = Math.max(0, x - RELIEF_R);
      const x1 = Math.min(cols, x + RELIEF_R + 1);
      const y0 = Math.max(0, y - RELIEF_R);
      const y1 = Math.min(rows, y + RELIEF_R + 1);
      const m = box(num, x0, y0, x1, y1);
      const mean = box(sum, x0, y0, x1, y1) / m;
      const sd = Math.sqrt(Math.max(0, box(sq, x0, y0, x1, y1) / m - mean * mean));
      const local = Math.min(1, Math.max(0, 0.5 + (tone[k] - mean) / (2.2 * sd + 0.05)));
      tone[k] += (local - tone[k]) * amount;
    }
  }
}

// Adds one mark to the current path. r is the radius of the round dot it stands in for.
// No closePath: fill and clip close each subpath anyway, and in Chrome it walks the whole path, so a
// plate's worth of marks took seconds a frame.
export function square(g: CanvasRenderingContext2D, x: number, y: number, r: number, turn: number) {
  const c = Math.cos(turn) * r * SQUARE;
  const s = Math.sin(turn) * r * SQUARE;
  g.moveTo(x - c + s, y - s - c);
  g.lineTo(x + c + s, y + s - c);
  g.lineTo(x + c - s, y + s + c);
  g.lineTo(x - c - s, y - s + c);
}

export function halftone(
  canvas: HTMLCanvasElement,
  paint: (g: CanvasRenderingContext2D, w: number, h: number) => void,
  cell: number,
  phase: [number, number] = [0, 0],
  ground = 0,
): boolean {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!w || !h) return false;
  const paper = cssVar("--color-canvas", "#e2e2e2");
  const ink = cssVar("--color-ink", "#0f0d09");
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const out = canvas.getContext("2d");
  if (!out) return false;
  out.scale(dpr, dpr);

  const ox = -(((phase[0] % cell) + cell) % cell);
  const oy = -(((phase[1] % cell) + cell) % cell);
  const cols = Math.ceil((w - ox) / cell);
  const rows = Math.ceil((h - oy) / cell);
  const src = document.createElement("canvas");
  src.width = cols * 3;
  src.height = rows * 3;
  const g = src.getContext("2d", { willReadFrequently: true });
  if (!g) return false;
  g.fillStyle = paper;
  g.fillRect(0, 0, src.width, src.height);
  const blank = g.getImageData(0, 0, 1, 1).data;
  const paperTone = (0.3 * blank[0] + 0.59 * blank[1] + 0.11 * blank[2]) / 255;
  g.save();
  g.translate((-ox / cell) * 3, (-oy / cell) * 3);
  paint(g, (w / cell) * 3, (h / cell) * 3);
  g.restore();
  let data: Uint8ClampedArray;
  try {
    data = g.getImageData(0, 0, src.width, src.height).data;
  } catch {
    return false;
  }

  const tone = new Float32Array(cols * rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let sum = 0;
      for (let yy = 0; yy < 3; yy++) {
        for (let xx = 0; xx < 3; xx++) {
          const k = ((y * 3 + yy) * src.width + (x * 3 + xx)) * 4;
          sum += 0.3 * data[k] + 0.59 * data[k + 1] + 0.11 * data[k + 2];
        }
      }
      tone[y * cols + x] = sum / 9 / 255;
    }
  }
  const sorted = Float32Array.from(tone).sort();
  const at = (q: number) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
  const lo = at(0.04);
  const hi = Math.max(lo + 0.08, at(0.96));
  const solid = Float32Array.from(tone, (v) => (Math.abs(v - paperTone) > 0.012 ? 1 : 0));
  for (let k = 0; k < tone.length; k++) tone[k] = Math.min(1, Math.max(0, (tone[k] - lo) / (hi - lo)));
  relief(tone, cols, rows, solid);

  out.fillStyle = paper;
  out.fillRect(0, 0, w, h);
  out.fillStyle = ink;
  out.beginPath();
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let level = 0.12 + 0.88 * tone[y * cols + x];
      if (ground) level = Math.min(level, ground);
      const r = (1 - level) * cell * DOT;
      if (r < 0.3) continue;
      const cx = ox + x * cell + cell / 2;
      const cy = oy + y * cell + cell / 2;
      square(out, cx, cy, r, turnAt(cx + phase[0], cy + phase[1]));
    }
  }
  out.fill();
  return true;
}

function cssVar(name: string, fallback: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}
