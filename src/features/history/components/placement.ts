// Where each photograph of the collage sits. The arrangement is irregular on purpose and never by
// accident: every choice (width, anchor, tilt, tape, gap) comes from the photograph's own seed and
// its place in the order, so nothing moves on a reload, and the column's width only scales it.

export type Item = {
  key: string;
  // Height over width.
  ratio: number;
  strip: boolean;
  year: number;
  // A handwritten note stands beside this one, so the page next to it stays clear.
  noted: boolean;
};

export type Spot = {
  key: string;
  top: number;
  left: number;
  width: number;
  height: number;
  // Degrees, within TILT either way.
  tilt: number;
  // The side of the photograph left open for a note: -1 the page to its left, 1 to its right.
  open: -1 | 1;
  // How wide that note may be, when there is one.
  note: number;
  tape: "top" | "corners";
};

type Box = { l: number; t: number; r: number; b: number };

export const TILT = 4;
// The gap a note keeps from its photograph (room for the arrow), and the note's own size.
export const REACH = 34;
const NOTE = { width: 152, least: 96, height: 104 };
const PAD = 40;
// The gap under a photograph before the next one below it, and the room kept beside one.
const GAP = [24, 72] as const;
const ASIDE = 8;
const JITTER = 12;
// Four anchors, two towards each edge, so neighbours stand on opposite sides and the column
// zigzags; a narrow column has room for one photograph across and two anchors.
const NARROW = 360;
const ANCHORS = { wide: [0, 0.15, 0.85, 1], narrow: [0, 1] } as const;
// Three widths, as shares of the column; a strip of small frames keeps its own.
const WIDTHS = { wide: [0.36, 0.43, 0.5], narrow: [0.5, 0.6, 0.7] } as const;
const STRIP = { wide: 0.34, narrow: 0.42 } as const;
// To end beside the list, the column may shrink its photographs to this share of their size, and
// then draw its gaps in towards the small end of their range. Past that it runs on below the list.
const LEAST = 0.85;
const TIGHT = 0.25;
// Tape reaches a little past the photograph it holds.
const TAPE = 8;

export function seedOf(key: string) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return h >>> 0;
}
// A number from 0 up to 1 for a seed and a purpose.
const roll = (seed: number, k: number) => ((Math.imul(seed ^ (k * 0x9e3779b1), 2654435761) >>> 0) % 9973) / 9973;

// The box a tilted photograph and its tape cover: it turns about the middle of its top edge.
function cover(left: number, top: number, w: number, h: number, tilt: number): Box {
  const a = (tilt * Math.PI) / 180;
  const [cos, sin] = [Math.cos(a), Math.sin(a)];
  const xs: number[] = [];
  const ys: number[] = [];
  for (const [x, y] of [[-w / 2, 0], [w / 2, 0], [-w / 2, h], [w / 2, h]]) {
    xs.push(left + w / 2 + x * cos - y * sin);
    ys.push(top + x * sin + y * cos);
  }
  return { l: Math.min(...xs) - TAPE, t: Math.min(...ys) - TAPE, r: Math.max(...xs) + TAPE, b: Math.max(...ys) + TAPE };
}

type Choice = { share: number; anchor: number; jitter: number; tilt: number; open: -1 | 1; tape: Spot["tape"]; gap: number };

// What the seeds decide, before any measuring: no two neighbours share a width or an anchor, and
// no more than two in a row lean the same way.
function choose(items: Item[], narrow: boolean): Choice[] {
  const shares = narrow ? WIDTHS.narrow : WIDTHS.wide;
  const anchors: readonly number[] = narrow ? ANCHORS.narrow : ANCHORS.wide;
  let [lastSize, lastAnchor] = [-1, -1];
  const leans: number[] = [];
  return items.map((item) => {
    const seed = seedOf(item.key);
    // A tall photograph takes one of the two smaller widths, so it never fills the column.
    const sizes = [0, 1, 2].filter((s) => s !== lastSize && !(item.ratio > 1.1 && s === 2));
    const size = sizes[Math.floor(roll(seed, 1) * sizes.length)];
    // The next one stands on the other side of the column wherever there is another side.
    const free = anchors.map((_, k) => k).filter((k) => k !== lastAnchor);
    const far = free.filter((k) => lastAnchor < 0 || anchors[k] < 0.5 !== anchors[lastAnchor] < 0.5);
    const pool = far.length ? far : free;
    const anchor = pool[Math.floor(roll(seed, 3) * pool.length)];
    let lean = roll(seed, 4) < 0.5 ? -1 : 1;
    if (leans.length >= 2 && leans.at(-1) === lean && leans.at(-2) === lean) lean = -lean;
    leans.push(lean);
    if (!item.strip) lastSize = size;
    lastAnchor = anchor;
    return {
      share: item.strip ? (narrow ? STRIP.narrow : STRIP.wide) : shares[size],
      anchor: anchors[anchor],
      jitter: (roll(seed, 5) * 2 - 1) * JITTER,
      tilt: lean * (1 + roll(seed, 6) * (TILT - 1)),
      open: anchors[anchor] < 0.5 ? 1 : -1,
      tape: !item.strip && roll(seed, 7) < 0.5 ? "corners" : "top",
      gap: roll(seed, 8),
    };
  });
}

