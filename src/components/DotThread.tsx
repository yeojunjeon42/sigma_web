"use client";

import { useEffect, useRef } from "react";
import { BANDS, SIZES, SWELL, plateDots, plateLeave, plateShown } from "@/components/ui/HeroPlate";
import { DOT, GROUND, SCREEN, turnAt } from "@/lib/halftone";
import { onPageScroll, pageY } from "@/lib/pageScroll";
import { printer } from "@/lib/printer";

type Build = { id: string; src: string };
type Box = { x: number; y: number; w: number; h: number };
type Shape = { n: number; x: Float32Array; y: Float32Array; r: Float32Array; band: Uint8Array; cx: number; cy: number; tree?: Tree };
type Tree = { seeds: Point[]; gates: Point[]; seed: Uint8Array; deep: Float32Array; route: Float32Array };
type Leg = {
  n: number;
  a: Int32Array;
  b: Int32Array;
  from: number;
  to: number;
  lines: Float32Array[];
  out: Tree | null;
  into: Tree;
};
type Point = [number, number];

const LEAVE = 0.3;
const ARRIVE = 0.62;
const STAGGER = 0.6;
const DOWN = 0.2;
const UP = 0.36;
const TAPER = 0.38;
const SPREAD = 7;
const LINE = 96;
const ROUTE = 8;
const SEEDS = 5;
const FLY = 0.42;
const PACE = 0.7;
const DRIFT = 13;
const SMALL = 0.8;
const HOT = 0.35;
const DEEPER = 3;
const RUN = 2.4;
const TOP = SCREEN * DOT;
const LARGEST = TOP * SWELL;
const SLOTS = SIZES * BANDS;
const R_GROUND = (1 - GROUND) * TOP;

const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
const smooth = (v: number) => v * v * (3 - 2 * v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const hash = (n: number) => {
  const h = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return h - Math.floor(h);
};

function printOf(img: HTMLImageElement, box: Box): Shape | null {
  const probe = document.createElement("canvas");
  probe.width = probe.height = 96;
  const pg = probe.getContext("2d", { willReadFrequently: true });
  if (!pg) return null;
  pg.drawImage(img, 0, 0, 96, 96);
  const pd = pg.getImageData(0, 0, 96, 96).data;
  let u0 = 96;
  let v0 = 96;
  let u1 = 0;
  let v1 = 0;
  for (let v = 0; v < 96; v++)
    for (let u = 0; u < 96; u++)
      if (pd[(v * 96 + u) * 4 + 3] > 40) {
        u0 = Math.min(u0, u);
        v0 = Math.min(v0, v);
        u1 = Math.max(u1, u + 1);
        v1 = Math.max(v1, v + 1);
      }
  if (u1 <= u0 || v1 <= v0) return null;
  const sx = (u0 / 96) * img.naturalWidth;
  const sy = (v0 / 96) * img.naturalHeight;
  const sw = ((u1 - u0) / 96) * img.naturalWidth;
  const sh = ((v1 - v0) / 96) * img.naturalHeight;

  const fit = Math.min(box.w / sw, box.h / sh);
  const w = sw * fit;
  const h = sh * fit;
  const x0 = Math.round((box.x + (box.w - w) / 2) / SCREEN) * SCREEN;
  const y0 = Math.round((box.y + (box.h - h) / 2) / SCREEN) * SCREEN;
  const cols = Math.max(1, Math.round(w / SCREEN));
  const rows = Math.max(1, Math.round(h / SCREEN));
  const c = document.createElement("canvas");
  c.width = cols * 2;
  c.height = rows * 2;
  const g = c.getContext("2d", { willReadFrequently: true });
  if (!g) return null;
  g.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
  const d = g.getImageData(0, 0, c.width, c.height).data;
  const tone = new Float32Array(cols * rows);
  const solid = new Float32Array(cols * rows);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      let sum = 0;
      let al = 0;
      for (let yy = 0; yy < 2; yy++) {
        for (let xx = 0; xx < 2; xx++) {
          const p = ((j * 2 + yy) * c.width + i * 2 + xx) * 4;
          const k = d[p + 3] / 255;
          sum += k * ((0.3 * d[p] + 0.59 * d[p + 1] + 0.11 * d[p + 2]) / 255) + (1 - k) * 0.9;
          al += k;
        }
      }
      tone[j * cols + i] = sum / 4;
      solid[j * cols + i] = al / 4;
    }
  }
  const inside = Float32Array.from(tone.filter((_, k) => solid[k] > 0.5)).sort();
  if (inside.length < 8) return null;
  const lo = inside[Math.floor(inside.length * 0.04)];
  const hi = Math.max(lo + 0.08, Math.min(0.9, inside[Math.floor(inside.length * 0.96)]));
  const max = cols * rows;
  const out: Shape = { n: 0, x: new Float32Array(max), y: new Float32Array(max), r: new Float32Array(max), band: new Uint8Array(max), cx: x0 + w / 2, cy: y0 + h / 2 };
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const k = j * cols + i;
      if (solid[k] < 0.02) continue;
      const t = Math.min(clamp((tone[k] - lo) / (hi - lo)), 1 - 0.22 * solid[k]);
      let r = (1 - GROUND * (0.12 + 0.88 * t)) * TOP;
      if (r <= R_GROUND + 0.06) continue;
      r *= smooth(clamp((r - R_GROUND) / (0.35 * TOP)));
      if (r < 0.25) continue;
      out.x[out.n] = x0 + (i + 0.5) * SCREEN;
      out.y[out.n] = y0 + (j + 0.5) * SCREEN;
      out.r[out.n] = r;
      out.band[out.n++] = Math.min(BANDS - 1, Math.round((1 - t) * (BANDS - 1)));
    }
  }
  return out;
}

