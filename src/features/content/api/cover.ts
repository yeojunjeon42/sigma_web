import fs from "node:fs";
import path from "node:path";
import type { DocMeta } from "../types";

export type Cover = { src: string; alt: string };

// A post's cover is a pen-and-ink drawing of its own: `coverIllustration` in the frontmatter, a
// file under public/blog-illustrations/. No two posts share one, and a post without one has a
// plain cover.

// The folder is named in full, so a build packs nothing else from public/.
export const drawingFile = (src: string) => path.join(process.cwd(), "public/blog-illustrations", path.basename(src));

// A drawing says what it shows in its own <title>, so the description travels with the file.
function shows(src: string) {
  const file = drawingFile(src);
  return fs.existsSync(file) ? (/<title>([^<]+)<\/title>/.exec(fs.readFileSync(file, "utf8"))?.[1].trim() ?? "") : null;
}

export function coverOf(post: DocMeta): Cover | undefined {
  const src = post.coverIllustration;
  const drawn = src ? shows(src) : null;
  if (!src || drawn === null) return undefined;
  return { src, alt: drawn ? `${post.title}, ${drawn}` : post.title };
}
