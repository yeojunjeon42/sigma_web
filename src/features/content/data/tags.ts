import type { Bilingual } from "@/features/archive/types";

export function isDateTag(tag: string): boolean {
  return /^\d{4}\s*[-–—]?\s*\d{0,4}$/.test(tag.trim());
}

export function tagLabel(tag: string): Bilingual {
  const t = tag.trim();
  return { en: t, ko: t };
}

export function displayTags(tags: string[], limit = 2): Bilingual[] {
  return tags.filter((t) => !isDateTag(t)).slice(0, limit).map(tagLabel);
}
