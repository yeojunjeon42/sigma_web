"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ACCENT, HANDWRITING, INK, InkDefs } from "@/features/hand/HandLayer";
import { useMedia } from "@/lib/media";
import type { ClubEvent } from "../data/photos";
import { Pointer, Tape } from "./Deco";

type Card = {
  key: string;
  src?: string;
  strip?: string[];
  ratio: number;
  event: ClubEvent;
  first: boolean;
  nth: number;
};

type Slot = { top: number; left: number; width: number; height: number };
type Note = { colour: string };

const TUCK = 0.08;
// The steepest a photograph lies on the page, in degrees either way.
const TILT = 4;
// The gap a note keeps from its photograph: room for the arrow between them.
const REACH = 34;

// A photograph's own seed, from its key: its tilt, its tape and its arrow stay the same however
// the column is laid out around it.
function seedOf(key: string) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return h >>> 0;
}
const pick = (seed: number, k: number) => (Math.imul(seed ^ (k * 0x9e3779b1), 2654435761) >>> 0) % 97;

function cards(events: ClubEvent[]): Card[] {
  const out: Card[] = [];
  for (const e of events) {
    if (e.strip) {
      out.push({ key: e.id, strip: e.photos.map((p) => p.src), ratio: 2.7, event: e, first: true, nth: 0 });
      continue;
    }
    e.photos.forEach((p, i) =>
      out.push({ key: `${e.id}-${i}`, src: p.src, ratio: p.h / p.w, event: e, first: i === 0, nth: i }),
    );
  }
  return out;
}

