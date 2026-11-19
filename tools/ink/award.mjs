// The ghost on a low stage under a spotlight, holding an award plaque up over its head with both
// arms. The star on the plaque is the accent.
import { bent, edge, turn } from "./pen.mjs";
import { arm, ghost } from "./ghost.mjs";

export const file = "public/blog-illustrations/award.svg";
export const title = "ink drawing of a ghost holding up an award plaque on a stage";
export const box = [300, 300];

// The plaque is drawn square on, then held at this tilt about its middle.
const PLAQUE = [182, 78];
const TILT = -5;
const LAMP = [42, 38];

export function draw(page) {
  const g = ghost(page, { at: [182, 236], height: 112, look: [0.2, -1] });

  // The plaque: a board, the plate screwed to it, a star and two engraved lines.
  const held = (points) => turn(points.map(([x, y]) => [PLAQUE[0] + x, PLAQUE[1] + y]), TILT, PLAQUE);
  const [a, b, c, d] = held([[-54, -31], [54, -31], [54, 31], [-54, 31]]);
  page.line(edge(a, b, 2, 3, -0.8), { width: 2.8 });
  page.line(edge(b, c, 1, 2), { width: 2.7 });
  page.line(edge(c, d, 3, 2, -0.8), { width: 2.8 });
  page.line(edge(d, a, 2, 1), { width: 2.7 });
  // The board's thickness shows along its foot and its right side.
  page.line(held([[-50, 36], [58, 36], [58, 36], [58, -26]]), { width: 2, tail: 0.3 });
  page.line(bent(held([[-44, -21], [44, -21], [44, 21], [-44, 21], [-44, -22]])), { width: 1.6 });
  for (const [x, y] of [[-39, -16], [39, -16], [39, 16], [-39, 16]]) page.dot(...held([[x, y]])[0], 1.3);
  page.line(held([[-26, 7], [0, 6.4], [26, 7]]), { width: 1.5, tail: 0.3, dry: 0 });
  page.line(held([[-17, 14], [0, 13.5], [15, 14]]), { width: 1.4, tail: 0.3, dry: 0 });
  const star = Array.from({ length: 10 }, (_, i) => {
    const turnBy = ((-90 + i * 36 + 4) * Math.PI) / 180;
    const r = i % 2 ? 3.9 : 9.6;
    return [Math.cos(turnBy) * r, -8 + Math.sin(turnBy) * r];
  });
  page.red.blob(held(star.flatMap((p) => [p, p])));
  // It catches the light.
  for (const [from, to] of [[[8, -8], [16, -17]], [[11, -1], [23, -3]], [[1, -11], [3, -22]]]) page.line([[b[0] + from[0], b[1] + from[1]], [b[0] + to[0], b[1] + to[1]]], { width: 1.6, tail: 0.5, dry: 0 });

  // Both arms go straight up to its foot.
  arm(page, g.left(0.3), held([[-47, 36]])[0], 0.1);
  arm(page, g.right(0.3), held([[50, 36]])[0], -0.1);

  // The stage: its front edge, and the riser below it down to the floor.
  page.line(edge([20, 244], [282, 241], 0, 0, -1.2), { width: 2.8 });
  page.line(edge([25, 269], [279, 267], 0, 0, -1), { width: 2.4 });
  page.line(edge([23, 244], [24, 269], 1, 2), { width: 2.4, dry: 0 });
  page.line(edge([279, 241], [280, 267], 2, 1), { width: 2.4, dry: 0 });
  for (const x of [84, 150, 218]) page.line(edge([x, 247], [x + 0.5, 263], 0, 0), { width: 1.4, tail: 0.3, dry: 0 });

  // The spotlight, hung at the top left and turned on the ghost.
  const aim = [g.top[0], g.top[1] + 40];
  const len = Math.hypot(aim[0] - LAMP[0], aim[1] - LAMP[1]);
  const [dx, dy] = [(aim[0] - LAMP[0]) / len, (aim[1] - LAMP[1]) / len];
  const lamp = (along, across) => [LAMP[0] + dx * along - dy * across, LAMP[1] + dy * along + dx * across];
  page.line(bent([lamp(-13, 7), lamp(11, 10), lamp(11, -10), lamp(-13, -7), lamp(-13, 8)]), { width: 2.4, dry: 0 });
  page.line(edge(lamp(11, 10), lamp(16, 12), 0, 0), { width: 2, dry: 0 });
  page.line(edge(lamp(11, -10), lamp(16, -12), 0, 0), { width: 2, dry: 0 });
  page.line([lamp(-4, -8), [LAMP[0] + 2, 17]], { width: 2, dry: 0 });
  page.line(edge([LAMP[0] - 10, 16], [LAMP[0] + 14, 15], 0, 0), { width: 2.2, dry: 0 });
  // Its beam is two lines. The far one passes behind the plaque and the ghost.
  const far = [264, 241];
  const along = (t) => [lamp(19, -13)[0] + (far[0] - lamp(19, -13)[0]) * t, lamp(19, -13)[1] + (far[1] - lamp(19, -13)[1]) * t];
  page.line(edge(lamp(19, 13), [116, 241], 0, -3), { width: 1.5, tail: 0.3 });
  page.line([along(0), along(0.3)], { width: 1.5, tail: 0.2, dry: 0 });
  page.line([along(0.84), along(0.985)], { width: 1.5, tail: 0.2, dry: 0 });

  // Shade on the riser and on the floor in front of it.
  page.hatch([[226, 247], [276, 246], [276, 263], [226, 264]], { angle: -55, gap: 6.5, width: 1.3 });
  page.hatch([[60, 276], [250, 273], [270, 281], [82, 285]], { angle: -55, gap: 7, width: 1.4 });
}
