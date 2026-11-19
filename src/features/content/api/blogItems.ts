import { formatDate } from "@/lib/date";
import type { BlogItem } from "../components/BlogIndex";
import { displayTags, isDateTag } from "../data/tags";
import { coverOf } from "./cover";
import { getIndex } from "./getContent";

// The posts as the blog's index shows them.
export async function blogItems(): Promise<BlogItem[]> {
  return (await getIndex("posts")).map((post) => ({
    slug: post.slug,
    title: post.title,
    date: formatDate(post.date ?? post.year) ?? undefined,
    cover: coverOf(post),
    year: post.year ?? Number((post.date ?? "").slice(0, 4)),
    section: displayTags(post.tags, 1)[0]?.en,
    keys: post.tags.filter((t) => !isDateTag(t)),
    sample: post.sample,
  }));
}
