import { inKorean } from "@/features/content/api/getContent";
import { Post, postMetadata } from "../post";

// The Korean reading of a post. Its address is /blog/<slug>?lang=ko; next.config.ts rewrites it here.
export function generateStaticParams() {
  return [...inKorean("posts")].map((slug) => ({ slug }));
}

export const generateMetadata = async ({ params }: { params: Promise<{ slug: string }> }) => postMetadata((await params).slug, "ko");

export default async function PostInKorean({ params }: { params: Promise<{ slug: string }> }) {
  return <Post slug={(await params).slug} lang="ko" />;
}
