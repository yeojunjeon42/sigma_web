"use client";

import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { T } from "@/components/T";
import { DOT, GROUND, GROUND_INK, SCREEN, groundPatch } from "@/lib/halftone";

export type HeroBuild = {
  id: string;
  src: string;
  name: { en: string; ko: string };
  year: number | null;
};

const SIZES = 40;
const BANDS = 10;
const SWELL = 1.6;
const LENS = 0.34;
const HOLE = 0.62;
const FRONT = 0.3;
const WAVE = 1500;
const QUICK = 650;
const BAND = 240;
const FADE = 0.6;
const CYCLE = 7000;
const IDLE = 2200;
const HOLD = 300;
const DRIFT = [14, 9];
const EDGE = [0.11, 0.84];
const PAPER_INK = "--color-rule-strong";
const KEY = "sigma_plate";

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
        <T en={b.name.en} ko={b.name.ko} />
        {b.year ? <span className="tabular-nums text-ink-muted">{b.year}</span> : null}
        <span aria-hidden="true">↗</span>
      </Link>
      <button
        type="button"
        onClick={() => advance?.()}
        className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-end leading-none text-ink-muted uppercase transition-colors hover:text-ink lg:min-h-0 lg:min-w-0"
      >
        <T en="Next" ko="다음" />
      </button>
    </p>
  );
}

type Tones = { key: string; cols: number; rows: number; tone: Float32Array };
type Box = { x: number; y: number; w: number; h: number };

