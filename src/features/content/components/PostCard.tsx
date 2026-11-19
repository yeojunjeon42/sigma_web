import Link from "@/i18n/Link";
import type { BlogItem } from "./BlogIndex";
import PostCover from "./PostCover";

const META = "text-caption tracking-normal";

// One card of the blog's grid. The cover carries the section and the title, so only the date
// sits under it.
export default function PostCard({ post, eager = false }: { post: BlogItem; eager?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className="flex flex-col">
      <PostCover title={post.title} section={post.section} cover={post.cover} eager={eager} heading className="w-full" />
      {post.date && <p className={`mt-md ${META} tabular-nums text-ink-muted`}>{post.date}</p>}
    </Link>
  );
}
