// An exhibition table with a row of small robots on it, and the ghost standing in the row between
// the walker and the rover as if it were one more exhibit. Its eyes are the accent.
import { arc, bent, edge, on } from "./pen.mjs";
import { ghost } from "./ghost.mjs";

export const file = "public/blog-illustrations/showcase-table.svg";
export const title = "ink drawing of a ghost squeezed in among small robots on an exhibition table";
export const box = [300, 300];

// The table top: back left, back right, front right, front left.
const TABLE = [[30, 120], [272, 106], [288, 176], [14, 192]];
// The stretches of the back edge that show between the things standing in front of it.
const BACK = [[30, 45], [59, 90], [121, 128], [212, 218], [262, 272]];

export function draw(page) {
  const t = on(TABLE);
  const ring = (x, y, r, o) => page.line(arc(x, y, r, r, -100, 275, 12), { width: 1.7, dry: 0, ...o });
  const back = (x) => [x, TABLE[0][1] + ((TABLE[1][1] - TABLE[0][1]) * (x - TABLE[0][0])) / (TABLE[1][0] - TABLE[0][0])];

  // The top's edges, the thickness of the near one, and the legs: the front pair whole, the back
  // pair showing only below the top.
  BACK.forEach(([a, b], i) => page.line(edge(back(a), back(b), i ? 0 : 3, i < BACK.length - 1 ? 0 : 3), { width: 2.4, dry: 0 }));
  page.line(edge(t(1, 0), t(1, 1), 2, 3), { width: 2.7 });
  page.line(edge(t(1, 1), t(0, 1), 2, 3, -1.5), { width: 2.8 });
  page.line(edge(t(0, 1), t(0, 0), 3, 1), { width: 2.7 });
  const drop = ([x, y], h = 8) => [x, y + h];
  page.line(edge(t(0, 1), drop(t(0, 1)), 0, 1), { width: 2.3, dry: 0 });
  page.line(edge(t(1, 1), drop(t(1, 1)), 0, 1), { width: 2.3, dry: 0 });
  page.line(edge(drop(t(0, 1)), drop(t(1, 1)), 1, 2, -1.5), { width: 2.5 });
  const leg = (x, y, to, lean, o = {}) => {
    page.line(edge([x, y], [x + lean, to], 0, 2), { width: 2.5, ...o });
    page.line(edge([x + 8, y], [x + 7 + lean, to - 1], 0, 1), { width: 2.3, ...o });
    page.line([[x + lean - 1, to + 1], [x + 8 + lean, to]], { width: 2, dry: 0 });
  };
  leg(24, 201, 285, 2);
  leg(270, 185, 270, -2);
  leg(60, 199, 220, 1, { width: 2 });
  leg(240, 187, 208, -1, { width: 2 });
  page.line(edge([35, 250], [269, 236], 0, 0, -1), { width: 1.7, tail: 0.2 });

  // The arm, at the back on the left: a base, two links on round joints, a gripper open at the end.
  {
    const k = 0.9;
    const p = (x, y) => [56 + x * k, 146 + y * k];
    page.line(bent([p(-20, 2), p(-16, -10), p(16, -11), p(21, 1)]), { width: 2.4, dry: 0 });
    page.line(edge(p(-22, 2), p(23, 1), 0, 0, 1.5), { width: 2.5, dry: 0 });
    const [shoulder, elbow, wrist] = [p(0, -20), p(-22, -66), p(16, -92)];
    const link = (a, b, w, gap) => {
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const [nx, ny] = [(-(b[1] - a[1]) / len) * w, ((b[0] - a[0]) / len) * w];
      const [dx, dy] = [((b[0] - a[0]) / len) * gap, ((b[1] - a[1]) / len) * gap];
      page.line(edge([a[0] + nx + dx, a[1] + ny + dy], [b[0] + nx - dx, b[1] + ny - dy], 0, 0), { width: 2.3 });
      page.line(edge([a[0] - nx + dx, a[1] - ny + dy], [b[0] - nx - dx, b[1] - ny - dy], 0, 0), { width: 2.3 });
    };
    link(p(0, -11), shoulder, 4.5, 1);
    link(shoulder, elbow, 4, 7);
    link(elbow, wrist, 3.6, 6);
    ring(...shoulder, 7.2, { width: 2.2 });
    page.dot(...shoulder, 1.7);
    ring(...elbow, 6.3, { width: 2.1 });
    page.dot(...elbow, 1.6);
    ring(...wrist, 5, { width: 2 });
    page.line(bent([p(20, -96), p(31, -104), p(43, -100)]), { width: 2.2, dry: 0 });
    page.line(bent([p(21, -89), p(31, -83), p(43, -89)]), { width: 2.2, dry: 0 });
  }

  // The walker: a head with a visor and an aerial, a body, arms hanging and two short legs.
  {
    const k = 0.9;
    const p = (x, y) => [105.5 + x * k, 166 + y * k];
    page.line(bent([p(-12, -44), p(13, -45), p(14, -64), p(-13, -63), p(-12, -42)]), { width: 2.4 });
    page.line(bent([p(-7, -57), p(8, -58), p(8, -52), p(-7, -51), p(-7, -58)]), { width: 1.6, dry: 0 });
    page.line(edge(p(0, -64), p(1, -76), 0, 0), { width: 1.8, dry: 0 });
    page.dot(...p(1, -78), 2.5);
    page.line(edge(p(-3, -43), p(-3, -39), 0, 0), { width: 1.8, dry: 0 });
    page.line(edge(p(4, -43), p(4, -39), 0, 0), { width: 1.8, dry: 0 });
    page.line(bent([p(-15, -13), p(-16, -39), p(17, -40), p(17, -14), p(-17, -13)]), { width: 2.5 });
    page.line(bent([p(-9, -33), p(-2, -33), p(-2, -27), p(-9, -27), p(-9, -34)]), { width: 1.5, dry: 0 });
    page.line([p(-16, -36), p(-23, -30), p(-23, -17)], { width: 2.2, dry: 0 });
    page.line([p(17, -37), p(24, -31), p(24, -18)], { width: 2.2, dry: 0 });
    for (const x of [-8, 8]) {
      page.line(edge(p(x - 3, -13), p(x - 3, -2), 0, 0), { width: 2, dry: 0 });
      page.line(edge(p(x + 3, -13), p(x + 3, -2), 0, 0), { width: 2, dry: 0 });
      page.line(bent([p(x - 6, -2), p(x + 7, -2), p(x + 7, 2), p(x - 6, 2), p(x - 6, -3)]), { width: 1.8, dry: 0 });
    }
  }

  // The ghost, in the row with them and looking straight ahead as they do.
  ghost(page, { at: [170, 172], height: 96, eyes: "red" });

  // The rover: a box on two wheels, and a sensor with two round eyes on a short neck.
  {
    const k = 0.88;
    const p = (x, y) => [238 + x * k, 158 + y * k];
    page.line(bent([p(-28, -6), p(-29, -26), p(29, -29), p(30, -8)]), { width: 2.5 });
    page.line(edge(p(-6, -5), p(8, -6), 0, 0), { width: 2.3, dry: 0 });
    page.line(bent([p(-29, -26), p(-20, -36), p(36, -39), p(29, -29)]), { width: 2.2 });
    page.line(edge(p(36, -39), p(37, -19), 0, 0), { width: 2.1, dry: 0 });
    page.line(edge(p(37, -19), p(31, -10), 0, 0), { width: 2, dry: 0 });
    for (const x of [-17, 19]) {
      ring(...p(x, -3), 11 * k, { width: 2.5 });
      ring(...p(x, -3), 3.2, { width: 1.5 });
    }
    page.line(edge(p(-2, -37), p(-2, -46), 0, 0), { width: 2, dry: 0 });
    page.line(edge(p(6, -37), p(6, -46), 0, 0), { width: 2, dry: 0 });
    page.line(bent([p(-19, -46), p(23, -48), p(24, -64), p(-18, -62), p(-19, -44)]), { width: 2.3 });
    ring(...p(-8, -54), 5, { width: 1.9 });
    ring(...p(12, -55), 5, { width: 1.9 });
  }

  // Shade on the top beside the arm and the rover, and on the floor.
  page.hatch([[62, 152], [84, 151], [92, 157], [70, 158]], { angle: -55, gap: 5, width: 1.3 });
  page.hatch([[240, 170], [272, 167], [280, 172], [250, 175]], { angle: -55, gap: 5.5, width: 1.3 });
  page.hatch([[58, 262], [250, 246], [268, 256], [78, 274]], { angle: -55, gap: 7, width: 1.4 });
}
