import { getDoc, getSlugs } from "@/features/content/api/getContent";
import { DEFAULT, type Locale } from "@/i18n/config";
import { getLocalPhotos, getLocalVideos } from "./getArchive";
import type { Photo } from "../types";

interface Entry {
  html: string;
  // The language the text is in: the reader's, or the other one where theirs has none.
  lang: Locale;
  team: string[];
  photos: Photo[];
  videos: string[];
}

// One set of entries to a language: content/<locale>/archive.
const filled = new Map<Locale, Map<string, Entry>>();

export async function getEntries(locale: Locale = DEFAULT): Promise<Map<string, Entry>> {
  const hit = filled.get(locale);
  if (hit && process.env.NODE_ENV === "production") return hit;

  const slugs = [...(await getSlugs("archive"))];
  const docs = await Promise.all(slugs.map((slug) => getDoc("archive", slug, locale)));

  const cache = new Map<string, Entry>();
  for (const doc of docs) {
    if (!doc) continue;
    cache.set(doc.slug, {
      html: doc.html,
      lang: doc.lang,
      team: doc.team.map(name),
      photos: getLocalPhotos(doc.slug),
      videos: getLocalVideos(doc.slug),
    });
  }
  filled.set(locale, cache);
  return cache;
}

function name(member: string) {
  return member.replace(/\s*\([^)]*\)/g, "").trim();
}
