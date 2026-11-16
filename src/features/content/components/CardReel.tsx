"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type Card = { src: string; alt: string; width: number; height: number };

const STEP =
  "inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-end text-body leading-none text-ink transition-opacity hover:opacity-60 aria-disabled:cursor-default aria-disabled:opacity-30 lg:min-h-0 lg:min-w-0";

export default function CardReel({ cards, column }: { cards: Card[]; column: string }) {
  const track = useRef<HTMLUListElement>(null);
  const [at, setAt] = useState(0);
  const aim = useRef<number | null>(null);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let io: IntersectionObserver | null = null;
    const watch = () => {
      io?.disconnect();
      const lead = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            const i = Number((e.target as HTMLElement).dataset.i);
            if (i === aim.current) aim.current = null;
            setAt(i);
          }
        },
        { root: el, rootMargin: `0px ${-(el.clientWidth - lead - 4)}px 0px ${-(lead + 2)}px` },
      );
      for (const li of el.children) io.observe(li);
    };
    watch();
    const ro = new ResizeObserver(watch);
    ro.observe(el);
    return () => {
      io?.disconnect();
      ro.disconnect();
    };
  }, [cards.length]);

  const go = (step: number) => {
    const el = track.current;
    const i = Math.min(cards.length - 1, Math.max(0, (aim.current ?? at) + step));
    const first = el?.children[0] as HTMLElement | undefined;
    const to = el?.children[i] as HTMLElement | undefined;
    if (!el || !first || !to) return;
    aim.current = i;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Sideways only: scrollIntoView would also pull the page up or down to fit the card.
    el.scrollTo({ left: to.offsetLeft - first.offsetLeft, behavior: still ? "auto" : "smooth" });
  };
  const taken = () => {
    aim.current = null;
  };

  return (
    <>
      <div data-reel className="card-reel col-span-full -mx-[var(--gutter)] mt-xxl md:mt-16">
        <ul ref={track} tabIndex={0} aria-label="Cards" onPointerDown={taken} onWheel={taken} className="u-scroll-x outline-none">
          {cards.map((card, i) => (
            <li key={card.src} data-i={i} style={{ "--own": card.width / card.height } as React.CSSProperties}>
              <Image
                src={card.src}
                alt={card.alt}
                width={card.width}
                height={card.height}
                // Served as the file: image optimisation is metered, and a post is many cards.
                unoptimized
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : undefined}
                draggable={false}
                className="u-corner block h-full w-full"
              />
            </li>
          ))}
        </ul>
      </div>
      <div className={`mt-md items-center justify-between ${cards.length > 1 ? "flex" : "hidden"} ${column}`}>
        <p aria-live="polite" aria-atomic="true" className="text-caption leading-none tracking-normal text-ink-muted tabular-nums">
          <span className="sr-only">Card </span>
          <span className="text-ink">{at + 1}</span> / {cards.length}
        </p>
        <p className="hidden lg:gap-x-lg [@media(pointer:fine)]:flex">
          {/* Not `disabled`: at either end that would drop the keyboard's focus. */}
          <button type="button" aria-label="Previous card" aria-disabled={at === 0} onClick={() => go(-1)} className={STEP}>
            ←
          </button>
          <button
            type="button"
            aria-label="Next card"
            aria-disabled={at === cards.length - 1}
            onClick={() => go(1)}
            className={STEP}
          >
            →
          </button>
        </p>
      </div>
    </>
  );
}
