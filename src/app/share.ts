import type { Metadata } from "next";

const NAME = "SIGMA INTELLIGENCE";
const IMAGE = { url: "/opengraph-image.png", width: 2400, height: 1260, alt: "SIGMA INTELLIGENCE, SNU, est. 1984" };

export function share(
  path: string,
  { title, description, image, published }: { title?: string; description?: string; image?: string; published?: string },
): Metadata {
  const heading = title ? `${title} — ${NAME}` : `${NAME} — SNU Robotics Club`;
  return {
    alternates: { canonical: path },
    openGraph: {
      ...(published ? { type: "article" as const, publishedTime: published } : { type: "website" as const }),
      siteName: NAME,
      locale: "en_US",
      alternateLocale: ["ko_KR"],
      url: path,
      title: heading,
      description,
      images: [image ? { url: image, alt: title } : IMAGE],
    },
    twitter: { card: "summary_large_image", title: heading, description, images: [image ?? IMAGE.url] },
  };
}
