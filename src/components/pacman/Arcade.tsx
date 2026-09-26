"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMedia } from "@/lib/media";
import { createFace, createPrinter, readInk } from "./sprites";

const BEST = "sigma_404";
const LIVES = 3;
const FRIGHT = 6000;
const HOME = 2600;

type Dir = [number, number];
type Actor = { x: number; y: number; d: Dir };
type Ghost = Actor & { out: number; eaten: boolean; home: [number, number] };
type State = "idle" | "play" | "caught" | "over";

const KEYS: Record<string, Dir> = {
  ArrowRight: [1, 0],
  ArrowLeft: [-1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  d: [1, 0],
  a: [-1, 0],
  w: [0, -1],
  s: [0, 1],
};

export default function Arcade({ word, label, extra }: { word: string; label: string; extra?: ReactNode }) {
  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<HTMLButtonElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const bestRef = useRef<HTMLSpanElement>(null);
  const livesRef = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState<State>("idle");
  const still = useMedia("(prefers-reduced-motion: reduce)", false);

  useEffect(() => {
    const board = boardRef.current;
    const canvas = canvasRef.current;
    const pad = padRef.current;
    if (!board || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tones = readInk();
    const rule = getComputedStyle(document.documentElement).getPropertyValue("--color-rule-strong").trim() || "#abafa6";
    const kit = createPrinter(tones);
    const mouth = createFace();
    const base = document.createElement("canvas");

    let W = 0;
    let H = 0;
    let dpr = 1;
    let cell = 24;
    let cols = 0;
    let rows = 0;
    let ox = 0;
    let oy = 0;
    let wall = new Uint8Array(0);
    let pellet = new Uint8Array(0);
    let left = 0;
    let start: [number, number] = [1, 1];
    let homes: [number, number][] = [];
    let pac: Actor = { x: 1, y: 1, d: [1, 0] };
    let want: Dir = [1, 0];
    let ghosts: Ghost[] = [];
    let field = new Int32Array(0);
    let aim = new Int32Array(0);
    let aimCell = -1;
    let aimAt = -Infinity;
    let keyAt = -Infinity;
    let mode: State = "idle";
    let points = 0;
    let high = 0;
    let lives = LIVES;
    let level = 0;
    let fright = -Infinity;
    let chain = 200;
    let pauseTo = 0;
    let raf = 0;
    let last = 0;
    let alive = true;
    try {
      high = Number(localStorage.getItem(BEST)) || 0;
    } catch {}

    const idx = (c: number, r: number) => r * cols + c;
    const open = (c: number, r: number) => c >= 0 && r >= 0 && c < cols && r < rows && !wall[idx(c, r)];
    const set = (s: State) => {
      mode = s;
      setState(s);
    };

    const hud = () => {
      if (scoreRef.current) scoreRef.current.textContent = String(points).padStart(5, "0");
      if (bestRef.current) bestRef.current.textContent = String(high).padStart(5, "0");
      if (livesRef.current) livesRef.current.textContent = `×${lives}`;
    };

    const build = async (keep = false) => {
      const r = board.getBoundingClientRect();
      W = Math.round(r.width);
      H = Math.round(r.height);
      if (!W || !H) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      cell = W < 640 ? 18 : W < 1100 ? 22 : 26;
      cols = Math.floor(W / cell);
      rows = Math.floor(H / cell);
      ox = (W - cols * cell) / 2;
      oy = (H - rows * cell) / 2;

      const family = getComputedStyle(document.documentElement).getPropertyValue("--f-display").trim() || "sans-serif";
      try {
        await document.fonts.load(`700 100px ${family}`);
      } catch {}
      if (!alive) return;

      base.width = W * dpr;
      base.height = H * dpr;
      const g = base.getContext("2d", { willReadFrequently: true });
      if (!g) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      g.font = `expanded 700 100px ${family}`;
      g.textBaseline = "alphabetic";
      const m = g.measureText(word);
      const ink = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
      const cap = m.actualBoundingBoxAscent;
      const margin = W < 640 ? 5 : 6;
      const size = Math.min(((cols - margin) * cell) / ink, ((rows - 6) * cell) / cap) * 100;
      g.font = `expanded 700 ${size}px ${family}`;
      const n = g.measureText(word);
      const tw = n.actualBoundingBoxLeft + n.actualBoundingBoxRight;
      const th = n.actualBoundingBoxAscent;
      const tx = ox + (cols * cell - tw) / 2 + n.actualBoundingBoxLeft;
      const ty = oy + (rows * cell + th) / 2;
      g.fillStyle = tones.ink;
      g.fillText(word, tx, ty);

      const data = g.getImageData(0, 0, base.width, base.height).data;
      wall = new Uint8Array(cols * rows);
      for (let rr = 0; rr < rows; rr++)
        for (let c = 0; c < cols; c++) {
          let on = 0;
          let all = 0;
          for (let sy = 0.2; sy < 1; sy += 0.3)
            for (let sx = 0.2; sx < 1; sx += 0.3) {
              const px = Math.floor((ox + (c + sx) * cell) * dpr);
              const py = Math.floor((oy + (rr + sy) * cell) * dpr);
              all++;
              if (data[(py * base.width + px) * 4 + 3] > 128) on++;
            }
          if (on / all > 0.34) wall[idx(c, rr)] = 1;
        }
      const rules: [number, number, number, number][] = [];
      const bar = (c0: number, r0: number, c1: number, r1: number) => {
        for (let c = c0; c <= c1; c++) for (let rr = r0; rr <= r1; rr++) if (c >= 0 && rr >= 0 && c < cols && rr < rows) wall[idx(c, rr)] = 1;
        rules.push([c0, r0, c1, r1]);
      };
      bar(0, 0, cols - 1, 0);
      bar(0, rows - 1, cols - 1, rows - 1);
      bar(0, 0, 0, rows - 1);
      bar(cols - 1, 0, cols - 1, rows - 1);
      const wordL = Math.floor((tx - n.actualBoundingBoxLeft - ox) / cell);
      const wordR = Math.ceil((tx - n.actualBoundingBoxLeft + tw - ox) / cell);
      const q1 = Math.round(rows / 4);
      const q3 = rows - 1 - q1;
      const midR = Math.floor(rows / 2);
      if (wordL > 5) {
        bar(2, q1, wordL - 3, q1);
        bar(2, q3, wordL - 3, q3);
        bar(Math.floor(wordL / 2), q1 + 2, Math.floor(wordL / 2), midR - 1);
        bar(Math.floor(wordL / 2), midR + 1, Math.floor(wordL / 2), q3 - 2);
      }
      if (cols - wordR > 5) {
        bar(wordR + 2, q1, cols - 3, q1);
        bar(wordR + 2, q3, cols - 3, q3);
        const c = Math.floor((wordR + cols) / 2);
        bar(c, q1 + 2, c, midR - 1);
        bar(c, midR + 1, c, q3 - 2);
      }
      const across = Math.floor(cols / 2);
      if (q1 > 3) {
        bar(3, 2, across - 2, 2);
        bar(across + 2, 2, cols - 4, 2);
        bar(3, rows - 3, across - 2, rows - 3);
        bar(across + 2, rows - 3, cols - 4, rows - 3);
      }

      g.strokeStyle = rule;
      g.lineWidth = 1;
      g.lineCap = "square";
      g.beginPath();
      for (const [c0, r0, c1, r1] of rules) {
        const x0 = ox + (c0 + 0.5) * cell;
        const y0 = oy + (r0 + 0.5) * cell;
        const x1 = ox + (c1 + 0.5) * cell;
        const y1 = oy + (r1 + 0.5) * cell;
        g.moveTo(Math.round(x0) + 0.5, Math.round(y0) + 0.5);
        g.lineTo(Math.round(x1) + 0.5, Math.round(y1) + 0.5);
      }
      g.stroke();

      start = [1, rows - 2];
      for (let c = 1; c < cols - 1 && !open(...start); c++) start = [c, rows - 2];
      const reach = new Int32Array(cols * rows).fill(-1);
      const q = [idx(...start)];
      reach[q[0]] = 0;
      for (let i = 0; i < q.length; i++) {
        const k = q[i];
        const c = k % cols;
        const rr = (k - c) / cols;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as Dir[]) {
          if (!open(c + dx, rr + dy)) continue;
          const j = idx(c + dx, rr + dy);
          if (reach[j] < 0) {
            reach[j] = reach[k] + 1;
            q.push(j);
          }
        }
      }
      const reachable = q.map((k) => [k % cols, Math.floor(k / cols)] as [number, number]);
      const far = reachable.slice().sort((a, b) => reach[idx(...b)] - reach[idx(...a)]);
      homes = [far[0], far[Math.floor(far.length * 0.05)], far[Math.floor(far.length * 0.1)], far[Math.floor(far.length * 0.15)]];
      const away = reachable.filter((p) => Math.abs(p[0] - start[0]) + Math.abs(p[1] - start[1]) > 3);
      const byCorner = (fx: number, fy: number) =>
        away.reduce((best, p) => (Math.hypot(p[0] - fx, p[1] - fy) < Math.hypot(best[0] - fx, best[1] - fy) ? p : best));
      const power = [byCorner(1, 1), byCorner(cols - 2, 1), byCorner(1, rows - 2), byCorner(cols - 2, rows - 2)];
      pellet = new Uint8Array(cols * rows);
      left = 0;
      for (const [c, rr] of reachable) {
        if (c === start[0] && rr === start[1]) continue;
        pellet[idx(c, rr)] = 1;
        left++;
      }
      for (const p of power) pellet[idx(...p)] = 2;
      field = new Int32Array(cols * rows);
      aim = new Int32Array(cols * rows);
      aimCell = -1;
      reset(!keep);
      paint(performance.now());
    };

    const reset = (full: boolean) => {
      pac = { x: start[0], y: start[1], d: [1, 0] };
      want = [1, 0];
      const count = W < 640 ? 3 : 4;
      ghosts = homes.slice(0, count).map((h, i) => ({ x: h[0], y: h[1], d: [0, 0] as Dir, out: performance.now() + i * 900, eaten: false, home: h }));
      fright = -Infinity;
      if (full) {
        points = 0;
        lives = LIVES;
        level = 0;
      }
      hud();
    };

    const flood = () => {
      field.fill(-1);
      const s = idx(Math.round(pac.x), Math.round(pac.y));
      const q = [s];
      field[s] = 0;
      for (let i = 0; i < q.length; i++) {
        const k = q[i];
        const c = k % cols;
        const rr = (k - c) / cols;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as Dir[]) {
          if (!open(c + dx, rr + dy)) continue;
          const j = idx(c + dx, rr + dy);
          if (field[j] < 0) {
            field[j] = field[k] + 1;
            q.push(j);
          }
        }
      }
    };

    const aimAtCell = (c: number, r: number) => {
      c = Math.max(0, Math.min(cols - 1, c));
      r = Math.max(0, Math.min(rows - 1, r));
      let k = idx(c, r);
      if (wall[k]) {
        let bestK = -1;
        let bestD = Infinity;
        for (let j = 0; j < wall.length; j++) {
          if (wall[j] || field[j] < 0) continue;
          const d = Math.hypot((j % cols) - c, Math.floor(j / cols) - r);
          if (d < bestD) {
            bestD = d;
            bestK = j;
          }
        }
        if (bestK < 0) return;
        k = bestK;
      }
      aimAt = performance.now();
      if (k === aimCell) return;
      aimCell = k;
      aim.fill(-1);
      const q = [k];
      aim[k] = 0;
      for (let i = 0; i < q.length; i++) {
        const x = q[i] % cols;
        const y = (q[i] - x) / cols;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as Dir[]) {
          if (!open(x + dx, y + dy)) continue;
          const j = idx(x + dx, y + dy);
          if (aim[j] < 0) {
            aim[j] = aim[q[i]] + 1;
            q.push(j);
          }
        }
      }
    };

    const step = (a: Actor, v: number, choose: (c: number, r: number) => Dir) => {
      let budget = v;
      for (let guard = 0; guard < 4 && budget > 0; guard++) {
        const cx = Math.round(a.x);
        const cy = Math.round(a.y);
        const along = a.d[0] ? (cx - a.x) * a.d[0] : (cy - a.y) * a.d[1];
        const atCentre = Math.abs(a.x - cx) < 1e-3 && Math.abs(a.y - cy) < 1e-3;
        if (atCentre) {
          a.x = cx;
          a.y = cy;
          a.d = choose(cx, cy);
          if (!a.d[0] && !a.d[1]) return;
          if (!open(cx + a.d[0], cy + a.d[1])) {
            a.d = [0, 0];
            return;
          }
          const move = Math.min(budget, 1);
          a.x += a.d[0] * move;
          a.y += a.d[1] * move;
          budget -= move;
          continue;
        }
        const toCentre = along > 0 ? along : 1 + along;
        const move = Math.min(budget, toCentre);
        a.x += a.d[0] * move;
        a.y += a.d[1] * move;
        budget -= move;
        if (Math.abs(move - toCentre) < 1e-6) {
          a.x = Math.round(a.x);
          a.y = Math.round(a.y);
        }
      }
    };

    const pacChoose = (c: number, r: number): Dir => {
      if (aimCell >= 0 && aimAt > keyAt) {
        let pick: Dir = [0, 0];
        let best = aim[idx(c, r)];
        for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]] as Dir[]) {
          if (!open(c + d[0], r + d[1])) continue;
          const v = aim[idx(c + d[0], r + d[1])];
          if (v >= 0 && v < best) {
            best = v;
            pick = d;
          }
        }
        if (pick[0] || pick[1]) want = pick;
        return pick;
      }
      if (open(c + want[0], r + want[1])) return want;
      if (open(c + pac.d[0], r + pac.d[1])) return pac.d;
      return [0, 0];
    };

    const ghostChoose = (gh: Ghost, now: number) => (c: number, r: number): Dir => {
      const dirs = ([[1, 0], [-1, 0], [0, 1], [0, -1]] as Dir[]).filter(
        (d) => open(c + d[0], r + d[1]) && !(d[0] === -gh.d[0] && d[1] === -gh.d[1] && (gh.d[0] || gh.d[1])),
      );
      const list = dirs.length ? dirs : ([[-gh.d[0], -gh.d[1]]] as Dir[]);
      const scared = now < fright;
      if (Math.random() < (scared ? 0.35 : 0.18)) return list[Math.floor(Math.random() * list.length)];
      let pick = list[0];
      let best = scared ? -Infinity : Infinity;
      for (const d of list) {
        const v = field[idx(c + d[0], r + d[1])];
        const score = v < 0 ? 9999 : v;
        if (scared ? score > best : score < best) {
          best = score;
          pick = d;
        }
      }
      return pick;
    };

    const paint = (now: number) => {
      if (process.env.NODE_ENV !== "production") board.dataset.pac = `${pac.x.toFixed(2)},${pac.y.toFixed(2)},${pac.d.join(":")},${mode}`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(base, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = tones.muted;
      ctx.beginPath();
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const p = pellet[idx(c, r)];
          if (!p) continue;
          const x = ox + (c + 0.5) * cell;
          const y = oy + (r + 0.5) * cell;
          const rad = p === 2 ? cell * 0.2 * (0.85 + 0.15 * Math.sin(now / 180)) : 1.4;
          ctx.moveTo(x + rad, y);
          ctx.arc(x, y, rad, 0, Math.PI * 2);
        }
      ctx.fill();
      const fine = Math.max(cell < 20 ? 0.8 : 0.95, 1.5 / dpr);
      const d = cell * 1.15;
      for (const gh of ghosts) {
        if (gh.eaten) continue;
        const flicker = now < fright && fright - now < 1500 && Math.floor(now / 150) % 2 === 0;
        kit.ghost(ctx, ox + (gh.x + 0.5) * cell, oy + (gh.y + 0.5) * cell, d * 0.92, fine, gh.d[0], gh.d[1], now, now < fright && !flicker, false);
      }
      kit.pac(ctx, ox + (pac.x + 0.5) * cell, oy + (pac.y + 0.5) * cell, d, fine, pac.d[0] || want[0], pac.d[1] || want[1], mouth.face, calm, false);
    };

    const frame = (now: number) => {
      raf = 0;
      if (!alive) return;
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      if (mode === "caught" && now >= pauseTo) {
        if (lives <= 0) {
          set("over");
          paint(now);
          return;
        }
        reset(false);
        set("play");
      }
      if (mode === "play") {
        const speed = (W < 640 ? 5.2 : 6.2) * (1 + level * 0.08);
        const bx = pac.x;
        const by = pac.y;
        step(pac, speed * dt, pacChoose);
        mouth.step(now, dt, Math.hypot(pac.x - bx, pac.y - by) > 1e-4);
        const k = idx(Math.round(pac.x), Math.round(pac.y));
        if (pellet[k]) {
          points += pellet[k] === 2 ? 50 : 10;
          if (pellet[k] === 2) {
            fright = now + FRIGHT;
            chain = 200;
            for (const gh of ghosts) if (gh.d[0] || gh.d[1]) gh.d = [-gh.d[0], -gh.d[1]];
          }
          pellet[k] = 0;
          left--;
          if (left <= 0) {
            level++;
            const keepLevel = level;
            const keepPoints = points;
            const keepLives = lives;
            build(true).then(() => {
              level = keepLevel;
              points = keepPoints;
              lives = keepLives;
              hud();
              run();
            });
            return;
          }
        }
        flood();
        for (const gh of ghosts) {
          if (gh.eaten) {
            if (now >= gh.out) {
              gh.eaten = false;
              gh.x = gh.home[0];
              gh.y = gh.home[1];
              gh.d = [0, 0];
            }
            continue;
          }
          if (now < gh.out) continue;
          const v = speed * (now < fright ? 0.55 : 0.86);
          step(gh, v * dt, ghostChoose(gh, now));
          if (Math.hypot(gh.x - pac.x, gh.y - pac.y) < 0.6) {
            if (now < fright) {
              gh.eaten = true;
              gh.out = now + HOME;
              points += chain;
              chain *= 2;
            } else {
              lives--;
              pauseTo = now + 1100;
              set("caught");
            }
          }
        }
        if (points > high) {
          high = points;
          try {
            localStorage.setItem(BEST, String(high));
          } catch {}
        }
        hud();
      } else {
        mouth.step(now, dt, false);
      }
      paint(now);
      if (!document.hidden && mode !== "over" && mode !== "idle") raf = requestAnimationFrame(frame);
    };

    const run = () => {
      if (!raf && !document.hidden && !calm) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    const begin = (d?: Dir) => {
      if (calm) return;
      if (mode === "over") build();
      if (d) {
        want = d;
        if (d[0] === -pac.d[0] && d[1] === -pac.d[1]) pac.d = d;
      }
      if (mode !== "play" && mode !== "caught") set("play");
      run();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable]")) return;
      const d = KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
      if (!d) return;
      e.preventDefault();
      keyAt = performance.now();
      begin(d);
    };
    let touch: [number, number] | null = null;
    const onTouchStart = (e: TouchEvent) => {
      if (mode === "play") e.preventDefault();
      touch = [e.touches[0].clientX, e.touches[0].clientY];
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!touch) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touch[0];
      const dy = t.clientY - touch[1];
      touch = null;
      if (Math.hypot(dx, dy) < 18) return;
      keyAt = performance.now();
      begin(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (mode === "play") e.preventDefault();
    };
    const cellAt = (e: { clientX: number; clientY: number }) => {
      const r = board.getBoundingClientRect();
      return [Math.floor((e.clientX - r.left - ox) / cell), Math.floor((e.clientY - r.top - oy) / cell)] as const;
    };
    const onPointer = (e: PointerEvent) => {
      if (calm) return;
      aimAtCell(...cellAt(e));
      if (mode !== "play" && mode !== "caught") begin();
    };
    const onHover = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || mode !== "play") return;
      aimAtCell(...cellAt(e));
    };
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (mode === "play" || mode === "caught") run();
    };

    let queued = 0;
    const rebuild = () => {
      const r = board.getBoundingClientRect();
      if (W && Math.abs(r.width - W) < 2 && Math.abs(r.height - H) < 2) return;
      cancelAnimationFrame(queued);
      queued = requestAnimationFrame(() => {
        if (!alive) return;
        cancelAnimationFrame(raf);
        raf = 0;
        if (mode === "play" || mode === "caught") set("idle");
        build();
      });
    };
    const ro = new ResizeObserver(rebuild);
    ro.observe(board);
    document.addEventListener("keydown", onKey);
    board.addEventListener("pointerdown", onPointer);
    board.addEventListener("pointermove", onHover);
    const onPad = () => {
      if (mode !== "play" && mode !== "caught") begin();
    };
    pad?.addEventListener("click", onPad);
    board.addEventListener("touchstart", onTouchStart, { passive: false });
    board.addEventListener("touchmove", onTouchMove, { passive: false });
    board.addEventListener("touchend", onTouchEnd);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(queued);
      ro.disconnect();
      document.removeEventListener("keydown", onKey);
      board.removeEventListener("pointerdown", onPointer);
      board.removeEventListener("pointermove", onHover);
      pad?.removeEventListener("click", onPad);
      board.removeEventListener("touchstart", onTouchStart);
      board.removeEventListener("touchmove", onTouchMove);
      board.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [word]);

  const prompt =
    state === "over" ? "Game over. Press an arrow or click to play again" : state === "idle" ? "Press an arrow or click to play" : null;

  return (
    <>
      <div
        ref={boardRef}
        className={`relative h-[calc(100svh-var(--masthead)-6.5rem)] min-h-[20rem] w-full cursor-pointer select-none ${
          state === "play" || state === "caught" ? "touch-none" : "touch-pan-y"
        }`}
      >
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
        <p className="sr-only">{label}</p>
      </div>
      {still ? null : (
        <div data-overlay className="fixed bottom-4 left-[var(--gutter)] z-40 flex items-center gap-x-xs">
          <button
            ref={padRef}
            type="button"
            aria-label="Play Pac-Man: arrow keys, W A S D or the pointer steer"
            className="flex h-11 items-center gap-x-sm rounded-pill bg-canvas/85 px-md text-caption backdrop-blur-sm focus:outline-none focus-visible:bg-ink focus-visible:text-canvas"
          >
            {prompt ? (
              <span className="whitespace-nowrap">
                <span className="max-md:hidden">{prompt}</span>
                <span className="md:hidden">{state === "over" ? "Tap to replay" : "Tap to play"}</span>
              </span>
            ) : null}
            <span className={`flex items-center gap-x-sm font-mono text-[12px] leading-none tabular-nums ${prompt ? "opacity-60" : ""}`}>
              <span ref={scoreRef}>00000</span>
              <span ref={bestRef} className="opacity-45">00000</span>
              <span ref={livesRef}>×3</span>
            </span>
          </button>
          {extra}
        </div>
      )}
    </>
  );
}
