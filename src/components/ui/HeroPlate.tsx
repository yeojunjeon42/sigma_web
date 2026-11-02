"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { DOT, GROUND, GROUND_INK, PLATE_KEY, SCREEN, relief, turnAt } from "@/lib/halftone";
import { printer, scaled, STRIDE, vignette } from "@/lib/printer";

export type HeroBuild = {
  id: string;
  src: string;
  name: string;
  year: number | null;
};

const PHONE_SCREEN = 5;
const SIZES = 40;
const BANDS = 10;
const SWELL = 1.6;
const LENS = 0.3;
const FRONT = 0.3;
const WAVE = 1300;
const QUICK = 650;
const BAND = 240;
// Spring rates (1/s) for the glass, the tail it drags and the idle wander.
const FOLLOW = 22;
const TRAIL = 9;
// How far the tail may fall behind, in lens radii.
const DRAG = 0.7;
const ROAM = 2.4;
// The photograph comes up through the dots: their radius over the cell at the centre (over 0.707 they
// merge into solid picture), and the share of the lens's radius that is already solid.
const COVER = 0.75;
const CORE = 0.28;
const FAST = 0.18;
const PRESS = 0.3;
const TAP = 0.16;
const CYCLE = 7000;
const IDLE = 2200;
const HOLD = 300;
const DRIFT = [14, 9];
const EDGE = [0.11, 0.84] as const;
const PAD = 3;
const FEATHER = 12;
const KNOCK = 0.8;
const EBB = 0.35;

let shown: HeroBuild | null = null;
let advance: (() => void) | null = null;
const subs = new Set<() => void>();
const subscribe = (f: () => void) => {
  subs.add(f);
  return () => {
    subs.delete(f);
  };
};
const show = (b: HeroBuild) => {
  if (b === shown) return;
  shown = b;
  subs.forEach((f) => f());
};

export const PLATE_SHOW = "plate:show";
export const PLATE_RELEASE = "plate:release";

export function HeroCaption({ builds, className = "" }: { builds: HeroBuild[]; className?: string }) {
  const b =
    useSyncExternalStore(
      subscribe,
      () => shown,
      () => null,
    ) ?? builds[0];
  if (!b) return null;
  return (
    <p className={className}>
      <Link
        href={`/archive?view=reel&at=${b.id}`}
        className="inline-flex min-h-11 items-center gap-x-xs leading-none text-ink transition-opacity hover:opacity-60 lg:min-h-0"
      >
        {b.name}
        {b.year ? <span className="tabular-nums text-ink">{b.year}</span> : null}
        <span aria-hidden="true">↗</span>
      </Link>
      <button
        type="button"
        onClick={() => advance?.()}
        className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-end leading-none text-ink transition-opacity hover:opacity-60 lg:min-h-0 lg:min-w-0"
      >
        Next
      </button>
    </p>
  );
}

type Tones = { key: string; cols: number; rows: number; tone: Float32Array };
type Box = { x: number; y: number; w: number; h: number };

