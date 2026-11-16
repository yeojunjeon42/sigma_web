"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type Card = { src: string; alt: string; width: number; height: number };

const STEP =
  "inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-end text-body leading-none text-ink transition-opacity hover:opacity-60 disabled:cursor-default disabled:opacity-30 lg:min-h-0 lg:min-w-0";

// A post's cards as one sideways reel (`.card-reel` in globals.css sets the sizes). Every card
// has the same height and its own width, so mixed shapes sit side by side with even gaps and
// nothing is cropped. The scroller is native and snaps; the counter reads which card lies on the
// column's left line.
export default function CardReel({ cards, column }: { cards: Card[]; column: string }) {
  const track = useRef<HTMLUListElement>(null);
  const [at, setAt] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let io: IntersectionObserver | null = null;
    // Several cards show at once, so watch a thin strip just inside the column line instead of
    // the whole reel: the card lying across it is the current one.
    const watch = () => {
      io?.disconnect();
      const lead = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) if (e.isIntersecting) setAt(Number((e.target as HTMLElement).dataset.i));
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

  const go = (i: number) => {
    const el = track.current;
    const first = el?.children[0] as HTMLElement | undefined;
    const to = el?.children[i] as HTMLElement | undefined;
    if (!el || !first || !to) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Sideways only: scrollIntoView would also pull the page up or down to fit the card.
    el.scrollTo({ left: to.offsetLeft - first.offsetLeft, behavior: still ? "auto" : "smooth" });
  };

  return (
    <>
      <div data-reel className="card-reel col-span-full -mx-[var(--gutter)] mt-xxl md:mt-16">
        <ul ref={track} tabIndex={0} aria-label="Cards" className="u-scroll-x outline-none">
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
                draggable={false}
                className="u-corner block h-full w-full"
              />
            </li>
          ))}
        </ul>
      </div>
      <div className={`mt-md items-center justify-between ${cards.length > 1 ? "flex" : "hidden"} ${column}`}>
        <p aria-live="polite" className="text-caption leading-none tracking-normal text-ink-muted tabular-nums">
          <span className="text-ink">{at + 1}</span> / {cards.length}
        </p>
        <p className="hidden lg:gap-x-lg [@media(pointer:fine)]:flex">
          <button type="button" aria-label="Previous card" disabled={at === 0} onClick={() => go(at - 1)} className={STEP}>
            ←
          </button>
          <button
            type="button"
            aria-label="Next card"
            disabled={at === cards.length - 1}
            onClick={() => go(at + 1)}
            className={STEP}
          >
            →
          </button>
        </p>
      </div>
    </>
  );
}
