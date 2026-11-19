// A backpack standing on the ground, a luggage tag on a string from its handle. The tag's dot is
// the accent.
import { arc, move, turn } from "./pen.mjs";

export const file = "public/blog-illustrations/trip.svg";
export const title = "ink drawing of a backpack with a luggage tag";
export const box = [300, 300];

export function draw(page) {
  // The body: up the left side and over the top in one stroke, down the right in another.
  page.line([[84, 262], [74, 200], [72, 140], [84, 92], [112, 62], [150, 51]], { width: 2.8 });
  page.line([[146, 50], [190, 59], [218, 90], [229, 142], [227, 204], [218, 262]], { width: 2.8 });
  page.line([[80, 258], [118, 269], [182, 270], [222, 257]], { width: 2.7 });
  // The grab handle.
  page.line([[133, 57], [137, 35], [150, 28], [164, 35], [168, 57]], { width: 2.5 });
  page.line([[142, 54], [144, 42], [150, 38], [157, 42], [159, 54]], { width: 1.7, tail: 0.3 });
  // The main zip runs over the shoulders, with its pull hanging.
  page.line([[80, 136], [110, 110], [150, 101], [192, 108], [223, 134]], { width: 2.2 });
  page.line([[86, 139], [113, 117], [150, 108], [189, 115], [217, 138]], { width: 1.4, tail: 0.4 });
  page.line([[112, 112], [108, 126]], { width: 1.8, dry: 0 });
  page.dot(107, 129, 2.6);
  // The front pocket and its zip.
  page.line([[101, 172], [150, 162], [203, 170], [208, 208], [201, 243], [150, 250], [103, 244], [96, 208], [100, 168]], { width: 2.4 });
  page.line([[106, 180], [150, 171], [198, 178]], { width: 1.5, tail: 0.3 });
  page.line([[176, 173], [178, 186]], { width: 1.8, dry: 0 });
  page.dot(178, 189, 2.4);
  // The base panel's seam on either side of the pocket.
  page.line([[76, 226], [96, 234]], { width: 1.6 });
  page.line([[207, 234], [226, 226]], { width: 1.6 });
  // Shoulder straps showing behind the body.
  page.line([[88, 86], [64, 116], [55, 168], [61, 222], [80, 250]], { width: 2.5 });
  page.line([[216, 92], [237, 124], [243, 172], [236, 222], [222, 246]], { width: 2.5 });
  // A strap's loose end hangs past the base.
  page.line([[58, 204], [50, 240], [54, 270]], { width: 2 });
  // The side panel's seam, which gives the bag its depth.
  page.line([[203, 100], [211, 150], [210, 212], [205, 258]], { width: 1.7, tail: 0.3 });

  // The tag: a string from the handle, a card with clipped corners, two lines of writing.
  const hole = [236, 50];
  const card = (points) => move(turn(points, -28), ...hole);
  page.line([[166, 44], [190, 27], [218, 30], [235, 49]], { width: 1.5, dry: 0 });
  page.line([[167, 50], [196, 38], [222, 41], [233, 52]], { width: 1.4, dry: 0, tail: 0.3 });
  const [a, b, c, d, e, f] = card([[-15, 0], [-7, -10], [7, -10], [15, 0], [15, 50], [-15, 50]]);
  page.line([a, b, b, c, c, d, d, e, e, f, f, a, a, b], { width: 2.2 });
  page.line(move(turn(arc(0, 0, 3, 3, 0, 340, 8), -28), ...hole), { width: 1.4, dry: 0 });
  page.line(card([[-8, 15], [0, 14], [8, 15]]), { width: 1.4, tail: 0.3 });
  page.line(card([[-8, 23], [-2, 22], [4, 23]]), { width: 1.4, tail: 0.3 });
  page.red.dot(...card([[5, 38]])[0], 4.6);
  page.arrow([282, 132], [266, 108], { width: 1.5 });

  // Shade down the right side and in the pocket's corner, and the ground it stands on.
  page.hatch([[213, 132], [227, 136], [224, 250], [209, 254]], { angle: -55, gap: 8, width: 1.4 });
  page.hatch([[172, 222], [202, 212], [199, 240], [172, 246]], { angle: -55, gap: 7, width: 1.3 });
  page.hatch([[100, 274], [228, 266], [262, 276], [116, 284]], { angle: -55, gap: 7, width: 1.4 });
}
