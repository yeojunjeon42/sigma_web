"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ACCENT, HANDWRITING, INK, InkDefs } from "@/features/hand/HandLayer";
import { useMedia } from "@/lib/media";
import type { ClubEvent } from "../data/photos";
import { Pointer, Tape } from "./Deco";
import { REACH, place, seedOf, type Item, type Spot } from "./placement";

type Card = {
  key: string;
  src?: string;
  strip?: string[];
  ratio: number;
  event: ClubEvent;
};

type Note = { colour: string };

const yearOf = (event: ClubEvent) => Number(/\d{4}/.exec(event.when)?.[0]);

function cards(events: ClubEvent[]): Card[] {
  const out: Card[] = [];
  for (const e of events) {
    if (e.strip) {
      out.push({ key: e.id, strip: e.photos.map((p) => p.src), ratio: 2.7, event: e });
      continue;
    }
    e.photos.forEach((p, i) => out.push({ key: `${e.id}-${i}`, src: p.src, ratio: p.h / p.w, event: e }));
  }
  return out;
}

// One note for each season, on the first photograph of the event with the most photographs in it.
// The first note down the page is the one in red.
function notes(list: Card[]): Map<string, Note> {
  const seasons = new Map<string, Card>();
  for (const card of list) {
    const held = seasons.get(card.event.when);
    if (!held || card.event.photos.length > held.event.photos.length) seasons.set(card.event.when, card);
  }
  return new Map([...seasons.values()].map((card, i) => [card.key, { colour: i === 0 ? ACCENT : INK }]));
}

// One strip of tape across the top, or two on opposite corners, never both.
function Hold({ seed, spot }: { seed: number; spot: Spot }) {
  const turn = (seed % 9) - 4;
  if (spot.tape === "corners")
    return (
      <>
        <Tape width={spot.width * 0.26} seed={seed} turn={turn - 38} className="left-0 top-0 -translate-x-[38%] -translate-y-[38%]" />
        <Tape width={spot.width * 0.26} seed={seed + 1} turn={-turn - 38} className="bottom-0 right-0 translate-x-[38%] translate-y-[38%]" />
      </>
    );
  return <Tape width={spot.width * 0.32} seed={seed} turn={turn} className="left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" />;
}

function Print({ card }: { card: Card }) {
  if (card.strip)
    return (
      <div className="flex size-full flex-col gap-[4%] bg-canvas p-[9%] pb-[14%] ring-1 ring-rule">
        {card.strip.map((src) => (
          <div key={src} className="relative w-full flex-1 overflow-hidden bg-ink/80">
            <Image src={src} alt="" fill sizes="(min-width: 1024px) 12vw, 1px" className="object-cover" />
          </div>
        ))}
      </div>
    );
  return (
    <div className="size-full bg-canvas p-[3.5%] ring-1 ring-rule">
      <div className="relative size-full overflow-hidden bg-ink/80">
        <Image src={card.src!} alt="" fill sizes="(min-width: 1024px) 22vw, 1px" className="object-cover" />
      </div>
    </div>
  );
}

