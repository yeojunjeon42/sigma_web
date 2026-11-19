// The ghost up to its middle in a pile of maple leaves, looking up at one more on its way down.
// That falling leaf is the accent.
import { turn } from "./pen.mjs";
import { ghost } from "./ghost.mjs";

export const file = "public/blog-illustrations/fall-leaves.svg";
export const title = "ink drawing of a ghost half-buried in a pile of maple leaves";
export const box = [300, 300];

// The right half of a leaf's blade, from the base up to the tip: x from the midrib, y from the base.
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
// The strokes that half is drawn in; a point named twice is a sharp turn.
const EDGE = [
  ["base", "b1", "low", "low", "c1", "n2", "d1", "tooth2", "tooth2", "e1", "e1", "side"],
  ["side", "f1", "f1", "tooth1", "tooth1", "g1", "n1", "h1", "tooth0", "tooth0", "i1", "i1", "tip"],
];

// The points joined by the pen's own curve and walked in short steps, so that a stroke can be cut
// where something lies over it.
function walk(points, step = 2.5) {
  const out = [points[0]];
  for (let i = 0; i < points.length - 1; i++) {
    const [p0, p1, p2, p3] = [points[Math.max(0, i - 1)], points[i], points[i + 1], points[Math.min(points.length - 1, i + 2)]];
    const n = Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step);
    for (let k = 1; k <= n; k++) {
      const t = k / n;
      const at = (j) => 0.5 * (2 * p1[j] + (p2[j] - p0[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t * t + (3 * p1[j] - p0[j] - 3 * p2[j] + p3[j]) * t * t * t);
      out.push([at(0), at(1)]);
    }
  }
  return out;
}

const inside = ([x, y], shape) => {
  let hit = false;
  for (let i = 0, j = shape.length - 1; i < shape.length; j = i++) {
    const [a, b] = [shape[i], shape[j]];
    if (a[1] > y !== b[1] > y && x < a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0])) hit = !hit;
  }
  return hit;
};

// A leaf lying with the middle of its blade on `at`: the strokes of its edge, its stem and veins,
// and the shape it covers.
function leaf(at, size, tilt) {
  // The left half is narrower, as no leaf is even.
  const put = ([x, y], side = 1) => turn([[at[0] + x * size * (side > 0 ? 1 : -0.92), at[1] - (y - 0.5) * size]], tilt, at)[0];
  const halves = [1, -1].map((side) => EDGE.map((names) => walk(names.map((k) => put(HALF[k], side)))));
  return {
    edge: halves.flat(),
    rib: walk([put([0.05, -0.2]), put([0.01, -0.04]), put([0, 0.3]), put([0, 0.9])]),
    veins: [1, -1].map((side) => walk([put([0, 0.1], side), put([0.24, 0.38], side), put([0.44, 0.56], side)])),
    shape: [...halves[0].flat(), ...halves[1].flat().reverse()],
  };
}

// The pile, from the leaves at the back to the ones lying on top of them. [x, y, size, tilt]
const PILE = [
  [58, 212, 48, -42],
  [242, 209, 50, 36],
  [98, 203, 56, -16],
  [206, 202, 56, 24],
  [152, 207, 58, 5],
  [40, 253, 36, -72],
  [262, 255, 34, 80],
  [76, 246, 52, 150],
  [228, 246, 54, -24],
  [124, 247, 56, -38],
  [178, 249, 58, 16],
];
// How many of them lie behind the ghost; the rest are in front of it.
const BEHIND = 2;

export function draw(page) {
  const H = 176;
  const g = ghost(page, { at: [150, 250], height: H, look: [0.9, -1], shown: 0.6 });

  // A stroke, laid only where nothing in `over` covers it.
  const lay = (pen, points, over, o) => {
    let run = [];
    for (const p of [...points, null]) {
      if (p && !over.some((shape) => inside(p, shape))) run.push(p);
      else {
        if (run.length > 2) pen.line(run, o);
        run = [];
      }
    }
  };
  const sketch = (pen, l, over, width) => {
    l.edge.forEach((stroke) => lay(pen, stroke, over, { width, dry: 0.1 }));
    lay(pen, l.rib, over, { width: width * 0.72, tail: 0.3, dry: 0 });
    l.veins.forEach((stroke) => lay(pen, stroke, over, { width: width * 0.6, tail: 0.5, dry: 0 }));
  };

  // The ghost's body, a little larger than drawn so the leaves behind stop short of its line.
  const body = [g.left(1), g.left(0.4), g.left(0.2), g.top, g.right(0.2), g.right(0.4), g.right(1)].map(([x, y]) => [150 + (x - 150) * 1.04, y - 3]);
  const leaves = PILE.map(([x, y, size, tilt]) => leaf([x, y], size, tilt));
  leaves.forEach((l, i) => sketch(page, l, [...leaves.slice(i + 1).map((m) => m.shape), ...(i < BEHIND ? [body] : [])], 2.2));

  // Two more coming down: a small one on the left, and the one the ghost is watching.
  sketch(page, leaf([44, 96], 34, -38), [], 1.9);
  page.line([[30, 56], [38, 62], [36, 70]], { width: 1.4, tail: 0.5, dry: 0 });
  page.line([[44, 50], [51, 57], [48, 66]], { width: 1.4, tail: 0.5, dry: 0 });
  sketch(page.red, leaf([246, 62], 46, 28), [], 2.4);
  page.line([[258, 16], [266, 22], [263, 30]], { width: 1.4, tail: 0.5, dry: 0 });
  page.line([[272, 26], [278, 33], [274, 41]], { width: 1.4, tail: 0.5, dry: 0 });

  // The ground the pile lies on.
  page.hatch([[36, 276], [250, 272], [274, 282], [60, 287]], { angle: -55, gap: 7, width: 1.4 });
}
