"use client";

import { useEffect, useRef, useState } from "react";
import { SOCIAL } from "@/features/site/data/social";
import { createFace, createPrinter, readInk } from "./pacman/sprites";

// The page's own rules are the track: unwalked they print as pellets, and the club's mark eats
// them back into hairlines while the four channels flee along them.

const RUN = 8;
const IDLE = 2400;
const MANUAL = 6000;
const RESPAWN = 4500;
const VISIT = 20000;
const BEST = "sigma_arcade";
const SOLID = "button, figure, [role=img], img, video";
const FIELDS = "input, textarea, select";

type Box = { l: number; t: number; r: number; b: number };
type Seg = { x0: number; y0: number; x1: number; y1: number; virtual: boolean; nodes: number[]; el?: HTMLCanvasElement };
type Node = { x: number; y: number; seg: number; pellet: boolean; visited: number; next: number[] };
type Mover = { a: number; b: number; t: number; dx: number; dy: number };
type Ghost = Mover & { n: number; dead: number };

export default function ContactPlay() {
  const layer = useRef<HTMLDivElement>(null);
  const score = useRef<HTMLSpanElement>(null);
  const best = useRef<HTMLSpanElement>(null);
  const keys = useRef<HTMLButtonElement>(null);
  const [caught, setCaught] = useState<number | null>(null);

  useEffect(() => {
    const root = layer.current;
    const main = root?.closest("main");
    const pad = keys.current;
    if (!root || !main || !pad) return;
    const tones = readInk();
    const { paper, muted } = tones;
    const kit = createPrinter(tones);
    const mouth = createFace();
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let dpr = 1;
    let narrow = false;
    let PAC = 22;
    let GHOST = 20;
    let GAP = 12;
    let speed = 140;
    let fine = 0.8;
    let segs: Seg[] = [];
    let nodes: Node[] = [];
    let walls: Box[] = [];
    let fields: Box[] = [];
    let pac: Mover = { a: 0, b: -1, t: 0, dx: 1, dy: 0 };
    let ghosts: Ghost[] = [];
    let sprites: HTMLCanvasElement[] = [];
    let labels: HTMLSpanElement[] = [];
    let points = 0;
    let shownPoints = -1;
    let alive = true;
    let high = 0;
    let target: [number, number] | null = null;
    let aimed = -Infinity;
    let keyed = -Infinity;
    let want: [number, number] = [0, 0];
    let raf = 0;
    let last = 0;
    let timer = 0;
    let built = false;
    let origin = { x: 0, y: 0 };
    let next = 0;
    const run = new Map<number, number>();
    const dirty = new Set<number>();
    let moving = false;
    let glide = 0;
    let stuck = false;
    let eased: [number, number] | null = null;
    try {
      high = Number(localStorage.getItem(BEST)) || 0;
    } catch {}

    const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by);
    const hits = (b: Box, list: Box[], pad = 0) =>
      list.some((w) => b.l < w.r + pad && b.r > w.l - pad && b.t < w.b + pad && b.b > w.t - pad);

    const local = (r: DOMRect): Box => ({
      l: r.left - origin.x,
      t: r.top - origin.y,
      r: r.right - origin.x,
      b: r.bottom - origin.y,
    });

    const measure = () => {
      const m = main.getBoundingClientRect();
      origin = { x: m.left, y: m.top };
      const text: Box[] = [];
      const walk = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      for (let t = walk.nextNode(); t; t = walk.nextNode()) {
        if (!t.textContent?.trim()) continue;
        const el = t.parentElement;
        if (!el || root.contains(el) || el.closest("[data-overlay], .sr-only")) continue;
        range.selectNodeContents(t);
        for (const r of range.getClientRects()) if (r.width > 0 && r.height > 0) text.push(local(r));
      }
      main.querySelectorAll(SOLID).forEach((el) => {
        if (root.contains(el) || el.closest("[data-overlay]")) return;
        const r = el.getBoundingClientRect();
        if (r.width && r.height) text.push(local(r));
      });
      walls = text;
      fields = [];
      main.querySelectorAll(FIELDS).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width && r.height) fields.push(local(r));
      });

      const found: Seg[] = [];
      main.querySelectorAll<HTMLElement>("*").forEach((el) => {
        if (root.contains(el) || el.closest("[data-overlay]")) return;
        const cs = getComputedStyle(el);
        if (parseFloat(cs.borderTopLeftRadius) > 0) return;
        const r = local(el.getBoundingClientRect());
        if (r.r - r.l < 1 || r.b - r.t < 1) return;
        const tf = cs.transform !== "none" ? new DOMMatrix(cs.transform) : null;
        const half = /^180deg|^-180deg|^0\.5turn|^3\.14/.test(cs.rotate);
        const flipX = (!!tf && tf.a < 0) !== half;
        const flipY = (!!tf && tf.d < 0) !== half;
        const side = (w: string, s: string, c: string) =>
          parseFloat(w) > 0 && s !== "none" && !/rgba\(.*,\s*0\)$|transparent/.test(c);
        const add = (x0: number, y0: number, x1: number, y1: number) =>
          found.push({ x0, y0, x1, y1, virtual: false, nodes: [] });
        const top = () => add(r.l, r.t + 0.5, r.r, r.t + 0.5);
        const bottom = () => add(r.l, r.b - 0.5, r.r, r.b - 0.5);
        const left = () => add(r.l + 0.5, r.t, r.l + 0.5, r.b);
        const right = () => add(r.r - 0.5, r.t, r.r - 0.5, r.b);
        if (side(cs.borderTopWidth, cs.borderTopStyle, cs.borderTopColor)) (flipY ? bottom : top)();
        if (side(cs.borderBottomWidth, cs.borderBottomStyle, cs.borderBottomColor)) (flipY ? top : bottom)();
        if (side(cs.borderLeftWidth, cs.borderLeftStyle, cs.borderLeftColor)) (flipX ? right : left)();
        if (side(cs.borderRightWidth, cs.borderRightStyle, cs.borderRightColor)) (flipX ? left : right)();
      });
      return found;
    };

    let gutter = 16;
    const clearOf = (x: number, y: number, d: number) =>
      !hits({ l: x - d / 2, t: y - d / 2, r: x + d / 2, b: y + d / 2 }, walls, 2);

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      narrow = window.innerWidth < 768;
      PAC = narrow ? 22 : 28;
      GHOST = narrow ? 20 : 24;
      GAP = narrow ? 10 : 12;
      speed = narrow ? 45 : 65;
      fine = Math.max(narrow ? 0.8 : 0.95, 1.5 / dpr);
      const probe = document.createElement("div");
      probe.style.cssText = "position:absolute;visibility:hidden;width:var(--gutter)";
      main.appendChild(probe);
      gutter = probe.getBoundingClientRect().width || 16;
      probe.remove();
      const raw = measure();
      const hs = raw.filter((s) => s.y0 === s.y1 && s.x1 - s.x0 > GAP * 3);
      const vs = raw.filter((s) => s.x0 === s.x1 && s.y1 - s.y0 > GAP * 3);
      segs = [...hs, ...vs];
      const clearLine = (x: number, y0: number, y1: number) => {
        for (let y = y0 + GAP; y < y1 - GAP / 2; y += GAP) if (!clearOf(x, y, PAC)) return false;
        return true;
      };
      const byY = hs.slice().sort((a, b) => a.y0 - b.y0);
      byY.forEach((upper, i) => {
        const lower = byY.slice(i + 1).find((o) => o.x0 < upper.x1 - GAP && o.x1 > upper.x0 + GAP && o.y0 - upper.y0 > GAP);
        if (!lower || lower.y0 - upper.y0 > 520) return;
        const l = Math.max(upper.x0, lower.x0);
        const r = Math.min(upper.x1, lower.x1);
        const xs: number[] = [];
        for (let x = r; x >= l; x -= GAP) xs.push(x);
        for (let x = l; x <= r; x += GAP) xs.push(x);
        const found: number[] = [];
        for (const x of xs) {
          if (found.some((f) => Math.abs(f - x) < 200)) continue;
          if (clearLine(x, upper.y0, lower.y0)) found.push(x);
          if (found.length >= 2) break;
        }
        for (const x of found) segs.push({ x0: x, y0: upper.y0, x1: x, y1: lower.y0, virtual: true, nodes: [] });
      });
      nodes = [];
      segs.forEach((s, si) => {
        const len = Math.hypot(s.x1 - s.x0, s.y1 - s.y0);
        const n = Math.max(1, Math.round(len / GAP));
        let prev = -1;
        let ok = true;
        for (let i = 0; i <= n; i++) {
          const x = s.x0 + ((s.x1 - s.x0) * i) / n;
          const y = s.y0 + ((s.y1 - s.y0) * i) / n;
          if (!clearOf(x, y, PAC)) {
            if (s.virtual) ok = false;
            s.nodes.push(-1);
            prev = -1;
            continue;
          }
          const k = nodes.length;
          nodes.push({ x, y, seg: si, pellet: !s.virtual, visited: -Infinity, next: [] });
          s.nodes.push(k);
          if (prev >= 0) {
            nodes[prev].next.push(k);
            nodes[k].next.push(prev);
          }
          prev = k;
        }
        if (s.virtual && !ok) s.nodes = s.nodes.map(() => -1);
      });
      const link = (a: number, b: number) => {
        if (a < 0 || b < 0 || a === b || nodes[a].next.includes(b)) return;
        nodes[a].next.push(b);
        nodes[b].next.push(a);
      };
      const nearestOn = (s: Seg, x: number, y: number) => {
        let pick = -1;
        let d = Infinity;
        for (const k of s.nodes) {
          if (k < 0) continue;
          const e = dist(nodes[k].x, nodes[k].y, x, y);
          if (e < d) {
            d = e;
            pick = k;
          }
        }
        return [pick, d] as const;
      };
      const vert = segs.filter((s) => s.x0 === s.x1);
      const hori = segs.filter((s) => s.y0 === s.y1);
      for (const v of vert) {
        for (const h of hori) {
          if (v.x0 < h.x0 - 30 || v.x0 > h.x1 + 30 || h.y0 < v.y0 - 30 || h.y0 > v.y1 + 30) continue;
          const [a, da] = nearestOn(v, v.x0, h.y0);
          const [b, db] = nearestOn(h, v.x0, h.y0);
          if (da + db < 40) link(a, b);
        }
      }
      const seen = new Int32Array(nodes.length).fill(-1);
      let bestC = -1;
      let bestN = 0;
      for (let k = 0; k < nodes.length; k++) {
        if (seen[k] >= 0) continue;
        const q = [k];
        seen[k] = k;
        for (let i = 0; i < q.length; i++)
          for (const n of nodes[q[i]].next)
            if (seen[n] < 0) {
              seen[n] = k;
              q.push(n);
            }
        if (q.length > bestN) {
          bestN = q.length;
          bestC = k;
        }
      }
      nodes.forEach((n, k) => {
        if (seen[k] !== bestC) {
          n.pellet = false;
          n.next = [];
        }
      });
      const play = nodes.map((_, k) => k).filter((k) => seen[k] === bestC);
      built = play.length > 8;

      root.querySelectorAll("canvas[data-rule]").forEach((c) => c.remove());
      for (const s of segs) {
        s.el = undefined;
        if (s.virtual || !built || !s.nodes.some((k) => k >= 0 && nodes[k].pellet && nodes[k].next.length)) continue;
        const c = document.createElement("canvas");
        c.dataset.rule = "";
        const horizontal = s.y0 === s.y1;
        const w = horizontal ? s.x1 - s.x0 + GAP : 6;
        const h = horizontal ? 6 : s.y1 - s.y0 + GAP;
        c.width = Math.ceil(w * dpr);
        c.height = Math.ceil(h * dpr);
        c.style.cssText = `position:absolute;left:${(horizontal ? s.x0 - GAP / 2 : s.x0 - 3)}px;top:${(horizontal ? s.y0 - 3 : s.y0 - GAP / 2)}px;width:${w}px;height:${h}px`;
        root.appendChild(c);
        s.el = c;
      }
      run.clear();

      if (!built) return;
      const top = play.slice().sort((a, b) => nodes[a].y - nodes[b].y || nodes[a].x - nodes[b].x);
      pac = { a: top[0], b: -1, t: 0, dx: 1, dy: 0 };
      const count = narrow ? 1 : SOCIAL.length;
      const rails = top.filter((k) => !segs[nodes[k].seg].virtual);
      ghosts = Array.from({ length: count }, (_, i) => ({
        a: rails[Math.min(rails.length - 1, Math.floor(((i + 1) / (count + 1)) * rails.length))],
        b: -1,
        t: 0,
        dx: 1,
        dy: 0,
        n: narrow ? next % SOCIAL.length : i,
        dead: -Infinity,
      }));
      sprites.forEach((c) => c.remove());
      labels.forEach((l) => l.remove());
      sprites = [PAC, ...ghosts.map(() => GHOST)].map((d) => {
        const c = document.createElement("canvas");
        const size = d + 4;
        c.width = Math.ceil(size * dpr);
        c.height = Math.ceil(size * dpr);
        c.style.cssText = `position:absolute;left:0;top:0;width:${size}px;height:${size}px;will-change:transform`;
        root.appendChild(c);
        return c;
      });
      // A ghost is its channel: clicking it (or its name) opens that channel.
      const open = (i: number) => (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(SOCIAL[ghosts[i].n].href, "_blank", "noopener,noreferrer");
      };
      const halt = (e: Event) => e.stopPropagation();
      ghosts.forEach((_, i) => {
        const c = sprites[i + 1];
        c.style.pointerEvents = "auto";
        c.style.cursor = "pointer";
        c.addEventListener("pointerdown", halt);
        c.addEventListener("click", open(i));
      });
      labels = ghosts.map(() => {
        const l = document.createElement("span");
        l.setAttribute("aria-hidden", "true");
        l.className = "pointer-events-auto absolute left-0 top-0 cursor-pointer whitespace-nowrap text-caption text-ink-muted transition-colors hover:text-ink";
        l.style.visibility = "hidden";
        root.appendChild(l);
        return l;
      });
      labels.forEach((l, i) => {
        l.addEventListener("pointerdown", (e) => e.stopPropagation());
        l.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          window.open(SOCIAL[ghosts[i].n].href, "_blank", "noopener,noreferrer");
        });
      });
    };

    const paintRule = (i: number, now: number) => {
      const s = segs[i];
      const c = s.el;
      const g = c?.getContext("2d");
      if (!c || !g) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, c.width, c.height);
      const horizontal = s.y0 === s.y1;
      for (const k of s.nodes) {
        const born = run.get(k);
        if (k < 0 || born === undefined) continue;
        const n = nodes[k];
        const grow = Math.min(1, Math.max(0, (now - born) / 450));
        if (grow <= 0) continue;
        const x = horizontal ? n.x - s.x0 + GAP / 2 : 3;
        const y = horizontal ? 3 : n.y - s.y0 + GAP / 2;
        g.fillStyle = paper;
        if (horizontal) g.fillRect(x - GAP, 0, GAP * 2, 6);
        else g.fillRect(0, y - GAP, 6, GAP * 2);
        g.fillStyle = muted;
        g.globalAlpha = grow;
        g.beginPath();
        g.arc(x, y, 1.3, 0, Math.PI * 2);
        g.fill();
        g.globalAlpha = 1;
      }
    };

    const ahead = (now: number) => {
      const want = new Set<number>();
      const from = pac.b >= 0 ? pac.b : pac.a;
      const s = segs[nodes[from].seg];
      if (!s.virtual && moving) {
        const idx = s.nodes.indexOf(from);
        const prev = pac.b >= 0 ? pac.a : -1;
        let dir = 1;
        if (prev >= 0 && nodes[prev].seg === nodes[from].seg) dir = s.nodes.indexOf(prev) < idx ? 1 : -1;
        else if (pac.dx || pac.dy) {
          const nx = s.nodes[idx + 1];
          dir = nx !== undefined && nx >= 0 && (nodes[nx].x - nodes[from].x) * pac.dx + (nodes[nx].y - nodes[from].y) * pac.dy > 0 ? 1 : -1;
        }
        let count = 0;
        for (let k = idx; k >= 0 && k < s.nodes.length && count < RUN; k += dir) {
          const n = s.nodes[k];
          if (n < 0 || !nodes[n].next.length) break;
          if (k % 2 === 0) {
            want.add(n);
            count++;
          }
        }
      }
      const touched = new Set<number>();
      for (const k of [...run.keys()])
        if (!want.has(k)) {
          run.delete(k);
          touched.add(nodes[k].seg);
        }
      let stagger = 0;
      for (const k of want)
        if (!run.has(k) && now - nodes[k].visited > 1500) {
          run.set(k, now + stagger);
          stagger += 60;
          touched.add(nodes[k].seg);
        }
      for (const k of run.keys()) if (now - (run.get(k) ?? 0) < 500) touched.add(nodes[k].seg);
      touched.forEach((i) => dirty.add(i));
    };

    const sprite = (c: HTMLCanvasElement, d: number) => {
      const ctx = c.getContext("2d");
      if (!ctx) return null;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, d + 4, d + 4);
      return ctx;
    };
    const drawPac = (c: HTMLCanvasElement, dx: number, dy: number) => {
      const ctx = sprite(c, PAC);
      if (ctx) kit.pac(ctx, (PAC + 4) / 2, (PAC + 4) / 2, PAC, fine, dx, dy, mouth.face, still);
    };
    const drawGhost = (c: HTMLCanvasElement, dx: number, dy: number, now: number) => {
      const ctx = sprite(c, GHOST);
      if (ctx) kit.ghost(ctx, (GHOST + 4) / 2, (GHOST + 4) / 2, GHOST, fine, dx, dy, now);
    };

    const at = (m: Mover): [number, number] => {
      const a = nodes[m.a];
      if (m.b < 0) return [a.x, a.y];
      const b = nodes[m.b];
      return [a.x + (b.x - a.x) * m.t, a.y + (b.y - a.y) * m.t];
    };

    const route = (from: number, goal: (k: number) => number) => {
      const prev = new Int32Array(nodes.length).fill(-2);
      const q = [from];
      prev[from] = -1;
      let pick = from;
      let score = goal(from);
      for (let i = 0; i < q.length; i++) {
        const k = q[i];
        const s = goal(k);
        if (s < score) {
          score = s;
          pick = k;
          if (s <= 0) break;
        }
        for (const n of nodes[k].next)
          if (prev[n] === -2) {
            prev[n] = k;
            q.push(n);
          }
      }
      if (pick === from) return -1;
      let k = pick;
      while (prev[k] !== from && prev[k] >= 0) k = prev[k];
      return k;
    };

    const advance = (m: Mover, v: number, decide: (m: Mover) => number) => {
      let left = v;
      for (let guard = 0; left > 0 && guard < 8; guard++) {
        if (m.b < 0) {
          const n = decide(m);
          if (n < 0) return;
          m.b = n;
          m.t = 0;
          m.dx = nodes[n].x - nodes[m.a].x;
          m.dy = nodes[n].y - nodes[m.a].y;
        }
        const len = dist(nodes[m.a].x, nodes[m.a].y, nodes[m.b].x, nodes[m.b].y) || 1;
        const s = Math.min(left, (1 - m.t) * len);
        m.t += s / len;
        left -= s;
        if (m.t >= 1 - 1e-6) {
          m.a = m.b;
          m.b = -1;
          m.t = 0;
        }
      }
    };

    const reverse = (m: Mover) => {
      if (m.b < 0) return;
      [m.a, m.b] = [m.b, m.a];
      m.t = 1 - m.t;
      m.dx = -m.dx;
      m.dy = -m.dy;
    };

    const pacDecide = (now: number) => (m: Mover) => {
      const here = nodes[m.a];
      if (now - keyed < MANUAL) {
        let pick = -1;
        let bestDot = 0.5;
        for (const n of here.next) {
          const ex = nodes[n].x - here.x;
          const ey = nodes[n].y - here.y;
          const d = (ex * want[0] + ey * want[1]) / (Math.hypot(ex, ey) || 1);
          if (d > bestDot) {
            bestDot = d;
            pick = n;
          }
        }
        return pick;
      }
      if (eased && now - aimed < IDLE) {
        const [tx, ty] = eased;
        return route(m.a, (k) => dist(nodes[k].x, nodes[k].y, tx, ty));
      }
      const mid = scrollY + window.innerHeight / 2 - (origin.y + scrollY);
      const band = window.innerHeight * 0.3;
      return route(m.a, (k) => {
        const n = nodes[k];
        const off = Math.abs(n.y - mid);
        if (now - n.visited >= VISIT && off < band) return 0;
        return 1 + off / 1000;
      });
    };

    const ghostDecide = (g: Ghost, now: number) => (m: Mover) => {
      const [px, py] = at(pac);
      const here = nodes[m.a];
      const real = here.next.filter((n) => !segs[nodes[n].seg].virtual);
      const opts = real.filter((n) =>
        ghosts.every((o) => o === g || now - o.dead < RESPAWN || dist(nodes[n].x, nodes[n].y, ...at(o)) > GHOST * 1.4),
      );
      const from = opts.length ? opts : real;
      if (!from.length) return -1;
      if (dist(here.x, here.y, px, py) < 260) {
        let pick = from[0];
        let far = -Infinity;
        for (const n of from) {
          const d = dist(nodes[n].x, nodes[n].y, px, py) + Math.random() * 6;
          if (d > far) {
            far = d;
            pick = n;
          }
        }
        return pick;
      }
      const ahead = from.filter((n) => (nodes[n].x - here.x) * m.dx + (nodes[n].y - here.y) * m.dy >= 0);
      const list = ahead.length ? ahead : from;
      return list[Math.floor(Math.random() * list.length)];
    };

    const place = (c: HTMLCanvasElement, x: number, y: number, d: number) => {
      c.style.transform = `translate3d(${x - (d + 4) / 2}px, ${y - (d + 4) / 2}px, 0)`;
    };

    const frame = (now: number) => {
      raf = 0;
      if (!built || !alive) return;
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      if (target) {
        const k = Math.min(1, dt * 2.2);
        eased = eased ? [eased[0] + (target[0] - eased[0]) * k, eased[1] + (target[1] - eased[1]) * k] : target;
      }
      const before = at(pac);
      glide += ((stuck ? 0 : speed) - glide) * Math.min(1, dt * 2.5);
      const decide = pacDecide(now);
      stuck = false;
      advance(pac, Math.max(6, glide) * dt, (m) => {
        const n = decide(m);
        stuck = n < 0;
        return n;
      });
      const [px, py] = at(pac);
      const moved = dist(before[0], before[1], px, py);
      moving = moved > 0.01;
      mouth.step(now, dt, moving);
      const here = pac.b >= 0 && pac.t > 0.5 ? pac.b : pac.a;
      nodes[here].visited = now;
      if (run.has(here)) {
        run.delete(here);
        points += 10;
        dirty.add(nodes[here].seg);
      }
      ahead(now);
      dirty.forEach((i) => paintRule(i, now));
      dirty.clear();
      const placed: (Box | null)[] = ghosts.map(() => null);
      ghosts.forEach((g, i) => {
        const c = sprites[i + 1];
        const label = labels[i];
        if (now - g.dead < RESPAWN) {
          c.style.visibility = "hidden";
          label.style.visibility = "hidden";
          return;
        }
        if (g.dead > -Infinity) {
          const far = nodes
            .map((n, k) => [k, n.next.length && !segs[n.seg].virtual ? dist(n.x, n.y, px, py) : -1] as const)
            .filter(([, d]) => d > 300 && d < window.innerHeight * 1.2)
            .sort((a, b) => a[1] - b[1])[0];
          g.a = far ? far[0] : g.a;
          g.b = -1;
          g.dead = -Infinity;
        }
        const near = dist(...at(g), px, py) < 260;
        advance(g, speed * dt * (near ? 0.88 : 0.5), ghostDecide(g, now));
        for (const o of ghosts) {
          if (o === g || now - o.dead < RESPAWN) continue;
          const [gx0, gy0] = at(g);
          const [ox, oy] = at(o);
          if (dist(gx0, gy0, ox, oy) > GHOST + 4) continue;
          if (g.b >= 0 && (ox - gx0) * g.dx + (oy - gy0) * g.dy > 0) reverse(g);
        }
        const [gx, gy] = at(g);
        c.style.visibility = "visible";
        drawGhost(c, g.dx, g.dy, now);
        place(c, gx, gy, GHOST);
        const name = SOCIAL[g.n].name;
        if (label.textContent !== name) label.textContent = name;
        const lw = label.offsetWidth;
        const lh = 16;
        let shown = false;
        const places: [number, number][] = [];
        for (const oy of [GHOST / 2 + 4, -GHOST / 2 - 4 - lh])
          for (const lx of [gx - lw / 2, gx - lw - GHOST / 2 - 4, gx + GHOST / 2 + 4]) places.push([lx, gy + oy]);
        for (const [lx, ly] of places) {
          const box = { l: lx, t: ly, r: lx + lw, b: ly + lh };
          if (box.l < gutter || box.r > main.clientWidth - gutter) continue;
          const crowded = ghosts.some((o, j) => {
            if (o === g || now - o.dead < RESPAWN) return false;
            const [ox, oy] = at(o);
            const hitsSprite = box.l < ox + GHOST / 2 && box.r > ox - GHOST / 2 && box.t < oy + GHOST / 2 && box.b > oy - GHOST / 2;
            const other = placed[j];
            return hitsSprite || (!!other && box.l < other.r + 6 && box.r > other.l - 6 && box.t < other.b + 2 && box.b > other.t - 2);
          });
          const [qx, qy] = at(pac);
          if (crowded || (box.l < qx + PAC / 2 && box.r > qx - PAC / 2 && box.t < qy + PAC / 2 && box.b > qy - PAC / 2)) continue;
          const onRule = segs.some((s) => !s.virtual && s.y0 === s.y1 && s.y0 > box.t - 3 && s.y0 < box.b + 3 && s.x1 > box.l && s.x0 < box.r);
          if (!hits(box, walls, 6) && !hits(box, fields, 4) && !onRule) {
            label.style.transform = `translate3d(${box.l}px, ${box.t}px, 0)`;
            placed[i] = box;
            shown = true;
            break;
          }
        }
        label.style.visibility = shown ? "visible" : "hidden";
        if (dist(gx, gy, px, py) < (PAC + GHOST) * 0.35) {
          g.dead = now;
          points += 200;
          setCaught(g.n);
          if (narrow) {
            next = (g.n + 1) % SOCIAL.length;
            g.n = next;
          }
          window.clearTimeout(timer);
          timer = window.setTimeout(() => setCaught(null), 4200);
        }
      });
      drawPac(sprites[0], pac.dx, pac.dy);
      place(sprites[0], px, py, PAC);
      if (points > high) {
        high = points;
        try {
          localStorage.setItem(BEST, String(high));
        } catch {}
      }
      if (score.current && points !== shownPoints) {
        score.current.textContent = String(points).padStart(5, "0");
        if (shownPoints >= 0)
          score.current.animate([{ opacity: 0.35 }, { opacity: 1 }], { duration: 180, easing: "ease-out" });
        shownPoints = points;
      }
      if (best.current) best.current.textContent = String(high).padStart(5, "0");
      if (!document.hidden) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (!built) return;
      if (still) {
        ghosts.forEach((_, i) => {
          sprites[i + 1].style.visibility = "hidden";
          labels[i].style.visibility = "hidden";
        });
        const [x, y] = at(pac);
        drawPac(sprites[0], 1, 0);
        place(sprites[0], x, y, PAC);
        return;
      }
      if (!raf && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    let queued = 0;
    const rebuild = () => {
      if (!alive) return;
      cancelAnimationFrame(queued);
      queued = requestAnimationFrame(() => {
        if (!alive) return;
        cancelAnimationFrame(raf);
        raf = 0;
        build();
        start();
      });
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const m = main.getBoundingClientRect();
      target = [e.clientX - m.left, e.clientY - m.top];
      aimed = performance.now();
    };
    const KEYS: Record<string, [number, number]> = {
      ArrowRight: [1, 0],
      ArrowLeft: [-1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      d: [1, 0],
      a: [-1, 0],
      w: [0, -1],
      s: [0, 1],
    };
    const onKey = (e: KeyboardEvent) => {
      const d = KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
      if (!d || still || !built) return;
      e.preventDefault();
      want = d;
      keyed = performance.now();
      target = null;
      if (pac.b >= 0 && (nodes[pac.b].x - nodes[pac.a].x) * d[0] + (nodes[pac.b].y - nodes[pac.a].y) * d[1] < 0) reverse(pac);
      const [, py] = at(pac);
      const y = py + main.getBoundingClientRect().top;
      if (y < 100 || y > window.innerHeight - 100) window.scrollBy({ top: y - window.innerHeight / 2 });
    };
    const onVis = () => {
      if (!document.hidden) return start();
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const ro = new ResizeObserver(rebuild);
    ro.observe(main);
    window.addEventListener("resize", rebuild);
    document.fonts?.ready.then(rebuild).catch(() => {});
    document.addEventListener("visibilitychange", onVis);
    if (!still) {
      window.addEventListener("pointermove", onMove, { passive: true });
      pad.addEventListener("keydown", onKey);
    }
    rebuild();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(queued);
      window.clearTimeout(timer);
      ro.disconnect();
      window.removeEventListener("resize", rebuild);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      pad.removeEventListener("keydown", onKey);
      root.replaceChildren();
    };
  }, []);

  const hit = caught === null ? null : SOCIAL[caught];

  return (
    <>
      <div ref={layer} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" />
      <div
        data-overlay
        className="fixed bottom-4 left-[var(--gutter)] z-40 flex flex-row-reverse items-center gap-x-xs motion-reduce:hidden"
      >
        <p aria-live="polite">
          {hit ? (
            <a
              href={hit.href}
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex h-11 items-center whitespace-nowrap rounded-pill bg-ink px-md text-caption text-canvas"
            >
              {hit.name} ↗
            </a>
          ) : null}
        </p>
        <button
          ref={keys}
          type="button"
          aria-label="Steer the mark with the arrow keys"
          className="flex h-11 items-center gap-x-sm rounded-pill bg-canvas/85 px-md font-mono text-[12px] leading-none tracking-[0.12em] tabular-nums backdrop-blur-sm focus:outline-none focus-visible:bg-ink focus-visible:text-canvas"
        >
          <span ref={score} className="text-current">00000</span>
          <span ref={best} className="opacity-45">00000</span>
        </button>
      </div>
    </>
  );
}
