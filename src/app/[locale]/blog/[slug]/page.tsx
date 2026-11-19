import { localePath } from "@/i18n/config";
import { BLOG } from "@/i18n/dict/blog";
import { META } from "@/i18n/dict/meta";
import { localeOf } from "@/i18n/server";
import { coverOf } from "@/features/content/api/cover";
import type { Metadata } from "next";
import { share } from "@/app/share";
import { SITE_URL } from "@/features/site/data/site";
import "katex/dist/katex.min.css";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getDoc, getSlugs } from "@/features/content/api/getContent";
import Article from "@/features/content/components/Article";
import { GridField } from "@/components/ui";

export async function generateStaticParams() {
  return [...(await getSlugs("posts"))].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await localeOf(params);
  const doc = await getDoc("posts", slug, locale);
  if (!doc) return { title: META[locale].notFound };
  const description = doc.summary ?? META[locale].blog.description;
  return {
    title: doc.title,
    description,
    ...share(locale, `/blog/${slug}`, { title: doc.title, description, image: { url: `/og${localePath(locale, `/blog/${slug}`)}`, alt: coverOf(doc, locale)?.alt ?? doc.title }, published: doc.date }),
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const locale = await localeOf(params);
  const doc = await getDoc("posts", slug, locale);
  if (!doc) notFound();
  const cover = doc.photos[0]?.src;
  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: doc.title,
    ...(doc.summary ? { description: doc.summary } : {}),
    ...(doc.date ? { datePublished: doc.date } : {}),
    ...(cover ? { image: `${SITE_URL}${cover}` } : {}),
    inLanguage: doc.lang,
    url: `${SITE_URL}${localePath(locale, `/blog/${slug}`)}`,
    mainEntityOfPage: `${SITE_URL}${localePath(locale, `/blog/${slug}`)}`,
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
          <Article doc={doc} locale={locale} back={{ href: "/blog", label: BLOG[locale].title }} />
        </GridField>
      </main>
      <Footer />
    </>
  );
}
