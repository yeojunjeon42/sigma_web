"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { T } from "@/components/T";
import { PLATE_RELEASE, PLATE_SHOW } from "@/components/ui/HeroPlate";

type Bilingual = { en: string; ko: string };
export type LineBuild = { id: string; name: Bilingual; year: number | null; src: string | null };
export type LineResult = { key: string; year: number; contest: Bilingual; result: Bilingual };

const DRIFT = -42;
const CRAWL = -5;
const PUSH = 2.2;
const PUSH_MAX = 360;
const THROW_MAX = 2400;
const SLOP = 6;
const CATCH = 200;
const GRACE = 500;
const LEAN = 0.15;
const CELL = 5;
const PEEK = [220, 176];
const STOPS = [
  [118, 118, 122],
  [237, 32, 36],
  [142, 19, 22],
];

const META = "font-mono text-[12px] leading-none tracking-normal uppercase";
const ALL =
  "inline-flex min-h-11 items-center text-ink transition-opacity hover:opacity-60 lg:min-h-0";

type Press = {
  id: number;
  ox: number;
  oy: number;
  px: number;
  t: number;
  el: HTMLElement | null;
  live: boolean;
  v0: number;
};

export default function RecordLines({
  builds,
  results,
  total,
  cohorts,
  people,
}: {
  builds: LineBuild[];
  results: LineResult[];
  total: number;
  cohorts: number;
  people: number;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = root.current;
    const t1 = host?.querySelector<HTMLElement>("[data-track='1']");
    const t2 = host?.querySelector<HTMLElement>("[data-track='2']");
    const peek = host?.querySelector<HTMLElement>("[data-peek]");
    const canvas = peek?.querySelector("canvas");
    const g = canvas?.getContext("2d");
    if (!host || !t1 || !t2 || !peek || !canvas || !g) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    host.dataset.live = "";
    const srcOf = new Map(builds.map((b) => [b.id, b]));
    const tones = new Map<string, { tone: Float32Array; cols: number; rows: number }>();
    let x = 0;
    let v = DRIFT;
    let lean = 0;
    let w1 = 0;
    let w2 = 0;
    let last = 0;
    let raf = 0;
    let seen = false;
    let inside = false;
    let press: Press | null = null;
    let verdict: { el: HTMLElement | null; until: number } | null = null;
    let keys = false;
    let held: HTMLElement | null = null;
    let cx = 0;
    let cy = 0;
    let cur: HTMLElement | null = null;
    let lastScroll = window.scrollY;
    let onPlate = false;
    const pk = { x: 0, y: 0, tx: 0, ty: 0, id: "", grow: 1 };

    const mod = (a: number, n: number) => ((a % n) + n) % n;
    const clamp = (a: number, lo: number, hi: number) => (a < lo ? lo : a > hi ? hi : a);
    const measure = () => {
      w1 = t1.firstElementChild?.getBoundingClientRect().width ?? 0;
      w2 = t2.firstElementChild?.getBoundingClientRect().width ?? 0;
    };

    const plateShows = () => {
      const r = document.querySelector("[data-plate]")?.getBoundingClientRect();
      if (!r || !r.height) return false;
      const seenPart = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      return seenPart / r.height > 0.45;
    };

    const tonesFor = (id: string, done: () => void) => {
      const src = srcOf.get(id)?.src;
      if (tones.has(id) || !src) return done();
      const img = new Image();
      img.onload = () => {
        const cols = Math.floor(PEEK[0] / CELL);
        const rows = Math.floor(PEEK[1] / CELL);
        const s = Math.min((PEEK[0] - 24) / img.naturalWidth, (PEEK[1] - 24) / img.naturalHeight);
        const w = img.naturalWidth * s;
        const h = img.naturalHeight * s;
        const c = document.createElement("canvas");
        c.width = cols;
        c.height = rows;
        const cg = c.getContext("2d", { willReadFrequently: true });
        if (!cg) return;
        cg.drawImage(img, (PEEK[0] - w) / 2 / CELL, (PEEK[1] - h) / 2 / CELL, w / CELL, h / CELL);
        let d: Uint8ClampedArray;
        try {
          d = cg.getImageData(0, 0, cols, rows).data;
        } catch {
          return;
        }
        const tone = new Float32Array(cols * rows).fill(1);
        const lum = (k: number) => (0.3 * d[k] + 0.59 * d[k + 1] + 0.11 * d[k + 2]) / 255;
        const ins: number[] = [];
        for (let k = 0; k < tone.length; k++) if (d[k * 4 + 3] > 128) ins.push(lum(k * 4));
        ins.sort((p, q) => p - q);
        const lo = ins[Math.floor(ins.length * 0.04)] ?? 0;
        const hi = Math.max(lo + 0.08, Math.min(0.886, ins[Math.floor(ins.length * 0.96)] ?? 1));
        for (let k = 0; k < tone.length; k++) {
          const al = d[k * 4 + 3] / 255;
          if (al < 0.02) continue;
          const l = al * lum(k * 4) + (1 - al) * 0.886;
          tone[k] = Math.min(clamp((l - lo) / (hi - lo), 0, 1), 1 - 0.22 * al);
        }
        tones.set(id, { tone, cols, rows });
        done();
      };
      img.src = `/_next/image?url=${encodeURIComponent(src)}&w=256&q=70`;
    };

    const print = () => {
      g.setTransform(2, 0, 0, 2, 0, 0);
      g.clearRect(0, 0, PEEK[0], PEEK[1]);
      const T0 = tones.get(pk.id);
      if (!T0) return;
      for (let j = 0; j < T0.rows; j++) {
        for (let i = 0; i < T0.cols; i++) {
          const t = T0.tone[j * T0.cols + i];
          const built = t < 0.97;
          const local = clamp(pk.grow * 1.6 - (i / T0.cols) * 0.6, 0, 1);
          const full = (1 - 0.63 * (0.12 + 0.88 * t)) * CELL * 0.44;
          const r = built ? 0.75 + (full - 0.75) * local : 0.75;
          const k = (1 - t) * 2;
          const s = Math.min(1, Math.floor(k));
          const c = built
            ? STOPS[s].map((q, n) => Math.round(q + (STOPS[s + 1][n] - q) * (k - s)))
            : [176, 176, 176];
          g.fillStyle = `rgb(${c[0]} ${c[1]} ${c[2]})`;
          g.beginPath();
          g.arc((i + 0.5) * CELL, (j + 0.5) * CELL, r, 0, Math.PI * 2);
          g.fill();
        }
      }
    };

    const focus = (el: HTMLElement | null) => {
      cur?.removeAttribute("data-on");
      cur = el;
      const id = el?.dataset.id ?? "";
      const b = id ? srcOf.get(id) : undefined;
      if (el) {
        el.dataset.on = "";
        host.dataset.focus = "";
      } else delete host.dataset.focus;

      if (b?.src && plateShows()) {
        onPlate = true;
        window.dispatchEvent(
          new CustomEvent(PLATE_SHOW, {
            detail: { id: b.id, src: b.src, name: b.name, year: b.year },
          }),
        );
      } else if (onPlate && !b) {
        onPlate = false;
        window.dispatchEvent(new Event(PLATE_RELEASE));
      }

      const card = !!b?.src && !onPlate && !press && !held;
      if (card && id !== pk.id) {
        pk.id = id;
        pk.grow = 0;
        tonesFor(id, () => {
          if (pk.id === id) pk.grow = 0;
        });
      }
      if (card) peek.dataset.show = "";
      else delete peek.dataset.show;
    };

    const step = (now: number) => {
      raf = 0;
      const dt = clamp((now - last) / 1000, 0.001, 0.05);
      last = now;
      if (!press) {
        const rest = held ? 0 : inside ? CRAWL : DRIFT;
        v += (rest - v) * (1 - Math.exp(-dt * (Math.abs(v) > 200 ? 1.4 : 3)));
        x += v * dt;
      }
      lean += (clamp(-v / 2600, -LEAN, LEAN) - lean) * (1 - Math.exp(-dt * 10));
      if (w1 > 0)
        t1.style.transform = `translate3d(${(-mod(-x, w1)).toFixed(2)}px,0,0) skewX(${(lean * 57.3).toFixed(2)}deg)`;
      if (w2 > 0)
        t2.style.transform = `translate3d(${(-mod(x * 0.5, w2)).toFixed(2)}px,0,0) skewX(${(-lean * 28).toFixed(2)}deg)`;

      if (!held && inside && !press) {
        const hit = document.elementFromPoint(cx, cy);
        const el = hit?.closest<HTMLElement>("[data-id]") ?? null;
        if (el !== cur) focus(el);
      }
      pk.x += (pk.tx - pk.x) * (1 - Math.exp(-dt * 14));
      pk.y += (pk.ty - pk.y) * (1 - Math.exp(-dt * 14));
      peek.style.transform = `translate3d(${pk.x.toFixed(1)}px,${pk.y.toFixed(1)}px,0)`;
      if (tones.has(pk.id) && pk.grow < 1) {
        pk.grow = Math.min(1, pk.grow + dt / 0.35);
        print();
      }
      if (seen && !document.hidden) kick();
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };

    const place = (e: PointerEvent) => {
      const f = host.getBoundingClientRect();
      cx = e.clientX;
      cy = e.clientY;
      pk.tx = clamp(e.clientX - f.left + 22, 0, Math.max(0, f.width - PEEK[0]));
      pk.ty = e.clientY - f.top + 26;
    };
    const enter = (e: PointerEvent) => {
      inside = true;
      place(e);
      pk.x = pk.tx;
      pk.y = pk.ty;
    };
    const leave = () => {
      inside = false;
      if (!held) focus(null);
    };
    const down = (e: PointerEvent) => {
      keys = false;
      verdict = null;
      if (!e.isPrimary || e.button !== 0) return;
      const hit = e.target as Element;
      const a = hit.closest("a");
      if (a && !a.hasAttribute("data-id")) return;
      press = {
        id: e.pointerId,
        ox: e.clientX,
        oy: e.clientY,
        px: e.clientX,
        t: performance.now(),
        el: Math.abs(v) > CATCH ? null : hit.closest<HTMLElement>("[data-id]"),
        live: false,
        v0: v,
      };
      v = 0;
    };
    const end = (clicks: boolean, touch: boolean) => {
      const p = press;
      if (!p) return;
      press = null;
      delete host.dataset.drag;
      if (p.live) v = performance.now() - p.t > 80 ? 0 : clamp(v, -THROW_MAX, THROW_MAX);
      else if (!clicks) v = p.v0;
      if (clicks) verdict = { el: p.live ? null : p.el, until: performance.now() + GRACE };
      if (touch) leave();
    };
    const move = (e: PointerEvent) => {
      if (inside) place(e);
      const p = press;
      if (!p || e.pointerId !== p.id) return;
      if (e.pointerType === "mouse" && e.buttons === 0) return end(false, false);
      const now = performance.now();
      if (!p.live) {
        if (Math.hypot(e.clientX - p.ox, e.clientY - p.oy) < SLOP) return;
        p.live = true;
        p.px = e.clientX;
        p.t = now;
        host.dataset.drag = "";
        focus(null);
        return;
      }
      const dx = e.clientX - p.px;
      x += dx;
      v = v * 0.4 + (dx / Math.max(0.008, (now - p.t) / 1000)) * 0.6;
      p.px = e.clientX;
      p.t = now;
    };
    const up = (e: PointerEvent) => {
      if (press && e.pointerId === press.id) end(e.type === "pointerup", e.pointerType !== "mouse");
    };
    const menu = () => end(false, false);
    const click = (e: MouseEvent) => {
      const g = verdict;
      if (!g || e.detail === 0) return;
      verdict = null;
      if (performance.now() > g.until) return;
      if (g.el && (e.target as Element).closest("[data-id]") === g.el) return;
      e.preventDefault();
      e.stopPropagation();
      if (g.el?.isConnected && !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) g.el.click();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Tab") keys = true;
    };
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      x -= e.deltaX;
      v = clamp(-e.deltaX * 20, -THROW_MAX, THROW_MAX);
    };
    const scroll = () => {
      const dy = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      if (seen && !press) v = clamp(v - dy * PUSH, -PUSH_MAX, PUSH_MAX);
    };
    const tab = (e: FocusEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-id]");
      if (!el || !keys) return;
      held = el;
      x = -(el.offsetLeft - 24);
      v = 0;
      focus(el);
    };
    const blur = () => {
      if (!held) return;
      held = null;
      if (!inside) focus(null);
    };

    const ro = new ResizeObserver(measure);
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      if (seen) {
        last = performance.now();
        kick();
      }
    });
    measure();
    ro.observe(t1);
    ro.observe(t2);
    io.observe(host);
    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointerleave", leave);
    host.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    host.addEventListener("click", click, true);
    host.addEventListener("contextmenu", menu);
    window.addEventListener("keydown", key, true);
    host.addEventListener("wheel", wheel, { passive: false });
    host.addEventListener("focusin", tab);
    host.addEventListener("focusout", blur);
    window.addEventListener("scroll", scroll, { passive: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointerleave", leave);
      host.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      host.removeEventListener("click", click, true);
      host.removeEventListener("contextmenu", menu);
      window.removeEventListener("keydown", key, true);
      delete host.dataset.drag;
      host.removeEventListener("wheel", wheel);
      host.removeEventListener("focusin", tab);
      host.removeEventListener("focusout", blur);
      window.removeEventListener("scroll", scroll);
      if (onPlate) window.dispatchEvent(new Event(PLATE_RELEASE));
      delete host.dataset.live;
    };
  }, [builds]);

  const names = (copy: number) => (
    <ul aria-hidden={copy > 0 || undefined} className="inline">
      {builds.map((b) => (
        <li key={b.id} className="inline">
          <Link
            href={`/archive?view=reel&at=${b.id}`}
            prefetch={false}
            draggable={false}
            tabIndex={copy > 0 ? -1 : undefined}
            data-id={b.id}
            className="inline-block py-1 text-ink transition-colors duration-200 group-data-[focus]/lines:text-rule-strong data-[on]:!text-ink"
          >
            <T en={b.name.en} ko={b.name.ko} />
            {b.year ? (
              <span className="ml-[0.5em] inline-block -translate-y-[2em] font-mono text-[12px] tracking-normal text-ink-muted tabular-nums">
                {b.year}
              </span>
            ) : null}
          </Link>
          <span
            aria-hidden="true"
            className="mx-[0.5em] inline-block size-[0.16em] -translate-y-[0.32em] rounded-full bg-rule-strong"
          />
        </li>
      ))}
    </ul>
  );

  const awards = (copy: number) => (
    <ul aria-hidden={copy > 0 || undefined} className="inline">
      {results.map((r) => (
        <li key={r.key} className="mr-[2.4em] inline">
          <span className="mr-[0.9em] font-mono text-[12px] text-ink-subtle tabular-nums">
            {r.year}
          </span>
          <T en={r.contest.en} ko={r.contest.ko} />
          <span className="ml-[1em] font-mono text-[12px] text-ink uppercase">
            <T en={r.result.en} ko={r.result.ko} />
          </span>
        </li>
      ))}
    </ul>
  );

  const fade =
    "[mask-image:linear-gradient(90deg,transparent,#000_7%,#000_93%,transparent)] overflow-hidden whitespace-nowrap motion-reduce:overflow-x-auto";

  return (
    <div
      ref={root}
      className="group/lines relative touch-pan-y select-none data-[live]:cursor-grab data-[drag]:!cursor-grabbing"
    >
      <div className="flex items-baseline justify-between gap-x-lg">
        <h2 className={`${META} text-ink`}>
          <T en="Builds" ko="작품" />
        </h2>
        <Link href="/archive" className={`${META} ${ALL}`}>
          <T en={`All ${builds.length} ↗`} ko={`전체 ${builds.length} ↗`} />
        </Link>
      </div>
      <div className={`${fade} mt-sm`}>
        <div
          data-track="1"
          className="inline-block origin-bottom text-[length:clamp(2.125rem,5.4vw,4rem)] leading-[1.12] tracking-[-0.025em] will-change-transform"
        >
          {names(0)}
          <span className="motion-reduce:hidden">{names(1)}</span>
        </div>
      </div>

      <div className="mt-lg flex items-baseline justify-between gap-x-lg">
        <h2 className={`${META} text-ink`}>
          <T en="Competition results" ko="수상" />
        </h2>
        <Link href="/history" className={`${META} ${ALL}`}>
          <T en={`All ${total} ↗`} ko={`전체 ${total} ↗`} />
        </Link>
      </div>
      <div className={`${fade} mt-sm`}>
        <div
          data-track="2"
          className="inline-block origin-bottom text-[length:clamp(0.9375rem,1.5vw,1.1875rem)] leading-[1.3] tracking-[-0.01em] text-ink-muted will-change-transform"
        >
          {awards(0)}
          <span className="motion-reduce:hidden">
            {awards(1)}
            {awards(2)}
          </span>
        </div>
      </div>

      <div className="mt-lg flex items-baseline justify-between gap-x-lg">
        <h2 className={`${META} text-ink`}>
          <T en="Members" ko="부원" />
        </h2>
        <Link href="/members" className={`${META} ${ALL}`}>
          <T
            en={`${cohorts} cohorts · ${people} members and alumni ↗`}
            ko={`${cohorts}개 기수 · 부원과 졸업생 ${people}명 ↗`}
          />
        </Link>
      </div>

      <div
        data-peek
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-20 h-[176px] w-[220px] scale-[0.92] border border-rule-strong bg-canvas opacity-0 transition-[opacity,scale] duration-200 will-change-transform data-[show]:scale-100 data-[show]:opacity-100"
      >
        <canvas width={PEEK[0] * 2} height={PEEK[1] * 2} className="block h-full w-full" />
      </div>
    </div>
  );
}
