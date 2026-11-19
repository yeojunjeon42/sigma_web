import fs from "node:fs";
import path from "node:path";
import { DEFAULT, type Locale } from "@/i18n/config";
import { BLOG } from "@/i18n/dict/blog";
import { displayTags } from "../data/tags";
import type { DocMeta } from "../types";

export type Cover = { src: string; alt: string };

// A post's cover is an ink drawing: its own (`coverIllustration` in the frontmatter), or the one
// its section shares. A section with no drawing of its own takes the notebook.
const FOLDER = "/blog-illustrations";
const SHARED: Record<string, string> = {
  "Activity report": "activity-report",
  Trip: "trip",
  Collaboration: "collaboration",
  Education: "education",
};
const NOTEBOOK = "activity-report";

// The folder is named in full, so a build packs nothing else from public/.
export const drawingFile = (src: string) => path.join(process.cwd(), "public/blog-illustrations", path.basename(src));

// A drawing says what it shows in its own <title>, so the description travels with the file.
function shows(src: string) {
  const file = drawingFile(src);
  return fs.existsSync(file) ? (/<title>([^<]+)<\/title>/.exec(fs.readFileSync(file, "utf8"))?.[1].trim() ?? "") : null;
}

// `post` is read in `locale`, so its title is already in that language.
export function coverOf(post: DocMeta, locale: Locale = DEFAULT): Cover | undefined {
  const section = displayTags(post.tags, 1)[0]?.en ?? "";
  const src = post.coverIllustration ?? `${FOLDER}/${SHARED[section] ?? NOTEBOOK}.svg`;
  const drawn = shows(src);
  if (drawn === null) return undefined;
  return { src, alt: drawn ? BLOG[locale].coverAlt(post.title, drawn) : post.title };
}
