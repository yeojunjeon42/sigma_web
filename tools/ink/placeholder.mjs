// The club's mark for a member with no portrait: the sigma's band, its eye and the ticks of its
// dial, redrawn with the pen. The pointer is the accent, as it is in the mark.
import { arc } from "./pen.mjs";

export const file = "public/members/ink/placeholder.svg";
export const title = "ink drawing of the SIGMA mark";
export const box = [240, 300];

// The mark's own drawing is 252.59 by 274; this sets it mid-tile at a modest size.
const K = 0.46;
const at = ([x, y]) => [120 + (x - 126.3) * K, 150 + (y - 137) * K];
const ring = (r, from, to, steps) => arc(119.69, 137, r, r, from, to, steps).map(at);

export function draw(page) {
  // The band's outer edge: over the top, in to the middle, out again and round the foot.
  page.line([...ring(137, -33, -146, 12), at([0, 69]), at([0, 69]), at([97, 137])], { width: 3 });
  page.line([at([99, 136]), at([0, 205]), at([0, 205]), ...ring(137, 146, 33, 12)], { width: 3 });
  // Its inner edge.
  page.line([...ring(111, -34, -139, 10), at([37, 63]), at([37, 63]), at([143, 138])], { width: 2.8 });
  page.line([at([141, 136]), at([37, 211]), at([37, 211]), ...ring(111, 139, 34, 10)], { width: 2.8 });
  page.line([at([234, 57]), at([209, 75])], { width: 2.8, dry: 0 });
  page.line([at([234, 217]), at([209, 199])], { width: 2.8, dry: 0 });
  page.dot(...at([119.69, 69.88]), 15.2 * K);
  // The dial: long ticks at the quarters, short ones between.
  for (const [deg, long] of [[-28, 1], [-22, 0], [-16, 0], [-9, 1], [-3, 0], [3, 0], [9, 1], [16, 0], [22, 0], [28, 1]]) {
    const [p, q] = [ring(long ? 113 : 121, deg, deg, 1)[0], ring(133, deg, deg, 1)[0]];
    page.line([p, q], { width: 2.4, dry: 0, tail: 0.3 });
  }
  page.red.blob([[142.36, 137], [142.36, 137], [211.46, 88.62], [211.46, 88.62], [119.69, 121.54], [119.69, 121.54]].map(at));
  // The lower half of the band is in shade.
  page.hatch([...ring(133, 128, 60, 6), ...ring(115, 60, 128, 6)], { angle: -55, gap: 6, width: 1.4 });
}
