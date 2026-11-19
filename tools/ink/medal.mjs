// A medal hanging on a neck ribbon, swung a little off plumb: the ribbon's two straps cross at the
// ring, the disc carries a laurel and a star. The star is the accent.
import { arc, edge, flip, scale, turn } from "./pen.mjs";

export const file = "public/blog-illustrations/medal.svg";
export const title = "ink drawing of a medal on a ribbon";
export const box = [300, 300];

const SWING = -5;
const C = [150, 207];
const R = 67;

export function draw(page) {
  const hang = (points) => scale(turn(points, SWING, [150, 150]), 0.94, [152, 150]);
  const line = (points, o) => page.line(hang(points), o);

  // The left strap lies in front: both its edges run the whole way down.
  line(edge([58, 30], [148, 135], 4, 1, 1.5), { width: 2.8 });
  line(edge([90, 5], [176, 106], 2, 2, -1), { width: 2.6 });
  line(edge([56, 32], [92, 3], 1, 3), { width: 2.1 });
  // The right strap passes behind it, so its inner edge stops at the crossing.
  line(edge([244, 26], [153, 135], 3, 2, -1.5), { width: 2.8 });
  line(edge([211, 3], [153, 73], 3, -2, 1), { width: 2.5 });
  line(edge([209, 1], [246, 29], 3, 1), { width: 2.1 });
  // A stripe down each strap.
  line(edge([76, 22], [156, 116], -4, -6), { width: 1.5, tail: 0.4 });
  line(edge([226, 18], [182, 72], -4, -4), { width: 1.5, tail: 0.4 });

  // The ring the ribbon threads, and the lug it hangs from.
  line(arc(150.5, 139, 10, 11.5, -240, 95, 14), { width: 2.4, dry: 0 });
  line(arc(150.5, 139, 5.5, 7, -200, 120, 10), { width: 1.5, dry: 0, tail: 0.3 });

  // The disc in two strokes that do not quite close, and the thickness of its rim.
  line(arc(C[0], C[1], R, R - 1, -74, 152, 22), { width: 2.9 });
  line(arc(C[0] - 0.5, C[1], R, R, 146, 280, 14), { width: 2.8 });
  line(arc(C[0] + 4, C[1] + 5, R, R, 8, 128, 12), { width: 2.2, tail: 0.3 });
  line(arc(C[0], C[1], R - 12, R - 12.5, -150, 172, 26), { width: 1.7, tail: 0.25 });

  // A laurel either side of the star: a stem, and leaves that leave it upward and outward.
  for (const side of [1, -1]) {
    const mirror = (points) => (side > 0 ? points : flip(points, C[0]));
    const stem = (a, r = 35) => [C[0] + Math.cos((a * Math.PI) / 180) * r, C[1] + Math.sin((a * Math.PI) / 180) * r];
    line(mirror(arc(C[0], C[1], 35, 35, 76, -58, 12)), { width: 1.6, tail: 0.4, dry: 0 });
    for (const a of [52, 28, 4, -20, -42]) {
      line(mirror([stem(a), stem(a - 9, 41), stem(a - 21, 45.5)]), { width: 2, tail: 0.6, dry: 0 });
      line(mirror([stem(a - 3), stem(a - 13, 30), stem(a - 24, 27)]), { width: 1.8, tail: 0.6, dry: 0 });
    }
  }
  const star = Array.from({ length: 10 }, (_, i) => {
    const a = ((-90 + i * 36 + 4) * Math.PI) / 180;
    const r = i % 2 ? 6.2 : 15.5;
    return [C[0] + Math.cos(a) * r, C[1] + 1 + Math.sin(a) * r];
  });
  page.red.blob(hang(star.flatMap((p) => [p, p])));

  // Shade where the back strap goes under, and in the lee of the disc's rim.
  page.hatch(hang([[156, 78], [176, 104], [196, 80], [176, 56]]), { angle: -55, gap: 6.5, width: 1.3 });
  page.hatch(hang([...arc(C[0], C[1], R - 2, R - 2, 8, 86, 8), ...arc(C[0], C[1], R - 11, R - 11, 86, 8, 8)]), { angle: -55, gap: 6, width: 1.3 });
}
