"use client";

import { useEffect, useRef, useState } from "react";
import type { Bilingual } from "@/features/site/data/about";
import { Print, useInView } from "./MemberCrew";

export interface Alumnus {
  id: string;
  name: string;
  field: Bilingual;
  gen: string;
  year: number;
  portrait: string | null;
}

export default function AlumniPlates({ alumni }: { alumni: Alumnus[] }) {
  const track = useRef<HTMLOListElement>(null);
  const [at, setAt] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    const read = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setAt(nearest(el));
      });
    };
    el.addEventListener("scroll", read, { passive: true });

    let drag: { x: number; left: number; moved: boolean } | null = null;
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag = { x: e.clientX, left: el.scrollLeft, moved: false };
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 4) {
        drag.moved = true;
        el.style.scrollSnapType = "none";
        el.style.cursor = "grabbing";
      }
      if (drag.moved) el.scrollLeft = drag.left - dx;
    };
    const up = () => {
      if (!drag) return;
      const moved = drag.moved;
      drag = null;
      el.style.cursor = "";
      if (!moved) return;
      const left = el.scrollLeft;
      el.style.scrollSnapType = "";
      el.scrollLeft = left;
      slide(el, nearest(el));
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", read);
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  const go = (i: number) => {
    if (track.current) slide(track.current, i);
  };

  return (
    <div>
      <ol
        ref={track}
        aria-label="Alumni"
        className="u-scroll-fade u-scroll-x flex snap-x snap-mandatory gap-md overflow-x-auto overscroll-x-contain after:w-[calc(18%-var(--spacing-md))] after:shrink-0 after:content-[''] md:after:w-[calc(54%-var(--spacing-md))] lg:cursor-grab lg:gap-xl lg:after:w-[calc(100%-(100%-2*var(--spacing-xl))/2.6-var(--spacing-xl))]"
      >
        {alumni.map((a) => (
          <li
            key={a.id}
            className="w-[82%] shrink-0 snap-start md:w-[46%] lg:w-[calc((100%-2*var(--spacing-xl))/2.6)]"
          >
            <figure>
              <LivePrint src={a.portrait} />
              <figcaption className="border-t border-ink pt-sm">
                <div className="flex items-baseline justify-between gap-md text-caption text-ink-muted">
                  <span>
                    {a.gen}
                  </span>
                  <span className="tabular-nums">{a.year}</span>
                </div>
                <p className="mt-md text-display-lg text-ink">{a.name}</p>
                <p className="mt-sm text-body text-ink-muted">
                  {a.field.en}
                </p>
              </figcaption>
            </figure>
          </li>
        ))}
      </ol>

      <div role="group" aria-label="Alumni by year" className="mt-xl flex border-t border-rule-strong">
        {alumni.map((a, i) => (
          <button
            key={a.id}
            type="button"
            aria-current={at === i ? "true" : undefined}
            aria-label={`${a.name}, ${a.year}`}
            onClick={() => go(i)}
            className={`relative flex min-h-11 flex-1 cursor-pointer items-end pt-sm text-left font-mono text-[12px] tabular-nums transition-colors duration-200 before:absolute before:inset-x-0 before:-top-px before:h-0.5 before:transition-colors motion-reduce:transition-none focus:outline-none ${
              at === i ? "text-ink before:bg-ink" : "text-ink-muted before:bg-transparent hover:text-ink"
            }`}
          >
            {a.year}
          </button>
        ))}
      </div>
    </div>
  );
}

function offset(el: HTMLElement, i: number): number {
  const kid = el.children[i] as HTMLElement | undefined;
  if (!kid) return el.scrollLeft;
  return kid.getBoundingClientRect().left - el.getBoundingClientRect().left + el.scrollLeft;
}

function slide(el: HTMLElement, i: number) {
  const max = el.scrollWidth - el.clientWidth;
  el.scrollTo({ left: Math.min(max, offset(el, i)), behavior: smooth() });
}

function nearest(el: HTMLElement): number {
  let best = 0;
  let gap = Infinity;
  for (let i = 0; i < el.children.length; i++) {
    if (el.children[i].tagName !== "LI") continue;
    const d = Math.abs(offset(el, i) - el.scrollLeft);
    if (d < gap) {
      gap = d;
      best = i;
    }
  }
  return best;
}

function smooth(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

function LivePrint({ src }: { src: string | null }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <div ref={ref}>
      <Print src={src} className="w-full select-none" live={seen} sizes="(min-width: 1024px) 34vw, 80vw" />
    </div>
  );
}