function tipOf(s: Shape): Point {
  let low = -Infinity;
  for (let k = 0; k < s.n; k++) low = Math.max(low, s.y[k]);
  let sum = 0;
  let count = 0;
  for (let k = 0; k < s.n; k++)
    if (s.y[k] > low - SCREEN * 3) {
      sum += s.x[k];
      count++;
    }
  return [count ? sum / count : s.cx, low];
}

function treeOf(s: Shape): Tree {
  if (s.tree) return s.tree;
  const tip = tipOf(s);
  const cell = new Map<number, number>();
  const key = (i: number, j: number) => j * 8192 + i;
  const col = (k: number) => Math.floor(s.x[k] / SCREEN);
  const row = (k: number) => Math.floor(s.y[k] / SCREEN);
  let low = 0;
  for (let k = 0; k < s.n; k++) {
    cell.set(key(col(k), row(k)), k);
    if (Math.hypot(s.x[k] - tip[0], s.y[k] - tip[1]) < Math.hypot(s.x[low] - tip[0], s.y[low] - tip[1])) low = k;
  }
  const picked = [low];
  const apart = Float32Array.from({ length: s.n }, (_, k) => Math.hypot(s.x[k] - s.x[low], s.y[k] - s.y[low]));
  while (picked.length < Math.min(SEEDS, s.n)) {
    let next = Math.floor(hash(s.n * 1.7 + picked.length * 5.3) * s.n);
    if (picked.length < 3) for (let k = 0; k < s.n; k++) if (apart[k] > apart[next]) next = k;
    if (picked.includes(next)) next = (next + 1) % s.n;
    picked.push(next);
    for (let k = 0; k < s.n; k++) apart[k] = Math.min(apart[k], Math.hypot(s.x[k] - s.x[next], s.y[k] - s.y[next]));
  }

  const far = new Float32Array(s.n).fill(Infinity);
  const parent = new Int32Array(s.n).fill(-1);
  const seed = new Uint8Array(s.n);
  const heap: number[] = [];
  const push = (d: number, k: number) => {
    let i = heap.length;
    heap.push(d, k);
    while (i > 0) {
      const up = ((i / 2 - 1) >> 1) * 2;
      if (heap[up] <= heap[i]) break;
      [heap[up], heap[up + 1], heap[i], heap[i + 1]] = [heap[i], heap[i + 1], heap[up], heap[up + 1]];
      i = up;
    }
  };
  const pop = () => {
    const d = heap[0];
    const k = heap[1];
    const lk = heap.pop() as number;
    const ld = heap.pop() as number;
    if (heap.length) {
      heap[0] = ld;
      heap[1] = lk;
      for (let i = 0; ; ) {
        let least = i;
        for (const c of [i * 2 + 2, i * 2 + 4]) if (c < heap.length && heap[c] < heap[least]) least = c;
        if (least === i) break;
        [heap[least], heap[least + 1], heap[i], heap[i + 1]] = [heap[i], heap[i + 1], heap[least], heap[least + 1]];
        i = least;
      }
    }
    return [d, k];
  };
  const spread = () => {
    while (heap.length) {
      const [d, k] = pop();
      if (d > far[k]) continue;
      for (let dj = -2; dj <= 2; dj++)
        for (let di = -2; di <= 2; di++) {
          if (!di && !dj) continue;
          const to = cell.get(key(col(k) + di, row(k) + dj));
          if (to === undefined) continue;
          const step = Math.hypot(di, dj) * SCREEN * (Math.abs(di) > 1 || Math.abs(dj) > 1 ? 1.6 : 1);
          if (d + step < far[to]) {
            far[to] = d + step;
            parent[to] = k;
            seed[to] = seed[k];
            push(far[to], to);
          }
        }
    }
  };
  picked.forEach((k, i) => {
    far[k] = 0;
    seed[k] = i;
    push(0, k);
  });
  spread();
  for (let k = 0; k < s.n; k++) {
    if (far[k] < Infinity) continue;
    let near = low;
    let gap = Infinity;
    for (let q = 0; q < s.n; q++) {
      if (far[q] === Infinity) continue;
      const d = Math.hypot(s.x[q] - s.x[k], s.y[q] - s.y[k]);
      if (d < gap) {
        gap = d;
        near = q;
      }
    }
    far[k] = far[near] + gap;
    parent[k] = near;
    seed[k] = seed[near];
    push(far[k], k);
    spread();
  }
  let most = 1;
  for (let k = 0; k < s.n; k++) most = Math.max(most, far[k]);
  const deep = Float32Array.from(far, (d) => d / most);
  const route = new Float32Array(s.n * ROUTE * 2);
  const chain: number[] = [];
  for (let k = 0; k < s.n; k++) {
    chain.length = 0;
    for (let q = k; q >= 0; q = parent[q]) chain.push(q);
    for (let i = 0; i < ROUTE; i++) {
      const q = chain[Math.round((1 - i / (ROUTE - 1)) * (chain.length - 1))];
      route[(k * ROUTE + i) * 2] = s.x[q];
      route[(k * ROUTE + i) * 2 + 1] = s.y[q];
    }
  }
  const seeds = picked.map((k): Point => [s.x[k], s.y[k]]);
  const gates = seeds.map(([x, y], i): Point => {
    const away = Math.hypot(x - s.cx, y - s.cy) || 1;
    const ux = (x - s.cx) / away;
    const uy = (y - s.cy) / away;
    const off = (hash(i * 3.9 + s.n) - 0.5) * 110;
    const reach = 62 + 70 * hash(i * 7.1 + s.n);
    return [x + ux * reach - uy * off, y + uy * reach + ux * off];
  });
  s.tree = { seeds, gates, seed, deep, route };
  return s.tree;
}

