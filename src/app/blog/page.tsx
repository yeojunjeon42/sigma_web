import type { Metadata } from "next";
import ContactPill from "@/components/ContactPill";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Container, GridField } from "@/components/ui";
import { getIndex } from "@/features/content/api/getContent";
import { displayTags, isDateTag, tagLabel } from "@/features/content/data/tags";
import { formatDate } from "@/lib/date";
import BlogIndex, { type BlogItem, type Topic } from "@/features/content/components/BlogIndex";
import { coverFor } from "@/features/content/data/covers";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing from Sigma Intelligence at Seoul National University.",
};

const TOPICS = 6;

export default async function PostsPage() {
  const index = await getIndex("posts");
  const posts: BlogItem[] = index.map((post) => ({
    slug: post.slug,
    title: post.title,
    date: formatDate(post.date ?? post.year) ?? undefined,
    year: post.year ?? Number((post.date ?? "").slice(0, 4)),
    section: displayTags(post.tags, 1)[0]?.en,
    keys: post.tags.filter((t) => !isDateTag(t)),
    cover: coverFor(post.slug),
    sample: post.sample,
  }));

  const topics: Topic[] = [...new Set(posts.map((p) => p.keys[0]).filter(Boolean))]
    .slice(0, TOPICS)
    .map((key) => ({ key, label: tagLabel(key).en }));

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
            pill={"Have something to share? Write for the blog"}
          />
        </main>

        <Footer />
      </div>
    </>
  );
}
