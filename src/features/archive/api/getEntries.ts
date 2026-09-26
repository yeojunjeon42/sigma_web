import { getDoc, getSlugs } from "@/features/content/api/getContent";
import { getLocalPhotos, getLocalVideos } from "./getArchive";
import type { Photo } from "../types";

interface Entry {
  html: string;
  team: string[];
  photos: Photo[];
  videos: string[];
}

const cache = new Map<string, Entry>();
let filled = false;

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

function name(member: string) {
  return member.replace(/\s*\([^)]*\)\s*$/, "").trim();
}
