// A caliper lying across the page, its jaws a little open, and a small printed block beside it:
// the layers show on the block's sides. The gap the jaws measure is the accent.
import { arc, bent, edge, move, turn } from "./pen.mjs";

export const file = "public/blog-illustrations/caliper.svg";
export const title = "ink drawing of a caliper beside a small 3D-printed part";
export const box = [300, 300];

// The caliper is drawn level, its beam's top edge on y = 0 from the fixed jaw at x = 0, then laid
// at this angle.
const LIE = -31;
const AT = [30, 196];
// Where the sliding jaw's measuring face stands, and how far the slide runs along the beam.
const S = 60;
const SLIDE = 76;
const END = 262;

export function draw(page) {
  const lay = (points) => move(turn(points, LIE), ...AT);
  const line = (points, o) => page.line(lay(points), o);

  // The fixed jaw: its measuring face, then round the tip and up the back in one stroke.
  line(edge([22, 18], [22, 86], 1, 3), { width: 2.6 });
  line(bent([[24, 86], [14, 86], [0, 60], [0, -20], [11, -36], [23, -36]]), { width: 2.7, dry: 0 });
  line(edge([22, -37], [22, 0], 2, 0), { width: 2.3 });

  // The beam either side of the slide, and the depth rod out of its end.
  line(edge([22, 0], [S, 0], 0, -1), { width: 2.4, dry: 0 });
  line(edge([22, 18], [S, 18], 2, -1), { width: 2.4, dry: 0 });
  line(edge([S + SLIDE, 0], [END, 0], -1, 3, 1), { width: 2.7 });
  line(edge([S + SLIDE, 18], [END, 18], -1, 1, -0.6), { width: 2.6 });
  line(edge([END, 0], [END, 18], 2, 3), { width: 2.2 });
  line(edge([END, 8], [END + 30, 8.5], 0, 0), { width: 2.2, tail: 0.3 });
  // Its scale: every fifth tick is long. They stop short of the end.
  for (let x = S + SLIDE + 7, i = 0; x < END - 8; x += 6.4, i++) line([[x, 18], [x + 0.3, i % 5 ? 12.5 : 8]], { width: 1.3, tail: 0.5, dry: 0 });
  for (let x = 28.5, i = 1; x < S - 3; x += 6.4, i++) line([[x, 18], [x + 0.3, i % 5 ? 12.5 : 8]], { width: 1.3, tail: 0.5, dry: 0 });

  // The slide: one stroke down its measuring face from the small jaw's tip to the large one's.
  line(edge([S, -36], [S, 86], 2, 3, 0.8), { width: 2.7, dry: 0 });
  line(bent([[S - 1, 86], [S + 8, 86], [S + 22, 60], [S + 22, 25], [S + SLIDE + 1, 25]]), { width: 2.6 });
  line(edge([S + SLIDE, 26], [S + SLIDE, -7], 2, 2), { width: 2.5 });
  line(bent([[S + SLIDE + 2, -7], [S + 17, -7], [S + 17, -22], [S + 7, -36], [S - 1, -36]]), { width: 2.5, dry: 0 });
  // Its window, the lock screw on top and the thumb wheel underneath.
  line(bent([[S + 27, 2], [S + 62, 2], [S + 62, 15], [S + 27, 15], [S + 27, 1]]), { width: 1.7 });
  for (let x = S + 32; x < S + 60; x += 5.6) line([[x, 15], [x, 10.5]], { width: 1.2, tail: 0.5, dry: 0 });
  line(bent([[S + 42, -7], [S + 42, -15], [S + 53, -15], [S + 53, -7]]), { width: 2, dry: 0 });
  line(arc(S + 58, 26, 9, 9, -10, 190, 10), { width: 2.1, dry: 0 });
  line([[S + 54, 28], [S + 54, 33]], { width: 1.3, dry: 0 });
  line([[S + 59, 28], [S + 59, 34]], { width: 1.3, dry: 0 });
  line([[S + 64, 28], [S + 64, 32]], { width: 1.3, dry: 0 });

  // What the jaws read: the gap between their faces.
  page.red.line(lay([[22.5, 71], [41, 70.4], [S - 0.5, 71]]), { width: 3, tail: 0.08, dry: 0 });

  // The printed block: a near corner, two sides and a top with a hole through it.
  const N = [222, 278];
  const H = 40;
  const R = [N[0] + 52, N[1] - 19];
  const L = [N[0] - 42, N[1] - 21];
  const up = ([x, y], h = H) => [x, y - h];
  const B = [R[0] + L[0] - N[0], R[1] + L[1] - N[1] - H];
  page.line(edge(up(N), N, 2, 2), { width: 2.6 });
  page.line(edge(up(L), L, 1, 2), { width: 2.5 });
  page.line(edge(up(R), R, 2, 1), { width: 2.5 });
  page.line(edge(L, N, 2, 2, 0.6), { width: 2.6 });
  page.line(edge(N, R, 1, 3, -0.6), { width: 2.6 });
  page.line(edge(up(L), up(N), 2, 1), { width: 2.4 });
  page.line(edge(up(N), up(R), 0, 2), { width: 2.4 });
  page.line(edge(up(L), B, 1, 3), { width: 2.3 });
  page.line(edge(B, up(R), -1, 2), { width: 2.3 });
  const top = [(up(N)[0] + B[0]) / 2, (up(N)[1] + B[1]) / 2];
  page.line(arc(top[0], top[1], 14, 6.8, -160, 190, 14), { width: 2, dry: 0 });
  page.line(arc(top[0] - 1, top[1] + 3.4, 12, 5, 185, 350, 8), { width: 1.4, dry: 0, tail: 0.4 });
  // The layers it was printed in, which run round the sides and stop short of the corners.
  for (let h = 6, i = 0; h < H - 3; h += 5.8, i++) {
    page.line(edge(up(L, h), up(N, h), -3 - (i % 3), -3 - ((i * 2) % 3)), { width: 1.2, tail: 0.3, dry: 0.3 });
    page.line(edge(up(N, h), up(R, h), -3 - ((i + 1) % 3), -4 - ((i * 2) % 4)), { width: 1.2, tail: 0.3, dry: 0.3 });
  }

  // The way the slide runs, and the shade: down the fixed jaw's back, under the beam, by the block.
  page.arrow(...lay([[S + 30, -34], [S + 78, -35]]), { width: 1.5, seed: 4 });
  page.hatch(lay([[1, 2], [11, 2], [11, 60], [1, 58]]), { angle: -55, gap: 6.5, width: 1.3 });
  page.hatch(lay([[S + SLIDE + 30, 23], [END - 8, 23], [END - 20, 31], [S + SLIDE + 36, 31]]), { angle: -55, gap: 6.5, width: 1.3 });
  page.hatch([[R[0] + 3, R[1] + 4], [R[0] + 26, R[1] - 6], [R[0] + 20, R[1] + 8], [N[0] + 14, N[1] + 8]], { angle: -55, gap: 6, width: 1.3 });
}
