import type { ArchiveProject } from "../types";
import { LIFTED, type Look } from "./covers";

export type Shape = "port" | "sq" | "land";

export const PLATE: Record<Shape, { w: number; h: number }> = {
  port: { w: 0.6, h: 0.8 },
  sq: { w: 0.6928, h: 0.6928 },
  land: { w: 0.8, h: 0.6 },
};

const INSET = 0.09;

export type TileKind = "lift" | "photo" | "none";

export interface Tile {
  kind: TileKind;
  shape: Shape;
  src?: string;
  box: [number, number, number, number];
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
  const l = has("left") ? 0 : pad / plate.w;
  const r = has("right") ? 0 : pad / plate.w;
  const t = has("top") ? 0 : pad / plate.h;
  const b = has("bottom") ? 0 : pad / plate.h;
  const aw = 1 - l - r;
  const ah = 1 - t - b;
  const boxRatio = (aw * plate.w) / (ah * plate.h);
  let w = ratio > boxRatio ? aw : (ah * plate.h * ratio) / plate.w;
  let h = ratio > boxRatio ? (aw * plate.w) / ratio / plate.h : ah;
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
