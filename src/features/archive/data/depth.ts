import { PLATE, type Shape } from "./field";

/**
 * The depth field's placement. Builds are scattered across a sheet 1000 units wide, era by
 * era, at three depths; the page scales the sheet to its width. The scatter is seeded, so it
 * is the same on every visit, and packed so no two plates overlap at rest — only the parallax
 * slides them past each other while the page moves. Which build goes to which depth is the
 * caller's decision (`ArchiveDepth`).
 */
export const SHEET = 1000;

export type Layer = 0 | 1 | 2;

/** Size of a square plate in units, and how fast the layer moves against the page. */
export const LAYERS: { size: number; speed: number }[] = [
  { size: 128, speed: 0.8 },
  { size: 176, speed: 1 },
  { size: 236, speed: 1.24 },
];

const MARGIN = 28;
/** Clear space kept around every plate, so neighbours never touch at rest. */
const PAD = 14;
/** Places tried for each plate; the best free one wins. */
const TRIES = 96;
/** Chance added to every score, so the best place is not always the obvious one. */
const NOISE = 10;
/** Plates start on one of these column lines, so their edges line up down the sheet. */
const SNAP = 24;
/** How far apart two plates on one row want to be, and what crowding costs. */
const ROOM = 240;
const CROWD = 30;
/** A band is stretched to the right rail, but never by more than this. */
const JUSTIFY = 1.7;
/** Room kept under every plate for its name, so a caption never lands on the plate below.
 *  54 was a line short of a two-line name near 1024, where captions were measured overlapping
 *  the next plate's by 6px. */
const CAPTION = 66;
/** A band is never shorter than this. The era numerals ride a slower plane (0.6), which
 *  draws two of them 0.6 of their sheet distance apart, so the pitch has to cover a numeral
 *  at that rate. */
const NUMERAL = 352;

/** Caption room a two-line name leaves unused. */
const SLACK = 22;

/** The slow plane draws two of its plates closer than they are packed, by its speed; the
 *  space under one of them has to cover that, less the caption room nobody prints in. */
function clearance(a: { layer: Layer; h: number }, b: { layer: Layer; h: number }) {
  const s = LAYERS[a.layer].speed;
  if (a.layer !== b.layer || s >= 1) return PAD;
  return PAD + Math.max(0, ((a.h + b.h) / 2) * (1 / s - 1) - SLACK);
}

export interface Spot<T> {
  item: T;
  layer: Layer;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Band {
  key: string;
  y: number;
}

/** Park–Miller: small, deterministic, good enough for a scatter. */
function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export function layoutDepth<T>(
  groups: { key: string | null; items: T[] }[],
  describe: (item: T) => { layer: Layer; shape: Shape },
) {
  const rand = seeded(1984);
  const spots: Spot<T>[] = [];
  const bands: Band[] = [];
  let y = 24;

  for (const group of groups) {
    if (group.key) bands.push({ key: group.key, y });
    const sized = group.items.map((item) => {
      const { layer, shape } = describe(item);
      const unit = LAYERS[layer].size / PLATE.sq.w;
      return { item, layer, w: PLATE[shape].w * unit, h: PLATE[shape].h * unit + CAPTION };
    });

    // Each plate drops into the highest free place among the column lines; a place crowded by a
    // neighbour on the same row costs more, so a row fills its width before the next begins.
    const placed: { x: number; y: number; w: number; h: number; layer: Layer }[] = [];
    const floor = y;
    const step = (SHEET - 2 * MARGIN) / SNAP;
    let bottom = y;
    for (const s of sized) {
      const lanes = Math.max(1, Math.round(s.w / step));
      let best = { x: MARGIN, y: Infinity, score: Infinity };
      for (let t = 0; t < TRIES; t++) {
        const lane = Math.min(SNAP - lanes, Math.floor(rand() * (SNAP - lanes + 1)));
        const x = MARGIN + lane * step + (rand() - 0.5) * step * 0.4;
        let at = floor + rand() * 12;
        for (const q of placed) {
          const apart = x + s.w + PAD <= q.x || q.x + q.w + PAD <= x;
          if (!apart) at = Math.max(at, q.y + q.h + clearance(s, q));
        }
        let near = ROOM;
        for (const q of placed) {
          if (at + s.h <= q.y || q.y + q.h <= at) continue;
          near = Math.min(near, Math.max(0, Math.max(x, q.x) - Math.min(x + s.w, q.x + q.w)));
        }
        const score = at + (1 - near / ROOM) * CROWD + rand() * NOISE;
        if (score < best.score) best = { x, y: at, score };
      }
      const spot = { x: best.x, y: best.y, w: s.w, h: s.h, layer: s.layer };
      placed.push(spot);
      spots.push({ item: s.item, ...spot });
      bottom = Math.max(bottom, spot.y + spot.h);
    }

    // Stretch the band out to the right rail, so no era stops short of it.
    const edge = placed.reduce((m, q) => Math.max(m, q.x + q.w), MARGIN);
    const far = placed.reduce((a, q) => (q.x + q.w > a.x + a.w ? q : a), placed[0]);
    if (far && edge < SHEET - MARGIN) {
      const f = Math.min(JUSTIFY, (SHEET - MARGIN - far.w - MARGIN) / Math.max(1, far.x - MARGIN));
      if (f > 1) {
        for (const spot of spots.slice(-placed.length)) {
          spot.x = MARGIN + (spot.x - MARGIN) * f;
        }
      }
    }

    // The band is justified after it is packed, so a plate can end up beside one it was
    // packed clear of. Two names on top of each other is the one thing the field cannot do —
    // sweep the band once more and drop anything still colliding below its neighbour.
    const band = spots.slice(-placed.length);
    band.sort((a, b) => a.y - b.y);
    for (let i = 0; i < band.length; i++) {
      for (let j = 0; j < i; j++) {
        const a = band[i];
        const q = band[j];
        const apart = a.x + a.w + PAD <= q.x || q.x + q.w + PAD <= a.x;
        const gap = clearance(a, q);
        if (!apart && a.y < q.y + q.h + gap) a.y = q.y + q.h + gap;
      }
      bottom = Math.max(bottom, band[i].y + band[i].h);
    }

    y = Math.max(bottom, floor + NUMERAL) + 48;
  }

  return { spots, bands, height: y };
}
