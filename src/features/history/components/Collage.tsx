"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMedia } from "@/lib/media";
import type { ClubEvent } from "../data/photos";
import { BinderClip, PaperClip, Pin, Stamp, Sticker, Tape, TornNote, type TapeKind } from "./Deco";

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

const TUCK = 0.08;
const HOLD = ["tape", "binder", "pin", "tapes", "paperclip", "tape", "pin", "tapes"] as const;
const TAPES: TapeKind[] = ["paper", "stripe", "dots", "accent", "grid"];

const pick = (n: number, k: number) => ((n * (37 + k * 16) + 11) >>> 0) % 97;

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

function Hold({ k, card }: { k: number; card: Card }) {
  const kind = HOLD[k % HOLD.length];
  const tape = TAPES[pick(k, 1) % TAPES.length];
  const turn = (pick(k, 2) % 9) - 4;
  if (card.strip)
    return (
      <>
        <Tape kind={tape} width="74%" turn={turn} className="left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" />
        <Tape kind="paper" width="74%" turn={-turn} className="bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2" />
      </>
    );
  if (kind === "binder") return <BinderClip className="left-1/2 top-0 -translate-x-1/2 -translate-y-[62%]" />;
  if (kind === "pin") return <Pin className="left-1/2 top-[3%] -translate-x-1/2 -translate-y-1/2" />;
  if (kind === "paperclip") return <PaperClip className="right-[12%] top-0 -translate-y-[28%]" />;
  if (kind === "tapes")
    return (
      <>
        <Tape kind={tape} turn={turn} className="left-0 top-0 -translate-x-[30%] -translate-y-[10%] -rotate-[38deg]" />
        <Tape kind="paper" turn={-turn} className="bottom-0 right-0 translate-x-[30%] translate-y-[10%] -rotate-[38deg]" />
      </>
    );
  return <Tape kind={tape} turn={turn} className="left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" />;
}

function Print({ card }: { card: Card }) {
  if (card.strip)
    return (
      <div className="flex size-full flex-col gap-[4%] bg-[#fbfaf6] p-[9%] pb-[14%] ring-1 ring-black/5">
        {card.strip.map((src) => (
          <div key={src} className="relative w-full flex-1 overflow-hidden bg-ink/80">
            <Image src={src} alt="" fill sizes="(min-width: 1024px) 12vw, 1px" className="object-cover" />
          </div>
        ))}
      </div>
    );
  return (
    <div className="size-full bg-[#fbfaf6] p-[3.5%] ring-1 ring-black/5">
      <div className="relative size-full overflow-hidden bg-ink/80">
        <Image src={card.src!} alt="" fill sizes="(min-width: 1024px) 22vw, 1px" className="object-cover" />
      </div>
    </div>
  );
}

function Piece({ card, k, slot, side, lone, shown, still }: { card: Card; k: number; slot: Slot; side: number; lone: boolean; shown: boolean; still: boolean }) {
  const el = useRef<HTMLDivElement>(null);
  const r = side * (3 + (pick(k, 4) % 5));
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

  const name = card.event.name;
  const extras: ReactNode[] = [];
  if (card.nth === 1) extras.push(<Stamp key="stamp" text={card.event.when} turn={-side * 9} className={side < 0 ? "-right-6 -bottom-6" : "-left-6 -bottom-6"} />);
  if (card.nth === 3 && lone) extras.push(<TornNote key="note" text={name} turn={side * 4} className={side < 0 ? "left-[calc(100%+1rem)] top-[30%]" : "right-[calc(100%+1rem)] top-[30%]"} />);
  if (k % 7 === 5) extras.push(<Sticker key="sticker" turn={side * 12} className={side < 0 ? "-right-5 top-[12%]" : "-left-5 top-[12%]"} />);

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
      <Hold k={k} card={card} />
      {extras}
      {card.first && lone && (
        <p
          className="absolute top-[34%] w-[9.5rem] font-[family-name:var(--f-hand)] text-[1.5rem] leading-[1.05] text-[#233a8b]"
          style={{
            [side < 0 ? "left" : "right"]: "calc(100% + 1.25rem)",
            textAlign: side < 0 ? "left" : "right",
            transform: `rotate(${-r - 3 * side}deg)`,
          }}
        >
          {name}
          <span className="mt-1 block text-[1.125rem] opacity-80">{card.event.when}</span>
        </p>
      )}
    </div>
  );
}

type Placed = { card: Card; slot: Slot; side: number; lone: boolean };
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
      out.push({ card, lone: u.kind !== "pair", side: onLeft ? -1 : 1, slot: { top: top + p.dy, left: onLeft ? edge : cw - p.w - edge, width: p.w, height: p.h } });
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

  return (
    <div ref={column} aria-hidden="true" data-print className="relative h-full">
      {placed.map(({ card, slot, side, lone }, k) => (
        <div key={card.key}>
          <span data-mark={card.key} className="absolute left-0 h-px w-px" style={{ top: slot.top + slot.height * 0.3 }} />
          <Piece card={card} k={k} slot={slot} side={side} lone={lone} shown={seen.has(card.key)} still={still} />
        </div>
      ))}
    </div>
  );
}