function lineThrough(points: Point[]) {
  const at = (u: number, axis: 0 | 1) => {
    const f = clamp(u) * (points.length - 1);
    const i = Math.min(points.length - 2, Math.floor(f));
    const t = f - i;
    const p0 = points[Math.max(0, i - 1)][axis];
    const p1 = points[i][axis];
    const p2 = points[i + 1][axis];
    const p3 = points[Math.min(points.length - 1, i + 2)][axis];
    return 0.5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (3 * p1 - p0 - 3 * p2 + p3) * t * t * t);
  };
  const fine = LINE * 4;
  const run = new Float32Array(fine + 1);
  for (let i = 1; i <= fine; i++)
    run[i] = run[i - 1] + Math.hypot(at(i / fine, 0) - at((i - 1) / fine, 0), at(i / fine, 1) - at((i - 1) / fine, 1));
  const line = new Float32Array((LINE + 1) * 2);
  let j = 0;
  for (let i = 0; i <= LINE; i++) {
    const want = (run[fine] * i) / LINE;
    while (j < fine - 1 && run[j + 1] < want) j++;
    const u = (j + (run[j + 1] > run[j] ? (want - run[j]) / (run[j + 1] - run[j]) : 0)) / fine;
    line[i * 2] = at(u, 0);
    line[i * 2 + 1] = at(u, 1);
  }
  return line;
}

