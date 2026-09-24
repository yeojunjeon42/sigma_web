import type { MetadataRoute } from "next";
import { getIndex } from "@/features/content/api/getContent";

const SITE_URL = "https://sigmaintelligence.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const [archive, posts] = await Promise.all([
    getIndex("archive"),
    getIndex("posts").then((p) => p.filter((d) => !d.sample)),
  ]);

  const docs: MetadataRoute.Sitemap = [
    ...archive.map((d) => ({
      url: `${SITE_URL}/archive?view=reel&at=${d.slug}`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    ...posts.map((d) => ({
      url: `${SITE_URL}/blog/${d.slug}`,
      lastModified: d.date ? new Date(d.date) : lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
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
