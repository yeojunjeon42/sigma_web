import { pick } from "@/i18n/config";
import { BLOG } from "@/i18n/dict/blog";
import { META } from "@/i18n/dict/meta";
import { localeOf, type PageProps } from "@/i18n/server";
import type { Metadata } from "next";
import { share } from "@/app/share";
import ContactPill from "@/components/ContactPill";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Container, GridField } from "@/components/ui";
import { blogItems } from "@/features/content/api/blogItems";
import { tagLabel } from "@/features/content/data/tags";
import BlogIndex, { type Topic } from "@/features/content/components/BlogIndex";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = await localeOf(params);
  const { title, description } = META[locale].blog;
  return { title, description, ...share(locale, "/blog", { title, description }) };
}

const TOPICS = 6;

export default async function PostsPage({ params }: PageProps) {
  const locale = await localeOf(params);
  const posts = await blogItems(locale);

  const topics: Topic[] = [...new Set(posts.map((p) => p.keys[0]).filter(Boolean))]
    .slice(0, TOPICS)
    .map((key) => ({ key, label: pick(locale, tagLabel(key)) }));

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
          <ContactPill about="blog" pill={BLOG[locale].pill} showOnMobile />
        </main>

        <Footer />
      </div>
    </>
  );
}
