import type { Metadata } from "next";
import { share } from "@/app/share";
import { coverFor } from "@/features/content/data/covers";
import { SITE_URL } from "@/features/site/data/site";
import "katex/dist/katex.min.css";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getDoc, getIndex, getSlugs } from "@/features/content/api/getContent";
import Article from "@/features/content/components/Article";
import { GridField } from "@/components/ui";

export async function generateStaticParams() {
  return [...(await getSlugs("posts"))].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getDoc("posts", slug);
  if (!doc) return { title: "Not found" };
  const description = doc.summary ?? "Writing from SIGMA INTELLIGENCE at Seoul National University.";
  return {
    title: doc.title,
    description,
    ...share(`/blog/${slug}`, { title: doc.title, description, image: `/og/blog/${slug}`, published: doc.date }),
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = await getDoc("posts", slug);
  if (!doc) notFound();
  const all = await getIndex("posts");
  const at = all.findIndex((p) => p.slug === slug);
  const others = all.filter((p) => p.slug !== slug);
  const near = others.slice(Math.max(0, at - 2), Math.max(0, at - 2) + 4);
  const cover = coverFor(slug);
  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: doc.title,
    ...(doc.summary ? { description: doc.summary } : {}),
    ...(doc.date ? { datePublished: doc.date } : {}),
    ...(cover ? { image: `${SITE_URL}${cover}` } : {}),
    inLanguage: "ko",
    url: `${SITE_URL}/blog/${slug}`,
    mainEntityOfPage: `${SITE_URL}/blog/${slug}`,
    author: doc.authors.length
      ? doc.authors.map((name) => ({ "@type": "Person", name }))
      : { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }}
      />
      <Navbar />
      <main id="main" className="pb-section">
        <GridField>
          <Article
            doc={doc}
            back={{ href: "/blog", label: "Blog" }}
            others={near}
            newer={at > 0 ? all[at - 1] : undefined}
            older={at >= 0 && at < all.length - 1 ? all[at + 1] : undefined}
          />
        </GridField>
      </main>
      <Footer />
    </>
  );
}