// Sets the photographs down the column at one scale. A year with few photographs is set first,
// starting beside its own year in the list; a year with more than its section can hold starts
// there too and runs on, around whatever is already down. Each photograph comes to rest its own gap
// below whatever is under it, and below the start of the one before it in its year.
function drop(items: Item[], choices: Choice[], cw: number, scale: number, spread: number, yearTop: (year: number) => number | undefined) {
  const taken: Box[] = [];
  const spots: Spot[] = new Array(items.length);
  const years = [...new Set(items.map((i) => i.year))];
  const count = (year: number) => items.filter((i) => i.year === year).length;
  for (const year of years.toSorted((a, b) => count(a) - count(b))) {
    let before = (yearTop(year) ?? 0) + PAD;
    items.forEach((item, i) => {
      if (item.year !== year) return;
      const c = choices[i];
      const gap = GAP[0] + c.gap * spread * (GAP[1] - GAP[0]) - 2 * TAPE;
      const width = Math.min(cw * c.share * scale, cw - 2 * TAPE);
      const height = width * item.ratio;
      // Keep the whole tilted photograph, and its note, inside the column.
      const lean = Math.abs(Math.sin((c.tilt * Math.PI) / 180)) * height + TAPE;
      const text = item.noted ? Math.max(NOTE.least, Math.min(NOTE.width, cw - width - REACH - 2 * lean)) : 0;
      const beside = text ? text + REACH : 0;
      const free = Math.min(Math.max(lean, c.anchor * (cw - width) + c.jitter), cw - width - lean);
      const left = !text ? free : c.open > 0 ? Math.min(free, Math.max(lean, cw - width - beside - lean)) : Math.max(free, beside + lean);
      const boxes = (top: number): Box[] => {
        const own = cover(left, top, width, height, c.tilt);
        if (!text) return [own];
        const side = c.open > 0 ? { l: own.r - TAPE, r: own.r - TAPE + beside } : { l: own.l + TAPE - beside, r: own.l + TAPE };
        return [own, { ...side, t: top, b: top + Math.max(28, height * 0.12) + NOTE.height }];
      };
      let top = before;
      // Slide down until neither the photograph nor its note is closer than its gap to anything.
      for (let moved = true; moved; ) {
        moved = false;
        for (const mine of boxes(top)) {
          const hit = taken.find((theirs) => mine.r + ASIDE > theirs.l && mine.l - ASIDE < theirs.r && mine.t < theirs.b + gap - 0.01 && mine.b + gap > theirs.t + 0.01);
          if (!hit) continue;
          top += hit.b + gap - mine.t + 0.02;
          moved = true;
          break;
        }
      }
      taken.push(...boxes(top));
      spots[i] = { key: item.key, top, left, width, height, tilt: c.tilt, open: c.open, note: text, tape: c.tape };
      // The next one starts lower than this one, so the column reads in order.
      before = top + Math.min(height * 0.3, 60);
    });
  }
  return { spots, height: Math.max(...taken.map((b) => b.b)) + PAD / 2 };
}

// The column for a width, ending beside the list (`limit`) where its rules allow: full size first,
// then smaller photographs, then tighter gaps. `height` is what it takes in the end.
export function place(items: Item[], cw: number, limit: number, yearTop: (year: number) => number | undefined) {
  const choices = choose(items, cw < NARROW);
  const at = (scale: number, spread: number) => drop(items, choices, cw, scale, spread, yearTop);
  const fit = (lo: number, hi: number, run: (v: number) => ReturnType<typeof drop>) => {
    let best = run(lo);
    if (best.height > limit) return best;
    for (let n = 0; n < 10; n++) {
      const mid = (lo + hi) / 2;
      const tried = run(mid);
      if (tried.height <= limit) [lo, best] = [mid, tried];
      else hi = mid;
    }
    return best;
  };
  const full = at(1, 1);
  if (full.height <= limit) return full;
  const smaller = fit(LEAST, 1, (scale) => at(scale, 1));
  if (smaller.height <= limit) return smaller;
  return fit(TIGHT, 1, (spread) => at(LEAST, spread)).height <= limit ? fit(TIGHT, 1, (spread) => at(LEAST, spread)) : at(LEAST, TIGHT);
}