function Piece({ card, k, spot, note, shown, still }: { card: Card; k: number; spot: Spot; note?: Note; shown: boolean; still: boolean }) {
  const el = useRef<HTMLDivElement>(null);
  const seed = seedOf(card.key);
  const r = spot.tilt;
  const rest = `rotate(${r}deg)`;
  useEffect(() => {
    if (!shown || still || !el.current) return;
    el.current.animate(
      [
        { transform: `translate(4%, -14%) rotate(${r + 7}deg) scale(1.07)`, opacity: 0 },
        { transform: `translate(0, 1%) rotate(${r - 0.8}deg) scale(0.995)`, opacity: 1, offset: 0.75 },
        { transform: rest, opacity: 1 },
      ],
      { duration: 560, easing: "cubic-bezier(0.25, 0.8, 0.3, 1)" },
    );
  }, [shown, still, rest, r]);

  // The note stands on the open side of the photograph, with its arrow in the gap between them.
  const open = spot.open > 0 ? "left" : "right";
  const drop = Math.max(28, spot.height * 0.12);
  return (
    <div
      ref={el}
      data-sp={`print-${k}`}
      className="absolute origin-[50%_0%]"
      style={{ transform: rest, top: spot.top, left: spot.left, width: spot.width, height: spot.height, zIndex: 100 + k, opacity: shown || still ? 1 : 0 }}
    >
      <Print card={card} />
      <Hold seed={seed} spot={spot} />
      {note && (
        <>
          <Pointer
            from={spot.open > 0 ? [31, 17] : [3, 17]}
            to={spot.open > 0 ? [5, 9] : [29, 9]}
            seed={seed}
            colour={note.colour}
            style={{ [open]: "100%", top: drop }}
          />
          <p
            className={`absolute text-[1.5rem] leading-[1.05] ${HANDWRITING}`}
            style={{
              [open]: `calc(100% + ${REACH}px)`,
              top: drop,
              width: spot.note,
              color: note.colour,
              textAlign: spot.open > 0 ? "left" : "right",
              // The note is written level, whatever the photograph's tilt.
              transform: `rotate(${-r + 2 * spot.open}deg)`,
              transformOrigin: spot.open > 0 ? "0 0" : "100% 0",
            }}
          >
            {card.event.name}
            {/* A name that carries its year needs no season under it. */}
            {/\d{4}/.test(card.event.name) ? null : <span className="mt-1 block text-[1.125rem]">{card.event.when}</span>}
          </p>
        </>
      )}
    </div>
  );
}

export default function Collage({ events }: { events: ClubEvent[] }) {
  const column = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState<{ spots: Spot[]; height: number }>({ spots: [], height: 0 });
  const [seen, setSeen] = useState<Set<string>>(() => new Set());
  const still = useMedia("(prefers-reduced-motion: reduce)", false);
  const [list] = useState(() => cards(events));
  const [noted] = useState(() => notes(list));

  useEffect(() => {
    const col = column.current;
    const ledger = document.getElementById("ledger");
    if (!col || !ledger) return;
    const items: Item[] = list.map((c) => ({ key: c.key, ratio: c.ratio, strip: !!c.strip, year: yearOf(c.event), noted: noted.has(c.key) }));
    let key = "";
    const measure = () => {
      const cw = col.clientWidth;
      const H = ledger.offsetHeight;
      if (!cw || !H || !col.offsetParent) return;
      // Where each year starts in the list beside the column, so its photographs start there too.
      const top = ledger.getBoundingClientRect().top;
      const starts = new Map([...new Set(items.map((i) => i.year))].map((y) => [y, document.getElementById(`y${y}`)?.getBoundingClientRect().top]));
      const next = `${Math.round(cw)}x${Math.round(H)}:${[...starts.values()].map((v) => Math.round((v ?? top) - top)).join(",")}`;
      if (next === key) return;
      key = next;
      setPlaced(place(items, cw, H, (year) => (starts.get(year) === undefined ? undefined : starts.get(year)! - top)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(col);
    ro.observe(ledger);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [list, noted]);

  useEffect(() => {
    const col = column.current;
    if (!col || !placed.spots.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).map((e) => (e.target as HTMLElement).dataset.mark!);
        if (hit.length) setSeen((s) => (hit.every((k) => s.has(k)) ? s : new Set([...s, ...hit])));
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    col.querySelectorAll("[data-mark]").forEach((m) => io.observe(m));
    return () => io.disconnect();
  }, [placed]);

  // The column is as tall as its photographs need: beside the list where they fit, past it where
  // they do not.
  return (
    <div ref={column} aria-hidden="true" data-print className="relative h-full" style={{ minHeight: placed.height || undefined }}>
      <InkDefs />
      {placed.spots.map((spot, k) => {
        const card = list[k];
        return (
          <div key={card.key}>
            <span data-mark={card.key} className="absolute left-0 h-px w-px" style={{ top: spot.top + spot.height * 0.3 }} />
            <Piece card={card} k={k} spot={spot} note={noted.get(card.key)} shown={seen.has(card.key)} still={still} />
          </div>
        );
      })}
    </div>
  );
}
