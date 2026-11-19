// How the words sit on a cover, shared by the card and its share image so both set them alike.

// Every side of the text stands the same distance from the cover's edge: the label's capitals
// from the top, the title's baseline from the foot, and both lines' ink from the left.
// As a share of the cover's width on a card.
export const INSET = 0.04;

// The space the sans leaves to the left of each letter, in ems (measured from the font). A line
// starts that far to the left, so its ink and not its box stands on the inset.
const BEARING: Record<string, number> = {
  A: 0.005, B: 0.06, C: 0.035, D: 0.06, E: 0.06, F: 0.06, G: 0.035, H: 0.06, I: 0.075, J: 0.015, K: 0.06, L: 0.06, M: 0.06,
  N: 0.06, O: 0.035, P: 0.06, Q: 0.035, R: 0.06, S: 0.045, T: 0.01, U: 0.06, V: 0.01, W: 0.01, X: 0.01, Y: 0.005, Z: 0.045,
  a: 0.045, b: 0.06, c: 0.035, d: 0.03, e: 0.035, f: 0.03, g: 0.035, h: 0.06, i: 0.06, j: 0.025, k: 0.06, l: 0.065, m: 0.06,
  n: 0.06, o: 0.025, p: 0.06, q: 0.035, r: 0.06, s: 0.035, t: 0.04, u: 0.06, v: 0.015, w: 0.02, x: 0.015, y: 0.015, z: 0.04,
  0: 0.045, 1: 0.02, 2: 0.035, 3: 0.03, 4: 0.025, 5: 0.055, 6: 0.055, 7: 0.04, 8: 0.06, 9: 0.055,
};
// A letter that meets the margin with a point or a curve looks set in even when its ink touches
// the line, so it goes a little past it.
const POINTED = /[AVWXYTvwxy]/;
const ROUND = /[CGOQScegoqs03689]/;

// The first-line indent of a line of text, in ems (negative: to the left).
export function hangEm(text: string | undefined): number {
  const first = text?.trim()[0];
  if (!first || BEARING[first] === undefined) return 0;
  return -(BEARING[first] + (POINTED.test(first) ? 0.015 : ROUND.test(first) ? 0.005 : 0));
}
export const hang = (text: string | undefined) => (hangEm(text) ? `${hangEm(text)}em` : undefined);
