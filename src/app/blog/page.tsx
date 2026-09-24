import type { Metadata } from "next";
import ContactPill from "@/components/ContactPill";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Container, GridField } from "@/components/ui";
import { getDoc, getIndex } from "@/features/content/api/getContent";
import { displayTags, isDateTag, tagLabel } from "@/features/content/data/tags";
import { formatDate } from "@/lib/date";
import BlogIndex, { type BlogItem, type Topic } from "@/features/content/components/BlogIndex";
import { coverFor } from "@/features/content/data/covers";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing from Sigma Intelligence at Seoul National University.",
};

const TOPICS = 6;

// The first paragraph of the post, as marked printed it.
function lead(html: string): string | null {
  const m = /<p>([\s\S]*?)<\/p>/.exec(html);
  return m ? m[1].trim() : null;
}

function day(value: string | undefined) {
  const m = value ? /^\d{4}-(\d{1,2})(?:-(\d{1,2}))?$/.exec(value) : null;
  if (!m) return undefined;
  const full = formatDate(value);
  return full ? { en: full.en.replace(/, \d{4}$/, "").replace(/ \d{4}$/, ""), ko: full.ko.replace(/^\d{4}년 /, "") } : undefined;
}

export default async function PostsPage() {
  const index = await getIndex("posts");
  const posts: BlogItem[] = await Promise.all(
    index.map(async (post) => {
      const doc = post.summary ? null : await getDoc("posts", post.slug);
      const keys = post.tags.filter((t) => !isDateTag(t));
      return {
        slug: post.slug,
        title: { en: post.title, ko: post.titleKo ?? post.title },
        date: formatDate(post.date ?? post.year) ?? undefined,
        day: day(post.date),
        year: post.year ?? Number((post.date ?? "").slice(0, 4)),
        tags: displayTags(post.tags, 2),
        keys,
        excerpt: post.summary ?? (doc ? lead(doc.html) : null),
        cover: coverFor(post.slug),
        sample: post.sample,
      };
    }),
  );

  const count = new Map<string, number>();
  posts.forEach((p) => p.keys.forEach((k) => count.set(k, (count.get(k) ?? 0) + 1)));
  const topics: Topic[] = [...count.entries()]
    .filter(([, n]) => n > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, TOPICS)
    .map(([key]) => ({ key, label: tagLabel(key) }));

  const years = posts.map((p) => p.year).filter(Number.isFinite);
  const span = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : "";

  return (
    <>
      <Navbar />

      <div className="relative z-10 bg-canvas">
        <main id="main">
          <GridField>
            <Container className="page-opening pb-section">
              <BlogIndex posts={posts} topics={topics} span={span} />
            </Container>
          </GridField>
          <ContactPill
            about="blog"
            pill={{ en: "Have something to share? Write for the blog", ko: "나누고 싶은 이야기가 있나요? 블로그에 글을 써 주세요" }}
            ask={{ en: "Have something to share?", ko: "나누고 싶은 이야기가 있나요?" }}
            link={{ en: "Write for the blog", ko: "블로그에 글 쓰기" }}
          />
        </main>

        <Footer />
      </div>
    </>
  );
}
