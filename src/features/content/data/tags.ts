import type { Bilingual } from "@/features/archive/types";

export function isDateTag(tag: string): boolean {
  return /^\d{4}\s*[-–—]?\s*\d{0,4}$/.test(tag.trim());
}

// A tag is written in English in the frontmatter; these are the ones with a Korean form.
const KO: Record<string, string> = {
  "Activity report": "활동 보고",
  Trip: "견학",
  Collaboration: "협업",
  Education: "교육",
  "Autonomous driving": "자율주행",
  "Industrial robot": "산업용 로봇",
};

export function tagLabel(tag: string): Bilingual {
  const t = tag.trim();
  return { en: t, ko: KO[t] ?? t };
}

export function displayTags(tags: string[], limit = 2): Bilingual[] {
  return tags.filter((t) => !isDateTag(t)).slice(0, limit).map(tagLabel);
}
