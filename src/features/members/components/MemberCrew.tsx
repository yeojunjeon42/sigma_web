"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Bilingual } from "@/features/site/data/about";
import type { MemberLinks as Links } from "../data/roster";
import MemberLinks from "./MemberLinks";
import { DOT, SCREEN } from "@/lib/halftone";

export interface CrewMember {
  id: string;
  name: string;
  nameEn?: string;
  post?: Bilingual;
  duty?: Bilingual;
  department: Bilingual;
  gen: string;
  portrait: string | null;
  links?: Links;
}

const SUB = "lg:col-span-full lg:grid lg:grid-cols-subgrid";

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
};

export function Print({
  src,
  className = "",
  live = false,
  sizes = "(min-width: 1024px) 34vw, 8rem",
}: {
  src: string | null;
  className?: string;
  live?: boolean;
  sizes?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const st = useRef({ t: 0, goal: 0, last: 0, raf: 0, paint: (() => false) as () => boolean });

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
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      return { bmp, tone, cols, rows, cell, w, h, crop };
    };

    const paint = () => {
      if (!sheet) sheet = measure();
      if (!sheet) return false;
      const g = canvas.getContext("2d");
      if (!g) return false;
      const { bmp, tone, cols, rows, cell, w, h, crop } = sheet;
      const paper = getComputedStyle(document.documentElement).getPropertyValue("--color-canvas").trim() || "#dfe1dc";
      const ink = getComputedStyle(document.documentElement).getPropertyValue("--color-ink").trim() || "#0f110d";
      const dpr = canvas.width / w;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const t = s.t;
      if (t >= 1) {
        g.imageSmoothingEnabled = true;
        g.drawImage(bmp, crop[0], crop[1], w * crop[2], h * crop[2], 0, 0, w, h);
        return true;
      }
      g.fillStyle = paper;
      g.fillRect(0, 0, w, h);
      g.fillStyle = ink;
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
      if (t > 0) {
        g.globalAlpha = t * t * (3 - 2 * t);
        g.drawImage(bmp, crop[0], crop[1], w * crop[2], h * crop[2], 0, 0, w, h);
        g.globalAlpha = 1;
      }
      return true;
    };
    s.paint = paint;

    const redraw = () => {
      sheet = null;
      if (img.complete && img.naturalWidth) paint();
      else img.addEventListener("load", paint, { once: true });
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
    s.last = 0;
    const since = performance.now();
    const step = (now: number) => {
      s.raf = 0;
      if (!s.paint() && now - since < 4000) {
        s.last = 0;
        s.raf = requestAnimationFrame(step);
        return;
      }
      const dt = s.last ? now - s.last : 16;
      s.last = now;
      s.t = s.goal > s.t ? Math.min(1, s.t + dt / IN) : Math.max(0, s.t - dt / OUT);
      s.paint();
      if (s.t !== s.goal) s.raf = requestAnimationFrame(step);
    };
    cancelAnimationFrame(s.raf);
    s.raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
    };
  }, [live]);

  return (
    <div ref={ref} aria-hidden="true" className={`relative aspect-square overflow-hidden u-corner ${className}`}>
      {src ? (
        <>
          <Image src={src} alt="" fill sizes={sizes} loading="eager" className="object-cover opacity-0" />
          <canvas className="absolute inset-0 size-full" />
        </>
      ) : (
        <div className="absolute inset-0 bg-surface-sunken" />
      )}
    </div>
  );
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

function InView({ src }: { src: string | null }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="h-full">
      <Print src={src} live={seen} className="h-full min-h-[6.5rem] aspect-auto! md:aspect-square! md:h-auto" />
    </div>
  );
}