function legOf(A: Shape, B: Shape, H: number, via: Point[], pour: boolean): Leg {
  const out = pour ? null : treeOf(A);
  const into = treeOf(B);
  const tip = tipOf(A);
  const starts: Point[][] = out ? out.seeds.map((seed, i) => [seed, out.gates[i]]) : [[tip]];
  const lines = starts.flatMap((start) => into.seeds.map((seed, i) => lineThrough([...start, ...via, into.gates[i], seed])));

  const first = Float32Array.from({ length: A.n }, (_, k) =>
    out ? -out.deep[k] + hash(k) * 0.16 : Math.hypot(A.x[k] - tip[0], A.y[k] - tip[1]) + hash(k) * 70,
  );
  const last = Float32Array.from({ length: B.n }, (_, k) => into.deep[k] + hash(k * 1.9) * 0.16);
  const oa = Array.from({ length: A.n }, (_, k) => k).sort((p, q) => first[p] - first[q]);
  const ob = Array.from({ length: B.n }, (_, k) => k).sort((p, q) => last[p] - last[q]);
  const n = Math.max(A.n, B.n);
  const a = new Int32Array(n);
  const b = new Int32Array(n);
  const pick = (o: number[], m: number, k: number) => {
    const i = Math.floor((k * m) / n);
    return k > 0 && i === Math.floor(((k - 1) * m) / n) ? -1 - o[i] : o[i];
  };
  for (let k = 0; k < n; k++) {
    a[k] = pick(oa, A.n, k);
    b[k] = pick(ob, B.n, k);
  }
  return { n, a, b, from: A.cy - LEAVE * H, to: B.cy - ARRIVE * H, lines, out, into };
}

