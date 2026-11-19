import { getDoc, getSlugs } from "@/features/content/api/getContent";
import type { Lang } from "@/features/content/types";
import { getLocalPhotos } from "./getArchive";
import type { Photo } from "../types";

interface Entry {
  html: string;
  // The language the text is in, and every language the entry has text in.
  lang: Lang;
  langs: Lang[];
  team: string[];
  photos: Photo[];
}

const caches: Record<Lang, Map<string, Entry> | undefined> = { en: undefined, ko: undefined };

// Every entry with its text in a language (English, or Korean where the reader asked for it).
export async function getEntries(lang: Lang = "en"): Promise<Map<string, Entry>> {
  const kept = caches[lang];
  if (kept && process.env.NODE_ENV === "production") return kept;

  const slugs = [...(await getSlugs("archive"))];
  const docs = await Promise.all(slugs.map((slug) => getDoc("archive", slug, lang)));

  const cache = new Map<string, Entry>();
  for (const doc of docs) {
    if (!doc) continue;
    cache.set(doc.slug, {
      html: doc.html,
      lang: doc.lang,
      langs: doc.langs,
      team: doc.team.map(name),
      photos: getLocalPhotos(doc.slug),
    });
  }
  caches[lang] = cache;
  return cache;
}

function name(member: string) {
  return member.replace(/\s*\([^)]*\)/g, "").trim();
}
