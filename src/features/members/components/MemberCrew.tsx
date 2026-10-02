"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Bilingual } from "@/features/site/data/about";
import type { MemberLinks as Links } from "../data/roster";
import MemberLinks from "./MemberLinks";
import { DOT, SCREEN } from "@/lib/halftone";

type CrewGroup = "alumni" | "executives" | "members";

const GROUPS: { key: CrewGroup; label: string }[] = [
  { key: "alumni", label: "Alumni" },
  { key: "executives", label: "Executives" },
  { key: "members", label: "Members" },
];

export interface CrewMember {
  id: string;
  group: CrewGroup;
  name: string;
  post?: Bilingual;
  duty?: Bilingual;
  department: Bilingual;
  year?: number;
  bio?: string;
  portrait: string | null;
  links?: Links;
}

const IN = 700;
const OUT = 400;

type Sheet = {
  bmp: HTMLImageElement;
  tone: Float32Array;
  cols: number;
  rows: number;
  cell: number;
  w: number;
  h: number;
  crop: [number, number, number];
  dots: HTMLCanvasElement | null;
};

export function Print({
  src,
  className = "",
  live = false,
  lazy = false,
  portrait = false,
  sizes = "(min-width: 1024px) 34vw, 8rem",
}: {
  src: string | null;
  className?: string;
  live?: boolean;
  lazy?: boolean;
  portrait?: boolean;
  sizes?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const st = useRef({ t: 0, goal: 0, last: 0, raf: 0, paint: (() => false) as () => boolean, run: () => {} });

  useEffect(() => {
    const box = ref.current;
    const canvas = box?.querySelector("canvas");
    const img = box?.querySelector("img");
    if (!box || !canvas || !img) return;
    const s = st.current;
    let sheet: Sheet | null = null;
    let frame = 0;

    const measure = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h || !img.complete || !img.currentSrc) return null;
      const bmp = new window.Image();
      bmp.src = img.currentSrc;
      if (!bmp.complete || !bmp.naturalWidth) {
        bmp.addEventListener("load", redraw, { once: true });
        return null;
      }
      const cell = Math.max(3.5, Math.min(SCREEN, w / 28));
      const cols = Math.ceil(w / cell);
      const rows = Math.ceil(h / cell);
      const k = Math.min(bmp.naturalWidth / w, bmp.naturalHeight / h);
      const crop: [number, number, number] = [(bmp.naturalWidth - w * k) / 2, (bmp.naturalHeight - h * k) * 0.2, k];
      const src = document.createElement("canvas");
      src.width = cols * 3;
      src.height = rows * 3;
      const g = src.getContext("2d", { willReadFrequently: true });
      if (!g) return null;
      g.drawImage(bmp, crop[0], crop[1], cols * cell * k, rows * cell * k, 0, 0, src.width, src.height);
      let data: Uint8ClampedArray;
      try {
        data = g.getImageData(0, 0, src.width, src.height).data;
      } catch {
        return null;
      }
      const tone = new Float32Array(cols * rows);
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          let sum = 0;
          for (let yy = 0; yy < 3; yy++)
            for (let xx = 0; xx < 3; xx++) {
              const i = ((y * 3 + yy) * src.width + x * 3 + xx) * 4;
              sum += 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
            }
          tone[y * cols + x] = sum / 9 / 255;
        }
      const sorted = Float32Array.from(tone).sort();
      const lo = sorted[Math.floor(0.04 * sorted.length)];
      const hi = Math.max(lo + 0.08, sorted[Math.min(sorted.length - 1, Math.floor(0.96 * sorted.length))]);
      for (let i = 0; i < tone.length; i++) tone[i] = 0.12 + 0.88 * Math.min(1, Math.max(0, (tone[i] - lo) / (hi - lo)));
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      return { bmp, tone, cols, rows, cell, w, h, crop, dots: null };
    };

    const paint = () => {
      if (!sheet) sheet = measure();
      if (!sheet) return false;
      const g = canvas.getContext("2d");
      if (!g) return false;
      const { bmp, w, h, crop } = sheet;
      const dpr = canvas.width / w;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const t = s.t;
      if (t >= 1 || t <= 0) sheet.dots = null;
      // Use high-quality resampling when shrinking portraits.
      g.imageSmoothingQuality = "high";
      if (t >= 1) {
        g.imageSmoothingEnabled = true;
        g.drawImage(bmp, crop[0], crop[1], w * crop[2], h * crop[2], 0, 0, w, h);
        return true;
      }
      if (t <= 0) press(g, sheet);
      else {
        if (!sheet.dots) {
          const c = document.createElement("canvas");
          c.width = canvas.width;
          c.height = canvas.height;
          const cg = c.getContext("2d");
          if (cg) {
            cg.setTransform(dpr, 0, 0, dpr, 0, 0);
            press(cg, sheet);
            sheet.dots = c;
          }
        }
        if (sheet.dots) g.drawImage(sheet.dots, 0, 0, w, h);
        else press(g, sheet);
      }
      if (t > 0) {
        g.globalAlpha = t * t * (3 - 2 * t);
        g.drawImage(bmp, crop[0], crop[1], w * crop[2], h * crop[2], 0, 0, w, h);
        g.globalAlpha = 1;
      }
      return true;
    };
    s.paint = paint;

    const ready = () => {
      if (paint() && s.t !== s.goal) s.run();
    };
    const redraw = () => {
      sheet = null;
      if (img.complete && img.naturalWidth) ready();
      else img.addEventListener("load", ready, { once: true });
    };
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(redraw);
    });
    ro.observe(canvas);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(s.raf);
      s.raf = 0;
    };
  }, [src]);

  useEffect(() => {
    const s = st.current;
    s.goal = live ? 1 : 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      s.t = s.goal;
      s.paint();
      return;
    }
    const step = (now: number) => {
      s.raf = 0;
      if (s.last) {
        const dt = now - s.last;
        s.t = s.goal > s.t ? Math.min(1, s.t + dt / IN) : Math.max(0, s.t - dt / OUT);
      }
      s.last = now;
      // Image load or resize resumes painting when dimensions are available.
      if (!s.paint()) return;
      if (s.t !== s.goal) s.raf = requestAnimationFrame(step);
    };
    s.run = () => {
      cancelAnimationFrame(s.raf);
      s.last = 0;
      s.raf = requestAnimationFrame(step);
    };
    s.run();
    return () => {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
    };
  }, [live]);

  return (
    // Keep print corners square to preserve the halftone dots.
    <div ref={ref} aria-hidden="true" data-print className={`relative ${portrait ? "aspect-[4/5]" : "aspect-square"} overflow-hidden ${className}`}>
      {src ? (
        <>
          <Image src={src} alt="" fill sizes={sizes} loading={lazy ? "lazy" : "eager"} className="object-cover opacity-0" />
          <canvas className="absolute inset-0 size-full" />
        </>
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-surface-sunken">
          <Image src="/logo-mark.svg" alt="" width={253} height={274} className="h-auto w-[28%] max-w-9 opacity-35" />
        </div>
      )}
    </div>
  );
}

