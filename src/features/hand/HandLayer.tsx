// The hand layer: the one handwriting face, the ink's colour and pen, and the filter that roughens
// its edges. Only hand-layer components import this module (eslint.config.mjs lists them), so the
// structure of the site cannot pick any of it up by accident. DESIGN.md has the rules.
import { Caveat } from "next/font/google";
import type { CSSProperties } from "react";

import { ID, NOISE, PUSH } from "./filter";

export { inkArrow, inkRect, inkStroke, type Point, type Stroke } from "./stroke";

const hand = Caveat({ weight: ["500"], subsets: ["latin"], display: "swap", preload: false });

// Handwriting: notes and labels inside a hand-layer component, never navigation, headings, body
// text or buttons.
export const HANDWRITING = hand.className;
export const INK = "#0a0907";
export const ACCENT = "#ed2024";

// Put this on anything drawn in ink, once `InkDefs` is somewhere on the page.
export const INKED: CSSProperties = { filter: `url(#${ID})` };

export function InkDefs() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <defs>
        <filter id={ID} x="-4%" y="-4%" width="108%" height="108%">
          <feTurbulence type="fractalNoise" baseFrequency={NOISE.baseFrequency} numOctaves={NOISE.numOctaves} seed={NOISE.seed} result="grain" />
          <feDisplacementMap in="SourceGraphic" in2="grain" scale={PUSH} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
