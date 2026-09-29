"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { DOT, GROUND, GROUND_INK, SCREEN } from "@/lib/halftone";
import { printer } from "@/lib/printer";
import { FIELD_POINTER, WARM } from "./fieldPointer";

const STEPS = 32;
const BANDS = 10;
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
    const pr = printer(canvas, () => kick());
    if (!pr) return;

    let plates: Plate[] = [];
    const measured = new WeakMap<HTMLElement, Tones>();
    const max = SCREEN * DOT;
    const SLOTS = STEPS * BANDS;
    let cap = 1 << 11;
    let bx = new Float32Array(SLOTS * cap);
    let by = new Float32Array(SLOTS * cap);
    const held = new Int32Array(SLOTS);
    let mixes: string[] = [];
    let mixKey = "";
    let raf = 0;
    let seen = false;
    let retry = 0;
    let moved = -1;

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

    const measure = (el: HTMLElement, img: HTMLImageElement, w: number, h: number, paper: string) => {
      const cols = Math.max(1, Math.round(w / SCREEN));
      const rows = Math.max(1, Math.round(h / SCREEN));
      const key = `${img.currentSrc || img.src}|${cols}x${rows}`;
      const had = measured.get(el);
      if (had && had.key === key) return had;

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

      const sorted = Float32Array.from(tone).sort();
      const pick = (q: number) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
      const lo = pick(0.04);
      const top = pick(0.96);
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
      if (frame() === moved) return;
      paint();
    };

    const paint = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;

      const sheet = host.getBoundingClientRect();
      const y = Math.min(Math.max(-sheet.top, 0), Math.max(0, sheet.height - h));
      canvas.style.transform = `translate3d(0,${y.toFixed(2)}px,0)`;
      const fx = sheet.left;
      const fy = sheet.top + y;

      pr.size(w, h, Math.min(window.devicePixelRatio || 1, 3));
      pr.clear();

      const paper = cssVar("--color-canvas", "#e2e2e2");
      const base = cssVar(GROUND_INK, "#76767a");
      const accent = cssVar("--color-accent", "#ed2024");
      const deep = cssVar("--color-accent-deep", "#8e1316");
      if (mixKey !== base + accent + deep) {
        mixKey = base + accent + deep;
        mixes = ramp([base, accent, deep], BANDS);
      }
      held.fill(0);
      const floor = Math.round((1 - GROUND) * STEPS);

      collect();
      const gx = sheet.left - fx + SCREEN / 2;
      const gy = sheet.top - fy + SCREEN / 2;

      pr.ground(gx, gy, SCREEN, (1 - GROUND) * SCREEN * DOT, base);

      let pending = false;
      let grew = false;

      const pk = FIELD_POINTER.k;
      const warmth = (x: number, y: number) => {
        if (pk <= 0) return 0;
        const d = Math.hypot(x - FIELD_POINTER.x, y - FIELD_POINTER.y);
        return d < WARM ? pk * (1 - d / WARM) ** 2 : 0;
      };

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

        const i0 = Math.ceil((Math.max(bl, -SCREEN) - gx) / SCREEN);
        const i1 = Math.floor((Math.min(br, w + SCREEN) - gx) / SCREEN);
        const j0 = Math.ceil((Math.max(bt, -SCREEN) - gy) / SCREEN);
        const j1 = Math.floor((Math.min(bb, h + SCREEN) - gy) / SCREEN);

        for (let j = j0; j <= j1; j++) {
          const py = gy + j * SCREEN;
          const dy = Math.min(py - bt, bb - py);
          const v = clamp((py - bt) * sy - 0.5, 0, grid.rows - 1);
          const v0 = Math.floor(v);
          const v1 = Math.min(grid.rows - 1, v0 + 1);
          const vf = v - v0;
          for (let i = i0; i <= i1; i++) {
            const px = gx + i * SCREEN;
            const m = mask(Math.min(dy, Math.min(px - bl, br - px)));
            if (m <= 0) continue;

            const u = clamp((px - bl) * sx - 0.5, 0, grid.cols - 1);
            const u0 = Math.floor(u);
            const u1 = Math.min(grid.cols - 1, u0 + 1);
            const uf = u - u0;
            const a = grid.tone[v0 * grid.cols + u0];
            const b = grid.tone[v0 * grid.cols + u1];
            const c = grid.tone[v1 * grid.cols + u0];
            const d = grid.tone[v1 * grid.cols + u1];
            const tone = (a + (b - a) * uf) * (1 - vf) + (c + (d - c) * uf) * vf;

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

      pr.dots(
        {
          x: bx,
          y: by,
          held,
          cap,
          radius: (slot) => (max * ((slot % STEPS) + 1)) / STEPS,
          ink: (slot) => Math.floor(slot / STEPS),
        },
        0,
        SLOTS,
        mixes,
      );

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
    const now = () => {
      moved = frame();
      paint();
    };

    const onScroll = () => {
      if (seen && !FIELD_POINTER.staged) kick();
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

    const paper = host.querySelector<HTMLElement>("[data-ground]");
    if (paper) paper.style.backgroundImage = "none";

    io.observe(host);
    ro.observe(host);
    kick();
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
      pr.dispose();
    };
  }, []);

  return (
    <div aria-hidden="true" style={edge} className="pointer-events-none absolute inset-0 z-[2]">
      <canvas ref={ref} className="absolute inset-x-0 top-0 h-svh w-full" />
    </div>
  );
}

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const frame = () => Number(document.timeline.currentTime ?? -1);

function mask(depth: number) {
  const t = clamp(depth / FEATHER, 0, 1);
  return t * t * (3 - 2 * t);
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
