import { getSlugs } from "@/features/content/api/getContent";
import { postImage } from "../../card";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return [...(await getSlugs("posts"))].map((slug) => ({ slug }));
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  return postImage((await params).slug, "en");
}
