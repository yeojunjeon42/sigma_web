"use client";

import { useEffect, useRef } from "react";
import { SQUARE, relief, turnAt } from "@/lib/halftone";
import { useMedia } from "@/lib/media";
import { STRIDE, flatPrinter, printer, type Box, type Printer, type Slots, type Veil } from "@/lib/printer";
import { FIELD_CELL } from "../data/field";

const STEPS = 32;
// How far a dot can swell as the wave's front passes it.
const SWELL = 8;
const SPAN = STEPS + SWELL;
const BANDS = 10;
const SLOTS = SPAN * BANDS;
// At full tone a mark covers this share of its cell's width.
const FULL = 0.94;
// The ink's lightest tone; the darker two are the accent tokens.
const LIGHT = "#ea5a5f";
// The wave into the colour object: ms in, ms out, and its front's width in px.
const IN = 620;
const OUT = 420;
const FRONT = 90;
const NEAR = "700px 0px";
const NO_LENS = { x: 0, y: 0, r: 0, power: 0 };

// A plate's marks, worked out once: paints only read them, so a wave frame touches no layout or pixels.
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
  // The object's box on the canvas, and the picture's rect covering it.
  box: Box;
  at: Box;
};
type Plate = {
  link: HTMLElement;
  art: HTMLElement;
  img: HTMLImageElement;
  canvas: HTMLCanvasElement;
  pr: Printer;
  cells: Cells | null;
  printed: boolean;
  pressed: boolean;
  w: number;
  goal: number;
  x: number;
  y: number;
};

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const smooth = (v: number) => {
  const t = clamp(v, 0, 1);
  return t * t * (3 - 2 * t);
};
const cssVar = (n: string, f: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(n).trim() || f;

// Resting plates print once. Waves share one viewport-sized printer, never a GL context per plate.
export default function FieldPrint() {
  const ref = useRef<HTMLSpanElement>(null);
  // No canvases are filled for the phone tree.
  const wide = useMedia("(min-width: 64rem)", false);

  useEffect(() => {
    const host = ref.current?.closest<HTMLElement>("[data-field]");
    if (!host || !wide) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
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
      radius: (slot) => (RADIUS * ((slot % SPAN) + 1)) / STEPS,
      ink: (slot) => Math.floor(slot / SPAN),
    };
    const veil: Veil = { data: new Float32Array(1 << 16), n: 0 };

    const plates = new Map<HTMLElement, Plate>();
    for (const link of host.querySelectorAll<HTMLElement>("[data-plate-link]")) {
      const art = link.firstElementChild;
      const img = link.querySelector("img");
      const canvas = link.querySelector("canvas");
      const pr = canvas && flatPrinter(canvas);
      if (!(art instanceof HTMLElement) || !img || !canvas || !pr) continue;
      plates.set(link, { link, art, img, canvas, pr, cells: null, printed: false, pressed: false, w: 0, goal: 0, x: 0, y: 0 });
    }

    const overlay = document.createElement("canvas");
    overlay.setAttribute("aria-hidden", "true");
    overlay.setAttribute("data-offgrid", "");
    overlay.className = "pointer-events-none absolute left-0";
    host.append(overlay);
    const shared = printer(overlay, () => {
      for (const p of plates.values()) if (p.w > 0 && p.w < 1) live.add(p);
      if (live.size && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    if (!shared) {
      overlay.remove();
      for (const p of plates.values()) p.pr.dispose();
      return;
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
      p.cells = { i0, j0, cols, rows, ox, oy, turn, size, band, box, at: cover(p.img, box) };
      return p.cells;
    };

    const show = (p: Plate) => {
      p.art.style.opacity = p.w >= 1 || p.pressed ? "1" : "";
      p.canvas.style.visibility = p.w > 0 || p.pressed ? "hidden" : "";
    };
    const paint = (p: Plate, moving = false, dx = 0, dy = 0): boolean => {
      const { img, canvas } = p;
      const pr = moving ? shared : p.pr;
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      if (!W || !H) return false;
      if (!img.complete || !img.naturalWidth) return false;

      if (!moving) {
        pr.size(W, H, Math.min(window.devicePixelRatio || 1, 2));
        pr.clear();
      }

      const cells = p.cells ?? bake(p);
      if (!cells) return false;
      const { i0, j0, cols, rows, ox, oy, turn, size, band, box, at } = cells;
      const on = moving && p.w > 0;
      const reach = Math.hypot(Math.max(p.x - box.x, box.x + box.w - p.x), Math.max(p.y - box.y, box.y + box.h - p.y));
      const front = p.w * (reach + FRONT);

      slots.held.fill(0);
      veil.n = 0;
      if (veil.data.length < cols * rows * STRIDE) veil.data = new Float32Array(cols * rows * STRIDE);
      for (let j = 0, k = 0; j < rows; j++) {
        const py = (j + j0 + 0.5) * CELL - oy;
        for (let i = 0; i < cols; i++, k++) {
          const px = (i + i0 + 0.5) * CELL - ox;
          let rest = size[k];
          if (on) {
            const f = smooth((front - Math.sqrt((px - p.x) ** 2 + (py - p.y) ** 2)) / FRONT);
            if (f > 0.01) lay(veil, px + dx, py + dy, (CELL / 2) * 1.06 * f, turn[k]);
            rest *= (1 - f * f) * (1 + 0.4 * Math.sin(Math.PI * f));
          }
          const step = Math.min(SPAN - 1, Math.round(rest * STEPS) - 1);
          if (step < 0) continue;
          const slot = band[k] * SPAN + step;
          const n = slots.held[slot];
          if (n >= slots.cap) {
            grow();
            return paint(p, moving, dx, dy);
          }
          const o = slot * slots.cap + n;
          slots.x[o] = px + dx;
          slots.y[o] = py + dy;
          slots.turn[o] = turn[k];
          slots.held[slot] = n + 1;
        }
      }

      pr.dots(slots, 0, SLOTS, ink);
      if (veil.n) pr.photo(img, { ...at, x: at.x + dx, y: at.y + dy }, veil, NO_LENS);
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

    const live = new Set<Plate>();
    let raf = 0;
    let last = 0;
    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(50, Math.max(1, now - last));
      last = now;
      // The overlay follows the visible slice of the field, including while a wave scrolls away.
      const r = host.getBoundingClientRect();
      const height = Math.min(window.innerHeight, r.height);
      const top = clamp(-r.top, 0, r.height - height);
      overlay.style.top = `${top}px`;
      overlay.style.width = `${r.width}px`;
      overlay.style.height = `${height}px`;
      shared.size(r.width, height, Math.min(window.devicePixelRatio || 1, 2));
      shared.clear();
      for (const p of live) {
        p.w = p.goal > p.w ? Math.min(1, p.w + dt / IN) : Math.max(0, p.w - dt / OUT);
        show(p);
        if (!p.pressed && p.w > 0 && p.w < 1) {
          const cells = p.cells ?? bake(p);
          if (cells) paint(p, true, cells.ox, cells.oy - top);
        }
        if (p.w === p.goal) live.delete(p);
      }
      if (live.size) raf = requestAnimationFrame(frame);
    };
    const go = (p: Plate, goal: number) => {
      p.goal = goal;
      if (still.matches) {
        p.w = goal;
        show(p);
        return;
      }
      live.add(p);
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const enter = (p: Plate, cx: number, cy: number) => {
      // A wave under way keeps its origin.
      if (p.w <= 0.001) {
        const r = p.canvas.getBoundingClientRect();
        p.x = clamp(cx - r.left, 0, r.width);
        p.y = clamp(cy - r.top, 0, r.height);
      }
      go(p, 1);
    };
    const plateOf = (t: EventTarget | null) => {
      const link = (t as HTMLElement | null)?.closest?.<HTMLElement>("[data-plate-link]");
      return link ? plates.get(link) : undefined;
    };

    let lit: Plate | undefined;
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const p = plateOf(e.target);
      if (!p || p === lit) return;
      if (lit) leave(lit);
      lit = p;
      enter(p, e.clientX, e.clientY);
    };
    const onOut = (e: PointerEvent) => {
      if (!lit || plateOf(e.relatedTarget) === lit) return;
      leave(lit);
      lit = undefined;
    };
    const leave = (p: Plate) => {
      p.pressed = false;
      go(p, 0);
    };
    let pressing = false;
    const onPress = (e: PointerEvent) => {
      pressing = true;
      // The view transition takes its picture of the link: show the object in it, whatever the wave's done.
      const p = plateOf(e.target);
      if (!p) return;
      p.pressed = true;
      show(p);
    };
    const onKey = () => {
      pressing = false;
    };
    const onFocus = (e: FocusEvent) => {
      const p = plateOf(e.target);
      if (!p || pressing) return;
      const r = p.canvas.getBoundingClientRect();
      enter(p, r.left + r.width / 2, r.top + r.height / 2);
    };
    const onBlur = (e: FocusEvent) => {
      const p = plateOf(e.target);
      if (p && p !== lit) leave(p);
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
            if (!live.has(p)) {
              p.canvas.width = p.canvas.height = 0;
              p.printed = false;
            }
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
    host.addEventListener("pointerover", onOver, { passive: true });
    host.addEventListener("pointerout", onOut, { passive: true });
    host.addEventListener("pointerdown", onPress, { passive: true, capture: true });
    window.addEventListener("keydown", onKey, true);
    host.addEventListener("focusin", onFocus);
    host.addEventListener("focusout", onBlur);
    host.addEventListener("load", onLoad, true);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (pumping) cancelAnimationFrame(pumping);
      near.clear();
      io.disconnect();
      ro.disconnect();
      host.removeEventListener("pointerover", onOver);
      host.removeEventListener("pointerout", onOut);
      host.removeEventListener("pointerdown", onPress, true);
      window.removeEventListener("keydown", onKey, true);
      host.removeEventListener("focusin", onFocus);
      host.removeEventListener("focusout", onBlur);
      host.removeEventListener("load", onLoad, true);
      for (const p of plates.values()) {
        p.pr.dispose();
        p.art.style.opacity = "";
        p.canvas.style.visibility = "";
      }
      shared.dispose();
      overlay.remove();
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

function lay(v: Veil, x: number, y: number, r: number, turn: number) {
  const o = v.n++ * STRIDE;
  v.data[o] = x;
  v.data[o + 1] = y;
  v.data[o + 2] = r;
  v.data[o + 3] = 1;
  v.data[o + 4] = turn;
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
