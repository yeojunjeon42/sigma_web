// Two hands reaching in from either side, forefingers meeting over a small circuit board. The
// light on the board they point at is the accent.
import { arc, flip, move, on, scale, turn } from "./pen.mjs";

export const file = "public/blog-illustrations/collaboration.svg";
export const title = "ink drawing of two hands meeting over a circuit board";
export const box = [300, 300];

// A pointing hand seen from the thumb side, drawn with its fingertip at the origin and its arm
// running off to the left. Each entry is one stroke.
const HAND = {
  finger: [[-124, -9], [-96, -17], [-72, -19], [-52, -13], [-28, -9], [-8, -6], [1, -2], [2, 2], [-3, 5], [-24, 4.5], [-44, 5]],
  crease: [[-27, -7], [-25, -3]],
  nail: [[-10, -5], [-5, -4.6], [-1, -2.5]],
  fist: [[-44, 5], [-37, 9], [-37, 19], [-41, 22], [-40, 30], [-43, 34], [-46, 41], [-52, 46], [-62, 47]],
  folds: [
    [[-41, 22], [-50, 23], [-55, 21]],
    [[-43, 34], [-51, 35], [-56, 33]],
  ],
  thumb: [[-90, 4], [-70, -1], [-52, 3], [-43, 10], [-49, 17], [-66, 16], [-80, 19]],
  palm: [[-62, 47], [-88, 43], [-110, 33], [-124, 31]],
  cuff: [[-121, -13], [-116, 10], [-121, 35]],
  band: [[-131, -11], [-127, 11], [-132, 37]],
  sleeveTop: [[-131, -11], [-137, -10], [-143, -8]],
  sleeveFoot: [[-132, 37], [-138, 39], [-143, 41]],
};

// The board's top face: back left, back right, front right, front left.
const BOARD = [[74, 162], [222, 146], [260, 214], [90, 240]];

export function draw(page) {
  const hand = (place, widths) => {
    const stroke = (points, o) => page.line(place(points), o);
    stroke(HAND.finger, { width: widths, dry: 0 });
    stroke(HAND.fist, { width: widths });
    stroke(HAND.palm, { width: widths });
    stroke(HAND.thumb, { width: widths - 0.3 });
    stroke(HAND.crease, { width: 1.4, dry: 0 });
    stroke(HAND.nail, { width: 1.3, dry: 0 });
    HAND.folds.forEach((f) => stroke(f, { width: 1.6, dry: 0 }));
    stroke(HAND.cuff, { width: 2.2 });
    stroke(HAND.band, { width: 2.2 });
    stroke(HAND.sleeveTop, { width: 2.3, tail: 0.5 });
    stroke(HAND.sleeveFoot, { width: 2.3, tail: 0.5 });
  };
  // The left hand comes down from the upper left; the right is a little smaller and flatter.
  hand((p) => move(turn(scale(p, 0.86), 15), 143, 100), 2.6);
  hand((p) => move(turn(flip(scale(p, 0.82), 0), -11), 158, 104), 2.5);

  const at = on(BOARD);
  const [a, b, c, d] = BOARD;
  page.line([[a[0] - 3, a[1] + 1], at(0.5, -0.01), [b[0] + 2, b[1]]], { width: 2.6 });
  page.line([[b[0] - 1, b[1] - 2], at(1, 0.5), [c[0] + 1, c[1] + 2]], { width: 2.6 });
  page.line([[c[0] + 3, c[1]], at(0.5, 1.01), [d[0] - 2, d[1] + 1]], { width: 2.7 });
  page.line([[d[0] + 1, d[1] + 3], at(0, 0.5), [a[0] - 1, a[1] - 2]], { width: 2.6 });
  page.line([[d[0], d[1] + 6], at(0.5, 1.08), [c[0], c[1] + 6]], { width: 2.2 });
  page.line([c, [c[0], c[1] + 6]], { width: 2, dry: 0 });
  page.line([d, [d[0], d[1] + 6]], { width: 2, dry: 0 });

  // A chip with its pins, and traces running off it to pads at the edges.
  page.line([at(0.4, 0.36), at(0.64, 0.36), at(0.64, 0.36), at(0.64, 0.7), at(0.64, 0.7), at(0.4, 0.7), at(0.4, 0.7), at(0.4, 0.34)], { width: 2.2 });
  page.dot(...at(0.44, 0.42), 1.5);
  for (let i = 0; i < 4; i++) {
    const v = 0.41 + i * 0.08;
    page.line([at(0.4, v), at(0.36, v)], { width: 1.5, dry: 0 });
    page.line([at(0.64, v), at(0.68, v)], { width: 1.5, dry: 0 });
  }
  const trace = (points) => page.line(points.flatMap((p, i) => (i && i < points.length - 1 ? [at(...p), at(...p)] : [at(...p)])), { width: 1.6, dry: 0 });
  trace([[0.36, 0.41], [0.24, 0.41], [0.17, 0.26], [0.1, 0.26]]);
  trace([[0.36, 0.49], [0.14, 0.49]]);
  trace([[0.36, 0.65], [0.26, 0.65], [0.2, 0.82], [0.1, 0.82]]);
  trace([[0.68, 0.41], [0.78, 0.41], [0.84, 0.26], [0.9, 0.26]]);
  trace([[0.68, 0.57], [0.9, 0.57]]);
  trace([[0.68, 0.65], [0.76, 0.65], [0.82, 0.84], [0.9, 0.84]]);
  trace([[0.52, 0.36], [0.52, 0.2]]);
  for (const [u, v] of [[0.08, 0.26], [0.12, 0.49], [0.08, 0.82], [0.92, 0.26], [0.92, 0.57], [0.92, 0.84]]) {
    const [x, y] = at(u, v);
    page.line(arc(x, y, 3.4, 2.6, -80, 290, 8), { width: 1.4, dry: 0 });
  }
  // The light both fingers point at.
  page.red.dot(...at(0.52, 0.14), 4.4);
  // Shade under the hands and beside the board.
  page.hatch([at(0.7, 0.08), at(0.95, 0.06), at(0.96, 0.18), at(0.72, 0.2)], { angle: -55, gap: 6.5, width: 1.3 });
  page.hatch([[118, 250], [266, 224], [274, 233], [130, 260]], { angle: -55, gap: 7, width: 1.4 });
}
