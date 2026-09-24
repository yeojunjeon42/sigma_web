"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { DOT, GROUND, GROUND_INK, SCREEN, groundPatch } from "@/lib/halftone";
import { FIELD_POINTER, WARM } from "./fieldPointer";

/**
 * The field, printed once.
 *
 * One screen in screen space, the way the effect is built everywhere it is built well: the
 * paper and the photographs are one surface printed through one lattice. A plate cannot have an
 * edge, because there is no second lattice for it to disagree with.
 *
 * Three things had to be true for this to work, and each was got wrong before:
 *
 * - **The dots belong to the sheet, not to a plate.** The lattice is fixed — the same grid the
 *   paper's own tile is laid on — and a build passing beneath it only makes the cells it covers
 *   heavier. Snapping each plate's own grid onto the paper's instead made the pattern jump a
 *   whole cell at a time as the planes moved.
 * - **A build has no edge, it has a falloff.** Its weight and its colour are carried back to
 *   bare paper across a few cells past the photograph, so the heavy pattern thins out instead of
 *   ending on a rectangle.
 * - **It must not re-measure while the page moves.** A plate's tones depend on its picture and
 *   its size, not on where it is, so they are measured once per size and read back by
 *   interpolation; re-measuring every plate every frame is what made scrolling crawl. It must
 *   also print in the same frame the plates move in — `DepthStage` calls here after it writes
 *   its transforms, so the dots are never a frame late.
 *
 * The plates stay in the DOM, invisible: they are the layout, the links, and the image source.
 * Their photographs fade in over the print on hover, in CSS, as the members page resolves.
 */

/**
 * How many dot sizes the print is quantised to. Cells are gathered by size and each size filled
 * as one path — measured at 1.3ms against 3.4ms for the same cells stamped one sprite at a time,
 * and it draws the *same* arc the paper's tile is drawn with, so the two cannot differ in weight
 * or in edge.
 */
const STEPS = 32;
/**
 * How many steps the print's colour is quantised to. Colour follows the *weight*: a cell printing
 * at the paper's own dot is the paper's grey, the club's red comes up through the midtones, and
 * the deepest shadows sit in the darker red — a duotone the way a spot colour is printed, not a
 * red rectangle laid over a photograph.
 */
const BANDS = 10;
/**
 * How far inside its photograph a build's print takes to come up to full weight, in px. The
 * falloff lives *inside* the rectangle, not past it: the print then has no edge to read, and it
 * never reaches past the photograph that fades in over it on hover.
 */
const FEATHER = SCREEN * 9;

type Plate = { el: HTMLElement; img: HTMLImageElement };
type Tones = { key: string; cols: number; rows: number; tone: Float32Array };

