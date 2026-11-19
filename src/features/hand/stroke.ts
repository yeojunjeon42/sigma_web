// Ink as a brush pen lays it: a stroke is a filled outline whose width swells and thins along its
// length, lands a little heavy, leaves on a tail, and now and then runs dry and breaks. Pure
// geometry, so a drawing tool and a component draw with the same pen.
export type Point = [number, number];

export type Stroke = {
  // The middle of the pen's range, in the drawing's own units; the pen runs about 1.5 to 3.
  width?: number;
  seed?: number;
  // How much of the stroke's end thins to a tail, from 0 to 1.
  tail?: number;
  // The chance that the stroke runs dry once and breaks.
  dry?: number;
};

function random(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smooth = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};

// The points joined by a smooth curve and walked in even steps.
function walk(points: Point[], step: number): Point[] {
  if (points.length < 3) {
    const [a, b] = [points[0], points[points.length - 1]];
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    return Array.from({ length: n + 1 }, (_, i) => [a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n]);
  }
  const out: Point[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [p0, p1, p2, p3] = [points[Math.max(0, i - 1)], points[i], points[i + 1], points[Math.min(points.length - 1, i + 2)]];
    const n = Math.max(1, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
    for (let k = i === 0 ? 0 : 1; k <= n; k++) {
      const t = k / n;
      const at = (j: 0 | 1) =>
        0.5 * (2 * p1[j] + (p2[j] - p0[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t * t + (3 * p1[j] - p0[j] - 3 * p2[j] + p3[j]) * t * t * t);
      out.push([at(0), at(1)]);
    }
  }
  return out;
}

const n1 = (v: number) => (Math.round(v * 10) / 10).toString();

// One unbroken run of ink as a closed outline: down one side, round the end, back up the other.
function outline(line: Point[], widths: number[]): string {
  if (line.length < 2) return "";
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i < line.length; i++) {
    const [a, b] = [line[Math.max(0, i - 1)], line[Math.min(line.length - 1, i + 1)]];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const [nx, ny] = [(-(b[1] - a[1]) / len) * widths[i] * 0.5, ((b[0] - a[0]) / len) * widths[i] * 0.5];
    left.push(`${n1(line[i][0] + nx)} ${n1(line[i][1] + ny)}`);
    right.push(`${n1(line[i][0] - nx)} ${n1(line[i][1] - ny)}`);
  }
  const cap = (w: number) => n1(Math.max(0.2, w * 0.5));
  const [first, last] = [widths[0], widths[widths.length - 1]];
  return `M${left.join("L")}A${cap(last)} ${cap(last)} 0 0 1 ${right[right.length - 1]}L${right.reverse().join("L")}A${cap(first)} ${cap(first)} 0 0 1 ${left[0]}Z`;
}

// A stroke through the points, as the `d` of a filled path.
export function inkStroke(points: Point[], { width = 2.2, seed = 1, tail = 0.18, dry = 0.15 }: Stroke = {}): string {
  const rand = random(seed * 7919 + Math.round(points[0][0] * 13 + points[0][1] * 31));
  const line = walk(points, 3);
  const [p1, p2, f1, f2] = [rand() * 6.3, rand() * 6.3, 1.5 + rand() * 2, 4 + rand() * 4];
  const widths = line.map((_, i) => {
    const t = i / (line.length - 1);
    const swell = 1 + 0.2 * Math.sin(t * f1 * 6.3 + p1) + 0.1 * Math.sin(t * f2 * 6.3 + p2);
    return Math.max(0.5, width * swell * (0.7 + 0.3 * smooth(t / 0.07)) * (0.3 + 0.7 * smooth((1 - t) / Math.max(0.01, tail))));
  });
  if (rand() >= dry || line.length < 16) return outline(line, widths);
  // Run dry: the ink thins to nothing, skips a short way, and picks up again.
  const at = Math.floor(line.length * (0.35 + rand() * 0.4));
  const gap = 1 + Math.floor(rand() * 2);
  const thin = (run: number[], from: boolean) => run.map((w, i) => w * (0.25 + 0.75 * smooth((from ? i : run.length - 1 - i) / 4)));
  return outline(line.slice(0, at), thin(widths.slice(0, at), false)) + outline(line.slice(at + gap), thin(widths.slice(at + gap), true));
}

// A rough rectangle, drawn as four strokes that overshoot or stop short at the corners.
export function inkRect(x: number, y: number, w: number, h: number, { seed = 1, width = 1.8 }: Stroke = {}): string {
  const rand = random(seed * 104729 + 17);
  const j = (v: number) => v + (rand() - 0.5) * 2.4;
  const sides: [Point, Point][] = [
    [[x, y], [x + w, y]],
    [[x + w, y], [x + w, y + h]],
    [[x + w, y + h], [x, y + h]],
    [[x, y + h], [x, y]],
  ];
  return sides
    .map(([a, b], i) => {
      const mid: Point = [j((a[0] + b[0]) / 2), j((a[1] + b[1]) / 2)];
      return inkStroke([[j(a[0]), j(a[1])], mid, [j(b[0]), j(b[1])]], { width, seed: seed + i * 3, dry: 0.3 });
    })
    .join("");
}

// A short arrow with a bowed shaft and a two-stroke head.
export function inkArrow(from: Point, to: Point, { seed = 1, width = 2 }: Stroke = {}): string {
  const rand = random(seed * 15485863 + 5);
  const [dx, dy] = [to[0] - from[0], to[1] - from[1]];
  const len = Math.hypot(dx, dy) || 1;
  const bow = (rand() < 0.5 ? -1 : 1) * len * (0.1 + rand() * 0.08);
  const mid: Point = [(from[0] + to[0]) / 2 - (dy / len) * bow, (from[1] + to[1]) / 2 + (dx / len) * bow];
  // The head follows the shaft's last leg, not the straight line between the ends.
  const turn = Math.atan2(to[1] - mid[1], to[0] - mid[0]);
  const barb = Math.min(12, len * 0.3);
  const head = (spread: number): Point => [to[0] - Math.cos(turn + spread) * barb, to[1] - Math.sin(turn + spread) * barb];
  return (
    inkStroke([from, mid, to], { width, seed, tail: 0.1, dry: 0 }) +
    inkStroke([head(0.5 + rand() * 0.15), to], { width, seed: seed + 1, tail: 0.3, dry: 0 }) +
    inkStroke([head(-0.5 - rand() * 0.15), to], { width, seed: seed + 2, tail: 0.3, dry: 0 })
  );
}

// A closed shape through the points, filled solid: a small pool of ink, never a large one.
export function inkBlob(points: Point[], { seed = 1 }: Stroke = {}): string {
  const rand = random(seed * 49979687 + 3);
  const n = points.length;
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [points[(i + n - 1) % n], points[i], points[(i + 1) % n], points[(i + 2) % n]];
    const steps = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 3));
    for (let k = 0; k < steps; k++) {
      const t = k / steps;
      const at = (j: 0 | 1) =>
        0.5 * (2 * p1[j] + (p2[j] - p0[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t * t + (3 * p1[j] - p0[j] - 3 * p2[j] + p3[j]) * t * t * t);
      out.push(`${n1(at(0) + (rand() - 0.5) * 0.5)} ${n1(at(1) + (rand() - 0.5) * 0.5)}`);
    }
  }
  return `M${out.join("L")}Z`;
}

// A dot of ink, a little out of round.
export function inkDot(x: number, y: number, r: number, { seed = 1 }: Stroke = {}): string {
  const rand = random(seed * 86028121 + 11);
  const turn = rand() * 6.3;
  return inkBlob(
    Array.from({ length: 7 }, (_, i) => {
      const a = turn + (i / 7) * Math.PI * 2;
      const reach = r * (0.9 + rand() * 0.2);
      return [x + Math.cos(a) * reach, y + Math.sin(a) * reach] as Point;
    }),
    { seed },
  );
}

// Hatching: parallel strokes across a shape, each starting and stopping a little differently, as
// a pen shades. `angle` is in degrees and `gap` is the distance between strokes.
export function inkHatch(shape: Point[], { angle = -50, gap = 7, seed = 1, width = 1.5 }: Stroke & { angle?: number; gap?: number } = {}): string {
  const rand = random(seed * 67867967 + 29);
  const [cos, sin] = [Math.cos((angle * Math.PI) / 180), Math.sin((angle * Math.PI) / 180)];
  // Turned so the strokes run level, crossed row by row, then turned back.
  const flat = shape.map(([x, y]) => [x * cos + y * sin, -x * sin + y * cos] as Point);
  const back = ([x, y]: Point): Point => [x * cos - y * sin, x * sin + y * cos];
  const ys = flat.map((p) => p[1]);
  let d = "";
  let row = 0;
  for (let y = Math.min(...ys) + gap * (0.4 + rand() * 0.4); y < Math.max(...ys); y += gap * (0.8 + rand() * 0.4), row++) {
    const xs: number[] = [];
    for (let i = 0; i < flat.length; i++) {
      const [a, b] = [flat[i], flat[(i + 1) % flat.length]];
      if (a[1] <= y !== b[1] <= y) xs.push(a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const span = xs[i + 1] - xs[i];
      if (span < 5) continue;
      const [from, to] = [xs[i] + span * rand() * 0.14, xs[i + 1] - span * rand() * 0.22];
      const bow = (rand() - 0.5) * Math.min(3, span * 0.05);
      d += inkStroke([back([from, y + (rand() - 0.5)]), back([(from + to) / 2, y + bow]), back([to, y + (rand() - 0.5)])], {
        width,
        seed: seed * 31 + row * 7 + i,
        tail: 0.4,
        dry: 0.12,
      });
    }
  }
  return d;
}
