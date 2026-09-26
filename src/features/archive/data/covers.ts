import data from "./covers.json";
import looks from "./looks.json";

type SlotId = "strip" | "wide" | "land" | "std" | "sq" | "tall" | "port" | "big";

interface Cover {
  file?: string;
  slot?: SlotId;
  focus?: string;
  why?: string;
  feature?: string;
  lift?: string | false;
  liftWhy?: string;
}

export const COVERS = data as Record<string, Cover>;

export const LOOKS = ["cutout", "drawing", "pen", "duotone", "photo"] as const;
export type Look = (typeof LOOKS)[number];
export const DEFAULT_LOOK: Look = "photo";

export function parseLook(raw: string | undefined): Look {
  return LOOKS.find((l) => l === raw) ?? DEFAULT_LOOK;
}

type Lifted = { file: string; w: number; h: number; anchor: string[] };
export const LIFTED = looks as Record<string, Lifted>;

