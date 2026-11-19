import { getSlugs } from "@/features/content/api/getContent";
import { Post, postMetadata } from "./post";

export async function generateStaticParams() {
  return [...(await getSlugs("posts"))].map((slug) => ({ slug }));
}

export const generateMetadata = async ({ params }: { params: Promise<{ slug: string }> }) => postMetadata((await params).slug);

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  return <Post slug={(await params).slug} lang="en" />;
}
