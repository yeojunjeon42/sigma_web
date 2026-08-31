import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import type { Project } from "../types";

interface SanityBlock {
  _type: string;
  children?: { text: string }[];
}

function plainText(blocks: unknown[]): string {
  if (!blocks?.length) return "";
  return (blocks as SanityBlock[])
    .filter((b) => b._type === "block")
    .map((b) => b.children?.map((c) => c.text).join("") ?? "")
    .join(" ");
}

export default function ProjectCard({ project }: { project: Project }) {
  const firstImage = project.images?.[0];
  const imageUrl = firstImage
    ? urlFor(firstImage).width(800).height(450).fit("crop").url()
    : null;
  const excerpt = plainText(project.description as unknown[]);

  return (
    <article>
      {imageUrl && (
        <Image src={imageUrl} alt={project.title} width={800} height={450} />
      )}
      <p>{project.status}</p>
      <p>{project.category}</p>
      <h3>{project.title}</h3>
      {excerpt && <p>{excerpt}</p>}
    </article>
  );
}
