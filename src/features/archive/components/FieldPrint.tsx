"use client";

import { useEffect, useRef } from "react";
import { SQUARE, relief, turnAt } from "@/lib/halftone";
import { useMedia } from "@/lib/media";
import { flatPrinter, type Printer, type Slots } from "@/lib/printer";
import { FIELD_CELL } from "../data/field";

const STEPS = 32;
const BANDS = 10;
const SLOTS = STEPS * BANDS;
// At full tone a mark covers this share of its cell's width.
const FULL = 0.94;
// The ink's lightest tone; the darker two are the accent tokens.
const LIGHT = "#ea5a5f";
const NEAR = "700px 0px";

// A plate's marks, worked out once. Hover fades the cached print and DOM image through CSS.
type Cells = {
  // The lattice over the picture, as its first index, its size, and its offset from the field.
  i0: number;
  j0: number;
  cols: number;
  rows: number;
  ox: number;
  oy: number;
  // Per cell: the mark's turn, its size at rest (0 for none) and its ink.
  turn: Float32Array;
  size: Float32Array;
  band: Uint8Array;
};
type Plate = {
  link: HTMLElement;
  art: HTMLElement;
  img: HTMLImageElement;
  canvas: HTMLCanvasElement;
  pr: Printer;
  cells: Cells | null;
  printed: boolean;
};

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const smooth = (v: number) => {
  const t = clamp(v, 0, 1);
  return t * t * (3 - 2 * t);
};
const cssVar = (n: string, f: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(n).trim() || f;

// Plates print once; the browser composites their hover fade without a per-frame drawing loop.
export default function FieldPrint() {
  const ref = useRef<HTMLSpanElement>(null);
  // No canvases are filled for the phone tree.
  const wide = useMedia("(min-width: 64rem)", false);

  useEffect(() => {
    const host = ref.current?.closest<HTMLElement>("[data-field]");
    if (!host || !wide) return;
    // A half-pixel lattice beats against the pixels of a 1x screen.
    const CELL = (window.devicePixelRatio || 1) >= 2 ? FIELD_CELL : Math.ceil(FIELD_CELL);
    const RADIUS = ((CELL / 2) * FULL) / SQUARE;
    const ink = ramp([LIGHT, cssVar("--color-accent", "#ed2024"), cssVar("--color-accent-deep", "#8e1316")], BANDS);

    const slots: Slots = {
      x: new Float32Array(SLOTS << 11),
      y: new Float32Array(SLOTS << 11),
      turn: new Float32Array(SLOTS << 11),
      held: new Int32Array(SLOTS),
      cap: 1 << 11,
      radius: (slot) => (RADIUS * ((slot % STEPS) + 1)) / STEPS,
      ink: (slot) => Math.floor(slot / STEPS),
    };

    const plates = new Map<HTMLElement, Plate>();
    for (const link of host.querySelectorAll<HTMLElement>("[data-plate-link]")) {
      const art = link.firstElementChild;
      const img = link.querySelector("img");
      const canvas = link.querySelector("canvas");
      const pr = canvas && flatPrinter(canvas);
      if (!(art instanceof HTMLElement) || !img || !canvas || !pr) continue;
      plates.set(link, { link, art, img, canvas, pr, cells: null, printed: false });
    }

    const measure = (img: HTMLImageElement, w: number, h: number) => {
      const cols = Math.max(1, Math.round(w / CELL));
      const rows = Math.max(1, Math.round(h / CELL));

      const src = document.createElement("canvas");
      src.width = cols * 2;
      src.height = rows * 2;
      const g = src.getContext("2d", { willReadFrequently: true });
      if (!g) return null;
      const at = cover(img, { x: 0, y: 0, w: src.width, h: src.height });
      g.drawImage(img, at.x, at.y, at.w, at.h);
      let data: Uint8ClampedArray;
      try {
        data = g.getImageData(0, 0, src.width, src.height).data;
      } catch {
        return null;
      }

      const lum = new Float32Array(cols * rows);
      const solid = new Float32Array(cols * rows);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let sum = 0;
          let al = 0;
          for (let yy = 0; yy < 2; yy++) {
            for (let xx = 0; xx < 2; xx++) {
              const o = ((y * 2 + yy) * src.width + (x * 2 + xx)) * 4;
              const k = data[o + 3] / 255;
              sum += (k * (0.3 * data[o] + 0.59 * data[o + 1] + 0.11 * data[o + 2])) / 255;
              al += k;
            }
          }
          lum[y * cols + x] = al ? sum / al : 1;
          solid[y * cols + x] = al / 4;
        }
      }

      // Levels come from the object alone, and even its whitest part keeps a little ink.
      const sorted = Float32Array.from(lum.filter((_, i) => solid[i] > 0.45)).sort();
      if (!sorted.length) return null;
      const pick = (q: number) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
      const lo = pick(0.04);
      const hi = Math.max(lo + 0.08, pick(0.96));
      const light = new Float32Array(cols * rows).fill(1);
      for (let i = 0; i < light.length; i++) {
        if (solid[i] > 0.05) light[i] = 1 - (0.1 + 0.9 * (1 - clamp((lum[i] - lo) / (hi - lo), 0, 1)) ** 1.2);
      }
      relief(light, cols, rows, solid);
      return { cols, rows, dark: light.map((v) => 1 - v), solid };
    };

    const bake = (p: Plate) => {
      const r = p.canvas.getBoundingClientRect();
      const b = p.img.getBoundingClientRect();
      const tones = measure(p.img, b.width, b.height);
      if (!tones) return null;
      const { cols: tc, rows: tr, dark, solid } = tones;

      // One screen across the whole field: every plate's dots sit on the same lattice.
      const origin = host.getBoundingClientRect();
      const ox = r.left - origin.left;
      const oy = r.top - origin.top;
      const box = { x: b.left - r.left, y: b.top - r.top, w: b.width, h: b.height };
      const sx = tc / b.width;
      const sy = tr / b.height;
      const i0 = Math.ceil((box.x + ox) / CELL - 0.5);
      const j0 = Math.ceil((box.y + oy) / CELL - 0.5);
      const cols = Math.max(0, Math.floor((box.x + b.width + ox) / CELL - 0.5) - i0 + 1);
      const rows = Math.max(0, Math.floor((box.y + b.height + oy) / CELL - 0.5) - j0 + 1);
      const turn = new Float32Array(cols * rows);
      const size = new Float32Array(cols * rows);
      const band = new Uint8Array(cols * rows);

      for (let j = 0; j < rows; j++) {
        const v = clamp(((j + j0 + 0.5) * CELL - oy - box.y) * sy - 0.5, 0, tr - 1);
        const v0 = Math.floor(v);
        const v1 = Math.min(tr - 1, v0 + 1);
        const vf = v - v0;
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          turn[k] = turnAt((i + i0) * CELL, (j + j0) * CELL);
          const u = clamp(((i + i0 + 0.5) * CELL - ox - box.x) * sx - 0.5, 0, tc - 1);
          const u0 = Math.floor(u);
          const u1 = Math.min(tc - 1, u0 + 1);
          const uf = u - u0;
          const a = v0 * tc + u0;
          const c = v0 * tc + u1;
          const d = v1 * tc + u0;
          const e = v1 * tc + u1;
          if (mix(solid, a, c, d, e, uf, vf) <= 0.45) continue;
          const tone = mix(dark, a, c, d, e, uf, vf);
          size[k] = Math.sqrt(tone) * smooth((tone - 0.02) / 0.1);
          band[k] = Math.min(BANDS - 1, Math.round(tone * (BANDS - 1)));
        }
      }
      p.cells = { i0, j0, cols, rows, ox, oy, turn, size, band };
      return p.cells;
    };

    const paint = (p: Plate): boolean => {
      const { img, canvas, pr } = p;
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      if (!W || !H || !img.complete || !img.naturalWidth) return false;
      pr.size(W, H, Math.min(window.devicePixelRatio || 1, 2));
      pr.clear();

      const cells = p.cells ?? bake(p);
      if (!cells) return false;
      const { i0, j0, cols, rows, ox, oy, turn, size, band } = cells;
      slots.held.fill(0);
      for (let j = 0, k = 0; j < rows; j++) {
        const py = (j + j0 + 0.5) * CELL - oy;
        for (let i = 0; i < cols; i++, k++) {
          const px = (i + i0 + 0.5) * CELL - ox;
          const step = Math.min(STEPS - 1, Math.round(size[k] * STEPS) - 1);
          if (step < 0) continue;
          const slot = band[k] * STEPS + step;
          const n = slots.held[slot];
          if (n >= slots.cap) {
            grow();
            return paint(p);
          }
          const o = slot * slots.cap + n;
          slots.x[o] = px;
          slots.y[o] = py;
          slots.turn[o] = turn[k];
          slots.held[slot] = n + 1;
        }
      }

      pr.dots(slots, 0, SLOTS, ink);
      return true;
    };

    const grow = () => {
      slots.cap *= 2;
      slots.x = new Float32Array(SLOTS * slots.cap);
      slots.y = new Float32Array(SLOTS * slots.cap);
      slots.turn = new Float32Array(SLOTS * slots.cap);
    };

    // At most one step of one plate a frame, nearest the screen first: its marks, then its print.
    const near = new Set<Plate>();
    const queue = new Set<Plate>();
    let pumping = 0;
    const pump = () => {
      pumping = 0;
      let next: Plate | undefined;
      let best = Infinity;
      for (const p of queue) {
        const r = p.link.getBoundingClientRect();
        const away = Math.max(r.top - window.innerHeight, -r.bottom);
        if (away < best) {
          best = away;
          next = p;
        }
      }
      if (!next) return;
      if (next.cells || !bake(next)) {
        next.printed = paint(next);
        queue.delete(next);
      }
      if (queue.size) pumping = requestAnimationFrame(pump);
    };
    const print = (p: Plate) => {
      if (p.printed || !p.img.complete || !p.img.naturalWidth) return;
      // Decoded off the main thread, or the first read of its pixels would do it here.
      const ready = p.cells ? Promise.resolve() : p.img.decode().catch(() => {});
      void ready.then(() => {
        if (p.printed || !near.has(p)) return;
        queue.add(p);
        pumping ||= requestAnimationFrame(pump);
      });
    };

    const plateOf = (t: EventTarget | null) => {
      const link = (t as HTMLElement | null)?.closest?.<HTMLElement>("[data-plate-link]");
      return link ? plates.get(link) : undefined;
    };

    const release = (p: Plate) => {
      p.art.style.transition = p.art.style.opacity = "";
      p.canvas.style.transition = p.canvas.style.opacity = "";
    };
    const press = (p: Plate) => {
      // The reel transition snapshots the link. Show its colour image immediately on activation.
      p.art.style.transition = p.canvas.style.transition = "none";
      p.art.style.opacity = "1";
      p.canvas.style.opacity = "0";
    };
    const onPress = (e: PointerEvent) => {
      const p = plateOf(e.target);
      if (p && e.button === 0) press(p);
    };
    const onKey = (e: KeyboardEvent) => {
      const p = plateOf(e.target);
      if (p && e.key === "Enter") press(p);
    };
    const onOut = (e: PointerEvent) => {
      const p = plateOf(e.target);
      if (p && plateOf(e.relatedTarget) !== p) release(p);
    };
    const onBlur = (e: FocusEvent) => {
      const p = plateOf(e.target);
      if (p) release(p);
    };
    const onCancel = (e: PointerEvent) => {
      const p = plateOf(e.target);
      if (p) release(p);
    };
    const onLoad = (e: Event) => {
      const p = (e.target as HTMLElement).tagName === "IMG" ? plateOf(e.target) : undefined;
      if (!p) return;
      p.cells = null;
      p.printed = false;
      if (near.has(p)) print(p);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const p = plates.get(e.target as HTMLElement);
          if (!p) continue;
          if (e.isIntersecting) {
            near.add(p);
            print(p);
          } else {
            // Far away a plate gives its memory back, and prints again from its kept tones.
            near.delete(p);
            queue.delete(p);
            p.canvas.width = p.canvas.height = 0;
            p.printed = false;
          }
        }
      },
      { rootMargin: NEAR },
    );
    let width = host.clientWidth;
    const ro = new ResizeObserver(() => {
      if (host.clientWidth === width) return;
      width = host.clientWidth;
      for (const p of plates.values()) {
        p.cells = null;
        p.printed = false;
      }
      near.forEach(print);
    });

    for (const p of plates.values()) io.observe(p.link);
    ro.observe(host);
    host.addEventListener("pointerout", onOut, { passive: true });
    host.addEventListener("pointerdown", onPress, { passive: true, capture: true });
    window.addEventListener("keydown", onKey, true);
    host.addEventListener("focusout", onBlur);
    host.addEventListener("pointercancel", onCancel);
    host.addEventListener("load", onLoad, true);

    return () => {
      if (pumping) cancelAnimationFrame(pumping);
      near.clear();
      io.disconnect();
      ro.disconnect();
      host.removeEventListener("pointerout", onOut);
      host.removeEventListener("pointerdown", onPress, true);
      window.removeEventListener("keydown", onKey, true);
      host.removeEventListener("focusout", onBlur);
      host.removeEventListener("pointercancel", onCancel);
      host.removeEventListener("load", onLoad, true);
      for (const p of plates.values()) {
        p.pr.dispose();
        release(p);
      }
    };
  }, [wide]);

  return <span ref={ref} hidden />;
}

function mix(t: Float32Array, a: number, c: number, d: number, e: number, uf: number, vf: number) {
  return (t[a] + (t[c] - t[a]) * uf) * (1 - vf) + (t[d] + (t[e] - t[d]) * uf) * vf;
}

// The picture's rect when it covers a box. A cut-out is square on a square box, so it fills it exactly.
function cover(img: HTMLImageElement, box: { x: number; y: number; w: number; h: number }) {
  const s = Math.max(box.w / img.naturalWidth, box.h / img.naturalHeight);
  const w = img.naturalWidth * s;
  const h = img.naturalHeight * s;
  return { x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h };
}

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
