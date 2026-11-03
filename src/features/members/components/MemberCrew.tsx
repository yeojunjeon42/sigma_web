"use client";

import { pageY } from "@/lib/pageScroll";
import { spring, type Sprung } from "@/lib/spring";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Bilingual } from "@/features/site/data/about";
import { FACES, type Face } from "../data/faces";
import { Fact } from "@/features/archive/components/EntryBody";
import type { MemberLinks as Links } from "../data/roster";
import MemberLinks from "./MemberLinks";
import { DOT, SCREEN, relief, square, turnAt } from "@/lib/halftone";

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

// A cropped head fills this share of the tile's height, with this share clear above it.
const HEAD = 0.52;
const HEADROOM = 0.09;

const IN = 700;
const OUT = 400;
const FACE_RELIEF = 0.3;

type Sheet = {
  bmp: HTMLImageElement;
  tone: Float32Array;
  spin: Float32Array;
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
  face,
  still = false,
}: {
  src: string | null;
  className?: string;
  live?: boolean;
  lazy?: boolean;
  portrait?: boolean;
  sizes?: string;
  face?: Face;
  // Shows the plain picture from the start, with no print and no dissolve.
  still?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const st = useRef({ t: 0, goal: 0, last: 0, raf: 0, paint: (() => false) as () => boolean, run: () => {} });

  useEffect(() => {
    const box = ref.current;
    const canvas = box?.querySelector("canvas");
    const img = box?.querySelector("img");
    if (!box || !canvas || !img) return;
    const s = st.current;
    const bmp = new window.Image();
    let sheet: Sheet | null = null;
    let frame = 0;

    const measure = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h || !img.complete || !img.currentSrc) return null;
      if (bmp.src !== img.currentSrc) bmp.src = img.currentSrc;
      if (!bmp.complete || !bmp.naturalWidth) {
        bmp.addEventListener("load", redraw, { once: true });
        return null;
      }
      const cell = Math.max(3.5, Math.min(SCREEN, w / 28));
      const cols = Math.ceil(w / cell);
      const rows = Math.ceil(h / cell);
      const nw = bmp.naturalWidth;
      const nh = bmp.naturalHeight;
      const cover = Math.min(nw / w, nh / h);
      const k = face ? Math.min(cover, ((face.chin - face.top) * nh) / (HEAD * h)) : cover;
      const crop: [number, number, number] = face
        ? [
            Math.min(Math.max(face.x * nw - (w * k) / 2, 0), nw - w * k),
            Math.min(Math.max(face.top * nh - HEADROOM * h * k, 0), nh - h * k),
            k,
          ]
        : [(nw - w * k) / 2, (nh - h * k) * 0.2, k];
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
      for (let i = 0; i < tone.length; i++) tone[i] = Math.min(1, Math.max(0, (tone[i] - lo) / (hi - lo)));
      relief(tone, cols, rows, undefined, FACE_RELIEF);
      for (let i = 0; i < tone.length; i++) tone[i] = 0.12 + 0.88 * tone[i];
      // One turn field across the page, so a wall of portraits doesn't repeat one pattern.
      const at = canvas.getBoundingClientRect();
      const spin = new Float32Array(cols * rows);
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) spin[y * cols + x] = turnAt(at.left + window.scrollX + (x + 0.5) * cell, at.top + pageY() + (y + 0.5) * cell);
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      return { bmp, tone, spin, cols, rows, cell, w, h, crop, dots: null };
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
      bmp.removeEventListener("load", redraw);
      img.removeEventListener("load", ready);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(s.raf);
      s.raf = 0;
    };
  }, [src, face]);

  useEffect(() => {
    const s = st.current;
    s.goal = live ? 1 : 0;
    if (still || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
  }, [live, still]);

  return (
    // Keep print corners square to preserve the halftone dots.
    <div ref={ref} aria-hidden="true" data-print className={`relative ${portrait ? "aspect-[4/5]" : "aspect-square"} overflow-hidden ${className}`}>
      {src ? (
        <>
          <Image src={src} alt="" fill sizes={sizes} loading={lazy ? "lazy" : "eager"} className="object-cover opacity-0" />
          <canvas className="absolute inset-0 size-full" />
        </>
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-surface-sunken max-lg:bg-canvas">
          <Image src="/logo-mark.svg" alt="" width={253} height={274} className="h-auto w-[28%] max-w-9 opacity-35" />
        </div>
      )}
    </div>
  );
}