// One strip of tape across the top, or two on opposite corners. A strip of photographs is held at
// both ends.
function Hold({ seed, card, width }: { seed: number; card: Card; width: number }) {
  const turn = (pick(seed, 2) % 9) - 4;
  if (card.strip)
    return (
      <>
        <Tape width={width * 0.74} seed={seed} turn={turn} className="left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" />
        <Tape width={width * 0.74} seed={seed + 1} turn={-turn} className="bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2" />
      </>
    );
  if (pick(seed, 3) % 2)
    return (
      <>
        <Tape width={width * 0.3} seed={seed} turn={turn - 38} className="left-0 top-0 -translate-x-[40%] -translate-y-[40%]" />
        <Tape width={width * 0.3} seed={seed + 1} turn={-turn - 38} className="bottom-0 right-0 translate-x-[40%] translate-y-[40%]" />
      </>
    );
  return <Tape width={width * 0.34} seed={seed} turn={turn} className="left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" />;
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

function Piece({ card, k, slot, side, room, note, shown, still }: { card: Card; k: number; slot: Slot; side: number; room: number; note?: Note; shown: boolean; still: boolean }) {
  const el = useRef<HTMLDivElement>(null);
  const seed = seedOf(card.key);
  const r = side * (1 + ((pick(seed, 4) % 31) / 30) * (TILT - 1));
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

  // The note stands on the open side of the photograph, with its arrow in the gap between them,
  // and starts below the strip where the photograph above tucks over this one.
  const open = side < 0 ? "left" : "right";
  const drop = Math.max(28, slot.height * 0.12);
  return (
    <div
      ref={el}
      data-sp={`print-${k}`}
      className="absolute origin-[50%_0%]"
      style={{ transform: rest, top: slot.top, left: slot.left, width: slot.width, height: slot.height, zIndex: 100 + k, opacity: shown || still ? 1 : 0 }}
    >
      <div className="size-full shadow-[0_22px_34px_-20px_rgb(0_0_0/0.45),0_2px_5px_rgb(0_0_0/0.12)]">
        <Print card={card} />
      </div>
      <Hold seed={seed} card={card} width={slot.width} />
      {note && (
        <>
          <Pointer
            from={side < 0 ? [31, 17] : [3, 17]}
            to={side < 0 ? [5, 9] : [29, 9]}
            seed={seed}
            colour={note.colour}
            style={{ [open]: "100%", top: drop }}
          />
          <p
            className={`absolute text-[1.5rem] leading-[1.05] ${HANDWRITING}`}
            style={{
              [open]: `calc(100% + ${REACH}px)`,
              top: drop,
              width: Math.min(152, room - REACH),
              color: note.colour,
              textAlign: side < 0 ? "left" : "right",
              transform: `rotate(${-r - 3 * side}deg)`,
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

type Placed = { card: Card; slot: Slot; side: number; lone: boolean; room: number };

// One note for each season, on the event with the most photographs in it: the first photograph of
// that event with open page beside it. The topmost note is the one in red.
function notes(placed: Placed[]): Map<string, Note> {
  const seasons = new Map<string, Placed[]>();
  for (const p of placed) if (p.lone) seasons.set(p.card.event.when, [...(seasons.get(p.card.event.when) ?? []), p]);
  const chosen = [...seasons.values()].map((free) => {
    const most = Math.max(...free.map((p) => p.card.event.photos.length));
    return free.find((p) => p.card.event.photos.length === most)!;
  });
  const top = Math.min(...chosen.map((p) => p.slot.top));
  return new Map(chosen.map((p) => [p.card.key, { colour: p.slot.top === top ? ACCENT : INK }]));
}
type Unit = { kind: "single" | "pair" | "strip"; cards: Card[] };

const PAD = 40;
const SMIN = 0.72;

const baseWidth = (c: Card) => (c.strip ? 0.34 : c.ratio > 1.1 ? 0.48 : c.ratio < 0.5 ? 0.66 : 0.58);

function stripOf(cards: Card[]): Card {
  const first = cards[0];
  return {
    key: cards.map((c) => c.key).join("+"),
    strip: cards.map((c) => c.src!),
    ratio: cards.length === 3 ? 2.7 : 1.9,
    event: first.event,
    first: first.first,
    nth: first.nth,
  };
}

function unitsFor(list: Card[], level: number): Unit[] {
  let units: Unit[] = list.map((c) => ({ kind: "single", cards: [c] }));
  let left = level;
  const stripLevel = Math.max(0, level - 100);
  if (stripLevel > 0) {
    left = list.length;
    const out: Unit[] = [];
    let budget = stripLevel;
    for (let i = 0; i < units.length; i++) {
      const run = units.slice(i, i + 3);
      const same = run.length === 3 && run.every((u) => !u.cards[0].strip && u.cards[0].event === run[0].cards[0].event);
      if (budget > 0 && same) {
        out.push({ kind: "strip", cards: [stripOf(run.map((u) => u.cards[0]))] });
        budget--;
        i += 2;
      } else out.push(units[i]);
    }
    units = out;
  }
  const out: Unit[] = [];
  for (let i = 0; i < units.length; i++) {
    const a = units[i];
    const b = units[i + 1];
    if (left > 0 && b && a.kind === "single" && b.kind === "single" && !a.cards[0].strip && !b.cards[0].strip && a.cards[0].event === b.cards[0].event) {
      out.push({ kind: "pair", cards: [a.cards[0], b.cards[0]] });
      left--;
      i++;
    } else out.push(a);
  }
  return out;
}

function unitSize(u: Unit, cw: number, s: number) {
  if (u.kind === "pair") {
    const [a, b] = u.cards;
    const wa = cw * 0.54 * s;
    const wb = cw * 0.36 * s;
    const ha = wa * a.ratio;
    const hb = wb * b.ratio;
    return { h: Math.max(ha, ha * 0.22 + hb), parts: [{ w: wa, h: ha, dy: 0 }, { w: wb, h: hb, dy: ha * 0.22 }] };
  }
  const c = u.cards[0];
  const w = cw * baseWidth(c) * s;
  return { h: w * c.ratio, parts: [{ w, h: w * c.ratio, dy: 0 }] };
}

function layout(list: Card[], cw: number, H: number): Placed[] {
  const pairsMax = Math.floor(list.length / 2);
  const levels: number[] = [];
  for (let l = 0; l <= pairsMax; l++) levels.push(l);
  for (let l = 1; l <= Math.ceil(list.length / 3); l++) levels.push(100 + l);
  let best = { units: [] as Unit[], s: 0 };
  for (const level of levels) {
    const units = unitsFor(list, level);
    const hs = units.map((u) => unitSize(u, cw, 1).h);
    const t1 = hs.slice(0, -1).reduce((x, h) => x + h * (1 - TUCK), 0) + hs[hs.length - 1];
    const s = Math.min(1, (H - PAD) / t1);
    if (s > best.s) best = { units, s };
    if (s >= SMIN) break;
  }
  const { units, s } = best;
  const sizes = units.map((u) => unitSize(u, cw, s));
  const n = units.length;
  const used = sizes.slice(0, -1).reduce((x, z) => x + z.h * (1 - TUCK), 0) + sizes[n - 1].h;
  const extra = n > 1 ? Math.max(0, H - PAD - used) / (n - 1) : 0;
  const out: Placed[] = [];
  const edge = cw * 0.03;
  let top = PAD;
  let prev = 0;
  units.forEach((u, k) => {
    if (k > 0) top += prev * (1 - TUCK) + extra;
    const side = k % 2 === 0 ? -1 : 1;
    const { parts } = sizes[k];
    u.cards.forEach((card, j) => {
      const p = parts[j];
      const onLeft = j === 0 ? side < 0 : side > 0;
      out.push({ card, lone: u.kind !== "pair", side: onLeft ? -1 : 1, room: cw - p.w - 2 * edge, slot: { top: top + p.dy, left: onLeft ? edge : cw - p.w - edge, width: p.w, height: p.h } });
    });
    prev = sizes[k].h;
  });
  return out;
}

export default function Collage({ events }: { events: ClubEvent[] }) {
  const column = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [seen, setSeen] = useState<Set<string>>(() => new Set());
  const still = useMedia("(prefers-reduced-motion: reduce)", false);
  const [list] = useState(() => cards(events));

  useEffect(() => {
    const col = column.current;
    const ledger = document.getElementById("ledger");
    if (!col || !ledger) return;
    let key = "";
    const measure = () => {
      const cw = col.clientWidth;
      const H = ledger.offsetHeight;
      if (!cw || !H || !col.offsetParent) return;
      const next = `${Math.round(cw)}x${Math.round(H)}`;
      if (next === key) return;
      key = next;
      setPlaced(layout(list, cw, H));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(col);
    ro.observe(ledger);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [list]);

  useEffect(() => {
    const col = column.current;
    if (!col || !placed.length) return;
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

  const noted = notes(placed);

  return (
    <div ref={column} aria-hidden="true" data-print className="relative h-full">
      <InkDefs />
      {placed.map(({ card, slot, side, room }, k) => (
        <div key={card.key}>
          <span data-mark={card.key} className="absolute left-0 h-px w-px" style={{ top: slot.top + slot.height * 0.3 }} />
          <Piece card={card} k={k} slot={slot} side={side} room={room} note={noted.get(card.key)} shown={seen.has(card.key)} still={still} />
        </div>
      ))}
    </div>
  );
}