export default function HeroPlate({ builds }: { builds: HeroBuild[] }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.closest<HTMLElement>("section");
    const plate = host?.querySelector<HTMLElement>("[data-plate]");
    const ctx = canvas?.getContext("2d");
    const mc = document.createElement("canvas");
    const pc = document.createElement("canvas");
    const mctx = mc.getContext("2d");
    const pctx = pc.getContext("2d");
    if (!canvas || !host || !plate || !ctx || !mctx || !pctx || !builds.length) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frozen = !!canvas.closest("[inert]");
    const fine = window.matchMedia("(hover: hover)").matches;
    const top = SCREEN * DOT;
    const rTop = top * SWELL;
    const rGround = (1 - GROUND) * top;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let box: Box = { x: 0, y: 0, w: 0, h: 0 };
    let rev = new Float32Array(0);
    let mask: ImageData | null = null;
    let revMax = 0;

    const SLOTS = SIZES * (BANDS + 1);
    let cap = 1 << 10;
    let bx = new Float32Array(SLOTS * cap);
    let by = new Float32Array(SLOTS * cap);
    const held = new Int32Array(SLOTS);
    let mixes: string[] = [];
    let ink = "#0f0d09";
    let ground: CanvasPattern | null = null;
    let groundKey = "";

    const all = [...builds];
    let curated = 0;
    let hold = false;
    let wave = WAVE;
    const imgs = new Map<number, HTMLImageElement>();
    const tones = new Map<number, Tones>();
    let a = -1;
    let b = -1;
    let want: { i: number; at?: { x: number; y: number }; quick?: boolean } | null = null;
    let t = 1;
    let t0 = 0;
    let origin = { x: 0, y: 0 };

    const ptr = { x: 0, y: 0, in: false, speed: 0, down: 0, link: false, left: 0 };
    const lens = { x: 0, y: 0, vx: 0, vy: 0, px: 0, py: 0, amp: 0, boost: 0 };
    const par = { x: 0, y: 0 };
    let raf = 0;
    let last = 0;
    let move = 0;
    let seen = false;
    let roam = false;
    let pressed = false;
    let on = 0;

    const css = (n: string, f: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(n).trim() || f;

    const load = (i: number) => {
      let img = imgs.get(i);
      if (!img) {
        img = new Image();
        img.decoding = "async";
        img.onload = kick;
        img.src = all[i].src;
        imgs.set(i, img);
      }
      return img.complete && img.naturalWidth ? img : null;
    };

    const place = (img: HTMLImageElement): Box => {
      const s = Math.min(box.w / img.naturalWidth, box.h / img.naturalHeight);
      const w = img.naturalWidth * s;
      const h = img.naturalHeight * s;
      return { x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h };
    };

    const measure = (i: number, img: HTMLImageElement, r: Box) => {
      const c = Math.max(1, Math.round(r.w / SCREEN));
      const n = Math.max(1, Math.round(r.h / SCREEN));
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
      for (let k = 0; k < tone.length; k++) {
        const v = Math.min(1, Math.max(0, (tone[k] - lo) / (hi - lo)));
        tone[k] = Math.min(v, 1 - 0.22 * solid[k]);
      }
      const out = { key, cols: c, rows: n, tone };
      tones.set(i, out);
      return out;
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
      const pr = plate.getBoundingClientRect();
      W = hr.width;
      H = hr.height;
      if (!W || !H) return;
      box = { x: pr.left - hr.left, y: pr.top - hr.top, w: pr.width, h: pr.height };
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      cols = Math.ceil(W / SCREEN);
      rows = Math.ceil(H / SCREEN);
      rev = new Float32Array(cols * rows);
      revMax = 0;
      mc.width = cols;
      mc.height = rows;
      mask = mctx.createImageData(cols, rows);
      if (t >= 1) origin = { x: box.x + box.w / 2, y: box.y + box.h / 2 };
      if (!ptr.in && lens.amp < 0.02) {
        lens.x = lens.px = origin.x;
        lens.y = lens.py = origin.y;
      }
      kick();
    };

    const stamp = (x: number, y: number, r: number, gain: number) => {
      const i0 = Math.max(0, Math.floor((x - r) / SCREEN));
      const i1 = Math.min(cols - 1, Math.ceil((x + r) / SCREEN));
      const j0 = Math.max(0, Math.floor((y - r) / SCREEN));
      const j1 = Math.min(rows - 1, Math.ceil((y + r) / SCREEN));
      for (let j = j0; j <= j1; j++) {
        for (let i = i0; i <= i1; i++) {
          const d = Math.hypot((i + 0.5) * SCREEN - x, (j + 0.5) * SCREEN - y);
          const v = smooth(clamp((r - d) / (r * 0.5), 0, 1)) * gain;
          const k = j * cols + i;
          if (v > rev[k]) rev[k] = v;
          if (v > revMax) revMax = v;
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
      t0 = performance.now();
      t = still || frozen ? 1 : 0;
      if (t >= 1) show(all[b]);
      try {
        localStorage.setItem(KEY, String(curated));
      } catch {}
      load((curated + 1) % builds.length);
      kick();
    };

    const next = (at?: { x: number; y: number }) => {
      if (t < 1 || want) return;
      const i = (curated + 1) % builds.length;
      if (load(i)) start(i, at);
      else want = { i, at };
    };

    const draw = () => {
      if (!W || !H) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const base = css(GROUND_INK, "#76767a");
      const pale = css(PAPER_INK, "#b0b0b0");
      const accent = css("--color-accent", "#ed2024");
      const deep = css("--color-accent-deep", "#8e1316");
      if (groundKey !== base + pale + accent + deep + dpr) {
        groundKey = base + pale + accent + deep + dpr;
        mixes = [...ramp([base, accent, deep], BANDS), pale];
        ink = css("--color-ink", "#0f0d09");
        const patch = groundPatch(SCREEN, GROUND, dpr, PAPER_INK);
        ground = patch && ctx.createPattern(patch, "repeat");
        if (ground && patch) ground.setTransform(new DOMMatrix().scaleSelf(SCREEN / patch.width));
      }

      const ox = -par.x * DRIFT[0];
      const oy = -par.y * DRIFT[1];
      const ia = a >= 0 ? load(a) : null;
      const ib = b >= 0 ? load(b) : null;
      const ra = ia ? shift(place(ia), ox, oy) : null;
      const rb = ib ? shift(place(ib), ox, oy) : null;
      const ga = ia && ra && t < 1 ? measure(a, ia, ra) : null;
      const gb = ib && rb ? measure(b, ib, rb) : null;

      const R = clamp(W * 0.085, 70, 150) * (1 + lens.boost);
      const lensOn = lens.amp > 0.01 && !still;
      const li0 = lensOn ? Math.max(0, Math.floor((lens.x - R) / SCREEN)) : 0;
      const li1 = lensOn ? Math.min(cols - 1, Math.ceil((lens.x + R) / SCREEN)) : -1;
      const lj0 = lensOn ? Math.max(0, Math.floor((lens.y - R) / SCREEN)) : 0;
      const lj1 = lensOn ? Math.min(rows - 1, Math.ceil((lens.y + R) / SCREEN)) : -1;

      if (ground) {
        ctx.save();
        if (lensOn) {
          const hole = new Path2D();
          hole.rect(0, 0, W, H);
          for (let j = lj0; j <= lj1; j++) {
            for (let i = li0; i <= li1; i++) {
              if (Math.hypot((i + 0.5) * SCREEN - lens.x, (j + 0.5) * SCREEN - lens.y) < R)
                hole.rect(i * SCREEN, j * SCREEN, SCREEN, SCREEN);
            }
          }
          ctx.clip(hole, "evenodd");
        }
        ctx.fillStyle = ground;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

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

      held.fill(0);
      let grew = false;
      if (x1 > x0) {
        const reach = Math.max(
          Math.hypot(x0 - origin.x, y0 - origin.y),
          Math.hypot(x1 - origin.x, y0 - origin.y),
          Math.hypot(x0 - origin.x, y1 - origin.y),
          Math.hypot(x1 - origin.x, y1 - origin.y),
        );
        const i0 = Math.max(0, Math.floor(x0 / SCREEN));
        const i1 = Math.min(cols - 1, Math.ceil(x1 / SCREEN));
        const j0 = Math.max(0, Math.floor(y0 / SCREEN));
        const j1 = Math.min(rows - 1, Math.ceil(y1 / SCREEN));
        for (let j = j0; j <= j1; j++) {
          const py = (j + 0.5) * SCREEN;
          for (let i = i0; i <= i1; i++) {
            const px = (i + 0.5) * SCREEN;
            let tone = gb && rb ? sample(gb, rb, px, py) : 1;
            let lt = 1;
            if (t < 1) {
              const d = Math.hypot(px - origin.x, py - origin.y);
              lt = smooth(clamp((t * (reach + BAND) - d) / BAND, 0, 1));
              const from = ga && ra ? sample(ga, ra, px, py) : 1;
              tone = from + (tone - from) * lt;
            }
            let r = (1 - GROUND * (0.12 + 0.88 * tone)) * top;
            const built = r > rGround + 0.06;
            const d = lensOn ? Math.hypot(px - lens.x, py - lens.y) : Infinity;
            const loupe = d < R;
            if (!built && !loupe) continue;

            let x = px;
            let y = py;
            if (built) {
              r *= 1 - rev[j * cols + i];
              if (lt > 0 && lt < 1) r *= 1 + FRONT * Math.sin(Math.PI * lt);
            } else r = rGround;
            if (loupe) {
              const q = (1 - (d / R) * (d / R)) * lens.amp * LENS;
              x = lens.x + (px - lens.x) * (1 + q);
              y = lens.y + (py - lens.y) * (1 + q);
              r *= 1 + q * 0.9;
            }
            if (r < 0.25) continue;

            const size = clamp(Math.round((r / rTop) * SIZES) - 1, 0, SIZES - 1);
            const band = built ? Math.min(BANDS - 1, Math.round((1 - tone) * (BANDS - 1))) : BANDS;
            const slot = band * SIZES + size;
            const n = held[slot];
            if (n < cap) {
              bx[slot * cap + n] = x;
              by[slot * cap + n] = y;
              held[slot] = n + 1;
            } else grew = true;
          }
        }
      }

      const flush = (from: number, to: number) => {
        for (let slot = from; slot < to; slot++) {
          const n = held[slot];
          if (!n) continue;
          const r = (rTop * ((slot % SIZES) + 1)) / SIZES;
          ctx.fillStyle = mixes[Math.floor(slot / SIZES)];
          ctx.beginPath();
          for (let k = 0; k < n; k++) {
            const x = bx[slot * cap + k];
            const y = by[slot * cap + k];
            ctx.moveTo(x + r, y);
            ctx.arc(x, y, r, 0, Math.PI * 2);
          }
          ctx.fill();
        }
      };

      flush(SIZES * BANDS, SLOTS);

      const face = t > 0.5 ? ib : ia;
      const fr = t > 0.5 ? rb : ra;
      if (revMax > 0.01 && face && fr && mask) {
        for (let k = 0; k < rev.length; k++) mask.data[k * 4 + 3] = rev[k] * 255;
        mctx.putImageData(mask, 0, 0);
        const pw = Math.max(1, Math.ceil(fr.w * dpr));
        const ph = Math.max(1, Math.ceil(fr.h * dpr));
        if (pc.width !== pw || pc.height !== ph) {
          pc.width = pw;
          pc.height = ph;
        }
        pctx.globalCompositeOperation = "source-over";
        pctx.clearRect(0, 0, pw, ph);
        pctx.drawImage(mc, -fr.x * dpr, -fr.y * dpr, cols * SCREEN * dpr, rows * SCREEN * dpr);
        pctx.globalCompositeOperation = "source-in";
        pctx.drawImage(face, 0, 0, pw, ph);
        ctx.drawImage(pc, fr.x, fr.y, fr.w, fr.h);
      }

      flush(0, SIZES * BANDS);

      const edge = ctx.createLinearGradient(0, 0, 0, H);
      edge.addColorStop(0, "rgb(0 0 0 / 1)");
      edge.addColorStop(EDGE[0], "rgb(0 0 0 / 0)");
      edge.addColorStop(EDGE[1], "rgb(0 0 0 / 0)");
      edge.addColorStop(1, "rgb(0 0 0 / 1)");
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = edge;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";

      if (lensOn) {
        ctx.globalAlpha = 0.5 * lens.amp;
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(lens.x, lens.y, R, 0, Math.PI * 2);
        ctx.stroke();
        if (ptr.in) {
          ctx.globalAlpha = lens.amp;
          ctx.fillStyle = ink;
          ctx.beginPath();
          ctx.arc(ptr.x, ptr.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      if (grew) {
        cap *= 2;
        bx = new Float32Array(SLOTS * cap);
        by = new Float32Array(SLOTS * cap);
        kick();
      }
      return R;
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = clamp((now - last) / 1000, 0.001, 0.05);
      last = now;

      if (want && t >= 1 && load(want.i)) start(want.i, want.at, want.quick);
      if (b < 0 && !want) {
        let first = 0;
        try {
          first = (Number(localStorage.getItem(KEY) ?? -1) + 1) % builds.length || 0;
        } catch {}
        want = { i: first };
        load(first);
      }
      if (t < 1) {
        t = Math.min(1, (now - t0) / wave);
        if (t > 0.5) show(all[b]);
      }

      if (!still) {
        roam = !ptr.in && now - ptr.left > IDLE;
        const s = now / 1000;
        const gx = roam ? box.x + box.w * (0.5 + 0.3 * Math.cos(s * 0.57)) : ptr.x;
        const gy = roam ? box.y + box.h * (0.5 + 0.26 * Math.sin(s * 0.83 + 1)) : ptr.y;
        const k = roam ? 14 : 120;
        const c = roam ? 7 : 16;
        lens.vx += ((gx - lens.x) * k - lens.vx * c) * dt;
        lens.vy += ((gy - lens.y) * k - lens.vy * c) * dt;
        lens.x += lens.vx * dt;
        lens.y += lens.vy * dt;
        on = roam ? 0.8 : ptr.in && !ptr.link ? 1 : 0;
        lens.amp += (on - lens.amp) * (1 - Math.exp(-dt * (roam ? 2 : 8)));
        ptr.speed *= Math.exp(-dt * 6);
        const swell = ptr.down && ptr.in ? 0.9 : clamp(ptr.speed / 1800, 0, 0.7);
        lens.boost += (swell - lens.boost) * (1 - Math.exp(-dt * 6));
        const tx = ptr.in ? (ptr.x / W) * 2 - 1 : 0;
        const ty = ptr.in ? (ptr.y / H) * 2 - 1 : 0;
        par.x += (tx - par.x) * (1 - Math.exp(-dt * 4));
        par.y += (ty - par.y) * (1 - Math.exp(-dt * 4));
        host.style.setProperty("--hx", par.x.toFixed(3));
        host.style.setProperty("--hy", par.y.toFixed(3));

        if (revMax > 0) {
          const fade = Math.exp(-dt / (t < 1 ? FADE / 4 : FADE));
          revMax = 0;
          for (let i = 0; i < rev.length; i++) {
            const v = rev[i] * fade;
            rev[i] = v < 0.004 ? 0 : v;
            if (v > revMax) revMax = v;
          }
        }
      }

      const R = draw() ?? 0;

      if (!still && lens.amp > 0.2 && t >= 1) {
        const hole = R * HOLE;
        const steps = Math.max(1, Math.ceil(Math.hypot(lens.x - lens.px, lens.y - lens.py) / (hole / 2)));
        for (let s = 1; s <= steps; s++) {
          const f = s / steps;
          stamp(lens.px + (lens.x - lens.px) * f, lens.py + (lens.y - lens.py) * f, hole, lens.amp);
        }
      }
      lens.px = lens.x;
      lens.py = lens.y;

      if (seen && !document.hidden && (t < 1 || want || revMax > 0.004 || (!still && !frozen))) {
        if (roam && !fine) window.setTimeout(kick, 24);
        else kick();
      }
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
        lens.x = lens.px = x;
        lens.y = lens.py = y;
        lens.vx = lens.vy = 0;
      }
      move = now;
      ptr.x = x;
      ptr.y = y;
      ptr.in = true;
      ptr.link = !!(e.target as HTMLElement).closest("a,button");
      if (e.type === "pointerdown") ptr.down = now;
      if (still) {
        rev.fill(0);
        revMax = 0;
        stamp(x, y, clamp(W * 0.085, 70, 150) * HOLE, 1);
      }
      kick();
    };
    const out = () => {
      ptr.in = false;
      ptr.down = 0;
      ptr.left = performance.now();
      if (still) {
        rev.fill(0);
        revMax = 0;
      }
      kick();
    };
    const up = (e: PointerEvent) => {
      pressed = ptr.down > 0 && performance.now() - ptr.down > HOLD;
      ptr.down = 0;
      if (e.pointerType !== "mouse") out();
    };
    const click = (e: MouseEvent) => {
      if (pressed || (e.target as HTMLElement).closest("a,button")) return;
      lens.boost = Math.min(1, lens.boost + 0.5);
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
      load(i);
      want = { i, at: { x: box.x + box.w / 2, y: box.y + box.h }, quick: true };
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
    ro.observe(host);
    io.observe(host);
    resize();

    let timer = 0;
    if (!frozen) {
      host.addEventListener("pointermove", at);
      host.addEventListener("pointerdown", at);
      host.addEventListener("pointerup", up);
      host.addEventListener("pointerleave", out);
      host.addEventListener("pointercancel", out);
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
    };
  }, [builds]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
    />
  );
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
