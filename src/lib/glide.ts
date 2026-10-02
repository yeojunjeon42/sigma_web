// Spring toward a fixed or per-frame target after native momentum stops.
// Cancel on external scroll or an unreachable target.

const STIFF = 250;
const DAMP = 32;

export type Glide = { settling: boolean; stop: () => void };

export function glide(to: number | (() => number)): Glide {
  const goal = typeof to === "function" ? to : () => to;
  let raf = 0;
  let y0 = NaN;
  let then = 0;
  let last = NaN;
  let prev = NaN;
  let stuck = 0;
  let velocity = 0;
  const g: Glide = {
    settling: true,
    stop: () => {
      cancelAnimationFrame(raf);
      g.settling = false;
    },
  };
  const frame = (now: number) => {
    const to = goal();
    if (Number.isNaN(y0)) {
      y0 = window.scrollY;
      if (Math.abs(to - y0) < 1) {
        g.settling = false;
        return;
      }
      then = now;
    } else if (Math.abs(window.scrollY - last) > 2) {
      g.settling = false;
      return;
    }
    const dt = Math.min(0.032, Math.max(0.008, (now - then) / 1000));
    then = now;
    const y = window.scrollY;
    stuck = Math.abs(y - prev) < 0.01 && Math.abs(last - y) > 0.1 ? stuck + 1 : 0;
    prev = y;
    if (stuck > 2) {
      g.settling = false;
      return;
    }
    const acceleration = (to - y) * STIFF - velocity * DAMP;
    velocity += acceleration * dt;
    const next = y + velocity * dt;
    if (Math.abs(to - next) < 0.35 && Math.abs(velocity) < 5) {
      last = to;
      window.scrollTo({ top: to, behavior: "instant" });
      g.settling = false;
      return;
    }
    last = next;
    window.scrollTo({ top: next, behavior: "instant" });
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return g;
}
