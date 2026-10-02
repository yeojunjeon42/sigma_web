// Sample a damped spring at 60 Hz for compositor keyframes.
// response: undamped period in seconds; damping: fraction of critical damping; velocity: units/s.

const STEP = 1 / 60;
const SUB = 8;

export type Sprung = { values: number[]; duration: number };

export function spring(
  from: number,
  to: number,
  velocity = 0,
  response = 0.42,
  damping = 0.86,
): Sprung {
  const w = (2 * Math.PI) / response;
  const near = 1e-3 * Math.max(1, Math.abs(from - to));
  let x = from - to;
  let v = velocity;
  const values = [from];
  for (let t = 0; t < 3; t += STEP) {
    for (let i = 0; i < SUB; i++) {
      v += (-w * w * x - 2 * damping * w * v) * (STEP / SUB);
      x += v * (STEP / SUB);
    }
    values.push(to + x);
    if (Math.abs(x) < near && Math.abs(v) < near * 10) break;
  }
  values[values.length - 1] = to;
  return { values, duration: (values.length - 1) * STEP * 1000 };
}
