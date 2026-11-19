// The ghost at a closed office door, holding its access badge up to the card reader on the wall
// beside the frame. The reader's light is the accent.
import { arc, bent, edge, turn } from "./pen.mjs";
import { arm, ghost } from "./ghost.mjs";

export const file = "public/blog-illustrations/badge.svg";
export const title = "ink drawing of a ghost holding an access badge in front of an office door";
export const box = [300, 300];

// The badge is drawn upright about its middle, then held at this tilt.
const BADGE = [181, 129];
const TILT = 9;

export function draw(page) {
  // The floor, and the door's frame standing on it.
  page.line(edge([14, 271], [286, 270], 0, 0, -1), { width: 2.3 });
  page.line(edge([18, 269], [17, 28], 0, 2), { width: 2.5 });
  page.line(edge([17, 28], [120, 26], 2, 3, -0.8), { width: 2.5 });
  page.line(edge([120, 26], [121, 269], 1, 0), { width: 2.5 });
  // The door in it, shut: it stops just short of the floor.
  page.line(edge([28, 266], [27, 38], 0, 1), { width: 2.1 });
  page.line(edge([27, 38], [111, 36], 2, 1), { width: 2.1 });
  page.line(edge([111, 36], [112, 266], 2, 0), { width: 2.1 });
  page.line(edge([28, 265], [112, 264], 1, 1), { width: 2, dry: 0 });
  // Two hinges, a name plate, a narrow window with the light on it, and a lever handle.
  page.line([[27.5, 64], [27.5, 77]], { width: 4, tail: 0.05, dry: 0 });
  page.line([[28, 224], [28, 237]], { width: 4, tail: 0.05, dry: 0 });
  page.line(bent([[37, 72], [67, 71], [67, 84], [37, 85], [37, 71]]), { width: 1.7, dry: 0 });
  page.line([[43, 78], [52, 77.6], [61, 78]], { width: 1.4, tail: 0.3, dry: 0 });
  page.line(bent([[78, 56], [100, 55], [101, 150], [78, 151], [78, 55]]), { width: 2 });
  page.line([[83, 92], [95, 66]], { width: 1.3, tail: 0.5, dry: 0 });
  page.line([[84, 110], [95, 86]], { width: 1.3, tail: 0.5, dry: 0 });
  page.line(bent([[91, 168], [102, 168], [102, 193], [91, 193], [91, 167]]), { width: 2, dry: 0 });
  page.line([[97, 176], [85, 176.5], [73, 178]], { width: 3, tail: 0.1, dry: 0 });
  page.dot(96.5, 187, 1.6);

  // The reader on the wall, and the signal between it and the badge.
  page.line(bent([[133, 112], [157, 111], [158, 153], [133, 154], [133, 111]]), { width: 2.5 });
  page.line(bent([[139, 131], [152, 131], [152, 147], [139, 147], [139, 130]]), { width: 1.4, dry: 0 });
  page.red.dot(145.5, 121, 3.6);
  page.line(arc(157, 131, 6, 7, -42, 42, 5), { width: 1.5, tail: 0.3, dry: 0 });
  page.line(arc(156, 131, 11.5, 13, -42, 42, 6), { width: 1.5, tail: 0.3, dry: 0 });

  // The ghost leans in with the badge held up by its foot.
  const g = ghost(page, { at: [228, 268], height: 120, lean: -4, look: [-1, -0.6] });
  const card = (points) => turn(points.map(([x, y]) => [BADGE[0] + x, BADGE[1] + y]), TILT, BADGE);
  page.line(bent(card([[-12, -17], [12, -17], [12, 17], [-12, 17], [-12, -18]])), { width: 2.2, dry: 0 });
  page.line(bent(card([[-4, -17], [-4, -23], [4, -23], [4, -17]])), { width: 1.7, dry: 0 });
  page.line(bent(card([[-7, -11], [1, -11], [1, -1], [-7, -1], [-7, -12]])), { width: 1.4, dry: 0 });
  page.line(card([[-7, 5], [7, 5]]), { width: 1.3, tail: 0.3, dry: 0 });
  page.line(card([[-7, 10], [3, 10]]), { width: 1.3, tail: 0.3, dry: 0 });
  arm(page, g.left(0.3), card([[2, 18]])[0]);

  // Shade low on the door and on the floor by the ghost.
  page.hatch([[32, 236], [108, 235], [108, 261], [32, 262]], { angle: -55, gap: 7, width: 1.3 });
  page.hatch([[150, 277], [266, 274], [284, 282], [168, 286]], { angle: -55, gap: 7, width: 1.4 });
}
