import type { MetadataRoute } from "next";
import { getIndex, inKorean } from "@/features/content/api/getContent";
import { koOf } from "@/features/content/reading";

import { SITE_URL } from "@/features/site/data/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const [archive, posts] = await Promise.all([
    getIndex("archive"),
    getIndex("posts").then((p) => p.filter((d) => !d.sample)),
  ]);

  // An entry, and its Korean reading where it has one, each naming the other.
  const entry = (href: string, korean: boolean, modified: Date): MetadataRoute.Sitemap => {
    const at = (h: string) => `${SITE_URL}${h.replace(/&/g, "&amp;")}`;
    const rest = { lastModified: modified, changeFrequency: "yearly" as const, priority: 0.6 };
    if (!korean) return [{ url: at(href), ...rest }];
    const alternates = { languages: { en: at(href), ko: at(koOf(href)), "x-default": at(href) } };
    return [href, koOf(href)].map((h) => ({ url: at(h), alternates, ...rest }));
  };
  const [archiveKo, postsKo] = [inKorean("archive"), inKorean("posts")];
  const docs: MetadataRoute.Sitemap = [
    ...archive.flatMap((d) => entry(`/archive?view=reel&at=${d.slug}`, archiveKo.has(d.slug), lastModified)),
    ...posts.flatMap((d) => entry(`/blog/${d.slug}`, postsKo.has(d.slug), d.date ? new Date(d.date) : lastModified)),
  ];

  return [
    { url: SITE_URL, lastModified, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/archive`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/members`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/history`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...["", "/about", "/archive", "/history", "/members", "/blog", "/contact"].map(
      (path) => ({
        url: `${SITE_URL}/ai${path}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.4,
      }),
    ),
    ...["/llms.txt", "/llms-full.txt"].map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
    {
      url: `${SITE_URL}/contact`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    ...docs,
  ];
}
