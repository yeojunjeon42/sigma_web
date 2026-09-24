import type { ArchiveProject } from "../types";
import { LIFTED, type Look } from "./covers";

/**
 * Plates — how a build sits on /archive. A plate takes one of three shapes, picked from the
 * build's own proportions, and every shape has the same area, so a tall wand and a long snake
 * weigh the same. The build is contained on it; a side its photograph cut it off on is set
 * flush. Plain numbers, so every view (depth, reel, the list's preview) places it alike.
 */
export type Shape = "port" | "sq" | "land";

/** Plate width and height in one unit. Equal areas: 0.6 × 0.8 = 0.48. */
export const PLATE: Record<Shape, { w: number; h: number }> = {
  port: { w: 0.6, h: 0.8 },
  sq: { w: 0.6928, h: 0.6928 },
  land: { w: 0.8, h: 0.6 },
};

/** Inset between a whole build and its plate, as a fraction of the plate's shorter side. */
const INSET = 0.09;

export type TileKind = "lift" | "photo" | "none";

export interface Tile {
  kind: TileKind;
  shape: Shape;
  src?: string;
  /**
   * Where the image sits inside the plate, as fractions: left, top, width, height. A whole
   * build is contained and centred; a side the photograph cut it off on is set flush.
   */
  box: [number, number, number, number];
  /** CSS object-position for a photograph cropped into its plate. */
  focus?: string;
}

function shapeFor(ratio: number): Shape {
  if (ratio < 0.9) return "port";
  if (ratio > 1.2) return "land";
  return "sq";
}

function contain(
  plate: { w: number; h: number },
  ratio: number,
  anchor: string[],
): Tile["box"] {
  const has = (s: string) => anchor.includes(s);
  const pad = INSET * Math.min(plate.w, plate.h);
  // Padding in plate fractions, dropped on any side the build is cut off on.
  const l = has("left") ? 0 : pad / plate.w;
  const r = has("right") ? 0 : pad / plate.w;
  const t = has("top") ? 0 : pad / plate.h;
  const b = has("bottom") ? 0 : pad / plate.h;
  const aw = 1 - l - r;
  const ah = 1 - t - b;
  // Contain the build's ratio inside the available box, in plate-fraction units.
  const boxRatio = (aw * plate.w) / (ah * plate.h);
  let w = ratio > boxRatio ? aw : (ah * plate.h * ratio) / plate.w;
  let h = ratio > boxRatio ? (aw * plate.w) / ratio / plate.h : ah;
  // Cut off on two opposite sides, the build runs edge to edge across them and the plate
  // crops the other way — a box larger than the plate is clipped by it.
  if (has("left") && has("right") && w < 1) {
    h /= w;
    w = 1;
  }
  if (has("top") && has("bottom") && h < 1) {
    w /= h;
    h = 1;
  }
  const x =
    has("left") && !has("right") ? 0 : has("right") && !has("left") ? 1 - w : l + (aw - w) / 2;
  const y =
    has("top") && !has("bottom") ? 0 : has("bottom") && !has("top") ? 1 - h : t + (ah - h) / 2;
  return [x, y, w, h];
}

export function tileFor(project: ArchiveProject, look: Look): Tile {
  const lifted = look === "photo" ? undefined : LIFTED[project.id];
  if (lifted) {
    const ratio = lifted.w / lifted.h;
    const shape = shapeFor(ratio);
    return {
      kind: "lift",
      shape,
      src: `/archive-looks/${project.id}/${look}.webp`,
      box: contain(PLATE[shape], ratio, lifted.anchor),
    };
  }
  if (project.imageUrl) {
    const ratio = project.imageW && project.imageH ? project.imageW / project.imageH : 4 / 3;
    return {
      kind: "photo",
      shape: shapeFor(ratio),
      src: project.imageUrl,
      box: [0, 0, 1, 1],
      focus: project.imageFocus,
    };
  }
  return { kind: "none", shape: "sq", box: [0, 0, 1, 1] };
}
