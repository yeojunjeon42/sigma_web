// The roughening: fractal noise pushes every edge a little out of true, so no stroke is clean.
// Numbers are in CSS pixels on a card, where a drawing's unit is about one pixel.
export const ID = "hand-ink";
export const NOISE = { baseFrequency: 0.055, numOctaves: 2, seed: 7 };
export const PUSH = 2.6;

// The same filter as markup, for a drawing rasterised away from the page (a share image).
export const inkFilter = () =>
  `<filter id="${ID}" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="${NOISE.baseFrequency}" numOctaves="${NOISE.numOctaves}" seed="${NOISE.seed}" result="grain"/><feDisplacementMap in="SourceGraphic" in2="grain" scale="${PUSH}" xChannelSelector="R" yChannelSelector="G"/></filter>`;
export const INK_FILTER = `url(#${ID})`;
