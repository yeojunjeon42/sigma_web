// A monitor with a 3D model of a block on it, and the ghost beside it holding a caliper flat
// against the glass, its jaws either side of the block. The model on the screen is the accent.
import { arc, bent, edge } from "./pen.mjs";
import { arm, ghost } from "./ghost.mjs";

export const file = "public/blog-illustrations/caliper-screen.svg";
export const title = "ink drawing of a ghost measuring a 3D model on a screen with a caliper";
export const box = [300, 300];

// The monitor's case and its glass: left, top, right, bottom.
const CASE = [12, 54, 158, 192];
const GLASS = [19, 61, 151, 180];
// The caliper lies level across the glass, jaws up: the beam's two edges, the faces of the fixed
// and the sliding jaw, how high the jaws reach, and where the slide and the beam end.
const BEAM = [158, 168];
const [FIXED, SLIDING, TIP, SLIDE, END] = [43, 119, 110, 146, 177];

export function draw(page) {
  // The monitor. Its right side is broken where the caliper's beam comes off the glass.
  for (const [[l, t, r, b], width] of [[CASE, 2.7], [GLASS, 2]]) {
    page.line(edge([l, t + 1], [r, t], 2, 2, -0.8), { width });
    page.line(edge([r, t], [r + 0.5, BEAM[0] - 4], 1, 0), { width, dry: 0 });
    page.line(edge([r + 0.5, BEAM[1] + 4], [r + 1, b], 0, 2), { width, dry: 0 });
    page.line(edge([r + 1, b], [l + 1, b + 1], 2, 1, -0.8), { width });
    page.line(edge([l + 1, b + 1], [l, t + 1], 2, 3), { width });
  }
  page.dot(85, 187, 1.5);
  // Its neck and foot.
  page.line(edge([76, 194], [75, 245], 0, 0), { width: 2.4, dry: 0 });
  page.line(edge([94, 194], [95, 244], 0, 0), { width: 2.4, dry: 0 });
  page.line(bent([[50, 258], [58, 246], [112, 244], [120, 256]]), { width: 2.5, dry: 0 });
  page.line(edge([48, 258], [122, 256], 0, 0, 1.5), { width: 2.6, dry: 0 });

  // The model: a block seen from a corner, with a hole through its top.
  const N = [79, 146];
  const H = 34;
  const R = [N[0] + 38, N[1] - 14];
  const L = [N[0] - 34, N[1] - 16];
  const up = ([x, y]) => [x, y - H];
  const B = [R[0] + L[0] - N[0], R[1] + L[1] - N[1] - H];
  const model = (a, b, before, after, o) => page.red.line(edge(a, b, before, after), { width: 1.9, dry: 0, ...o });
  model(up(N), N, 1, 1);
  model(up(L), L, 1, 0);
  model(up(R), R, 0, 1);
  model(L, N, 0, 1);
  model(N, R, 1, 0);
  model(up(L), up(N), 0, 1);
  model(up(N), up(R), 1, 0);
  model(up(L), B, 0, 1);
  model(B, up(R), 1, 0);
  const top = [(up(N)[0] + B[0]) / 2, (up(N)[1] + B[1]) / 2];
  page.red.line(arc(top[0], top[1], 12, 5.6, -160, 190, 14), { width: 1.6, dry: 0 });

  // The fixed jaw: up its measuring face, round the tip and down its back to the beam's far edge.
  page.line(bent([[FIXED, BEAM[0] + 1], [FIXED, TIP], [FIXED - 9, TIP + 17], [FIXED - 11, BEAM[1] + 1]]), { width: 2.6, dry: 0 });
  // The beam, either side of the slide, and its end.
  page.line(edge([FIXED, BEAM[0]], [SLIDING, BEAM[0]], 0, 0), { width: 2.3, dry: 0 });
  page.line(edge([FIXED - 11, BEAM[1]], [SLIDING, BEAM[1]], 1, 0, 0.6), { width: 2.4, dry: 0 });
  page.line(edge([SLIDE, BEAM[0]], [END, BEAM[0] - 0.5], 0, 2), { width: 2.4, dry: 0 });
  page.line(edge([SLIDE, BEAM[1]], [END, BEAM[1]], 0, 1), { width: 2.4, dry: 0 });
  page.line(edge([END, BEAM[0]], [END, BEAM[1]], 1, 2), { width: 2.1, dry: 0 });
  // Its scale: every fifth tick is long.
  for (let x = FIXED + 6, i = 1; x < SLIDING - 4; x += 5.6, i++) page.line([[x, BEAM[1]], [x + 0.3, BEAM[1] - (i % 5 ? 3.6 : 6.4)]], { width: 1.2, tail: 0.5, dry: 0 });
  for (let x = SLIDE + 6, i = 3; x < END - 4; x += 5.6, i++) page.line([[x, BEAM[1]], [x + 0.3, BEAM[1] - (i % 5 ? 3.6 : 6.4)]], { width: 1.2, tail: 0.5, dry: 0 });
  // The slide: up its face from the beam to the tip, down its back, and its body round the beam
  // with the lock screw on top and the thumb wheel underneath.
  page.line(bent([[SLIDING, BEAM[1] + 5], [SLIDING, TIP], [SLIDING + 9, TIP + 17], [SLIDING + 10, BEAM[0] - 4], [SLIDE + 1, BEAM[0] - 4]]), { width: 2.6, dry: 0 });
  page.line(bent([[SLIDE, BEAM[0] - 5], [SLIDE, BEAM[1] + 4], [SLIDING - 1, BEAM[1] + 4]]), { width: 2.5, dry: 0 });
  page.line(bent([[SLIDING + 16, BEAM[0] - 4], [SLIDING + 16, BEAM[0] - 9], [SLIDING + 23, BEAM[0] - 9], [SLIDING + 23, BEAM[0] - 4]]), { width: 1.8, dry: 0 });
  page.line(arc(SLIDING + 13, BEAM[1] + 4, 6, 5.5, 0, 180, 8), { width: 1.9, dry: 0 });
  page.line(bent([[SLIDING + 6, BEAM[0] + 2.5], [SLIDE - 5, BEAM[0] + 2.5], [SLIDE - 5, BEAM[1] - 2.5], [SLIDING + 6, BEAM[1] - 2.5], [SLIDING + 6, BEAM[0] + 1.5]]), { width: 1.4, dry: 0 });

  // The ghost, leaning in and looking up at the jaws, with the end of the beam in its hand.
  const g = ghost(page, { at: [241, 266], height: 124, lean: -4, look: [-1, -1] });
  arm(page, g.left(0.56), [END - 1, BEAM[1] + 2]);

  // An arrow to what is being measured, and the shade under the monitor's foot.
  page.arrow([244, 82], [187, 149], { width: 1.5 });
  page.hatch([[40, 262], [146, 258], [164, 266], [58, 272]], { angle: -55, gap: 7, width: 1.4 });
}
