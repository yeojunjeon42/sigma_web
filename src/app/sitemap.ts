import type { MetadataRoute } from "next";
import { getIndex } from "@/features/content/api/getContent";

import { SITE_URL } from "@/features/site/data/site";
import { LOCALES, localePath } from "@/i18n/config";
import { languages } from "./share";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const [archive, posts] = await Promise.all([
    getIndex("archive"),
    getIndex("posts").then((p) => p.filter((d) => !d.sample)),
  ]);

  // A page in each language, each naming the other.
  const both = (path: string, rest: Omit<MetadataRoute.Sitemap[number], "url">): MetadataRoute.Sitemap =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}${localePath(locale, path).replace(/&/g, "&amp;").replace(/\/$/, "")}`,
      alternates: { languages: Object.fromEntries(Object.entries(languages(path)).map(([l, p]) => [l, `${SITE_URL}${p.replace(/&/g, "&amp;").replace(/\/$/, "")}`])) },
      ...rest,
    }));

  return [
    ...both("/", { lastModified, changeFrequency: "weekly", priority: 1 }),
    ...both("/archive", { lastModified, changeFrequency: "weekly", priority: 0.9 }),
    ...both("/members", { lastModified, changeFrequency: "monthly", priority: 0.8 }),
    ...both("/history", { lastModified, changeFrequency: "monthly", priority: 0.7 }),
    ...both("/blog", { lastModified, changeFrequency: "weekly", priority: 0.7 }),
    ...both("/contact", { lastModified, changeFrequency: "yearly", priority: 0.5 }),
    ...archive.flatMap((d) => both(`/archive?view=reel&at=${d.slug}`, { lastModified, changeFrequency: "yearly", priority: 0.6 })),
    ...posts.flatMap((d) => both(`/blog/${d.slug}`, { lastModified: d.date ? new Date(d.date) : lastModified, changeFrequency: "yearly", priority: 0.6 })),
    ...["", "/about", "/archive", "/history", "/members", "/blog", "/contact"].map((path) => ({
      url: `${SITE_URL}/ai${path}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
    ...["/llms.txt", "/llms-full.txt"].map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
  ];
}
