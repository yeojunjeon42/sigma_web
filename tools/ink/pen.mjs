// What a drawing is made with: a sheet that collects marks in ink and in the one accent, and a
// few ways to move points about. The pen itself is the site's (src/features/hand/stroke.ts).
import { inkArrow, inkBlob, inkDot, inkHatch, inkRect, inkStroke } from "../../src/features/hand/stroke.ts";

export function sheet() {
  const marks = { ink: [], accent: [] };
  // Every mark takes the next seed unless it names one, so no two strokes swell alike.
  let n = 0;
  const into = (list) => ({
    line: (points, o = {}) => list.push(inkStroke(points, { seed: ++n, ...o })),
    hatch: (shape, o = {}) => list.push(inkHatch(shape, { seed: ++n, ...o })),
    blob: (points, o = {}) => list.push(inkBlob(points, { seed: ++n, ...o })),
    dot: (x, y, r, o = {}) => list.push(inkDot(x, y, r, { seed: ++n, ...o })),
    rect: (x, y, w, h, o = {}) => list.push(inkRect(x, y, w, h, { seed: ++n, ...o })),
    arrow: (from, to, o = {}) => list.push(inkArrow(from, to, { seed: ++n, ...o })),
  });
  return { ...into(marks.ink), red: into(marks.accent), marks };
}

export const turn = (points, deg, [cx, cy] = [0, 0]) => {
  const [cos, sin] = [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)];
  return points.map(([x, y]) => [cx + (x - cx) * cos - (y - cy) * sin, cy + (x - cx) * sin + (y - cy) * cos]);
};
export const move = (points, dx, dy) => points.map(([x, y]) => [x + dx, y + dy]);
export const scale = (points, k, [cx, cy] = [0, 0]) => points.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);
export const flip = (points, cx) => points.map(([x, y]) => [2 * cx - x, y]);

// A place on a four-cornered face seen at an angle: u runs along its first edge, v away from it.
export const on = ([a, b, c, d]) => (u, v) => {
  const top = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  const foot = [d[0] + (c[0] - d[0]) * u, d[1] + (c[1] - d[1]) * u];
  return [top[0] + (foot[0] - top[0]) * v, top[1] + (foot[1] - top[1]) * v];
};

// An arc as points, for circles and curved edges. Angles in degrees, clockwise from the right.
export const arc = (cx, cy, rx, ry, from, to, steps = 10) =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const a = ((from + ((to - from) * i) / steps) * Math.PI) / 180;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
  });
