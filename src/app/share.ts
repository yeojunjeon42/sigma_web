import type { Metadata } from "next";

const NAME = "SIGMA INTELLIGENCE";
const IMAGE = { url: "/opengraph-image.png", width: 2400, height: 1260, alt: "SIGMA INTELLIGENCE, SNU, est. 1984" };
const TWITTER_IMAGE = { ...IMAGE, url: "/twitter-image.png" };

export function share(
  path: string,
  {
    title,
    description,
    image,
    published,
    languages,
  }: { title?: string; description?: string; image?: { url: string; alt: string }; published?: string; languages?: Record<string, string> },
): Metadata {
  const heading = title ? `${title} — ${NAME}` : `${NAME} — SNU Robotics Club`;
  return {
    // `path` is the page's own address and its canonical; `languages` names an entry's two readings.
    alternates: { canonical: path, languages },
    openGraph: {
      ...(published ? { type: "article" as const, publishedTime: published } : { type: "website" as const }),
      siteName: NAME,
      locale: "en_US",
      alternateLocale: ["ko_KR"],
      url: path,
      title: heading,
      description,
      images: [image ? { ...image, width: 1200, height: 630 } : IMAGE],
    },
    twitter: { card: "summary_large_image", title: heading, description, images: [image ?? TWITTER_IMAGE] },
  };
}
