// An Arduino board behind a breadboard, three jumper wires run from the board's header down into
// the breadboard's holes. One of the wires is the accent.
import { arc, bent, edge, on } from "./pen.mjs";

export const file = "public/blog-illustrations/arduino.svg";
export const title = "ink drawing of a breadboard with an Arduino board and jumper wires";
export const box = [300, 300];

// Each top face: back left, back right, front right, front left.
const BOARD = [[70, 44], [226, 28], [242, 112], [80, 132]];
const BREAD = [[28, 174], [250, 156], [276, 244], [42, 264]];

// A box standing on a face. Seen from above and in front, it shows its top and its front.
function crate(page, at, [u0, v0, u1, v1], h, o = {}) {
  const lift = ([x, y]) => [x, y - h];
  const [bl, br, fr, fl] = [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)];
  page.line(edge(lift(bl), lift(br), 1, 2), o);
  page.line(edge(lift(br), lift(fr), 1, 1), o);
  page.line(edge(lift(fr), lift(fl), 2, 1), o);
  page.line(edge(lift(fl), lift(bl), 1, 2), o);
  page.line(edge(lift(fl), fl, 0, 1), { ...o, dry: 0 });
  page.line(edge(lift(fr), fr, 0, 1), { ...o, dry: 0 });
  page.line(edge(fl, fr, 1, 2), o);
}

export function draw(page) {
  const b = on(BOARD);
  const d = on(BREAD);

  // The Arduino: its edges, broken on the left where the two sockets hang over.
  page.line(edge(b(-0.02, 0), b(1, 0), 0, 3, -1), { width: 2.7 });
  page.line(edge(b(1, 0), b(1, 1), 2, 2), { width: 2.6 });
  page.line(edge(b(1, 1), b(0, 1), 3, 2, -1), { width: 2.7 });
  page.line(edge(b(0, 1), b(0, 0.88), 2, 0), { width: 2.5, dry: 0 });
  page.line(edge(b(0, 0.6), b(0, 0.42), 0, 0), { width: 2.5, dry: 0 });
  page.line(edge(b(0, 1.04), b(1, 1.04), -1, 0, -1), { width: 1.8, tail: 0.3 });
  // The USB socket and the power jack.
  crate(page, b, [-0.08, 0.16, 0.17, 0.4], 11, { width: 2.3 });
  crate(page, b, [-0.03, 0.66, 0.16, 0.86], 10, { width: 2.3 });
  page.hatch([b(-0.02, 0.76), b(0.15, 0.76), b(0.15, 0.86), b(-0.02, 0.86)], { angle: -55, gap: 5, width: 1.3 });
  // Two rows of header sockets along the long edges, a dot for each pin.
  crate(page, b, [0.34, 0.05, 0.96, 0.13], 4, { width: 1.8 });
  crate(page, b, [0.42, 0.87, 0.96, 0.95], 4, { width: 1.8 });
  for (let u = 0.38; u < 0.94; u += 0.062) page.dot(b(u, 0.09)[0], b(u, 0.09)[1] - 4, 1.2);
  for (let u = 0.46; u < 0.94; u += 0.062) page.dot(b(u, 0.91)[0], b(u, 0.91)[1] - 4, 1.2);
  // The long chip with its legs, a smaller one, the reset button and two capacitors.
  page.line(bent([b(0.48, 0.38), b(0.92, 0.38), b(0.92, 0.54), b(0.48, 0.54), b(0.48, 0.36)]), { width: 2.1 });
  for (let u = 0.52; u < 0.91; u += 0.055) {
    page.line([b(u, 0.38), b(u, 0.33)], { width: 1.4, dry: 0 });
    page.line([b(u, 0.54), b(u, 0.59)], { width: 1.4, dry: 0 });
  }
  page.line(arc(...b(0.49, 0.46), 3, 3.5, -80, 80, 5), { width: 1.3, dry: 0 });
  page.line(bent([b(0.3, 0.24), b(0.42, 0.24), b(0.42, 0.42), b(0.3, 0.42), b(0.3, 0.22)]), { width: 1.8 });
  page.line(bent([b(0.2, 0.03), b(0.28, 0.03), b(0.28, 0.13), b(0.2, 0.13), b(0.2, 0.02)]), { width: 1.6, dry: 0 });
  page.dot(...b(0.24, 0.08), 1.7);
  for (const u of [0.26, 0.36]) {
    const [x, y] = b(u, 0.76);
    page.line(arc(x, y - 6, 6, 4, -200, 170, 10), { width: 1.6, dry: 0 });
    page.line(arc(x, y, 6, 4, 0, 180, 6), { width: 1.6, dry: 0 });
    page.line([[x - 6, y - 6], [x - 6, y]], { width: 1.5, dry: 0 });
    page.line([[x + 6, y - 6], [x + 6, y]], { width: 1.5, dry: 0 });
  }

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
  // to the right, as they do when a pattern is only indicated.
  page.line(edge(d(0.05, 0.1), d(0.95, 0.1), 0, 0), { width: 1.5, tail: 0.3 });
  page.line(edge(d(0.05, 0.9), d(0.93, 0.9), 0, 0), { width: 1.5, tail: 0.3 });
  page.line(edge(d(0.02, 0.47), d(0.98, 0.47), 0, 0), { width: 1.7 });
  page.line(edge(d(0.02, 0.53), d(0.98, 0.53), 0, 0), { width: 1.7 });
  [0.2, 0.28, 0.36, 0.64, 0.72, 0.8].forEach((v, row) => {
    for (let u = 0.06, i = 0; u < 0.95; u += 0.052, i++) {
      if (i > 10 && (i * 5 + row * 3) % 8 < i - 10) continue;
      page.dot(...d(u, v), 1.25);
    }
  });

  // The jumper wires: each stands up out of a header socket in its plug, falls over the board's
  // edge and goes down into a hole through another.
  const wire = (pen, u, through, hole, o) => {
    const [from, to] = [b(u, 0.91), d(...hole)];
    page.line([[from[0], from[1] - 4], [from[0] + 0.5, from[1] - 13]], { width: 4.4, tail: 0.05, dry: 0 });
    page.line([[to[0], to[1] - 1], [to[0] - 0.5, to[1] - 10]], { width: 4.4, tail: 0.05, dry: 0 });
    pen.line([[from[0] + 0.5, from[1] - 13], ...through, [to[0] - 0.5, to[1] - 10]], { width: 2.4, tail: 0.04, dry: 0, ...o });
  };
  wire(page, 0.5, [[158, 92], [149, 96], [141, 128], [112, 150], [94, 168]], [0.268, 0.28]);
  wire(page, 0.63, [[183, 88], [190, 100], [190, 140], [172, 178], [160, 198]], [0.528, 0.64]);
  wire(page.red, 0.86, [[221, 84], [232, 92], [248, 124], [244, 150], [226, 162]], [0.84, 0.28], { width: 2.6 });

  // An arrow to the socket the cable goes in, and the shade under each board.
  page.hatch([b(0.02, 1.1), b(0.3, 1.09), b(0.33, 1.18), b(0.06, 1.2)], { angle: -55, gap: 6.5, width: 1.3 });
  page.arrow([22, 40], [50, 62], { width: 1.5 });
  page.hatch([[70, 276], [270, 256], [286, 264], [84, 286]], { angle: -55, gap: 7, width: 1.4 });
}
