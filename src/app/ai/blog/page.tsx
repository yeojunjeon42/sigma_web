import type { Metadata } from "next";
import { getPosts } from "@/app/ai/corpus";
import { page, postsList } from "@/app/ai/ld";
import { Bil, Ext, Facts, Head, Ld, Section } from "@/app/ai/machine";

const DESCRIPTION = "Every published post, with its date, tags, source and address.";

export const metadata: Metadata = {
  title: "Blog",
  description: DESCRIPTION,
  alternates: { canonical: "/ai/blog", types: { "text/markdown": "/ai/blog.md" } },
};

export default function MachineBlog() {
  const posts = getPosts();

  return (
    <>
      <Ld data={page("/ai/blog", "Blog — published posts", DESCRIPTION)} />
      <Ld data={postsList(posts)} />
      <Head
        title="Blog — published posts"
        lede={`${posts.length} posts, newest first. Post texts are the club's own Korean documents, quoted verbatim in /ai/blog.md and /llms-full.txt.`}
        md="/ai/blog.md"
        human="/blog"
      />

      {posts.map((p) => (
        <Section key={p.slug} id={p.slug} title={p.title.en}>
          <Facts
            rows={[
              { k: "Title", v: <Bil v={p.title} /> },
              { k: "Date", v: <time dateTime={p.date}>{p.date}</time> },
              ...(p.tags.length
                ? [
                    {
                      k: "Tags",
                      v: p.tags.map((t, i) => (
                        <span key={t.en}>
                          {i > 0 && ", "}
                          <Bil v={t} />
                        </span>
                      )),
                    },
                  ]
                : []),
              ...(p.team.length ? [{ k: "Team", v: p.team.join(", ") }] : []),
              ...(p.source ? [{ k: "Source document", v: <span lang="ko">{p.source}</span> }] : []),
              { k: "URL", v: <Ext href={`/blog/${p.slug}`}>{p.url}</Ext> },
            ]}
          />
        </Section>
      ))}
    </>
  );
}
