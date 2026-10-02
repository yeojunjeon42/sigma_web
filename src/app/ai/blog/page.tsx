import type { Metadata } from "next";
import { getPosts } from "@/app/ai/corpus";
import { page, postsList } from "@/app/ai/ld";
import { Chips, DIM, Ext, Head, Items, Ld, Section } from "@/app/ai/terminal";

const DESCRIPTION = "Every published post, with its date, tags and address.";

export const metadata: Metadata = {
  title: "Blog",
  description: DESCRIPTION,
  alternates: { canonical: "/ai/blog", types: { "text/markdown": "/ai/blog.md" } },
};

export default function TerminalBlog() {
  const posts = getPosts();

  return (
    <>
      <Ld data={page("/ai/blog", "Blog — published posts", DESCRIPTION)} />
      <Ld data={postsList(posts)} />
      <Head
        name="blog"
        notes={["posts, newest first.", "full texts: /ai/blog.md, /llms-full.txt"]}
        facts={[{ k: "Posts", v: String(posts.length) }]}
        md="/ai/blog.md"
        human="/blog"
      />

      <Section id="posts" title="Posts">
        <Items mark="*">
          {posts.map((p) => (
            <li key={p.slug} id={p.slug} className="scroll-mt-6">
              <time dateTime={p.date} className={DIM}>
                {p.date}
              </time>{" "}
              <Ext href={`/blog/${p.slug}`}>{p.title.en}</Ext>
              {p.title.ko && p.title.ko !== p.title.en && (
                <span lang="ko" className={`block ${DIM}`}>
                  {p.title.ko}
                </span>
              )}
              <Chips items={p.tags.map((t) => t.en)} />
              {p.team.length > 0 && <span className={`block ${DIM}`}>team: {p.team.join(", ")}</span>}
            </li>
          ))}
        </Items>
      </Section>
    </>
  );
}