function press(g: CanvasRenderingContext2D, { tone, cols, rows, cell, w, h }: Sheet) {
  const css = getComputedStyle(document.documentElement);
  g.fillStyle = css.getPropertyValue("--color-canvas").trim() || "#dfe1dc";
  g.fillRect(0, 0, w, h);
  g.fillStyle = css.getPropertyValue("--color-ink").trim() || "#0f110d";
  g.beginPath();
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const r = (1 - tone[y * cols + x]) * cell * DOT;
      if (r < 0.3) continue;
      const cx = x * cell + cell / 2;
      const cy = y * cell + cell / 2;
      g.moveTo(cx + r, cy);
      g.arc(cx, cy, r, 0, Math.PI * 2);
    }
  g.fill();
}

export function useInView<T extends Element>(share = 0.6) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: share });
    io.observe(el);
    return () => io.disconnect();
  }, [share]);
  return [ref, seen] as const;
}

// Keep hyphenated words on one line.
function whole(text: string) {
  return text.split(/(\S*-\S*)/).map((part, i) => (i % 2 ? <span key={i} className="whitespace-nowrap">{part}</span> : part));
}

function Meta({ m, className = "" }: { m: CrewMember; className?: string }) {
  if (m.group === "alumni") {
    return (
      <span className={className}>
        <span className="tabular-nums">{m.year}</span>
        <span className="xl:hidden"> · {m.department.en}</span>
      </span>
    );
  }
  return (
    <span className={className}>
      {m.post && whole(m.post.en)}
      {m.post && m.duty && <span className="text-ink-muted"> · </span>}
      {m.duty && <span>{whole(m.duty.en)}</span>}
    </span>
  );
}

