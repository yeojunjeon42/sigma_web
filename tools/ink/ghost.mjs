// The ghost: the SIGMA mark has the shape of Pac-Man, so the ghost that chases him is the club's
// too, and every blog cover is a scene with it. It is one figure, drawn here once: the arcade
// ghost's outline (a round top, straight sides, a wavy hem) and two dot eyes, nothing else. A
// scene says where it stands, how tall it is and how much of it shows; the proportions are fixed.
import { arc, turn } from "./pen.mjs";

const WIDE = 0.8; // its width, as a share of its height
const DOME = 0.4; // how much of the height the round top takes
const HEM = 0.12; // how deep the hem's waves are
const EYES = { down: 0.41, apart: 0.2, size: 0.052 };
const PEN = 2.2;

// Draws the ghost standing on `at` (the middle of its hem), `height` tall and leaning `lean`
// degrees. `look` moves the eyes a little towards something ([-1..1, -1..1]). `eyes` is "ink" or
// "red": a cover's one red place is the eyes or a prop, never both. `shown` is how much of it is
// drawn from the top down, for a ghost that is behind or inside something (1 draws the hem too).
// Returns places on it in the drawing's own units, so a scene can put a prop against it.
export function ghost(page, { at, height: h, lean = 0, look = [0, 0], eyes = "ink", shown = 1 }) {
  const w = h * WIDE;
  const place = (points) => turn(points.map(([x, y]) => [at[0] + x, at[1] - h + y]), lean, at);
  const one = (x, y) => place([[x, y]])[0];
  const foot = Math.min(1, shown) * h;
  const dome = arc(0, DOME * h, w / 2, DOME * h, 180, 360, 10);
  page.line(place([[-w / 2, foot], [-w / 2, DOME * h + (foot - DOME * h) * 0.5], ...dome, [w / 2, DOME * h + (foot - DOME * h) * 0.5], [w / 2, foot]]), { width: PEN, dry: 0, tail: 0.04 });
  if (shown >= 1) {
    const d = HEM * h;
    page.line(place([[-w / 2 - 0.5, h - 1], [-w / 3, h - d], [-w / 6, h], [0, h - d], [w / 6, h], [w / 3, h - d], [w / 2 + 0.5, h - 1]]), { width: PEN - 0.3, dry: 0, tail: 0.04 });
  }
  const mark = eyes === "red" ? page.red : page;
  for (const side of [-1, 1]) mark.dot(...one(side * EYES.apart * w + look[0] * 0.05 * w, EYES.down * h + look[1] * 0.04 * h), Math.max(2.1, EYES.size * h));
  return {
    top: one(0, 0),
    left: (down = 0.6) => one(-w / 2, down * h),
    right: (down = 0.6) => one(w / 2, down * h),
    width: w,
  };
}

// What the ghost holds a thing with: one short stroke from its side to the thing, bowed a little,
// with no hand drawn. `from` is a place on the ghost (see what `ghost` returns), `to` is the prop.
export function arm(page, from, to, bow = 0.18) {
  const [dx, dy] = [to[0] - from[0], to[1] - from[1]];
  const mid = [(from[0] + to[0]) / 2 + dy * bow, (from[1] + to[1]) / 2 - dx * bow];
  page.line([from, mid, to], { width: PEN - 0.4, dry: 0, tail: 0.1 });
}
