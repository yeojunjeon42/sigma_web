// A maple leaf, tilted as it would lie on the page. The stem and midrib are the accent.
import { turn } from "./pen.mjs";

export const file = "public/blog-illustrations/maple-leaf.svg";
export const title = "ink drawing of a maple leaf";
export const box = [300, 300];

const TILT = 14;
const H = 196;
// The right half of the blade, from the base up to the tip: x from the midrib, y from the base.
const HALF = {
  base: [0.0, 0.05],
  b1: [0.14, 0.1],
  low: [0.41, 0.13],
  c1: [0.3, 0.23],
  n2: [0.22, 0.33],
  d1: [0.38, 0.37],
  tooth2: [0.55, 0.4],
  e1: [0.46, 0.5],
  side: [0.6, 0.67],
  f1: [0.46, 0.62],
  tooth1: [0.4, 0.79],
  g1: [0.3, 0.64],
  n1: [0.13, 0.54],
  h1: [0.16, 0.72],
  tooth0: [0.23, 0.85],
  i1: [0.11, 0.83],
  tip: [0.0, 1.03],
};

export function draw(page) {
  // side: 1 is the right half; the left is narrower and hangs a little lower, as no leaf is even.
  const at = ([x, y], side = 1) => turn([[150 + x * H * (side > 0 ? 1 : -0.92), 240 - (y - (side > 0 ? 0 : 0.05 * x)) * H]], TILT, [150, 150])[0];
  for (const side of [1, -1]) {
    const p = Object.fromEntries(Object.entries(HALF).map(([k, v]) => [k, at(v, side)]));
    page.line([p.base, p.b1, p.low, p.low, p.c1, p.n2], { width: 2.6 });
    page.line([p.n2, p.d1, p.tooth2, p.tooth2, p.e1, p.e1, p.side], { width: 2.5 });
    page.line([p.side, p.f1, p.f1, p.tooth1, p.tooth1, p.g1, p.n1], { width: 2.4 });
    page.line([p.n1, p.h1, p.tooth0, p.tooth0, p.i1, p.i1, p.tip], { width: 2.5 });
    // Veins stop short of the points they run to.
    const hub = at([0, 0.1], side);
    page.line([hub, at([0.26, 0.4], side), at([0.5, 0.6], side)], { width: 1.7, tail: 0.5 });
    page.line([hub, at([0.2, 0.14], side), at([0.34, 0.14], side)], { width: 1.6, tail: 0.5 });
    page.line([at([0.0, 0.5], side), at([0.1, 0.66], side), at([0.17, 0.78], side)], { width: 1.5, tail: 0.5 });
    page.line([at([0.3, 0.44], side), at([0.4, 0.42], side), at([0.47, 0.42], side)], { width: 1.4, tail: 0.5 });
    page.line([at([0.36, 0.5], side), at([0.37, 0.6], side), at([0.38, 0.7], side)], { width: 1.4, tail: 0.5 });
  }
  // Shade on one side of each vein only, all strokes leaning the same way.
  page.hatch([at([0.08, 0.2], 1), at([0.44, 0.52], 1), at([0.46, 0.42], 1), at([0.24, 0.3], 1)], { angle: -58, gap: 7.5, width: 1.4 });
  page.hatch([at([0.03, 0.56], -1), at([0.12, 0.8], -1), at([0.03, 0.9], -1)], { angle: -58, gap: 7, width: 1.3 });
  page.hatch([at([0.12, 0.13], -1), at([0.34, 0.16], -1), at([0.3, 0.21], -1)], { angle: -58, gap: 7, width: 1.3 });
  page.red.line([at([0.06, -0.22]), at([0.02, -0.08]), at([0, 0.08]), at([0, 0.5]), at([0, 0.93])], { width: 2.8, tail: 0.35, dry: 0 });
}
