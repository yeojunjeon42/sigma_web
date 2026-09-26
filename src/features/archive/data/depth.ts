import { PLATE, type Shape } from "./field";

export const SHEET = 1000;

export type Layer = 0 | 1 | 2;

export const LAYERS: { size: number; speed: number }[] = [
  { size: 128, speed: 0.8 },
  { size: 176, speed: 1 },
  { size: 236, speed: 1.24 },
];

const MARGIN = 28;
const PAD = 14;
const TRIES = 96;
const NOISE = 10;
const SNAP = 24;
const ROOM = 240;
const CROWD = 30;
const JUSTIFY = 1.7;
const CAPTION = 66;
const NUMERAL = 352;

const SLACK = 22;

function clearance(a: { layer: Layer; h: number }, b: { layer: Layer; h: number }) {
  const s = LAYERS[a.layer].speed;
  if (a.layer !== b.layer || s >= 1) return PAD;
  return PAD + Math.max(0, ((a.h + b.h) / 2) * (1 / s - 1) - SLACK);
}

interface Spot<T> {
  item: T;
  layer: Layer;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Band {
  key: string;
  y: number;
}

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