function press(g: CanvasRenderingContext2D, { tone, spin, cols, rows, cell, w, h }: Sheet) {
  const css = getComputedStyle(document.documentElement);
  g.fillStyle = css.getPropertyValue("--color-canvas").trim() || "#dfe1dc";
  g.fillRect(0, 0, w, h);
  g.fillStyle = css.getPropertyValue("--color-ink").trim() || "#0f110d";
  g.beginPath();
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const r = (1 - tone[y * cols + x]) * cell * DOT;
      if (r < 0.3) continue;
      square(g, x * cell + cell / 2, y * cell + cell / 2, r, spin[y * cols + x]);
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

// A paper tile's edge, drawn over it so a tile with a frame and one without stay the same size.
const FRAME = "relative after:pointer-events-none after:absolute after:inset-0 after:border after:border-rule";

function Card({ m, onSelect }: { m: CrewMember; onSelect: (member: CrewMember) => void }) {
  return (
    <li className={`min-w-0 ${m.portrait ? "" : FRAME}`}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={`${m.name}, view profile`}
        onClick={(e) => {
          // Safari doesn't focus a tapped button, and the dialog hands focus back to whatever had it.
          e.currentTarget.focus({ preventScroll: true });
          onSelect(m);
        }}
        className="block w-full transition-opacity duration-200 [-webkit-tap-highlight-color:transparent] active:opacity-70 active:duration-0 motion-reduce:transition-none"
      >
        <Print src={m.portrait} live still lazy portrait sizes="(min-width: 768px) 32vw, 50vw" face={FACES[m.id]} />
      </button>
    </li>
  );
}

// Closes the group's last row: pale and blank, so it never reads as a person.
function Spare({ members, cols, className }: { members: number; cols: number; className: string }) {
  return Array.from({ length: (cols - (members % cols)) % cols }, (_, i) => (
    <li key={i} aria-hidden="true" className={`${FRAME} ${className}`} />
  ));
}

function MemberProfile({ member: m, onClose }: { member: CrewMember; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const motion = useRef<{ animation: Animation; path: Sprung | null } | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    const sheet = dialog?.querySelector<HTMLElement>("[data-profile-sheet]");
    if (!dialog || !sheet) return;
    dialog.showModal();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const theme = getComputedStyle(dialog);
    const chrome = Number.parseFloat(theme.getPropertyValue("--duration-chrome"));
    const easing = theme.getPropertyValue("--ease-magnify").trim();
    const path = reduced ? null : spring(100, 0, 0, 0.5, 1);
    const entrance = sheet.animate(
      path ? path.values.map((y) => ({ transform: `translateY(${y}%)` })) : { opacity: [0, 1] },
      {
        duration: path?.duration ?? chrome,
        easing: path ? "linear" : easing,
        fill: "both",
      },
    );
    motion.current = { animation: entrance, path };
    const desktop = window.matchMedia("(min-width: 64rem)");
    const resize = () => { if (desktop.matches) dialog.close(); };
    desktop.addEventListener("change", resize);
    return () => {
      desktop.removeEventListener("change", resize);
      motion.current?.animation.cancel();
      motion.current = null;
      dialog.close();
    };
  }, []);

  const korean = !!m.bio && HANGUL.test(m.bio);
  const hasLinks = m.links && Object.values(m.links).some(Boolean);

  const leave = () => {
    const dialog = ref.current;
    const sheet = dialog?.querySelector<HTMLElement>("[data-profile-sheet]");
    const current = motion.current;
    if (!dialog || !sheet || !current || dialog.hasAttribute("data-closing")) return;
    dialog.toggleAttribute("data-closing", true);
    const { animation, path } = current;
    if (path) {
      // Retarget from the current position and speed, including a close during entry.
      const frame = Math.min(path.values.length - 1, Math.max(0, Number(animation.currentTime) / path.duration * (path.values.length - 1)));
      const index = Math.min(Math.floor(frame), path.values.length - 2);
      const step = path.values[index + 1] - path.values[index];
      const transform = getComputedStyle(sheet).transform;
      const from = transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m42 / sheet.getBoundingClientRect().height * 100;
      const velocity = animation.playState === "finished" ? 0 : step / (path.duration / (path.values.length - 1) / 1000);
      const exit = spring(from, 100, velocity, 0.4, 1);
      const leaving = sheet.animate(exit.values.map((y) => ({ transform: `translateY(${y}%)` })), {
        duration: exit.duration,
        easing: "linear",
        fill: "both",
      });
      animation.cancel();
      motion.current = { animation: leaving, path: exit };
      leaving.onfinish = () => dialog.close();
      return;
    }
    // Close while still mounted so the browser restores focus to the selected portrait.
    animation.onfinish = () => dialog.close();
    animation.reverse();
    const duration = animation.effect?.getTiming().duration;
    if (typeof duration === "number") {
      const exit = Number.parseFloat(getComputedStyle(dialog).getPropertyValue("--duration-chrome"));
      animation.updatePlaybackRate(-duration / exit);
    }
  };

  return (
    <dialog
      ref={ref}
      data-overlay
      aria-labelledby={`profile-${m.id}`}
      onCancel={(e) => {
        e.preventDefault();
        leave();
      }}
      onClose={(e) => { if (!e.currentTarget.open) onClose(); }}
      onClick={(e) => {
        // The content fills the dialog, so only the backdrop lands on the dialog itself.
        if (e.target === e.currentTarget) leave();
      }}
      className="member-profile mx-auto mt-auto mb-0 max-h-[calc(100dvh_-_var(--gutter))] w-full max-w-none overflow-clip rounded-t-[1.5rem] bg-transparent text-ink backdrop:bg-black/50 [corner-shape:squircle] md:max-w-[32rem] md:rounded-t-[2.5rem]"
    >
      <div data-profile-sheet className="flex max-h-[inherit] flex-col rounded-[inherit] bg-canvas pt-md [corner-shape:inherit]">
        <article data-profile-paper className="min-h-0 overflow-y-auto overscroll-contain px-gutter">
          <div className="flex flex-col gap-y-sm">
            <header className="flex min-w-0 flex-col gap-y-sm [overflow-wrap:anywhere]">
              <h2 data-profile-part id={`profile-${m.id}`} className="font-member-name text-body">{m.name}</h2>
              <dl data-profile-part="details" className="flex min-w-0 flex-wrap gap-x-gutter gap-y-sm [&_dd]:text-body [&_dt]:sr-only">
                {m.group === "alumni" ? (
                  <Fact label="Year"><span className="tabular-nums">{m.year}</span></Fact>
                ) : m.post || m.duty ? (
                  <Fact label="Role"><Meta m={m} /></Fact>
                ) : null}
                <Fact label={m.group === "alumni" ? "Field" : "Department"} className="[&_dd]:text-ink-muted">{m.department.en}</Fact>
              </dl>
            </header>
            {m.bio && <p data-profile-part="bio" lang={korean ? "ko" : "en"} className="max-w-[60ch] text-body [overflow-wrap:anywhere]">{m.bio}</p>}
          </div>
        </article>
        <div data-profile-actions data-profile-part="actions" className={`flex shrink-0 items-end gap-x-md px-gutter pt-[calc(var(--spacing-sm)_-_(2.75rem_-_1lh)/2)] pb-[calc(var(--spacing-xs)+env(safe-area-inset-bottom))] ${hasLinks ? "justify-between" : "justify-end"}`}>
          {hasLinks && <MemberLinks name={m.name} links={m.links} variant="text" className="-ml-xs flex-wrap" />}
          <button
            type="button"
            onClick={leave}
            className="-mr-xs min-h-11 min-w-11 shrink-0 px-xs text-body text-ink transition-opacity duration-200 hover:opacity-70 active:opacity-70 active:duration-0 focus-visible:underline focus-visible:underline-offset-4 motion-reduce:transition-none"
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
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
      className={`pointer-events-none absolute inset-0 col-start-3 col-end-[-2] row-end-2 flex xl:col-start-2 items-center overflow-hidden font-serif text-[0.9375rem] leading-[21px] text-ink transition-[opacity,visibility] duration-200 motion-reduce:transition-none data-[over]:[mask-image:linear-gradient(90deg,transparent,#000_0.35em,#000_calc(100%-2em),transparent)] ${
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
  const [selected, setSelected] = useState<CrewMember | null>(null);
  const groups = GROUPS.map((g) => ({ ...g, members: members.filter((m) => m.group === g.key) })).filter(
    (g) => g.members.length > 0,
  );
  const order = groups.flatMap((g) => g.members);

  return (
    <>
      <div className="lg:hidden">
        {groups.map((g, i) => (
          <section key={g.key} aria-labelledby={`crew-m-${g.key}`} className={`pb-xl ${i === 0 ? "pt-sm" : ""}`}>
            <GroupHead id={`crew-m-${g.key}`} label={g.label} count={g.members.length} />
            <ul data-offgrid className="grid grid-cols-4 gap-xs md:grid-cols-6">
              {g.members.map((m) => (
                <Card key={m.id} m={m} onSelect={setSelected} />
              ))}
              <Spare members={g.members.length} cols={4} className="md:hidden" />
              <Spare members={g.members.length} cols={6} className="hidden md:block" />
            </ul>
          </section>
        ))}
      </div>

      {selected && <MemberProfile member={selected} onClose={() => setSelected(null)} />}

      <div className="hidden grid-cols-12 gap-x-gutter pt-sm lg:grid" onPointerLeave={() => setHot(null)}>
        <div
          className="col-span-6 grid grid-cols-subgrid content-start xl:col-span-7"
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
                    className={`relative col-span-full grid grid-cols-subgrid items-start border-b border-rule py-1.5 text-body-sm transition-colors duration-200 motion-reduce:transition-none [&>*]:row-start-1 ${
                      hot && hot !== m.id ? "text-ink-muted" : "text-ink"
                    }`}
                  >
                    <span className="col-span-2 col-start-1 font-member-name whitespace-nowrap xl:col-span-1">{m.name}</span>
                    <Meta m={m} className={`col-span-3 col-start-3 xl:col-span-2 xl:col-start-2 ${away}`} />
                    <span className={`col-span-4 col-start-4 hidden text-ink-muted xl:block ${away}`}>{m.department.en}</span>
                    {/* Centre 32px hit areas on the 21px text line. */}
                    <MemberLinks name={m.name} links={m.links} dense className="col-start-6 -my-[5.5px] -mr-xxs justify-self-end xl:col-start-7" />
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
          {/* One object on the sheet: its outer edges are on columns, its gaps are the wall's own. */}
          <ul data-offgrid className="grid grid-cols-5 gap-xs">
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
