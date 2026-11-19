// A breadboard lying at an angle, a few jumper wires, an LED and a chip on it. Its power rail's
// line is the accent.
import { on } from "./pen.mjs";

export const file = "public/blog-illustrations/education.svg";
export const title = "ink drawing of a breadboard with a few wires";
export const box = [300, 300];

// The top face: back left, back right, front right, front left. The board is this thick.
const FACE = [[32, 128], [232, 92], [278, 170], [70, 218]];
const THICK = 14;

export function draw(page) {
  const at = on(FACE);
  const [a, b, c, d] = FACE;
  const down = ([x, y], k = 1) => [x, y + THICK * k];

  page.line([[a[0] - 3, a[1] + 1], at(0.5, -0.01), [b[0] + 2, b[1] - 1]], { width: 2.6 });
  page.line([[b[0] - 1, b[1] - 3], at(1.005, 0.5), [c[0] + 1, c[1] + 2]], { width: 2.6 });
  page.line([[c[0] + 3, c[1] - 1], at(0.5, 1.01), [d[0] - 2, d[1] + 1]], { width: 2.7 });
  page.line([[d[0] + 1, d[1] + 3], at(-0.005, 0.5), [a[0] - 1, a[1] - 2]], { width: 2.6 });
  // Its thickness, on the two sides that face us.
  page.line([a, down(a)], { width: 2.3, dry: 0 });
  page.line([d, down(d, 1.05)], { width: 2.3, dry: 0 });
  page.line([c, down(c)], { width: 2.3, dry: 0 });
  page.line([down(a), down(at(0, 0.5)), down(d)], { width: 2.5 });
  page.line([down(d), down(at(0.5, 1)), down(c)], { width: 2.6 });

  // Power rails along both long edges; the far one's line is red.
  page.red.line([at(0.04, 0.085), at(0.5, 0.08), at(0.96, 0.085)], { width: 2.4, dry: 0, tail: 0.12 });
  page.line([at(0.04, 0.175), at(0.5, 0.17), at(0.955, 0.175)], { width: 1.5, tail: 0.3 });
  page.line([at(0.045, 0.83), at(0.5, 0.825), at(0.96, 0.83)], { width: 1.5, tail: 0.3 });
  page.line([at(0.04, 0.92), at(0.5, 0.915), at(0.955, 0.92)], { width: 1.5, tail: 0.3 });
  // The trench down the middle.
  page.line([at(0.02, 0.487), at(0.5, 0.485), at(0.98, 0.488)], { width: 1.7 });
  page.line([at(0.02, 0.517), at(0.5, 0.515), at(0.98, 0.514)], { width: 1.5, tail: 0.3 });

  // Holes: dotted in by hand, so some are missing and none sit quite on the grid.
  const skip = (i, j) => ((i * 37 + j * 91 + i * j * 13) % 11) < 3;
  const rows = [0.25, 0.31, 0.37, 0.43, 0.57, 0.63, 0.69, 0.75];
  for (let i = 0; i < 21; i++)
    rows.forEach((v, j) => {
      if (skip(i, j)) return;
      const [x, y] = at(0.055 + i * 0.0445, v);
      page.dot(x + ((i * 7 + j * 3) % 5) * 0.2 - 0.4, y + ((i * 3 + j * 11) % 5) * 0.2 - 0.4, 1.25);
    });
  for (let i = 0; i < 21; i++)
    for (const v of [0.13, 0.875]) {
      if (i % 6 === 5 || skip(i + 3, v > 0.5 ? 5 : 2)) continue;
      const [x, y] = at(0.055 + i * 0.0445, v);
      page.dot(x, y, 1.2);
    }

  // Jumper wires: each leaves a hole, arcs over the board and comes down in another.
  const wire = (from, to, lift, o = {}) => {
    const [p, q] = [at(...from), at(...to)];
    page.line([p, [p[0] + (q[0] - p[0]) * 0.22, p[1] + (q[1] - p[1]) * 0.22 - lift * 0.8], [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2 - lift], [p[0] + (q[0] - p[0]) * 0.8, p[1] + (q[1] - p[1]) * 0.8 - lift * 0.75], q], { width: 2.9, dry: 0, tail: 0.06, ...o });
  };
  wire([0.144, 0.31], [0.41, 0.13], 46);
  wire([0.633, 0.69], [0.9, 0.37], 40);
  // One wire trails off the board toward the supply.
  page.line([at(0.055, 0.875), [62, 224], [46, 250], [44, 270], [22, 284]], { width: 2.9, dry: 0, tail: 0.1 });

  // An LED standing on two legs.
  const led = at(0.19, 0.66);
  page.line([[led[0] - 5, led[1]], [led[0] - 5, led[1] - 16]], { width: 1.7, dry: 0 });
  page.line([[led[0] + 6, led[1] + 2], [led[0] + 5, led[1] - 16]], { width: 1.7, dry: 0 });
  page.line([[led[0] - 12, led[1] - 15], [led[0] - 10, led[1] - 16], [led[0] - 10, led[1] - 32], [led[0], led[1] - 43], [led[0] + 10, led[1] - 32], [led[0] + 10, led[1] - 16], [led[0] + 10, led[1] - 16], [led[0] - 12, led[1] - 15]], { width: 2.2, dry: 0 });
  page.line([[led[0] + 12, led[1] - 15], [led[0] - 12, led[1] - 15]], { width: 2, dry: 0 });
  page.line([[led[0] - 5, led[1] - 34], [led[0] - 2, led[1] - 38]], { width: 1.3, dry: 0 });
  // A chip across the trench, lifted on its pins.
  const chip = (u, v, up = 9) => {
    const [x, y] = at(u, v);
    return [x, y - up];
  };
  page.line([chip(0.44, 0.43), chip(0.6, 0.43), chip(0.6, 0.43), chip(0.6, 0.57), chip(0.6, 0.57), chip(0.44, 0.57), chip(0.44, 0.57), chip(0.44, 0.42)], { width: 2, dry: 0 });
  page.line([chip(0.44, 0.57), chip(0.44, 0.57, 3)], { width: 1.8, dry: 0 });
  page.line([chip(0.6, 0.57), chip(0.6, 0.57, 3)], { width: 1.8, dry: 0 });
  page.line([chip(0.44, 0.57, 3), chip(0.6, 0.57, 3)], { width: 1.8, dry: 0 });
  for (let i = 0; i < 4; i++) page.line([chip(0.46 + i * 0.04, 0.575, 3), at(0.46 + i * 0.04, 0.6)], { width: 1.5, dry: 0 });
  page.dot(...chip(0.465, 0.46), 1.6);

  // A note in the margin: this rail is the supply.
  page.arrow([266, 62], [240, 86], { width: 1.5 });

  // The near-left side is in shade, and the board throws a little on the table.
  page.hatch([a, d, down(d), down(a)], { angle: -72, gap: 7, width: 1.3 });
  page.hatch([[110, 242], [282, 192], [290, 201], [124, 252]], { angle: -55, gap: 7, width: 1.4 });
}
