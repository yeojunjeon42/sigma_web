import { coverOf } from "@/features/content/api/cover";
import { getDoc, getSlugs } from "@/features/content/api/getContent";
import { displayTags } from "@/features/content/data/tags";
import { postCard } from "../../card";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return [...(await getSlugs("posts"))].map((slug) => ({ slug }));
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await getDoc("posts", slug);
  if (!doc) return new Response("Not found", { status: 404 });
  return postCard({ title: doc.title, section: displayTags(doc.tags, 1)[0]?.en, cover: coverOf(doc) });
}