export default function DotThread({ builds }: { builds: Build[] }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const hero = document.querySelector<HTMLElement>("section [data-plate]")?.closest("section");
    if (!canvas || !hero) return;
    const desk = window.matchMedia("(min-width: 64rem) and (pointer: fine)");
    if (!desk.matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const print = printer(canvas, () => kick());
    if (!print) return;
    canvas.hidden = false;

    let live = true;
    let raf = 0;
    let W = 0;
    let H = 0;
    let start = Infinity;
    let middle = { x: 0, y: 0 };
    let gap: Point | null = null;
    let rule: Point | null = null;
    let prints: Shape[] = [];
    let shapes: Shape[] = [];
    let legs: Leg[] = [];
    let taken = false;
    let asked = "";
    let at = 0;
    let last = 0;

    const css = (n: string, f: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || f;
    const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const stops = [rgb(css("--color-rule-field", "#76767a")), rgb(css("--color-accent", "#ed2024")), rgb(css("--color-accent-deep", "#8e1316"))];
    const inks = Array.from({ length: BANDS }, (_, k) => {
      const t = (k / (BANDS - 1)) * 2;
      const s = Math.min(1, Math.floor(t));
      const c = stops[s].map((v, n) => Math.round(v + (stops[s + 1][n] - v) * (t - s)));
      return `rgb(${c[0]} ${c[1]} ${c[2]})`;
    });

    const imgs = new Map<string, HTMLImageElement>();
    const image = (b: Build) => {
      let img = imgs.get(b.id);
      if (!img) {
        img = new Image();
        img.decoding = "async";
        img.onload = () => live && measure();
        img.src = b.src;
        imgs.set(b.id, img);
      }
      return img.complete && img.naturalWidth ? img : null;
    };

    const boxes = (): Box[] => {
      const y = pageY();
      const out: Box[] = [];
      const gutter = parseFloat(getComputedStyle(hero).getPropertyValue("--gutter")) || 24;
      const col = (W - gutter * 13) / 12;
      const line = (n: number) => gutter + (n - 1) * (col + gutter);
      const heads = [...document.querySelectorAll("main h2")];
      const span = (name?: string) => {
        const h2 = name ? heads.find((h) => h.textContent?.trim() === name) : undefined;
        const list = h2?.nextElementSibling;
        if (!h2 || !list) return null;
        const a = h2.getBoundingClientRect();
        const b = list.getBoundingClientRect();
        return { top: a.top + y, bottom: Math.max(a.bottom, b.bottom) + y };
      };
      // The rows above and below a print run through its columns, so it keeps a gutter clear of both.
      const beside = (name: string, from: number, to: number, above?: string, below?: string) => {
        const own = span(name);
        if (!own) return;
        const mid = (own.top + own.bottom) / 2;
        const up = span(above);
        const down = span(below);
        const half = Math.min(
          Math.min(520, H * 0.6) / 2,
          up ? mid - up.bottom - gutter : Infinity,
          down ? down.top - gutter - mid : Infinity,
        );
        if (half <= 0) return;
        out.push({ x: line(from), y: mid - half, w: line(to + 1) - gutter - line(from), h: half * 2 });
      };
      beside("Stacks", 8, 12, undefined, "Equipments");
      beside("Equipments", 1, 5, "Stacks", "Intake");
      return out;
    };

    const link = () => {
      const hand = taken ? plateDots() : null;
      if (!hand) {
        shapes = [];
        legs = [];
        return;
      }
      shapes = [{ ...hand, cx: middle.x, cy: middle.y }, ...prints];
      legs = shapes.slice(1).map((B, i) => {
        const A = shapes[i];
        const dx = B.cx - A.cx;
        const dy = B.cy - A.cy;
        const on = (share: number, side: number): Point => [A.cx + dx * share - dy * side, A.cy + dy * share + dx * side];
        const via: Point[] = i === 0 ? [...(rule ? [rule] : []), ...(gap ? [gap] : []), on(0.72, 0.03)] : [on(0.24, 0.07), on(0.5, 0.14), on(0.76, 0.06)];
        return legOf(A, B, H, via, i === 0);
      });
    };

    const measure = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      print.size(W, H, Math.min(window.devicePixelRatio || 1, 3));
      const plate = hero.querySelector("[data-plate]")?.getBoundingClientRect();
      if (!plate) return;
      const y = pageY();
      middle = { x: plate.left + plate.width / 2, y: plate.top + y + plate.height / 2 };
      start = middle.y - LEAVE * H;
      const band = document.querySelector("main section[aria-label^='Founded']");
      const first = band?.querySelector("p")?.getBoundingClientRect();
      const box = band?.getBoundingClientRect();
      const gutter = parseFloat(getComputedStyle(hero).getPropertyValue("--gutter")) || 24;
      gap = first && box ? [first.right + gutter / 2, box.top + y + box.height / 2] : null;
      // The supporters' row lies on the way to the gap. The thread passes it at the clear spot
      // nearest the gap, between two logos or past the row's end, so no dot crosses a logo.
      const logos = [...document.querySelectorAll("main section[aria-label='Supported by'] li")].map((li) => li.getBoundingClientRect());
      const g = gap;
      rule = null;
      if (g && logos.length) {
        const clear = [logos[0].left - gutter * 3, ...logos.slice(1).map((r, i) => (logos[i].right + r.left) / 2), logos[logos.length - 1].right + gutter * 3];
        const x = clear.reduce((a, c) => (Math.abs(c - g[0]) < Math.abs(a - g[0]) ? c : a));
        rule = [x, logos[0].top + y + logos[0].height / 2];
      }
      const at = Math.max(0, builds.findIndex((b) => b.id === asked));
      prints = boxes().flatMap((box, i) => {
        const img = image(builds[(at + 1 + i) % builds.length]);
        const s = img ? printOf(img, box) : null;
        return s ? [s] : [];
      });
      link();
      kick();
    };

    let cap = 1 << 9;
    let sx = new Float32Array(SLOTS * cap);
    let sy = new Float32Array(SLOTS * cap);
    let st = new Float32Array(SLOTS * cap);
    const held = new Int32Array(SLOTS);
    let short = false;
    const put = (x: number, y: number, r: number, turn: number, band: number) => {
      if (r < 0.25 || y < -12 || y > H + 12) return;
      const slot = band * SIZES + clamp(Math.round((r / LARGEST) * SIZES) - 1, 0, SIZES - 1);
      const n = held[slot];
      if (n >= cap) {
        short = true;
        return;
      }
      sx[slot * cap + n] = x;
      sy[slot * cap + n] = y;
      st[slot * cap + n] = turn;
      held[slot] = n + 1;
    };

    const still = (s: Shape, y: number) => {
      for (let k = 0; k < s.n; k++) put(s.x[k], s.y[k] - y, s.r[k], turnAt(s.x[k], s.y[k]), s.band[k]);
    };

    const run = (L: Leg, A: Shape, B: Shape, P: number, y: number, t: number) => {
      const down = L.out ? DOWN : 0;
      const ride = 1 - down - UP;
      const many = L.into.seeds.length;
      let lx = 0;
      let ly = 0;
      const line = (path: Float32Array, share: number) => {
        const f = clamp(share) * LINE;
        const i = Math.min(LINE - 1, Math.floor(f));
        lx = lerp(path[i * 2], path[i * 2 + 2], f - i);
        ly = lerp(path[i * 2 + 1], path[i * 2 + 3], f - i);
      };
      const route = (tree: Tree, dot: number, c: number) => {
        const f = clamp(c) * (ROUTE - 1);
        const i = Math.min(ROUTE - 2, Math.floor(f));
        const o = (dot * ROUTE + i) * 2;
        lx = lerp(tree.route[o], tree.route[o + 2], f - i);
        ly = lerp(tree.route[o + 1], tree.route[o + 3], f - i);
      };
      const arc = (x0: number, y0: number, x1: number, y1: number, bow: number, c: number) => {
        const mx = (x0 + x1) / 2 - (y1 - y0) * bow;
        const my = (y0 + y1) / 2 + (x1 - x0) * bow;
        const v = 1 - c;
        lx = v * v * x0 + 2 * v * c * mx + c * c * x1;
        ly = v * v * y0 + 2 * v * c * my + c * c * y1;
      };
      for (let k = 0; k < L.n; k++) {
        const ia = L.a[k];
        const ib = L.b[k];
        const ka = ia < 0 ? -1 - ia : ia;
        const kb = ib < 0 ? -1 - ib : ib;
        const order = clamp(k / L.n + 0.03 * Math.sin((k / L.n) * 57 + L.n));
        const e = clamp((P - STAGGER * order) / (1 - STAGGER));
        const jx = (hash(k * 3.1) - 0.5) * SPREAD;
        const jy = (hash(k * 5.9) - 0.5) * SPREAD;
        const pace = PACE + (1 - PACE) * hash(k * 4.7);
        const path = L.lines[(L.out ? L.out.seed[ka] : 0) * many + L.into.seed[kb]];
        const lifts = !!L.out && hash(k * 6.3) < FLY;
        const joins = lifts ? 0.04 + 0.15 * hash(k * 8.9) : 0;
        const flies = hash(k * 2.3) < FLY;
        const quits = flies ? 0.78 + 0.19 * hash(k * 9.7) : 1;
        const bow = (hash(k * 1.3) - 0.5) * (0.5 + 1.6 * hash(k * 7.9) ** 3);
        const boards = L.out ? down * pace * (lifts ? 0.7 : L.out.deep[ka]) : 0;
        const leaves = boards + ride * pace * (quits - joins);
        const lands = leaves + UP * pace * (flies ? 0.75 : L.into.deep[kb]);
        let x: number;
        let yy: number;
        let size = SMALL;
        let heat = 0;
        let loose = 1;
        if (L.out && e < boards) {
          const c = 1 - e / boards;
          if (lifts) {
            line(path, joins);
            arc(lx + jx, ly + jy, A.x[ka], A.y[ka], bow, smooth(c));
          } else {
            route(L.out, ka, c);
            lx += jx * (1 - c);
            ly += jy * (1 - c);
          }
          x = lx;
          yy = ly;
          size = lerp(SMALL, 1, smooth(c));
          heat = Math.sin(Math.PI * c);
          loose = 1 - c;
        } else if (e < leaves) {
          const at = joins + smooth((e - boards) / (leaves - boards)) * (quits - joins);
          line(path, at);
          const own = L.out ? 0 : 1 - smooth(clamp(at / TAPER));
          x = lx + (A.x[ka] - path[0]) * own + jx * (1 - own);
          yy = ly + (A.y[ka] - path[1]) * own + jy * (1 - own);
          size = lerp(SMALL, 1, own);
          loose = 1 - own;
        } else {
          const c = lands > leaves ? clamp((e - leaves) / (lands - leaves)) : 1;
          if (flies) {
            line(path, quits);
            arc(lx + jx, ly + jy, B.x[kb], B.y[kb], bow, smooth(c));
          } else {
            route(L.into, kb, c);
            lx += jx * (1 - c);
            ly += jy * (1 - c);
          }
          x = lx;
          yy = ly;
          heat = Math.sin(Math.PI * c);
          size = lerp(SMALL, 1, smooth(c)) * (1 + HOT * heat * c);
          loose = 1 - c;
        }
        if (loose > 0) {
          const dx = Math.sin(x * 0.009 + t * 0.6) * Math.cos(yy * 0.011 - t * 0.45) + 0.5 * Math.sin(yy * 0.023 + t * 0.9 + k * 0.002);
          const dy = Math.sin(yy * 0.008 + t * 0.52 + 2.3) * Math.cos(x * 0.012 + t * 0.38) + 0.5 * Math.cos(x * 0.021 - t * 0.8);
          x += DRIFT * loose * dx;
          yy += DRIFT * loose * dy;
        }
        const ra = ia < 0 ? 0 : A.r[ka];
        const rb = ib < 0 ? 0 : B.r[kb];
        const done = clamp(e / lands);
        const r = lerp(ra, rb, done) * size + (ia < 0 || ib < 0 ? 0.9 * Math.sin(Math.PI * done) : 0);
        const band = done < 0.5 ? A.band[ka] : B.band[kb];
        put(x, yy - y, r, turnAt(x, yy), Math.min(BANDS - 1, band + Math.round(DEEPER * heat)));
      }
    };

    const goal = (y: number) => {
      let j = 0;
      for (let i = 0; i < legs.length && y > legs[i].from; i++) j = i + clamp((y - legs[i].from) / (legs[i].to - legs[i].from));
      return j;
    };

    const draw = (now: number) => {
      raf = 0;
      const dt = clamp((now - last) / 1000, 0.001, 0.05);
      last = now;
      const y = pageY();
      const below = y > start;
      if (below && !taken) {
        taken = true;
        at = 0;
        link();
      } else if (taken && !shapes.length) link();
      const want = taken && below ? goal(y) : 0;
      at += clamp((want - at) * (1 - Math.exp(-dt * 9)), -dt / RUN, dt / RUN);
      if (Math.abs(want - at) < 0.0004) at = want;
      if (taken && !below && at === 0) {
        taken = false;
        link();
      }
      const ours = taken && shapes.length > 0;
      plateLeave(clamp(y / Math.max(1, start)), ours);

      print.clear();
      if (!ours) return;
      held.fill(0);
      const leg = Math.min(Math.floor(at), legs.length - 1);
      if (leg < 0 || at >= legs.length) still(shapes[shapes.length - 1], y);
      else if (at === leg) still(shapes[leg], y);
      else run(legs[leg], shapes[leg], shapes[leg + 1], at - leg, y, now / 1000);
      print.dots(
        { x: sx, y: sy, turn: st, held, cap, radius: (slot) => (LARGEST * ((slot % SIZES) + 1)) / SIZES, ink: (slot) => Math.floor(slot / SIZES) },
        0,
        SLOTS,
        inks,
      );
      if (short) {
        short = false;
        cap *= 2;
        sx = new Float32Array(SLOTS * cap);
        sy = new Float32Array(SLOTS * cap);
        st = new Float32Array(SLOTS * cap);
        kick();
      }
      if (at !== want || at % 1 !== 0) kick();
    };
    function kick() {
      if (!raf) raf = requestAnimationFrame(draw);
    }

    const plate = () => {
      const id = plateShown.get()?.id ?? "";
      if (id === asked || taken) return;
      asked = id;
      measure();
    };
    let settle = 0;
    const resize = () => {
      window.clearTimeout(settle);
      settle = window.setTimeout(measure, 200);
    };
    const stopScroll = onPageScroll(kick);
    const stopPlate = plateShown.subscribe(plate);
    window.addEventListener("resize", resize);
    asked = plateShown.get()?.id ?? "";
    document.fonts.ready.then(() => live && measure());
    const opening = hero.getAnimations({ subtree: true }).filter((a) => a instanceof CSSAnimation && a.animationName.startsWith("hero-"));
    Promise.all(opening.map((a) => a.finished.catch(() => {}))).then(() => live && measure());

    return () => {
      live = false;
      stopScroll();
      stopPlate();
      window.removeEventListener("resize", resize);
      window.clearTimeout(settle);
      cancelAnimationFrame(raf);
      for (const img of imgs.values()) img.onload = null;
      plateLeave(0, false);
      print.dispose();
    };
  }, [builds]);

  return (
    // Hidden until the desk is confirmed: a wide fixed box at the screen's edge tints iOS's bars.
    <canvas
      ref={ref}
      hidden
      data-overlay
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-20 h-full w-full mix-blend-multiply"
    />
  );
}