function Drawer({ id, open, m }: { id: string; open: boolean; m: CrewMember }) {
  return (
    <div
      id={id}
      inert={!open}
      data-drawer=""
      className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${SUB} ${
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <div className={`min-h-0 overflow-hidden ${SUB}`}>
        <p className="pt-sm pb-md text-body text-ink lg:col-span-2 lg:col-start-2 lg:pb-lg">
          Hello, I am {m.nameEn ?? m.name}, nice to meet you!
        </p>
      </div>
    </div>
  );
}

function Toggle({ m, open, controls, onToggle }: { m: CrewMember; open: boolean; controls: string; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      aria-label={`${m.name}: ${open ? "close" : "more"}`}
      onClick={onToggle}
      className="relative flex h-11 w-9 shrink-0 cursor-pointer items-center justify-center text-ink-muted transition-colors before:absolute before:top-1/2 before:left-1/2 before:size-11 before:-translate-1/2 before:content-[''] hover:text-ink focus:outline-none lg:w-11 lg:before:hidden"
    >
      <svg aria-hidden="true" viewBox="0 0 12 12" className={`size-3 transition-transform duration-300 motion-reduce:transition-none ${open ? "rotate-45" : ""}`}>
        <path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </button>
  );
}

function Meta({ m, className = "" }: { m: CrewMember; className?: string }) {
  return (
    <span className={className}>
      {m.post && m.post.en}
      {m.post && m.duty && <span className="text-ink-muted"> · </span>}
      {m.duty && (
        <span>
          {m.duty.en}
        </span>
      )}
    </span>
  );
}

function rowClick(e: React.MouseEvent, toggle: () => void) {
  const t = e.target as HTMLElement;
  if (t.closest("a, button, [data-drawer]")) return;
  if (window.getSelection()?.toString()) return;
  toggle();
}

export default function MemberCrew({ members }: { members: CrewMember[] }) {
  const [hot, setHot] = useState(members[0]?.id ?? null);
  const [open, setOpen] = useState<string | null>(null);
  const pointed = members.find((m) => m.id === hot);
  const toggle = (id: string) => setOpen((o) => (o === id ? null : id));

  return (
    <>
      <ul className="border-b border-rule-strong lg:hidden">
        {members.map((m) => (
          <li
            key={m.id}
            onClick={(e) => rowClick(e, () => toggle(m.id))}
            className="u-scroll-fade grid cursor-pointer content-start items-stretch grid-cols-[6.5rem_minmax(0,1fr)] gap-x-md border-t border-rule-strong py-md md:grid-cols-[8rem_minmax(0,1fr)_auto] md:gap-x-lg"
          >
            <InView src={m.portrait} />
            <div className="flex min-w-0 flex-col gap-y-sm md:justify-between md:py-xxs">
              <span className="u-trim text-display-md text-ink">{m.name}</span>
              <p className="text-body-sm text-ink-muted">
                <Meta m={m} className="block text-ink" />
                {m.department.en}
              </p>
              <div className="-mb-xs mt-auto flex flex-wrap items-center md:hidden">
                <MemberLinks name={m.name} links={m.links} className="-ml-1.5" />
                <Toggle m={m} open={open === m.id} controls={`crew-m-${m.id}`} onToggle={() => toggle(m.id)} />
              </div>
            </div>
            <div className="hidden items-center self-start md:flex">
              <MemberLinks name={m.name} links={m.links} />
              <Toggle m={m} open={open === m.id} controls={`crew-m-${m.id}`} onToggle={() => toggle(m.id)} />
            </div>
            <div className="col-span-2 md:col-span-3">
              <Drawer id={`crew-m-${m.id}`} open={open === m.id} m={m} />
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden grid-cols-12 gap-x-xl lg:grid">
        <div className="sticky top-[calc(var(--masthead)+var(--spacing-lg))] col-span-4 self-start">
          <div className="u-develop relative aspect-square">
            {members.map((m) => (
              <div
                key={m.id}
                className={`absolute inset-0 ${hot === m.id ? "" : "invisible"}`}
              >
                <Print src={m.portrait} className="size-full" live={hot === m.id} />
              </div>
            ))}
          </div>
          <p aria-hidden="true" className="mt-sm text-body-sm text-ink">
            {pointed?.name}
            {pointed && (
              <span className="text-ink-muted">
                {" ("}
                {pointed.post ? (
                  pointed.post.en
                ) : pointed.duty ? (
                  pointed.duty.en
                ) : null}
                {")"}
              </span>
            )}
          </p>
          <ul aria-hidden="true" className="mt-lg grid grid-cols-5 gap-xs">
            {members.map((m) => (
              <li
                key={m.id}
                onPointerEnter={() => setHot(m.id)}
                className={`transition-opacity duration-200 motion-reduce:transition-none ${
                  hot === m.id ? "" : "opacity-45"
                }`}
              >
                <Print src={m.portrait} live={hot === m.id} sizes="6rem" />
              </li>
            ))}
          </ul>
        </div>

        <ul
          className="col-span-8 grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)_minmax(0,1.7fr)_auto] gap-x-lg border-b border-rule-strong"
          onFocus={(e) => {
            const id = (e.target as HTMLElement).closest<HTMLElement>("[data-crew]")?.dataset.crew;
            if (id) setHot(id);
          }}
        >
          {members.map((m) => {
            const on = hot === m.id;
            return (
              <li
                key={m.id}
                data-crew={m.id}
                onPointerEnter={() => setHot(m.id)}
                className={`u-scroll-fade col-span-full grid grid-cols-subgrid border-t transition-colors duration-200 motion-reduce:transition-none ${
                  on ? "border-ink" : "border-rule-strong"
                }`}
              >
                <div
                  onClick={(e) => rowClick(e, () => toggle(m.id))}
                  className="col-span-full grid min-h-16 cursor-pointer grid-cols-subgrid items-center py-sm"
                >
                <span className="u-trim text-display-md text-ink">{m.name}</span>
                <Meta m={m} className="u-trim text-body text-ink" />
                <span className="u-trim text-body text-ink-muted">
                  {m.department.en}
                </span>
                <span className="-mr-xs flex items-center justify-self-end">
                  <MemberLinks name={m.name} links={m.links} />
                  <Toggle m={m} open={open === m.id} controls={`crew-d-${m.id}`} onToggle={() => toggle(m.id)} />
                </span>
                </div>
                <Drawer id={`crew-d-${m.id}`} open={open === m.id} m={m} />
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