function GroupHead({ id, label, count, className = "" }: { id?: string; label: string; count: number; className?: string }) {
  return (
    <h3 id={id} className={`flex items-baseline justify-between pb-xs text-body-sm text-ink-muted ${className}`}>
      {label}
      <span className="tabular-nums">{count}</span>
    </h3>
  );
}

function Card({ m }: { m: CrewMember }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <li className="u-scroll-fade min-w-0">
      <div ref={ref}>
        <Print src={m.portrait} live={seen} lazy portrait sizes="(min-width: 768px) 16vw, 33vw" />
      </div>
      <p className="mt-xs text-body-sm text-ink">{m.name}</p>
      <Meta m={m} className="block text-caption text-ink-muted" />
      {/* Keep 44px hit areas without adding card height. */}
      <MemberLinks name={m.name} links={m.links} className="-mx-1.5 -mb-3.5 -mt-1.5 flex-wrap" />
    </li>
  );
}

const HANGUL = /[가-힣]/;

// Scroll speed (px/s) and endpoint pause (ms).
const RUN = 45;
const REST = 1000;

// Overflowing bios scroll across the role and department columns while active.
function BioLine({ text, on }: { text: string; on: boolean }) {
  const box = useRef<HTMLSpanElement>(null);
  const line = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const b = box.current;
    const l = line.current;
    if (!b || !l || !on) return;
    // Extend past the fade so the final letters remain readable.
    const d = l.scrollWidth - b.clientWidth;
    b.toggleAttribute("data-over", d > 1);
    if (d <= 1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const far = d + 24;
    const move = (far / RUN) * 1000;
    const total = REST + move + REST;
    const run = l.animate(
      [
        { transform: "translateX(0)", offset: 0 },
        { transform: "translateX(0)", offset: REST / total, easing: "cubic-bezier(0.45, 0, 0.55, 1)" },
        { transform: `translateX(${-far}px)`, offset: (REST + move) / total },
        { transform: `translateX(${-far}px)`, offset: 1 },
      ],
      { duration: total, iterations: Infinity, direction: "alternate" },
    );
    return () => run.cancel();
  }, [on, text]);

  return (
    <span
      ref={box}
      aria-hidden="true"
      lang={HANGUL.test(text) ? "ko" : "en"}
      className={`pointer-events-none absolute inset-0 col-start-2 col-end-[-2] flex items-center overflow-hidden font-serif text-[0.9375rem] leading-[21px] text-ink transition-[opacity,visibility] duration-200 motion-reduce:transition-none data-[over]:[mask-image:linear-gradient(90deg,transparent,#000_0.35em,#000_calc(100%-2em),transparent)] ${
        HANGUL.test(text) ? "" : "italic"
      } ${on ? "visible opacity-100" : "invisible opacity-0"}`}
    >
      {/* Align serif and sans cap centres. */}
      <span ref={line} className="shrink-0 whitespace-nowrap [text-box:trim-both_cap_alphabetic]">
        {`“${text}”`}
      </span>
    </span>
  );
}

