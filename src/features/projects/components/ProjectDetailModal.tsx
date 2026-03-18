"use client";

import { useEffect, useCallback } from "react";
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

function renderDescription(blocks: unknown[]): string {
  if (!blocks?.length) return "";
  return (blocks as SanityBlock[])
    .filter((b) => b._type === "block")
    .map((b) => b.children?.map((c) => c.text).join("") ?? "")
    .join("\n\n");
}

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectDetailModal({
  project,
  onClose,
}: ProjectDetailModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const firstImage = project.images?.[0];
  const imageUrl = firstImage
    ? urlFor(firstImage).width(1200).height(675).fit("crop").url()
    : null;
  const description = renderDescription(project.description as unknown[]);
  const updatedDate = project.updatedAt
    ? new Date(project.updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-dark shadow-2xl sm:max-h-[85vh]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white"
          aria-label="Close"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {imageUrl && (
          <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-neutral-800">
            <Image
              src={imageUrl}
              alt={project.title}
              fill
              sizes="(max-width: 672px) 100vw, 672px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS_COLORS[project.status] ?? STATUS_COLORS.planned}`}
            >
              {project.status}
            </span>
            {project.category && (
              <span className="rounded-full border border-white/20 px-3 py-0.5 text-xs font-medium uppercase tracking-wide text-neutral-300">
                {project.category}
              </span>
            )}
          </div>

          <h2 className="mb-3 text-xl font-bold text-white sm:text-2xl">
            {project.title}
          </h2>

          {description && (
            <div className="mb-4 text-sm leading-relaxed whitespace-pre-line text-neutral-300 sm:text-base">
              {description}
            </div>
          )}

          {updatedDate && (
            <p className="text-xs text-neutral-500">
              Last updated: {updatedDate}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
