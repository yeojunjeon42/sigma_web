// A breadboard lying in front, and the ghost standing behind it with a soldering iron: the tip is
// down on a resistor's leg and a wisp of smoke goes up from the joint. The hot tip is the accent.
import { bent, edge, on } from "./pen.mjs";
import { arm, ghost } from "./ghost.mjs";

export const file = "public/blog-illustrations/soldering.svg";
export const title = "ink drawing of a ghost soldering at a breadboard, with a wisp of smoke";
export const box = [300, 300];

// The breadboard's top face: back left, back right, front right, front left.
const BREAD = [[22, 198], [262, 182], [284, 246], [36, 264]];
// The iron: where its tip touches the board, and where the ghost holds it.
const TIP = [70, 216];
const GRIP = [104, 125];

export function draw(page) {
  const d = on(BREAD);

  // The ghost, behind the board and bent a little over the joint.
  const g = ghost(page, { at: [186, 180], height: 128, lean: -4, look: [-1, 1] });

  // The breadboard, with the thickness of its near edge.
  page.line(edge(d(0, 0), d(1, 0), 3, 1, -1), { width: 2.7 });
  page.line(edge(d(1, 0), d(1, 1), 1, 3), { width: 2.7 });
  page.line(edge(d(1, 1), d(0, 1), 2, 3, -1), { width: 2.8 });
  page.line(edge(d(0, 1), d(0, 0), 2, 2), { width: 2.7 });
  const drop = ([x, y]) => [x, y + 9];
  page.line(edge(d(0, 1), drop(d(0, 1)), 0, 1), { width: 2.2, dry: 0 });
  page.line(edge(d(1, 1), drop(d(1, 1)), 0, 1), { width: 2.2, dry: 0 });
  page.line(edge(drop(d(0, 1)), drop(d(1, 1)), 1, 2, 1), { width: 2.4 });
  // Its two rails, the trench down the middle, and the holes either side of it. The rows thin out
  // to the right, and leave room for the resistor.
  page.line(edge(d(0.05, 0.1), d(0.95, 0.1), 0, 0), { width: 1.5, tail: 0.3 });
  page.line(edge(d(0.05, 0.9), d(0.93, 0.9), 0, 0), { width: 1.5, tail: 0.3 });
  page.line(edge(d(0.02, 0.48), d(0.98, 0.48), 0, 0), { width: 1.7 });
  page.line(edge(d(0.02, 0.54), d(0.98, 0.54), 0, 0), { width: 1.7 });
  [0.2, 0.3, 0.4, 0.64, 0.73, 0.82].forEach((v, row) => {
    for (let u = 0.06, i = 0; u < 0.95; u += 0.052, i++) {
      if (i > 10 && (i * 5 + row * 3) % 8 < i - 10) continue;
      if (row === 1 && i > 1 && i < 8) continue;
      page.dot(...d(u, v), 1.25);
    }
  });
  // The resistor: a body with two bands, and a leg bent down into the board at each end.
  const r = (u, lift = 0) => [d(u, 0.3)[0], d(u, 0.3)[1] - lift];
  page.line(bent([r(0.175), r(0.2, 5), r(0.25, 5)]), { width: 1.6, dry: 0 });
  page.line(bent([r(0.36, 5), r(0.405, 5), r(0.425)]), { width: 1.6, dry: 0 });
  page.line(bent([r(0.25, 1), r(0.25, 9), r(0.36, 9), r(0.36, 1), r(0.25, 1), r(0.25, 4)]), { width: 1.9, dry: 0 });
  page.line([r(0.285, 8), r(0.285, 2)], { width: 1.5, dry: 0 });
  page.line([r(0.325, 8), r(0.325, 2)], { width: 1.5, dry: 0 });

  // The iron, along the line from the grip to the tip: a handle, a collar, a thin shaft, the tip.
  const len = Math.hypot(TIP[0] - GRIP[0], TIP[1] - GRIP[1]);
  const [ux, uy] = [(TIP[0] - GRIP[0]) / len, (TIP[1] - GRIP[1]) / len];
  const at = (along, across = 0) => [GRIP[0] + ux * along - uy * across, GRIP[1] + uy * along + ux * across];
  page.line(bent([at(24, -5.5), at(-20, -4.6), at(-24, 0), at(-20, 4.6), at(24, 5.5), at(24, -6.5)]), { width: 2.5, dry: 0 });
  page.line([at(13, -5), at(13, 5)], { width: 1.5, dry: 0 });
  page.line([at(18, -5), at(18, 5)], { width: 1.5, dry: 0 });
  page.line(bent([at(24, -3.4), at(31, -3.2), at(31, 3.2), at(24, 3.4)]), { width: 2, dry: 0 });
  page.line(edge(at(31, -1.9), at(len - 17, -1.7), 0, 0), { width: 1.7, dry: 0 });
  page.line(edge(at(31, 1.9), at(len - 17, 1.7), 0, 0), { width: 1.7, dry: 0 });
  page.red.line([at(len - 19), at(len - 8), at(len)], { width: 5, tail: 0.7, dry: 0 });
  // Its cord, which curls away off the end of the handle.
  page.line([at(-24), at(-36, -3), at(-46, 6), at(-45, 20), at(-36, 30)], { width: 1.7, dry: 0, tail: 0.3 });
  arm(page, g.left(0.6), at(2, -6));

  // The smoke, going up from the joint.
  page.line([[65, 206], [58, 190], [66, 172], [57, 154], [65, 136], [59, 120], [64, 108]], { width: 1.7, tail: 0.5, dry: 0 });
  page.line([[55, 198], [50, 185], [56, 172], [51, 160]], { width: 1.4, tail: 0.5, dry: 0 });

  // The shade under the board.
  page.hatch([[70, 278], [270, 262], [286, 270], [84, 288]], { angle: -55, gap: 7, width: 1.4 });
}
