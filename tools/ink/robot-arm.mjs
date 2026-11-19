// A small ghost at the foot of an industrial robot arm, head back, looking up at the gripper the
// arm holds out over it. The ghost's eyes are the accent.
import { arc, bent, edge } from "./pen.mjs";
import { ghost } from "./ghost.mjs";

export const file = "public/blog-illustrations/robot-arm.svg";
export const title = "ink drawing of a small ghost looking up at a huge industrial robot arm";
export const box = [300, 300];

// The joints, and how large each one's housing is.
const SHOULDER = [224, 180];
const ELBOW = [190, 54];
const WRIST = [98, 58];
const R = { shoulder: 26, elbow: 20, wrist: 11 };

export function draw(page) {
  const ring = ([x, y], r, o) => page.line(arc(x, y, r, r, -100, 275, 16), { width: 2.2, dry: 0, ...o });
  // A place measured from `a` towards `b` (along) and to the right of that way (across).
  const from = (a, b) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const [dx, dy] = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
    return (along, across = 0) => [a[0] + dx * along - dy * across, a[1] + dy * along + dx * across];
  };
  // A link between two housings: two sides, `wa` apart at one and `wb` at the other, each
  // starting and stopping on the housing's rim.
  const link = (a, b, wa, wb, ra, rb, o) => {
    const [out, back] = [from(a, b), from(b, a)];
    for (const s of [1, -1]) page.line(edge(out(Math.sqrt(ra * ra - wa * wa) + 1, wa * s), back(Math.sqrt(rb * rb - wb * wb) + 1, -wb * s), 0, 0, s * 0.8), { width: 2.6, ...o });
  };

  // The floor, and the ghost standing on it with its head back.
  page.line(edge([20, 271], [284, 270], 0, 0, -1), { width: 2.3 });
  ghost(page, { at: [60, 268], height: 64, lean: -8, look: [0.7, -1], eyes: "red" });

  // The foot bolted to the floor, the pedestal and the turret that turns on it.
  page.line(bent([[168, 269], [169, 259], [267, 259], [268, 269]]), { width: 2.6, dry: 0 });
  page.dot(180, 264, 1.5);
  page.dot(256, 264, 1.5);
  page.line(bent([[184, 259], [195, 223], [251, 223], [259, 259]]), { width: 2.7 });
  page.line(bent([[201, 223], [202, 208], [246, 208], [248, 223]]), { width: 2.4, dry: 0 });

  // The shoulder: a big housing with its cover bolted on.
  ring(SHOULDER, R.shoulder, { width: 2.8 });
  ring(SHOULDER, 11, { width: 1.8 });
  page.dot(...SHOULDER, 2.6);
  for (let a = 20; a < 360; a += 60) page.dot(SHOULDER[0] + Math.cos((a * Math.PI) / 180) * 18.5, SHOULDER[1] + Math.sin((a * Math.PI) / 180) * 18.5, 1.3);

  // The upper arm, the elbow, and the forearm reaching out over the ghost.
  link(SHOULDER, ELBOW, 15, 11.5, R.shoulder, R.elbow, { width: 2.8 });
  ring(ELBOW, R.elbow, { width: 2.6 });
  ring(ELBOW, 8, { width: 1.7 });
  page.dot(...ELBOW, 2.2);
  link(ELBOW, WRIST, 11, 7.5, R.elbow, R.wrist, { width: 2.6 });
  ring(WRIST, R.wrist, { width: 2.3 });
  page.dot(...WRIST, 1.9);
  // The motor that sticks out behind the elbow, with its cooling fins.
  const rear = from(ELBOW, [2 * ELBOW[0] - WRIST[0], 2 * ELBOW[1] - WRIST[1]]);
  page.line(bent([rear(17, 12), rear(50, 12), rear(50, -12), rear(17, -12)]), { width: 2.5 });
  for (const along of [29, 36, 43]) page.line([rear(along, -7.5), rear(along, 7.5)], { width: 1.4, tail: 0.4, dry: 0 });
  // A cable hanging in a loop from the shoulder up to that motor.
  page.line([[249, 171], [268, 144], [268, 108], [246, 77]], { width: 2, dry: 0, tail: 0.05 });

  // The tool: a neck, a flange and a two-fingered gripper, open, pointed down at the ghost.
  const tool = from(WRIST, [52, 208]);
  page.line(edge(tool(11, 6), tool(29, 6), 0, 0), { width: 2.3, dry: 0 });
  page.line(edge(tool(11, -6), tool(29, -6), 0, 0), { width: 2.3, dry: 0 });
  page.line(bent([tool(30, -18), tool(30, 18), tool(37, 18), tool(37, -18), tool(29, -18)]), { width: 2.3, dry: 0 });
  for (const s of [1, -1]) page.line(bent([tool(37, 13 * s), tool(60, 16 * s), tool(73, 7 * s)]), { width: 2.5, dry: 0, tail: 0.1 });

  // Shade down the arm's far side, on the pedestal and on the floor under it.
  const up = from(SHOULDER, ELBOW);
  page.hatch([up(30, 14), up(96, 11), up(96, 4), up(30, 6)], { angle: -55, gap: 7, width: 1.3 });
  page.hatch([[237, 226], [250, 226], [257, 257], [241, 257]], { angle: -55, gap: 6, width: 1.3 });
  page.hatch([[150, 276], [268, 273], [284, 281], [168, 285]], { angle: -55, gap: 7, width: 1.4 });
}
