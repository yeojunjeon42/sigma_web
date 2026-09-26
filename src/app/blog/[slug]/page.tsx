import type { Metadata } from "next";
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
  return { title: doc.title, description: doc.summary };
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

  return (
    <>
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
