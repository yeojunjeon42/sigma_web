import type { Locale } from "../config";

// Words more than one part of the site uses.
export const COMMON: Record<Locale, { language: string; onlyIn: Record<Locale, string> }> = {
  en: {
    language: "Language",
    // Shown beside an entry whose text exists only in the other language, keyed by that language.
    onlyIn: { ko: "Available in Korean only", en: "" },
  },
  ko: {
    language: "언어",
    onlyIn: { en: "영문으로만 제공됩니다", ko: "" },
  },
};