export default function MemberCrew({ members }: { members: CrewMember[] }) {
  const [hot, setHot] = useState<string | null>(null);
  const groups = GROUPS.map((g) => ({ ...g, members: members.filter((m) => m.group === g.key) })).filter(
    (g) => g.members.length > 0,
  );
  const order = groups.flatMap((g) => g.members);

  return (
    <>
      <div className="lg:hidden">
        {groups.map((g) => (
          <section key={g.key} aria-labelledby={`crew-m-${g.key}`} className="border-t border-rule-strong pt-sm pb-xxl">
            <GroupHead id={`crew-m-${g.key}`} label={g.label} count={g.members.length} className="pb-md" />
            <ul className="grid grid-cols-3 gap-x-sm gap-y-xl md:grid-cols-6 md:gap-x-md">
              {g.members.map((m) => (
                <Card key={m.id} m={m} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="hidden grid-cols-12 gap-x-xl lg:grid" onPointerLeave={() => setHot(null)}>
        <div
          className="col-span-6 grid grid-cols-[auto_minmax(0,1fr)_auto] content-start gap-x-md xl:col-span-7 xl:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto]"
          onFocus={(e) => {
            const row = (e.target as HTMLElement).closest<HTMLElement>("[data-crew]");
            if (row?.dataset.crew) setHot(row.dataset.crew);
          }}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHot(null);
          }}
        >
          {groups.map((g, i) => (
            <section
              key={g.key}
              aria-labelledby={`crew-d-${g.key}`}
              className={`col-span-full grid grid-cols-subgrid ${i ? "pt-xxl" : ""}`}
            >
              <GroupHead id={`crew-d-${g.key}`} label={g.label} count={g.members.length} className="col-span-full" />
              <ul className="col-span-full grid grid-cols-subgrid border-t border-rule-strong">
                {g.members.map((m) => {
                  const read = hot === m.id && !!m.bio;
                  const away = `transition-[opacity,visibility] duration-200 motion-reduce:transition-none ${read ? "invisible opacity-0" : ""}`;
                  return (
                  <li
                    key={m.id}
                    data-crew={m.id}
                    onPointerEnter={() => setHot(m.id)}
                    className={`relative col-span-full grid grid-cols-subgrid items-start border-b border-rule py-1.5 text-body-sm transition-colors duration-200 motion-reduce:transition-none ${
                      hot && hot !== m.id ? "text-ink-muted" : "text-ink"
                    }`}
                  >
                    <span className="min-w-[4.5rem]">{m.name}</span>
                    <Meta m={m} className={away} />
                    <span className={`hidden text-ink-muted xl:block ${away}`}>{m.department.en}</span>
                    {/* Centre 32px hit areas on the 21px text line. */}
                    <MemberLinks name={m.name} links={m.links} dense className="-my-[5.5px] -mr-xxs justify-self-end" />
                    {m.bio && (
                      <>
                        <span className="sr-only">{m.bio}</span>
                        <BioLine text={m.bio} on={read} />
                      </>
                    )}
                  </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        <div aria-hidden="true" className="col-span-6 xl:col-span-5">
          {/* Align the portrait wall with the first table rule. */}
          <GroupHead label={groups[0]?.label ?? ""} count={0} className="invisible" />
          <ul className="grid grid-cols-5 gap-xs">
            {order.map((m) => (
              <li key={m.id} onPointerEnter={() => setHot(m.id)}>
                <Print
                  src={m.portrait}
                  live={hot === m.id}
                  lazy
                  portrait
                  sizes="(min-width: 1280px) 8vw, 10vw"
                  className={`transition-opacity duration-200 motion-reduce:transition-none ${hot && hot !== m.id ? "opacity-45" : ""}`}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