export default function HeroPlate({ builds }: { builds: HeroBuild[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  // Rebuild on md crossings: the grid is captured at setup.
  const [layout, setLayout] = useState(0);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.closest<HTMLElement>("section");
    const plate = host?.querySelector<HTMLElement>("[data-plate]");
    if (!canvas || !host || !plate || !builds.length) return;
    const pr = printer(canvas, () => kick());
    if (!pr) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frozen = !!canvas.closest("[inert]");
    const fine = window.matchMedia("(hover: hover)").matches;
    const cell = window.matchMedia("(min-width: 768px)").matches ? SCREEN : PHONE_SCREEN;
    const top = cell * DOT;
    const rTop = top * SWELL;
    const rGround = (1 - GROUND) * top;

    let W = 0;
    let H = 0;
    let cols = 0;
    let rows = 0;
    let box: Box = { x: 0, y: 0, w: 0, h: 0 };
    let quiet = new Float32Array(0);

    const SLOTS = SIZES * BANDS;
    let cap = 1 << 10;
    let bt = new Float32Array(SLOTS * cap);
    let spin = new Float32Array(0);
    const veilA = { data: new Float32Array(1 << 14), n: 0 };
    const veilB = { data: new Float32Array(1 << 14), n: 0 };
    let bx = new Float32Array(SLOTS * cap);
    let by = new Float32Array(SLOTS * cap);
    const held = new Int32Array(SLOTS);
    let mixes: string[] = [];
    let ink = "#0f0d09";

    const all = [...builds];
    let curated = 0;
    let hold = false;
    let wave = WAVE;
    const imgs = new Map<number, HTMLImageElement>();
    const bad = new Set<number>();
    const tones = new Map<number, Tones>();
    const ready = new Set<number>();
    const going = new Set<number>();
    let epoch = 0;
    let live = true;
    let reach = 0;
    let a = -1;
    let b = -1;
    let want: { i: number; at?: { x: number; y: number }; quick?: boolean } | null = null;
    let t = 1;
    let t0 = 0;
    let origin = { x: 0, y: 0 };

    const ptr = { x: 0, y: 0, in: false, speed: 0, down: 0, link: false, left: 0 };
    const lens = { x: 0, y: 0, vx: 0, vy: 0, amp: 0, boost: 0 };
    const tail = { x: 0, y: 0, vx: 0, vy: 0 };
    const par = { x: 0, y: 0 };
    let raf = 0;
    let last = 0;
    let move = 0;
    let seen = false;
    let roam = false;
    let pressed = false;
    let on = 0;
    let settling = 0;

    const css = (n: string, f: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(n).trim() || f;
    // Cache styles to avoid per-frame recalculation.
    const base = css(GROUND_INK, "#76767a");
    mixes = [...ramp([base, css("--color-accent", "#ed2024"), css("--color-accent-deep", "#8e1316")], BANDS)];
    ink = css("--color-ink", "#0f0d09");

    const element = (i: number) => {
      let img = imgs.get(i);
      if (!img) {
        img = new Image();
        img.decoding = "async";
        img.onload = kick;
        // Skip failed images so the cycle cannot stall.
        img.onerror = () => {
          bad.add(i);
          if (want?.i === i) want = null;
          kick();
        };
        img.src = all[i].src;
        imgs.set(i, img);
      }
      return img;
    };
    const load = (i: number) => {
      const img = element(i);
      return img.complete && img.naturalWidth ? img : null;
    };

    const place = (img: HTMLImageElement): Box => {
      const s = Math.min(box.w / img.naturalWidth, box.h / img.naturalHeight);
      const w = img.naturalWidth * s;
      const h = img.naturalHeight * s;
      return { x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h };
    };

    const measure = (i: number, img: CanvasImageSource, r: Box) => {
      const c = Math.max(1, Math.round(r.w / cell));
      const n = Math.max(1, Math.round(r.h / cell));
      const key = `${c}x${n}`;
      const had = tones.get(i);
      if (had && had.key === key) return had;
      const src = document.createElement("canvas");
      src.width = c * 2;
      src.height = n * 2;
      const g = src.getContext("2d", { willReadFrequently: true });
      if (!g) return null;
      g.drawImage(img, 0, 0, src.width, src.height);
      let data: Uint8ClampedArray;
      try {
        data = g.getImageData(0, 0, src.width, src.height).data;
      } catch {
        return null;
      }
      const paper = lum(rgb(css("--color-canvas", "#e2e2e2")));
      const tone = new Float32Array(c * n);
      const solid = new Float32Array(c * n);
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < c; x++) {
          let sum = 0;
          let al = 0;
          for (let yy = 0; yy < 2; yy++) {
            for (let xx = 0; xx < 2; xx++) {
              const p = ((y * 2 + yy) * src.width + (x * 2 + xx)) * 4;
              const k = data[p + 3] / 255;
              sum += k * lum([data[p], data[p + 1], data[p + 2]]) + (1 - k) * paper;
              al += k;
            }
          }
          tone[y * c + x] = sum / 4;
          solid[y * c + x] = al / 4;
        }
      }
      const inside = Float32Array.from(tone.filter((_, k) => solid[k] > 0.5)).sort();
      if (inside.length < 8) return null;
      const pick = (q: number) => inside[Math.min(inside.length - 1, Math.floor(q * inside.length))];
      const lo = pick(0.04);
      const hi = Math.max(lo + 0.08, Math.min(paper, pick(0.96)));
      for (let k = 0; k < tone.length; k++) tone[k] = Math.min(1, Math.max(0, (tone[k] - lo) / (hi - lo)));
      relief(tone, c, n, solid);
      for (let k = 0; k < tone.length; k++) tone[k] = Math.min(tone[k], 1 - 0.22 * solid[k]);
      const out = { key, cols: c, rows: n, tone };
      tones.set(i, out);
      return out;
    };

    // Everything a plate costs happens before it is asked for: decode, tones, texture.
    const prepare = async (i: number) => {
      if (ready.has(i) || going.has(i) || bad.has(i) || !W) return;
      going.add(i);
      const run = epoch;
      try {
        const img = element(i);
        await img.decode();
        await rest();
        if (!live || run !== epoch) return;
        const r = place(img);
        const file = await (await fetch(img.src)).blob();
        const small = await scaled(file, Math.max(1, Math.round(r.w / cell)) * 2, Math.max(1, Math.round(r.h / cell)) * 2, "medium");
        if (!live || run !== epoch) return;
        measure(i, small, r);
        small.close();
        await rest();
        await pr.prime(img, r, file).catch(() => {});
        if (!live || run !== epoch) return;
        ready.add(i);
        kick();
      } catch {
        bad.add(i);
        if (want?.i === i) want = null;
        kick();
      } finally {
        going.delete(i);
        if (live && run !== epoch) void prepare(i);
      }
    };

    const sample = (g: Tones, r: Box, x: number, y: number) => {
      if (x < r.x || y < r.y || x > r.x + r.w || y > r.y + r.h) return 1;
      const u = clamp(((x - r.x) * g.cols) / r.w - 0.5, 0, g.cols - 1);
      const v = clamp(((y - r.y) * g.rows) / r.h - 0.5, 0, g.rows - 1);
      const u0 = Math.floor(u);
      const v0 = Math.floor(v);
      const u1 = Math.min(g.cols - 1, u0 + 1);
      const v1 = Math.min(g.rows - 1, v0 + 1);
      const uf = u - u0;
      const vf = v - v0;
      const p = g.tone[v0 * g.cols + u0];
      const q = g.tone[v0 * g.cols + u1];
      const m = g.tone[v1 * g.cols + u0];
      const n = g.tone[v1 * g.cols + u1];
      return (p + (q - p) * uf) * (1 - vf) + (m + (n - m) * uf) * vf;
    };

    const resize = () => {
      const hr = host.getBoundingClientRect();
      const pb = plate.getBoundingClientRect();
      W = hr.width;
      H = hr.height;
      if (!W || !H) return;
      box = { x: pb.left - hr.left, y: pb.top - hr.top, w: pb.width, h: pb.height };
      pr.size(W, H, Math.min(window.devicePixelRatio || 1, 3));
      cols = Math.ceil(W / cell);
      rows = Math.ceil(H / cell);
      spin = new Float32Array(cols * rows);
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++)
          spin[j * cols + i] = turnAt((i + 0.5) * cell, (j + 0.5) * cell);
      // The mask is slow to make: wait for a dragged window to settle.
      if (quiet.length) {
        quiet = new Float32Array(cols * rows);
        window.clearTimeout(settling);
        settling = window.setTimeout(() => {
          hush();
          kick();
        }, 120);
      } else hush();
      if (t >= 1) origin = { x: box.x + box.w / 2, y: box.y + box.h / 2 };
      if (!ptr.in && lens.amp < 0.02) {
        lens.x = tail.x = origin.x;
        lens.y = tail.y = origin.y;
      }
      epoch++;
      ready.clear();
      if (b >= 0) {
        void prepare(b);
        void prepare(after(curated));
      }
      kick();
    };

    const hush = () => {
      quiet = new Float32Array(cols * rows);
      if (!W || !H) return;
      const hr = host.getBoundingClientRect();
      const c = document.createElement("canvas");
      c.width = Math.ceil(W);
      c.height = Math.ceil(H);
      const g = c.getContext("2d", { willReadFrequently: true });
      if (!g) return;
      const range = document.createRange();
      for (const el of host.querySelectorAll<HTMLElement>(".u-lift")) {
        const cs = getComputedStyle(el);
        g.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        g.fontStretch = cs.fontStretch === "125%" ? "expanded" : "normal";
        g.letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
        const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        for (let n = walk.nextNode(); n; n = walk.nextNode()) {
          for (const m of (n.textContent ?? "").matchAll(/\S+/g)) {
            range.setStart(n, m.index);
            range.setEnd(n, m.index + m[0].length);
            const q = range.getClientRects()[0];
            if (!q) continue;
            const word = cs.textTransform === "uppercase" ? m[0].toUpperCase() : m[0];
            g.fillText(word, q.left - hr.left, q.top - hr.top + g.measureText(word).fontBoundingBoxAscent);
          }
        }
      }
      const px = g.getImageData(0, 0, c.width, c.height).data;
      const inked = new Uint8Array(cols * rows);
      for (let y = 0; y < c.height; y++) {
        const row = Math.floor(y / cell) * cols;
        for (let x = 0; x < c.width; x++) if (px[(y * c.width + x) * 4 + 3] > 96) inked[row + Math.floor(x / cell)] = 1;
      }
      const reach = Math.ceil((PAD + FEATHER) / cell);
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          if (!inked[j * cols + i]) continue;
          for (let dj = -reach; dj <= reach; dj++) {
            const jj = j + dj;
            if (jj < 0 || jj >= rows) continue;
            for (let di = -reach; di <= reach; di++) {
              const ii = i + di;
              if (ii < 0 || ii >= cols) continue;
              const v = 1 - smooth(clamp((Math.hypot(di, dj) * cell - PAD) / FEATHER, 0, 1));
              const k = jj * cols + ii;
              if (v > quiet[k]) quiet[k] = v;
            }
          }
        }
      }
    };

    const start = (i: number, at?: { x: number; y: number }, quick = false) => {
      a = b;
      b = i;
      want = null;
      wave = quick ? QUICK : WAVE;
      if (i < builds.length) curated = i;
      origin = at ?? { x: box.x + box.w / 2, y: box.y + box.h / 2 };
      // Fixed for the whole wave: measured per frame, the front would shift as the glass moves.
      reach = 0;
      for (const cx of [box.x - DRIFT[0], box.x + box.w + DRIFT[0]])
        for (const cy of [box.y - DRIFT[1], box.y + box.h + DRIFT[1]])
          reach = Math.max(reach, Math.hypot(cx - origin.x, cy - origin.y));
      t0 = performance.now();
      t = still || frozen ? 1 : 0;
      if (t >= 1) show(all[b]);
      try {
        localStorage.setItem(PLATE_KEY, String(curated));
      } catch {}
      kick();
    };

    const after = (from: number) => {
      for (let n = 1; n <= builds.length; n++) {
        const i = (from + n) % builds.length;
        if (!bad.has(i)) return i;
      }
      return -1;
    };

    const next = (at?: { x: number; y: number }) => {
      if (t < 1 || want) return;
      const i = after(curated);
      if (i < 0) return;
      want = { i, at };
      void prepare(i);
      kick();
    };

    const draw = () => {
      if (!W || !H) return;
      pr.clear();

      const ox = -par.x * DRIFT[0];
      const oy = -par.y * DRIFT[1];
      const ia = a >= 0 ? load(a) : null;
      const ib = b >= 0 ? load(b) : null;
      const ra = ia ? shift(place(ia), ox, oy) : null;
      const rb = ib ? shift(place(ib), ox, oy) : null;
      const ga = ia && ra && t < 1 ? measure(a, ia, ra) : null;
      const gb = ib && rb ? measure(b, ib, rb) : null;

      const R = clamp(W * 0.105, 84, 180) * (1 + lens.boost);
      const lensOn = lens.amp > 0.01 && !still;
      const power = lensOn ? LENS * lens.amp : 0;
      const open = fine && lens.amp > 0.01 ? smooth(clamp(lens.amp, 0, 1)) : 0;
      veilA.n = veilB.n = 0;
      // The tail eases toward its limit rather than meeting it, so a fast move has no corner.
      const lag = Math.hypot(tail.x - lens.x, tail.y - lens.y);
      const hold = lag > 0 ? (R * DRAG * (1 - Math.exp(-lag / (R * DRAG)))) / lag : 0;
      const tx = (tail.x - lens.x) * hold;
      const ty = (tail.y - lens.y) * hold;
      const tt = tx * tx + ty * ty;

      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      for (const r of [ga && ra, gb && rb]) {
        if (!r) continue;
        x0 = Math.min(x0, r.x);
        y0 = Math.min(y0, r.y);
        x1 = Math.max(x1, r.x + r.w);
        y1 = Math.max(y1, r.y + r.h);
      }
      if (lensOn) {
        x0 = Math.min(x0, lens.x - R);
        y0 = Math.min(y0, lens.y - R);
        x1 = Math.max(x1, lens.x + R);
        y1 = Math.max(y1, lens.y + R);
      }
      if (open > 0) {
        x0 = Math.min(x0, lens.x + Math.min(tx, 0) - R);
        y0 = Math.min(y0, lens.y + Math.min(ty, 0) - R);
        x1 = Math.max(x1, lens.x + Math.max(tx, 0) + R);
        y1 = Math.max(y1, lens.y + Math.max(ty, 0) + R);
      }

      held.fill(0);
      let grew = false;
      if (x1 > x0) {
        const i0 = Math.max(0, Math.floor(x0 / cell));
        const i1 = Math.min(cols - 1, Math.ceil(x1 / cell));
        const j0 = Math.max(0, Math.floor(y0 / cell));
        const j1 = Math.min(rows - 1, Math.ceil(y1 / cell));
        for (let j = j0; j <= j1; j++) {
          const py = (j + 0.5) * cell;
          for (let i = i0; i <= i1; i++) {
            const px = (i + 0.5) * cell;
            let tone = gb && rb ? sample(gb, rb, px, py) : 1;
            let lt = 1;
            if (t < 1) {
              const d = Math.hypot(px - origin.x, py - origin.y);
              lt = smooth(clamp((t * (reach + BAND) - d) / BAND, 0, 1));
              const from = ga && ra ? sample(ga, ra, px, py) : 1;
              tone = from + (tone - from) * lt;
            }
            // One field: it bends, swells and opens the dots by distance alone, and each effect
            // reaches zero with zero slope at the edge, so no line can show.
            const ox = px - lens.x;
            const oy = py - lens.y;
            const d = Math.hypot(ox, oy);
            const bend = d < R ? 1 - (d / R) * (d / R) : 0;
            const q = bend * bend * power;
            const x = lens.x + ox * (1 + q);
            const y = lens.y + oy * (1 + q);
            let veil = 0;
            if (open > 0) {
              const along = tt > 0 ? clamp((ox * tx + oy * ty) / tt, 0, 1) : 0;
              veil = smooth(clamp((R - Math.hypot(ox - tx * along, oy - ty * along)) / (R * (1 - CORE)), 0, 1)) * open;
              if (veil > 0.01) {
                const rp = cell * (1 + q) * COVER * veil;
                if (gb && lt > 0) lay(veilB, x, y, rp, lt, spin[j * cols + i]);
                if (ga && lt < 1) lay(veilA, x, y, rp, 1 - lt, spin[j * cols + i]);
              }
            }

            let r = (1 - GROUND * (0.12 + 0.88 * tone)) * top;
            if (r <= rGround + 0.06) continue;
            const hushed = quiet[j * cols + i];
            if (hushed > 0) r = rGround + (r - rGround) * (1 - KNOCK * hushed);
            r *= smooth(clamp((r - rGround) / (EBB * top), 0, 1));
            if (lt > 0 && lt < 1) r *= 1 + FRONT * Math.sin(Math.PI * lt);
            r *= vignette(py / H, EDGE);
            r *= (1 + q * 0.9) * (1 - veil * veil);
            if (r < 0.25) continue;

            const size = clamp(Math.round((r / rTop) * SIZES) - 1, 0, SIZES - 1);
            const band = Math.min(BANDS - 1, Math.round((1 - tone) * (BANDS - 1)));
            const slot = band * SIZES + size;
            const n = held[slot];
            if (n < cap) {
              bx[slot * cap + n] = x;
              by[slot * cap + n] = y;
              bt[slot * cap + n] = spin[j * cols + i];
              held[slot] = n + 1;
            } else grew = true;
          }
        }
      }

      const slots = {
        x: bx,
        y: by,
        turn: bt,
        held,
        cap,
        radius: (slot: number) => (rTop * ((slot % SIZES) + 1)) / SIZES,
        ink: (slot: number) => Math.floor(slot / SIZES),
      };
      pr.dots(slots, 0, SLOTS, mixes);

      const seen = { x: lens.x, y: lens.y, r: R, power };
      if (ia && ra) pr.photo(ia, ra, veilA, seen);
      if (ib && rb) pr.photo(ib, rb, veilB, seen);

      if (lensOn && ptr.in) pr.mark(ptr.x, ptr.y, 2.5, ink, lens.amp);

      if (grew) {
        cap *= 2;
        bx = new Float32Array(SLOTS * cap);
        by = new Float32Array(SLOTS * cap);
        bt = new Float32Array(SLOTS * cap);
        kick();
      }
      return R;
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = clamp((now - last) / 1000, 0.001, 0.05);
      last = now;

      // Only the first plate may start unprepared: nothing is moving yet.
      if (want && t >= 1 && (ready.has(want.i) || (b < 0 && load(want.i)))) start(want.i, want.at, want.quick);
      if (b < 0 && !want) {
        let last = -1;
        try {
          last = Number(localStorage.getItem(PLATE_KEY) ?? -1);
        } catch {}
        if (!Number.isInteger(last)) last = -1;
        const first = after(((last % builds.length) + builds.length) % builds.length);
        if (first >= 0) {
          want = { i: first };
          void prepare(first);
        }
      }
      if (t < 1) {
        t = Math.min(1, (now - t0) / wave);
        if (t > 0.5) show(all[b]);
      } else if (b >= 0 && !want) void prepare(after(curated));

      if (!still) {
        roam = fine && !ptr.in && now - ptr.left > IDLE;
        const s = now / 1000;
        const gx = roam ? box.x + box.w * (0.5 + 0.3 * Math.cos(s * 0.57)) : ptr.x;
        const gy = roam ? box.y + box.h * (0.5 + 0.26 * Math.sin(s * 0.83 + 1)) : ptr.y;
        chase(lens, gx, gy, roam ? ROAM : FOLLOW, dt);
        chase(tail, lens.x, lens.y, TRAIL, dt);
        on = roam ? 0.8 : ptr.in && !ptr.link ? 1 : 0;
        lens.amp += (on - lens.amp) * (1 - Math.exp(-dt * (roam ? 2 : 8)));
        ptr.speed *= Math.exp(-dt * 6);
        const swell = ptr.down && ptr.in ? PRESS : clamp(ptr.speed / 2400, 0, FAST);
        lens.boost += (swell - lens.boost) * (1 - Math.exp(-dt * 5));
        const tx = ptr.in ? (ptr.x / W) * 2 - 1 : 0;
        const ty = ptr.in ? (ptr.y / H) * 2 - 1 : 0;
        par.x += (tx - par.x) * (1 - Math.exp(-dt * 4));
        par.y += (ty - par.y) * (1 - Math.exp(-dt * 4));
      } else {
        lens.x = tail.x = ptr.x;
        lens.y = tail.y = ptr.y;
        lens.amp = ptr.in && !ptr.link ? 1 : 0;
      }

      draw();

      if (seen && !document.hidden && (t < 1 || want || (fine && !still && !frozen))) kick();
    };

    function kick() {
      if (!raf) raf = requestAnimationFrame(frame);
    }

    const at = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const now = performance.now();
      if (ptr.in) ptr.speed = Math.max(ptr.speed, Math.hypot(x - ptr.x, y - ptr.y) / Math.max(0.008, (now - move) / 1000));
      else if (lens.amp < 0.02) {
        lens.x = tail.x = x;
        lens.y = tail.y = y;
        lens.vx = lens.vy = tail.vx = tail.vy = 0;
      }
      move = now;
      ptr.x = x;
      ptr.y = y;
      ptr.in = true;
      ptr.link = !!(e.target as HTMLElement).closest("a,button");
      if (e.type === "pointerdown") ptr.down = now;
      kick();
    };
    const out = () => {
      ptr.in = false;
      ptr.down = 0;
      ptr.left = performance.now();
      kick();
    };
    const up = (e: PointerEvent) => {
      pressed = ptr.down > 0 && performance.now() - ptr.down > HOLD;
      ptr.down = 0;
      if (e.pointerType !== "mouse") out();
    };
    const click = (e: MouseEvent) => {
      if (pressed || (e.target as HTMLElement).closest("a,button")) return;
      lens.boost = Math.min(PRESS, lens.boost + TAP);
      const r = host.getBoundingClientRect();
      next({ x: e.clientX - r.left, y: e.clientY - r.top });
    };

    const asked = (e: Event) => {
      const d = (e as CustomEvent<HeroBuild>).detail;
      if (!d || frozen) return;
      hold = true;
      let i = all.findIndex((x) => x.id === d.id);
      if (i < 0) i = all.push(d) - 1;
      if (i === b && !want) return;
      want = { i, at: { x: box.x + box.w / 2, y: box.y + box.h }, quick: true };
      void prepare(i);
      kick();
    };
    const released = () => {
      hold = false;
    };

    const ro = new ResizeObserver(resize);
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      if (seen) kick();
    });
    // ResizeObserver handles initial sizing; font loads require remasking.
    ro.observe(host);
    io.observe(host);
    if (document.fonts && document.fonts.status !== "loaded")
      document.fonts.ready.then(() => {
        if (!live) return;
        hush();
        kick();
      });
    const md = window.matchMedia("(min-width: 768px)");
    const turned = () => setLayout((n) => n + 1);
    md.addEventListener("change", turned);

    let timer = 0;
    if (!frozen) {
      if (fine) {
        host.addEventListener("pointermove", at);
        host.addEventListener("pointerdown", at);
        host.addEventListener("pointerup", up);
        host.addEventListener("pointerleave", out);
        host.addEventListener("pointercancel", out);
      }
      host.addEventListener("click", click);
      window.addEventListener(PLATE_SHOW, asked);
      window.addEventListener(PLATE_RELEASE, released);
      advance = () => next();
      if (fine && !still) host.style.cursor = "none";
      if (!still)
        timer = window.setInterval(() => {
          if (seen && !ptr.in && !hold && !document.hidden) next();
        }, CYCLE);
    }

    return () => {
      live = false;
      window.clearTimeout(settling);
      md.removeEventListener("change", turned);
      for (const img of imgs.values()) img.onload = img.onerror = null;
      if (raf) cancelAnimationFrame(raf);
      window.clearInterval(timer);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", at);
      host.removeEventListener("pointerdown", at);
      host.removeEventListener("pointerup", up);
      host.removeEventListener("pointerleave", out);
      host.removeEventListener("pointercancel", out);
      host.removeEventListener("click", click);
      window.removeEventListener(PLATE_SHOW, asked);
      window.removeEventListener(PLATE_RELEASE, released);
      host.style.cursor = "";
      advance = null;
      pr.dispose();
    };
  }, [builds, layout]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
    />
  );
}

