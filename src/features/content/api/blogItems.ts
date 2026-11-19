import { pick, type Locale } from "@/i18n/config";
import { formatDate } from "@/lib/date";
import type { BlogItem } from "../components/BlogIndex";
import { displayTags, isDateTag } from "../data/tags";
import { coverOf } from "./cover";
import { getIndex } from "./getContent";

// The posts as the blog's index shows them.
export async function blogItems(locale: Locale): Promise<BlogItem[]> {
  return (await getIndex("posts", locale)).map((post) => ({
    slug: post.slug,
    title: post.title,
    date: formatDate(post.date ?? post.year, locale) ?? undefined,
    cover: coverOf(post, locale),
    year: post.year ?? Number((post.date ?? "").slice(0, 4)),
    section: displayTags(post.tags, 1).map((tag) => pick(locale, tag))[0],
    keys: post.tags.filter((t) => !isDateTag(t)),
    sample: post.sample,
  }));
}
