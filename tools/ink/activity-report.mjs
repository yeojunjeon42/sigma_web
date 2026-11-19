// An open spiral notebook seen from the front, a small arcade ghost sketched on its right page and
// a few lines of notes on the left. The dot the ghost is after is the accent.
import { arc, on } from "./pen.mjs";

export const file = "public/blog-illustrations/activity-report.svg";
export const title = "ink drawing of an open notebook with a small ghost sketched on its page";
export const box = [300, 300];

// The spread's corners: far left, the gutter's top and foot, near left, and the same on the right.
const FL = [48, 84];
const GT = [150, 90];
const GB = [152, 244];
const NL = [20, 222];
const FR = [252, 82];
const NR = [282, 216];

export function draw(page) {
  const left = on([FL, GT, GB, NL]);
  const right = on([GT, FR, NR, GB]);

  // The pages: each edge is its own stroke, and they do not quite meet at the corners.
  page.line([[46, 86], [96, 75], [136, 80], [149, 90]], { width: 2.6 });
  page.line([[151, 90], [164, 79], [206, 72], [254, 83]], { width: 2.6 });
  page.line([[49, 82], [36, 150], [21, 224]], { width: 2.8 });
  page.line([[251, 80], [266, 150], [283, 218]], { width: 2.8 });
  page.line([[18, 221], [80, 236], [136, 237], [151, 244]], { width: 2.7 });
  page.line([[153, 244], [168, 237], [220, 233], [284, 215]], { width: 2.7 });
  // The stack of pages under the near edge, then the cover.
  page.line([[24, 229], [82, 242], [137, 243], [151, 250]], { width: 1.6, tail: 0.3 });
  page.line([[154, 250], [170, 243], [222, 239], [279, 224]], { width: 1.6, tail: 0.3 });
  page.line([[17, 226], [20, 236], [80, 250], [138, 251], [152, 257], [168, 251], [224, 247], [286, 229], [285, 219]], { width: 2.4 });

  // The spiral: rings over the gutter, each a small hook.
  for (let i = 0; i < 8; i++) {
    const y = 99 + i * 19.4;
    page.line(arc(151 + (i % 2) * 0.6, y, 7.5, 5.2, 200, 372, 6), { width: 1.9, tail: 0.3, dry: 0 });
  }

  // Notes on the left page: lines of writing that never resolve into letters.
  const rows = [
    [0.16, 0.14, 0.8],
    [0.25, 0.14, 0.86],
    [0.34, 0.14, 0.62],
    [0.47, 0.14, 0.84],
    [0.56, 0.14, 0.7],
  ];
  rows.forEach(([v, from, to], r) => {
    const points = [];
    for (let u = from, i = 0; u <= to; u += 0.035, i++) {
      const [x, y] = left(u, v);
      points.push([x, y + (i % 2 ? -1.6 : 1.3) * (0.6 + ((i * 7 + r * 3) % 5) / 5)]);
    }
    page.line(points, { width: 1.5, tail: 0.25 });
  });
  // A two-box diagram under the notes.
  const boxOn = (face, u0, v0, u1, v1, o) => page.line([face(u0, v0), face(u1, v0), face(u1, v0), face(u1, v1), face(u1, v1), face(u0, v1), face(u0, v1), face(u0, v0 - 0.01)], o);
  boxOn(left, 0.16, 0.7, 0.36, 0.84, { width: 1.7 });
  boxOn(left, 0.56, 0.7, 0.78, 0.84, { width: 1.7 });
  page.arrow(left(0.38, 0.77), left(0.54, 0.77), { width: 1.5 });

  // The ghost, drawn on the page and so leaning with it: one stroke up a side, over the dome and
  // down the other, then the hem in a second.
  page.line([right(0.3, 0.8), right(0.3, 0.52), right(0.315, 0.37), right(0.39, 0.25), right(0.52, 0.2), right(0.65, 0.25), right(0.725, 0.37), right(0.74, 0.52), right(0.74, 0.8)], { width: 2.2, dry: 0 });
  page.line(
    [right(0.295, 0.79), right(0.355, 0.7), right(0.41, 0.8), right(0.465, 0.7), right(0.52, 0.8), right(0.575, 0.7), right(0.63, 0.8), right(0.685, 0.7), right(0.745, 0.79)],
    { width: 2, dry: 0 },
  );
  // Eyes looking the way it is going.
  for (const u of [0.43, 0.61]) {
    const [x, y] = right(u, 0.43);
    page.line(arc(x, y, 6.2, 8, -100, 280, 12), { width: 1.7, dry: 0 });
    page.dot(x + 2.4, y + 0.8, 2.5);
  }
  // What it is after: two small dots and the one it wants.
  page.dot(...right(0.82, 0.52), 1.7);
  page.red.dot(...right(0.91, 0.53), 3.6);
  page.arrow(right(0.93, 0.16), right(0.72, 0.25), { width: 1.5 });
  page.hatch([right(0.32, 0.87), right(0.76, 0.86), right(0.74, 0.91), right(0.3, 0.92)], { angle: -55, gap: 6, width: 1.3 });

  // The page falls away into the gutter, and the book throws a little shade to the right.
  page.hatch([right(0.02, 0.06), right(0.1, 0.04), right(0.1, 0.94), right(0.02, 0.97)], { angle: -62, gap: 9, width: 1.3 });
  page.hatch([[176, 258], [288, 234], [294, 243], [184, 268]], { angle: -52, gap: 6.5, width: 1.4 });
}