function lay(v: { data: Float32Array; n: number }, x: number, y: number, r: number, alpha: number, turn: number) {
  if ((v.n + 1) * STRIDE > v.data.length) {
    const more = new Float32Array(v.data.length * 2);
    more.set(v.data);
    v.data = more;
  }
  const o = v.n++ * STRIDE;
  v.data[o] = x;
  v.data[o + 1] = y;
  v.data[o + 2] = r;
  v.data[o + 3] = alpha;
  v.data[o + 4] = turn;
}

// Yield to the browser between the steps of preparing a plate.
const rest = () =>
  new Promise<void>((go) => {
    if (typeof requestIdleCallback === "function") requestIdleCallback(() => go(), { timeout: 400 });
    else setTimeout(go, 1);
  });

// Critically damped and exact for any dt: no overshoot, and a dropped frame doesn't change the path.
function chase(p: { x: number; y: number; vx: number; vy: number }, gx: number, gy: number, w: number, dt: number) {
  const e = Math.exp(-w * dt);
  const dx = p.x - gx;
  const jx = (p.vx + w * dx) * dt;
  p.x = gx + (dx + jx) * e;
  p.vx = (p.vx - w * jx) * e;
  const dy = p.y - gy;
  const jy = (p.vy + w * dy) * dt;
  p.y = gy + (dy + jy) * e;
  p.vy = (p.vy - w * jy) * e;
}

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const smooth = (v: number) => v * v * (3 - 2 * v);
const lum = (c: number[]) => (0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2]) / 255;
const shift = (r: Box, x: number, y: number): Box => ({ x: r.x + x, y: r.y + y, w: r.w, h: r.h });

function ramp(stops: string[], n: number) {
  const c = stops.map(rgb);
  return Array.from({ length: n }, (_, i) => {
    const t = (i / (n - 1)) * (c.length - 1);
    const k = Math.min(c.length - 2, Math.floor(t));
    const m = c[k].map((v, j) => Math.round(v + (c[k + 1][j] - v) * (t - k)));
    return `rgb(${m[0]} ${m[1]} ${m[2]})`;
  });
}

function rgb(value: string): number[] {
  const v = value.trim();
  if (v.startsWith("#")) {
    const n = v.length === 4 ? [1, 2, 3].map((i) => v[i] + v[i]) : [1, 3, 5].map((i) => v.slice(i, i + 2));
    return n.map((h) => Number.parseInt(h, 16));
  }
  const m = v.match(/-?[\d.]+/g);
  return m ? m.slice(0, 3).map(Number) : [0, 0, 0];
}
