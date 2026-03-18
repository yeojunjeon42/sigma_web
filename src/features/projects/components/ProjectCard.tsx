import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import type { Project, ProjectStatus } from "../types";

const STATUS_COLORS: Record<ProjectStatus, string> = {
  active: "bg-emerald-500/90 text-white",
  planned: "bg-amber-500/90 text-white",
  completed: "bg-sky-500/90 text-white",
  archived: "bg-neutral-500/90 text-white",
};

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

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const firstImage = project.images?.[0];
  const imageUrl = firstImage
    ? urlFor(firstImage).width(800).height(450).fit("crop").url()
    : null;
  const excerpt = plainText(project.description as unknown[]);

  return (
    <article
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-colors hover:border-white/20"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-800">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={project.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-600">
            <svg className="h-10 w-10 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        <span
          className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:px-3 sm:py-1 sm:text-[11px] ${STATUS_COLORS[project.status] ?? STATUS_COLORS.planned}`}
        >
          {project.status}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {project.category && (
          <span className="mb-2 inline-block self-start rounded-full border border-white/20 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-300 sm:px-3 sm:text-xs">
            {project.category}
          </span>
        )}
        <h3 className="mb-1.5 text-base font-bold leading-tight text-white sm:mb-2 sm:text-lg">
          {project.title}
        </h3>
        {excerpt && (
          <p className="line-clamp-2 text-sm leading-relaxed text-neutral-400">
            {excerpt}
          </p>
        )}
        <span className="mt-auto pt-3 text-xs font-medium text-bright-red opacity-0 transition-opacity group-hover:opacity-100">
          View details →
        </span>
      </div>
    </article>
  );
}
