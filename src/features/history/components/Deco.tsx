import type { CSSProperties } from "react";
import { INK, INKED, inkArrow, inkRect, type Point } from "@/features/hand/HandLayer";

// What holds a photograph to the page and points a note at it, drawn in ink (DESIGN.md, the hand
// layer). Sizes are in CSS pixels, so the pen keeps its width whatever the photograph's size.
const ROOM = 6;

// A strip of tape as its outline only: the photograph shows through it.
export function Tape({ width, seed, turn = 0, className }: { width: number; seed: number; turn?: number; className: string }) {
  const w = Math.round(width);
  const h = Math.round(Math.max(16, width * 0.3));
  return (
    <svg
      aria-hidden="true"
      width={w + 2 * ROOM}
      height={h + 2 * ROOM}
      viewBox={`0 0 ${w + 2 * ROOM} ${h + 2 * ROOM}`}
      className={`absolute z-10 overflow-visible ${className}`}
      style={{ rotate: `${turn}deg`, ...INKED }}
    >
      <path d={inkRect(ROOM, ROOM, w, h, { seed })} fill={INK} />
    </svg>
  );
}

// A short arrow from a note to its photograph.
export function Pointer({ from, to, seed, colour, style }: { from: Point; to: Point; seed: number; colour: string; style: CSSProperties }) {
  return (
    <svg aria-hidden="true" width={34} height={28} viewBox="0 0 34 28" className="absolute overflow-visible" style={{ ...style, ...INKED }}>
      <path d={inkArrow(from, to, { seed })} fill={colour} />
    </svg>
  );
}
