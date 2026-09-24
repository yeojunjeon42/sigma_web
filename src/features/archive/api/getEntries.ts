import { getDoc, getSlugs } from "@/features/content/api/getContent";
import { getLocalPhotos, getLocalVideos } from "./getArchive";
import type { Photo } from "../types";

/** One build's entry — its body, who made it, and its media. */
export interface Entry {
  html: string;
  team: string[];
  photos: Photo[];
  videos: string[];
}

const cache = new Map<string, Entry>();
let filled = false;

/**
 * Every entry at once. The reel prints an entry in its own panel — there is no detail page —
 * so /archive needs all of them on the first paint. Rendering 67 markdown files and reading the
 * headers of 464 photographs is a per-visit cost on a dynamic route, so it is memoised in
 * production; left uncached in development so an edited file or a newly dropped photo shows up.
 */
export async function getEntries(): Promise<Map<string, Entry>> {
  if (filled && process.env.NODE_ENV === "production") return cache;

  const slugs = [...(await getSlugs("archive"))];
  const docs = await Promise.all(slugs.map((slug) => getDoc("archive", slug)));

  cache.clear();
  for (const doc of docs) {
    if (!doc) continue;
    cache.set(doc.slug, {
      html: doc.html,
      team: doc.team.map(name),
      photos: getLocalPhotos(doc.slug),
      videos: getLocalVideos(doc.slug),
    });
  }
  filled = true;
  return cache;
}

// Names only: the source lists each member as "이름 (학부 24)"; the department and year stay off the site.
function name(member: string) {
  return member.replace(/\s*\([^)]*\)\s*$/, "").trim();
}
