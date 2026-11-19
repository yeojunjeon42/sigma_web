import type { Lang } from "./types";

// An entry's text can be read in Korean beside the English. Only the text changes: the address
// gains `lang=ko`, and the page says where the other reading is.
export type Reading = { href: string; label: string };

export const koOf = (href: string) => `${href}${href.includes("?") ? "&" : "?"}lang=ko`;

// The link to the other reading, or nothing where the entry has only one. `href` is the entry's
// English address.
export function otherReading(href: string, shown: Lang, langs: Lang[]): Reading | undefined {
  if (langs.length < 2) return undefined;
  return shown === "ko" ? { href, label: "Read in English" } : { href: koOf(href), label: "Read in Korean" };
}

// `hreflang` for an entry with both readings; the canonical address stays the English one.
export const readings = (href: string, langs: Lang[]) => (langs.length < 2 ? undefined : { en: href, ko: koOf(href), "x-default": href });

// Set like the view switches (Grid List): plain words, grey until pointed at, with the same
// finger-sized target around them on touch screens.
export const READING_LINK =
  "relative text-ink-muted transition-colors hover:text-ink before:absolute before:inset-x-[-0.25rem] before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-[''] lg:before:hidden";