const cssVar = (n: string, f: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(n).trim() || f;

export default function FieldScreen({ edge }: { edge?: CSSProperties }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.closest<HTMLElement>("[data-depth]");
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let plates: Plate[] = [];
    const measured = new WeakMap<HTMLElement, Tones>();
    const max = SCREEN * DOT;
    // Cells waiting to be drawn, gathered by size. Kept between frames so a frame allocates
    // nothing.
    const SLOTS = STEPS * BANDS;
    let cap = 1 << 11;
    let bx = new Float32Array(SLOTS * cap);
    let by = new Float32Array(SLOTS * cap);
    const held = new Int32Array(SLOTS);
    let mixes: string[] = [];
    let mixKey = "";
    let ground: CanvasPattern | null = null;
    let groundKey = "";
    let raf = 0;
    let seen = false;
    let retry = 0;
    let last = 0;

    /**
     * Which plates there are to print. Cheap, and run every frame on purpose: a plate whose
     * `<img>` did not exist when this mounted would otherwise be left out of the print for the
     * life of the page.
     */
    const collect = () => {
      const links = host.querySelectorAll<HTMLElement>("[data-plate-link]");
      if (plates.length === links.length) return;
      const next: Plate[] = [];
      for (const el of links) {
        const img = el.querySelector("img");
        if (img) next.push({ el, img });
      }
      plates = next;
    };

    /** A plate's tones, in its own cells. Measured once per picture per size. */
    const measure = (el: HTMLElement, img: HTMLImageElement, w: number, h: number, paper: string) => {
      const cols = Math.max(1, Math.round(w / SCREEN));
      const rows = Math.max(1, Math.round(h / SCREEN));
      const key = `${img.currentSrc || img.src}|${cols}x${rows}`;
      const had = measured.get(el);
      if (had && had.key === key) return had;

      // A fresh surface each time: one shared canvas is tainted for good by a single
      // cross-origin picture, and every plate measured after it reads back nothing.
      const src = document.createElement("canvas");
      src.width = cols * 2;
      src.height = rows * 2;
      const sg = src.getContext("2d", { willReadFrequently: true });
      if (!sg) return null;
      sg.fillStyle = paper;
      sg.fillRect(0, 0, src.width, src.height);
      sg.drawImage(img, 0, 0, src.width, src.height);
      let data: Uint8ClampedArray;
      try {
        data = sg.getImageData(0, 0, src.width, src.height).data;
      } catch {
        return null;
      }

      const tone = new Float32Array(cols * rows);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let sum = 0;
          for (let yy = 0; yy < 2; yy++) {
            for (let xx = 0; xx < 2; xx++) {
              const p = ((y * 2 + yy) * src.width + (x * 2 + xx)) * 4;
              sum += 0.3 * data[p] + 0.59 * data[p + 1] + 0.11 * data[p + 2];
            }
          }
          tone[y * cols + x] = sum / 4 / 255;
        }
      }

      // Each picture levelled on its own, as the members page levels each portrait: a drawing
      // on white would otherwise print as bare paper, a photograph shot against a grey wall as
      // a block of ink.
      const sorted = Float32Array.from(tone).sort();
      const pick = (q: number) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
      const lo = pick(0.04);
      const top = pick(0.96);
      // `complete` can be true before the bitmap is drawable, and the surface is then still the
      // paper we filled it with. Caching that would print the plate blank for good.
      if (top - lo < 0.02) return null;
      const hi = Math.max(lo + 0.06, top);
      for (let i = 0; i < tone.length; i++) {
        tone[i] = Math.min(1, Math.max(0, (tone[i] - lo) / (hi - lo)));
      }

      const out = { key, cols, rows, tone };
      measured.set(el, out);
      return out;
    };

    const draw = () => {
      raf = 0;
      // Scroll and `DepthStage` can both ask within one frame; printing twice buys nothing.
      const t = performance.now();
      if (t - last < 8) return;
      last = t;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;

      // The canvas is carried to the viewport by hand, in this frame, together with what is
      // printed on it. Under `position: sticky` the browser moves it on its own schedule while
      // the print is made on ours, and a scroll pulled the two apart — the pattern stretched
      // down the page behind each photograph.
      const sheet = host.getBoundingClientRect();
      const y = Math.min(Math.max(-sheet.top, 0), Math.max(0, sheet.height - h));
      canvas.style.transform = `translate3d(0,${y.toFixed(2)}px,0)`;
      // Where the canvas now is, in the viewport. Read from the sheet rather than measured back
      // off the canvas: the transform above has not been laid out yet.
      const fx = sheet.left;
      const fy = sheet.top + y;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const paper = cssVar("--color-canvas", "#e2e2e2");
      const base = cssVar(GROUND_INK, "#76767a");
      if (groundKey !== base + dpr) {
        const patch = groundPatch(SCREEN, GROUND, dpr, GROUND_INK);
        ground = patch && ctx.createPattern(patch, "repeat");
        groundKey = base + dpr;
      }
      const accent = cssVar("--color-accent", "#ed2024");
      const deep = cssVar("--color-accent-deep", "#8e1316");
      if (mixKey !== base + accent + deep) {
        mixKey = base + accent + deep;
        mixes = ramp([base, accent, deep], BANDS);
      }
      held.fill(0);
      // At or under the paper's weight the field's own background prints the cell already.
      const floor = Math.round((1 - GROUND) * STEPS);

      collect();
      // The lattice belongs to the sheet, not to any plate: one grid of fixed cells, the same
      // grid the paper's tile is laid on. A build passing under it never moves a dot — it only
      // makes the dots it covers heavier. That is why nothing steps or slides as the planes move.
      const gx = sheet.left - fx + SCREEN / 2;
      const gy = sheet.top - fy + SCREEN / 2;

      // Bare paper, laid down first and in one fill: the same cell the builds are printed
      // through, repeated from the sheet's own origin, so every dot on the page — ground and
      // build alike — comes off this one canvas through this one lattice.
      if (ground) {
        // The tile carries its dot at its own centre, so the pattern's origin is the cell's
        // corner — `gx`/`gy` less the half cell that puts a plate's dot in the middle of it.
        // Translating by the cell centre instead laid the paper's lattice half a cell off the
        // builds', and every plate printed through two grids at once.
        ground.setTransform(
          new DOMMatrix()
            .translateSelf(gx - SCREEN / 2, gy - SCREEN / 2)
            .scaleSelf(1 / dpr, 1 / dpr),
        );
        ctx.fillStyle = ground;
        ctx.fillRect(0, 0, w, h);
      }

      let pending = false;
      let grew = false;

      const pk = FIELD_POINTER.k;
      const warmth = (x: number, y: number) => {
        if (pk <= 0) return 0;
        const d = Math.hypot(x - FIELD_POINTER.x, y - FIELD_POINTER.y);
        return d < WARM ? pk * (1 - d / WARM) ** 2 : 0;
      };

      // Bare paper warms too: the cells round the pointer print a shade heavier and redder,
      // whether or not a build lies there (a build's own dots are drawn over them).
      if (pk > 0) {
        const cx = FIELD_POINTER.x - fx;
        const cy = FIELD_POINTER.y - fy;
        const i0 = Math.ceil((cx - WARM - gx) / SCREEN);
        const i1 = Math.floor((cx + WARM - gx) / SCREEN);
        const j0 = Math.ceil((cy - WARM - gy) / SCREEN);
        const j1 = Math.floor((cy + WARM - gy) / SCREEN);
        for (let j = j0; j <= j1; j++) {
          const py = gy + j * SCREEN;
          if (py < -SCREEN || py > h + SCREEN) continue;
          for (let i = i0; i <= i1; i++) {
            const px = gx + i * SCREEN;
            const near = warmth(px + fx, py + fy);
            if (near < 0.04) continue;
            const level = GROUND * (1 - near * 0.16);
            const step = Math.max(floor - 1, Math.min(STEPS - 1, Math.round((1 - level) * STEPS) - 1));
            const slot = Math.min(BANDS - 1, Math.round(near * 0.55 * (BANDS - 1))) * STEPS + step;
            const n = held[slot];
            if (n < cap) {
              bx[slot * cap + n] = px;
              by[slot * cap + n] = py;
              held[slot] = n + 1;
            } else grew = true;
          }
        }
      }

      for (const { el, img } of plates) {
        const r = el.getBoundingClientRect();
        if (r.bottom < fy - 20 || r.top > fy + h + 20) continue;
        if (!img.complete || !img.naturalWidth) {
          pending = true;
          continue;
        }

        const box = img.getBoundingClientRect();
        const grid = measure(el, img, box.width, box.height, paper);
        if (!grid) {
          pending = true;
          continue;
        }

        const bl = box.left - fx;
        const bt = box.top - fy;
        const br = bl + box.width;
        const bb = bt + box.height;
        const sx = grid.cols / box.width;
        const sy = grid.rows / box.height;

        // Every cell the picture covers, and no more.
        const i0 = Math.ceil((Math.max(bl, -SCREEN) - gx) / SCREEN);
        const i1 = Math.floor((Math.min(br, w + SCREEN) - gx) / SCREEN);
        const j0 = Math.ceil((Math.max(bt, -SCREEN) - gy) / SCREEN);
        const j1 = Math.floor((Math.min(bb, h + SCREEN) - gy) / SCREEN);

        for (let j = j0; j <= j1; j++) {
          const py = gy + j * SCREEN;
          // Distance into the picture, so the print can thin out over the edge instead of
          // stopping at it.
          const dy = Math.min(py - bt, bb - py);
          const v = clamp((py - bt) * sy - 0.5, 0, grid.rows - 1);
          const v0 = Math.floor(v);
          const v1 = Math.min(grid.rows - 1, v0 + 1);
          const vf = v - v0;
          for (let i = i0; i <= i1; i++) {
            const px = gx + i * SCREEN;
            const m = mask(Math.min(dy, Math.min(px - bl, br - px)));
            if (m <= 0) continue;

            // The tone is read off the picture where the cell *is*, not off a cell of the
            // picture's own: as the plate slides the reading changes by a hair each frame, so a
            // dot grows and shrinks smoothly rather than jumping a size.
            const u = clamp((px - bl) * sx - 0.5, 0, grid.cols - 1);
            const u0 = Math.floor(u);
            const u1 = Math.min(grid.cols - 1, u0 + 1);
            const uf = u - u0;
            const a = grid.tone[v0 * grid.cols + u0];
            const b = grid.tone[v0 * grid.cols + u1];
            const c = grid.tone[v1 * grid.cols + u0];
            const d = grid.tone[v1 * grid.cols + u1];
            const tone = (a + (b - a) * uf) * (1 - vf) + (c + (d - c) * uf) * vf;

            // The picture's lightest tone lands exactly on the paper's weight and its darkest on
            // full ink, so a build rises out of the ground instead of sitting on it; the taper
            // carries both the weight and the colour back to bare paper.
            const near = warmth(px + fx, py + fy);
            const lit = Math.max(0, 1 - (1 - tone) * m - near * 0.1 * m);
            const level = GROUND * (0.12 + 0.88 * lit);
            const step = Math.min(STEPS - 1, Math.round((1 - level) * STEPS) - 1);
            if (step < floor) continue;
            const slot =
              Math.min(BANDS - 1, Math.round(((1 - lit) * m + near * 0.35 * m) * (BANDS - 1))) * STEPS + step;
            const n = held[slot];
            if (n < cap) {
              bx[slot * cap + n] = px;
              by[slot * cap + n] = py;
              held[slot] = n + 1;
            } else grew = true;
          }
        }
      }

      // One path per colour and size. `moveTo` before each arc keeps the discs from being strung
      // together by the line the path would otherwise carry between them.
      for (let slot = 0; slot < SLOTS; slot++) {
        const n = held[slot];
        if (!n) continue;
        const r = (max * ((slot % STEPS) + 1)) / STEPS;
        const base = slot * cap;
        ctx.fillStyle = mixes[Math.floor(slot / STEPS)];
        ctx.beginPath();
        for (let k = 0; k < n; k++) {
          const x = bx[base + k];
          const y = by[base + k];
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      // A window wide enough to hold more cells than the buffers do: widen them and print again.
      if (grew) {
        cap *= 2;
        bx = new Float32Array(SLOTS * cap);
        by = new Float32Array(SLOTS * cap);
        pending = true;
      }

      if (pending) {
        window.clearTimeout(retry);
        retry = window.setTimeout(kick, 120);
      }
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    /** `DepthStage` calls this straight after it writes the planes' transforms. */
    const now = () => draw();

    const onScroll = () => {
      if (seen) kick();
    };
    const onLoad = (e: Event) => {
      if ((e.target as HTMLElement).tagName === "IMG") kick();
    };

    const io = new IntersectionObserver(
      ([e]) => {
        seen = e.isIntersecting;
        if (seen) kick();
      },
      { rootMargin: "200px" },
    );
    const ro = new ResizeObserver(kick);

    // The server's stand-in gradient goes the moment this canvas can print the same dot itself.
    const paper = host.querySelector<HTMLElement>("[data-ground]");
    if (paper) paper.style.backgroundImage = "none";

    io.observe(host);
    ro.observe(host);
    kick();
    // The field settles over the first second — fonts land, pictures decode, the planes take
    // their first step — and a plate measured mid-settle prints wrong.
    const settle = [120, 400, 900, 1800].map((t) => window.setTimeout(kick, t));

    window.addEventListener("scroll", onScroll, { passive: true });
    host.addEventListener("load", onLoad, true);
    host.addEventListener("field:moved", now);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(retry);
      settle.forEach(window.clearTimeout);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      host.removeEventListener("load", onLoad, true);
      host.removeEventListener("field:moved", now);
    };
  }, []);

  // The wrapper is absolute, so the screen costs the field no height; the canvas is one viewport
  // tall and carried down the sheet by `draw`, in the same frame as the print, so the two can
  // never disagree. It sits on the paper's own dots and below the plates, whose photographs
  // fade in over it.
  return (
    <div aria-hidden="true" style={edge} className="pointer-events-none absolute inset-0 z-[2]">
      <canvas ref={ref} className="absolute inset-x-0 top-0 h-svh w-full" />
    </div>
  );
}

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

