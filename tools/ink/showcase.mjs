// An exhibition table with three small robots on it: an arm, a wheeled rover and a walker. A name
// card stands at the front with the arcade ghost doodled on it; the dot the ghost is after is the
// accent.
import { arc, bent, edge, on } from "./pen.mjs";

export const file = "public/blog-illustrations/showcase.svg";
export const title = "ink drawing of an exhibition table with a few small robots";
export const box = [300, 300];

// The table top: back left, back right, front right, front left.
const TABLE = [[46, 128], [258, 114], [288, 184], [14, 200]];

export function draw(page) {
  const t = on(TABLE);
  const ring = (x, y, rx, ry, o) => page.line(arc(x, y, rx, ry, -100, 275, 12), { width: 1.7, dry: 0, ...o });

  // The top's edges. The back one shows only between the things standing in front of it.
  page.line(edge(t(0, 0), t(0.18, 0), 3, 0), { width: 2.5, dry: 0 });
  page.line(edge(t(0.41, 0), t(0.47, 0), 0, 0), { width: 2.4, dry: 0 });
  page.line(edge(t(0.69, 0), t(0.75, 0), 0, 0), { width: 2.4, dry: 0 });
  page.line(edge(t(0.985, 0), t(1, 0), 0, 3), { width: 2.4, dry: 0 });
  page.line(edge(t(1, 0), t(1, 1), 2, 3), { width: 2.7 });
  page.line(edge(t(1, 1), t(0, 1), 2, 3, -1.5), { width: 2.8 });
  page.line(edge(t(0, 1), t(0, 0), 3, 1), { width: 2.7 });
  const drop = ([x, y], h = 8) => [x, y + h];
  page.line(edge(t(0, 1), drop(t(0, 1)), 0, 1), { width: 2.3, dry: 0 });
  page.line(edge(t(1, 1), drop(t(1, 1)), 0, 1), { width: 2.3, dry: 0 });
  page.line(edge(drop(t(0, 1)), drop(t(1, 1)), 1, 2, -1.5), { width: 2.5 });
  // Its legs: the front pair whole, the back pair showing only below the top.
  const leg = (x, y, to, lean, o = {}) => {
    page.line(edge([x, y], [x + lean, to], 0, 2), { width: 2.5, ...o });
    page.line(edge([x + 8, y], [x + 7 + lean, to - 1], 0, 1), { width: 2.3, ...o });
    page.line([[x + lean - 1, to + 1], [x + 8 + lean, to]], { width: 2, dry: 0 });
  };
  leg(24, 209, 284, 2);
  leg(270, 193, 268, -2);
  leg(60, 207, 228, 1, { width: 2 });
  leg(240, 195, 216, -1, { width: 2 });
  page.line(edge([35, 252], [269, 238], 0, 0, -1), { width: 1.7, tail: 0.2 });

  // The arm: a base, two links on round joints, and a gripper open at the end.
  const [bx, by] = t(0.3, 0.14);
  page.line(bent([[bx - 20, by + 2], [bx - 16, by - 10], [bx + 16, by - 11], [bx + 21, by + 1]]), { width: 2.4, dry: 0 });
  page.line(edge([bx - 22, by + 2], [bx + 23, by + 1], 0, 0, 1.5), { width: 2.5, dry: 0 });
  const [shoulder, elbow, wrist] = [[bx, by - 20], [bx - 22, by - 66], [bx + 16, by - 92]];
  const link = (a, b, w, gap) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const [nx, ny] = [(-(b[1] - a[1]) / len) * w, ((b[0] - a[0]) / len) * w];
    const [dx, dy] = [((b[0] - a[0]) / len) * gap, ((b[1] - a[1]) / len) * gap];
    page.line(edge([a[0] + nx + dx, a[1] + ny + dy], [b[0] + nx - dx, b[1] + ny - dy], 0, 0), { width: 2.4 });
    page.line(edge([a[0] - nx + dx, a[1] - ny + dy], [b[0] - nx - dx, b[1] - ny - dy], 0, 0), { width: 2.4 });
  };
  link([bx, by - 11], shoulder, 5, 1);
  link(shoulder, elbow, 4.5, 8);
  link(elbow, wrist, 4, 7);
  ring(...shoulder, 8, 8, { width: 2.2 });
  page.dot(...shoulder, 1.8);
  ring(...elbow, 7, 7, { width: 2.1 });
  page.dot(...elbow, 1.7);
  ring(...wrist, 5.5, 5.5, { width: 2 });
  page.line(bent([[wrist[0] + 4, wrist[1] - 4], [wrist[0] + 15, wrist[1] - 12], [wrist[0] + 27, wrist[1] - 8]]), { width: 2.2, dry: 0 });
  page.line(bent([[wrist[0] + 5, wrist[1] + 3], [wrist[0] + 15, wrist[1] + 9], [wrist[0] + 27, wrist[1] + 3]]), { width: 2.2, dry: 0 });

  // The rover: a box on two wheels, and a sensor with two round eyes on a short neck.
  const [rx, ry] = t(0.56, 0.8);
  page.line(bent([[rx - 28, ry - 6], [rx - 29, ry - 26], [rx + 29, ry - 29], [rx + 30, ry - 8]]), { width: 2.5 });
  page.line(edge([rx - 6, ry - 5], [rx + 8, ry - 6], 0, 0), { width: 2.3, dry: 0 });
  page.line(bent([[rx - 29, ry - 26], [rx - 20, ry - 36], [rx + 36, ry - 39], [rx + 29, ry - 29]]), { width: 2.2 });
  page.line(edge([rx + 36, ry - 39], [rx + 37, ry - 19], 0, 0), { width: 2.1, dry: 0 });
  page.line(edge([rx + 37, ry - 19], [rx + 31, ry - 10], 0, 0), { width: 2, dry: 0 });
  for (const x of [rx - 17, rx + 19]) {
    ring(x, ry - 3, 11, 11, { width: 2.5 });
    ring(x, ry - 3, 3.4, 3.4, { width: 1.5 });
  }
  page.line(edge([rx - 2, ry - 37], [rx - 2, ry - 46], 0, 0), { width: 2, dry: 0 });
  page.line(edge([rx + 6, ry - 37], [rx + 6, ry - 46], 0, 0), { width: 2, dry: 0 });
  page.line(bent([[rx - 19, ry - 46], [rx + 23, ry - 48], [rx + 24, ry - 64], [rx - 18, ry - 62], [rx - 19, ry - 44]]), { width: 2.3 });
  ring(rx - 8, ry - 54, 5.6, 5.6, { width: 1.9 });
  ring(rx + 12, ry - 55, 5.6, 5.6, { width: 1.9 });

  // The walker: a head with a visor and an aerial, a body, arms hanging and two short legs.
  const [wx, wy] = t(0.82, 0.5);
  page.line(bent([[wx - 12, wy - 44], [wx + 13, wy - 45], [wx + 14, wy - 64], [wx - 13, wy - 63], [wx - 12, wy - 42]]), { width: 2.4 });
  page.line(bent([[wx - 7, wy - 57], [wx + 8, wy - 58], [wx + 8, wy - 52], [wx - 7, wy - 51], [wx - 7, wy - 58]]), { width: 1.6, dry: 0 });
  page.line(edge([wx, wy - 64], [wx + 1, wy - 76], 0, 0), { width: 1.8, dry: 0 });
  page.dot(wx + 1, wy - 78, 2.6);
  page.line(edge([wx - 3, wy - 43], [wx - 3, wy - 39], 0, 0), { width: 1.8, dry: 0 });
  page.line(edge([wx + 4, wy - 43], [wx + 4, wy - 39], 0, 0), { width: 1.8, dry: 0 });
  page.line(bent([[wx - 15, wy - 13], [wx - 16, wy - 39], [wx + 17, wy - 40], [wx + 17, wy - 14], [wx - 17, wy - 13]]), { width: 2.5 });
  page.line(bent([[wx - 9, wy - 33], [wx - 2, wy - 33], [wx - 2, wy - 27], [wx - 9, wy - 27], [wx - 9, wy - 34]]), { width: 1.5, dry: 0 });
  page.line([[wx - 16, wy - 36], [wx - 23, wy - 30], [wx - 23, wy - 17]], { width: 2.2, dry: 0 });
  page.line([[wx + 17, wy - 37], [wx + 24, wy - 31], [wx + 24, wy - 18]], { width: 2.2, dry: 0 });
  for (const x of [wx - 8, wx + 8]) {
    page.line(edge([x - 3, wy - 13], [x - 3, wy - 2], 0, 0), { width: 2, dry: 0 });
    page.line(edge([x + 3, wy - 13], [x + 3, wy - 2], 0, 0), { width: 2, dry: 0 });
    page.line(bent([[x - 6, wy - 2], [x + 7, wy - 2], [x + 7, wy + 2], [x - 6, wy + 2], [x - 6, wy - 3]]), { width: 1.8, dry: 0 });
  }

  // The name card, folded like a tent, and the ghost on it: up one side, over the dome and down
  // the other, then the hem, as it is drawn on the club's arcade page.
  const [cx, cy] = t(0.1, 0.9);
  const card = [[cx - 4, cy - 40], [cx + 52, cy - 43], [cx + 56, cy - 3], [cx, cy]];
  const c = on(card);
  page.line(edge(card[0], card[1], 2, 1), { width: 2.3 });
  page.line(edge(card[1], card[2], 1, 2), { width: 2.3 });
  page.line(edge(card[2], card[3], 2, 2), { width: 2.4 });
  page.line(edge(card[3], card[0], 1, 2), { width: 2.3 });
  page.line(edge(card[1], [cx + 64, cy - 14], 0, 0), { width: 1.9, dry: 0 });
  page.line(edge([cx + 64, cy - 14], card[2], 0, -1), { width: 1.7, dry: 0 });
  page.line([c(0.12, 0.8), c(0.12, 0.5), c(0.15, 0.3), c(0.25, 0.2), c(0.36, 0.3), c(0.39, 0.5), c(0.39, 0.8)], { width: 1.9, dry: 0, tail: 0.05 });
  page.line([c(0.115, 0.79), c(0.165, 0.68), c(0.21, 0.8), c(0.255, 0.68), c(0.3, 0.8), c(0.345, 0.68), c(0.395, 0.79)], { width: 1.5, dry: 0, tail: 0.05 });
  page.dot(...c(0.215, 0.43), 1.7);
  page.dot(...c(0.315, 0.43), 1.7);
  page.dot(...c(0.56, 0.54), 1.4);
  page.red.dot(...c(0.78, 0.53), 3.6);

  // Shade in the card's fold, on the top beside the rover, and on the floor.
  page.hatch([card[1], [cx + 64, cy - 14], card[2]], { angle: -55, gap: 4.5, width: 1.2 });
  page.hatch([[rx - 2, ry + 10], [rx + 40, ry + 7], [rx + 50, ry + 12], [rx + 8, ry + 15]], { angle: -55, gap: 6, width: 1.3 });
  page.hatch([[58, 262], [250, 246], [268, 256], [78, 274]], { angle: -55, gap: 7, width: 1.4 });
}
