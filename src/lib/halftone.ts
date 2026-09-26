export const SCREEN = 7;

export const GROUND = 0.63;
export const DOT = 0.42;
export const GROUND_INK = "--color-rule-field";
export const GROUND_DOT = (1 - GROUND) * SCREEN * DOT;

export function groundPatch(cell: number, ground: number, dpr: number, colour = GROUND_INK) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(cell * dpr));
  c.height = c.width;
  const g = c.getContext("2d");
  if (!g) return null;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.fillStyle = cssVar(colour, "#76767a");
  g.beginPath();
  g.arc(cell / 2, cell / 2, (1 - ground) * cell * DOT, 0, Math.PI * 2);
  g.fill();
  return c;
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
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
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

  out.fillStyle = paper;
  out.fillRect(0, 0, w, h);
  out.fillStyle = ink;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let level = 0.12 + 0.88 * Math.min(1, Math.max(0, (tone[y * cols + x] - lo) / (hi - lo)));
      if (ground) level = Math.min(level, ground);
      const r = (1 - level) * cell * DOT;
      if (r < 0.3) continue;
      out.beginPath();
      out.arc(ox + x * cell + cell / 2, oy + y * cell + cell / 2, r, 0, Math.PI * 2);
      out.fill();
    }
  }
  return true;
}

function cssVar(name: string, fallback: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}
