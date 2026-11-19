import type { Metadata } from "next";
import { LOCALES, localePath, type Locale } from "@/i18n/config";

const NAME = "SIGMA INTELLIGENCE";
const TAIL: Record<Locale, string> = { en: "SNU Robotics Club", ko: "서울대학교 로봇동아리" };
const OG: Record<Locale, string> = { en: "en_US", ko: "ko_KR" };
const IMAGE = { url: "/opengraph-image.png", width: 2400, height: 1260, alt: "SIGMA INTELLIGENCE, SNU, est. 1984" };
const TWITTER_IMAGE = { ...IMAGE, url: "/twitter-image.png" };

// A page's address in each language, for `hreflang`. English is also the default.
export const languages = (path: string) => ({ ...Object.fromEntries(LOCALES.map((l) => [l, localePath(l, path)])), "x-default": path });

// The canonical address, its twin in the other language, and the share card. `path` is the page's
// address without a language.
export function share(
  locale: Locale,
  path: string,
  { title, description, image, published }: { title?: string; description?: string; image?: { url: string; alt: string }; published?: string },
): Metadata {
  const heading = title ? `${title} — ${NAME}` : `${NAME} — ${TAIL[locale]}`;
  const url = localePath(locale, path);
  return {
    alternates: { canonical: url, languages: languages(path) },
    openGraph: {
      ...(published ? { type: "article" as const, publishedTime: published } : { type: "website" as const }),
      siteName: NAME,
      locale: OG[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG[l]),
      url,
      title: heading,
      description,
      images: [image ? { ...image, width: 1200, height: 630 } : IMAGE],
    },
    twitter: { card: "summary_large_image", title: heading, description, images: [image ?? TWITTER_IMAGE] },
  };
}
