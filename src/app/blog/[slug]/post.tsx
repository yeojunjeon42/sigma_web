import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import { notFound, redirect } from "next/navigation";
import { share } from "@/app/share";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GridField } from "@/components/ui";
import { coverOf } from "@/features/content/api/cover";
import { getDoc } from "@/features/content/api/getContent";
import Article from "@/features/content/components/Article";
import { koOf, otherReading, readings } from "@/features/content/reading";
import type { Lang } from "@/features/content/types";
import { SITE_URL } from "@/features/site/data/site";

// A post at /blog/<slug>, and its Korean reading at /blog/<slug>?lang=ko (next.config.ts serves
// that from /blog/<slug>/ko, so both stay prerendered). Only the text is Korean there: the title,
// the metadata and everything around it are the English page's.
export async function postMetadata(slug: string): Promise<Metadata> {
  const doc = await getDoc("posts", slug);
  if (!doc) return { title: "Not found" };
  const description = doc.summary ?? "Writing from SIGMA INTELLIGENCE at Seoul National University.";
  const href = `/blog/${slug}`;
  return {
    title: doc.title,
    description,
    ...share(href, {
      title: doc.title,
      description,
      image: { url: `/og/blog/${slug}`, alt: coverOf(doc)?.alt ?? doc.title },
      published: doc.date,
      languages: readings(href, doc.langs),
    }),
  };
}

export async function Post({ slug, lang }: { slug: string; lang: Lang }) {
  const doc = await getDoc("posts", slug, lang);
  if (!doc) notFound();
  const href = `/blog/${slug}`;
  // No Korean text: the Korean address is the English page.
  if (doc.lang !== lang) redirect(href);
  const cover = doc.photos[0]?.src;
  const url = `${SITE_URL}${lang === "ko" ? koOf(href) : href}`;
  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: doc.title,
    ...(doc.summary ? { description: doc.summary } : {}),
    ...(doc.date ? { datePublished: doc.date } : {}),
    ...(cover ? { image: `${SITE_URL}${cover}` } : {}),
    inLanguage: doc.lang,
    url,
    mainEntityOfPage: url,
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
      <main id="main" className="bg-canvas pb-section">
        <GridField>
          <Article doc={doc} back={{ href: "/blog", label: "Blog" }} reading={otherReading(href, doc.lang, doc.langs)} />
        </GridField>
      </main>
      <Footer />
    </>
  );
}
