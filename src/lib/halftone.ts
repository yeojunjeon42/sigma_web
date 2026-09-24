/**
 * The pitch of the site's halftone, in CSS px. `FieldScreen` prints the whole of /archive on it
 * in one pass — the paper and the photographs together, so the field has one lattice and a
 * plate has no edge.
 */
export const SCREEN = 7;

/**
 * The tone bare paper prints at on /archive, and the radius that tone draws. `GROUND_DOT` is
 * only the server's stand-in, drawn as a CSS gradient until the script lands and the canvas
 * takes the whole screen over. It lives here rather than in the component because a server
 * component cannot read a constant out of a `"use client"` module.
 */
export const GROUND = 0.63;
/**
 * The darkest dot, as a fraction of the pitch. Short of the half that would make neighbours
 * touch, so paper shows between the dots at every weight and a shadow prints as a screen rather
 * than as a blot.
 */
export const DOT = 0.42;
/**
 * The paper's own dot is grey, not ink. A build's dots grow out of it into the club's red, so a
 * plate resolves out of the ground as one rising tone — with ink underneath, the first cells past
 * bare paper printed black and a build was approached through a dirty shadow.
 */
export const GROUND_INK = "--color-rule-field";
export const GROUND_DOT = (1 - GROUND) * SCREEN * DOT;

/**
 * One cell of bare paper, drawn by the same `arc()` a plate's dots are drawn with. `FieldScreen`
 * fills the whole field with this as a repeating pattern before it prints the builds, on the same
 * canvas and the same lattice — so paper and photograph are one screen with one rasteriser, not
 * two layers that can disagree.
 */
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

/**
 * Dots on a square lattice, each as large as its patch of the source is dark — the site's own
 * screen. The members page prints every portrait with it, and /archive prints every build.
 *
 * `paint` draws the source into a small offscreen canvas at three samples per cell; the tones
 * are then levelled per picture, so a portrait shot against a grey wall doesn't come out as a
 * solid block of ink. Returns false when there is nothing to draw on yet.
 */
export function halftone(
  canvas: HTMLCanvasElement,
  paint: (g: CanvasRenderingContext2D, w: number, h: number) => void,
  cell: number,
  /**
   * Where this canvas sits on the page, in px. The lattice is shifted onto the page's own grid,
   * so a plate's dots line up with the dots printed on the paper around it and the field reads
   * as one screen rather than a scatter of separately-screened rectangles.
   */
  phase: [number, number] = [0, 0],
  /**
   * The tone the paper around this canvas is printed at. The picture's lightest cells are held
   * to exactly that weight, so the screen inside the canvas and the screen outside it are the
   * same screen — without it a light photograph prints no dot where the paper prints one, and
   * the plate shows its rectangle. 0 leaves the picture to fade out to nothing, which is right
   * for a print that stands on its own, like a portrait on the members page.
   */
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

  // A cell of slack each way, so shifting onto the page's grid never leaves a bare strip.
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
      // Lifted a little and with the dot capped short of its cell, so even the darkest
      // ground keeps paper showing between the dots.
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

/** An image drawn to cover a box, the way `object-fit: cover` would, at `object-position`. */
export function coverInto(
  g: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  position = "50% 50%",
) {
  const [fx, fy] = parsePosition(position);
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * s;
  const dh = img.naturalHeight * s;
  g.drawImage(img, (w - dw) * fx, (h - dh) * fy, dw, dh);
}

function parsePosition(value: string): [number, number] {
  const parts = value.trim().split(/\s+/);
  const one = (raw: string | undefined, fallback: number) => {
    if (!raw) return fallback;
    if (raw === "left" || raw === "top") return 0;
    if (raw === "right" || raw === "bottom") return 1;
    if (raw === "center") return 0.5;
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? Math.min(1, Math.max(0, n / 100)) : fallback;
  };
  return [one(parts[0], 0.5), one(parts[1], 0.5)];
}