/**
 * How much of a build a cell carries, by how deep inside the photograph it sits: 0 at the edge,
 * 1 a feather's width in, smoothstepped between. The heavy pattern gathers towards the middle of
 * a plate and thins back to bare paper before it reaches the rim, so there is no rectangle to
 * see and nothing printed outside the photograph.
 */
function mask(depth: number) {
  const t = clamp(depth / FEATHER, 0, 1);
  return t * t * (3 - 2 * t);
}

/** `n` colours along a ramp through `stops`. */
function ramp(stops: string[], n: number) {
  const rgbs = stops.map(rgb);
  return Array.from({ length: n }, (_, i) => {
    const t = (i / (n - 1)) * (rgbs.length - 1);
    const a = Math.min(rgbs.length - 2, Math.floor(t));
    const f = t - a;
    const c = rgbs[a].map((v, k) => Math.round(v + (rgbs[a + 1][k] - v) * f));
    return `rgb(${c[0]} ${c[1]} ${c[2]})`;
  });
}

function rgb(value: string): number[] {
  const hex = value.trim();
  if (hex.startsWith("#")) {
    const n = hex.length === 4 ? [1, 2, 3].map((i) => hex[i] + hex[i]) : [1, 3, 5].map((i) => hex.slice(i, i + 2));
    return n.map((h) => Number.parseInt(h, 16));
  }
  const m = hex.match(/-?[\d.]+/g);
  return m ? m.slice(0, 3).map(Number) : [0, 0, 0];
}
