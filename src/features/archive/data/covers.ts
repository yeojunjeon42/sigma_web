import data from "./covers.json";
import looks from "./looks.json";

// `covers.json` is hand-kept: per entry, which photograph opens it, its crop, and whether it
// leads its era (`scripts/media/sheet.py <dir> --covers` previews them).
export type SlotId = "strip" | "wide" | "land" | "std" | "sq" | "tall" | "port" | "big";

export interface Cover {
  file?: string;
  slot?: SlotId;
  /** CSS object-position. */
  focus?: string;
  why?: string;
  /** Set on the one entry that leads its era, with the reason. */
  feature?: string;
  /** The photograph `scripts/media/looks.py` lifts the build out of; `false` keeps the photo. */
  lift?: string | false;
  liftWhy?: string;
}

export const COVERS = data as Record<string, Cover>;

/**
 * The index's treatments. Every build is lifted off its background and redrawn one way, so
 * photographs from 65 desks read as one catalogue; `photo` is the photographs as they are.
 */
export const LOOKS = ["cutout", "drawing", "pen", "duotone", "photo"] as const;
export type Look = (typeof LOOKS)[number];
/** The photograph fills the plate. The cut-out builds are kept for `?look=` comparison only —
 *  a build floating on a ground made every hover read as an effect on the object. */
export const DEFAULT_LOOK: Look = "photo";

export function parseLook(raw: string | undefined): Look {
  return LOOKS.find((l) => l === raw) ?? DEFAULT_LOOK;
}

/** What `looks.py` wrote per entry: frame size, and the sides the photograph cut the build off. */
export type Lifted = { file: string; w: number; h: number; anchor: string[] };
export const LIFTED = looks as Record<string, Lifted>;

