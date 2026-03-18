"use client";

import { useState } from "react";
import { T } from "@/components/T";
import type { Project } from "../types";
import ProjectCard from "./ProjectCard";
import ProjectDetailModal from "./ProjectDetailModal";

interface ProjectsGalleryProps {
  projects: Project[];
}

export default function ProjectsGallery({ projects }: ProjectsGalleryProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  if (projects.length === 0) {
    return (
      <section data-anim="reveal-group" className="py-24 text-center text-neutral-400">
        <svg
          data-anim="reveal-item"
          className="mx-auto mb-6 h-16 w-16 opacity-30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <p data-anim="reveal-item" className="text-lg">
          <T en="Projects coming soon." ko="프로젝트 정보가 곧 업데이트됩니다." />
        </p>
      </section>
    );
  }

  return (
    <section data-anim="reveal-group">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
        {projects.map((project) => (
          <div key={project._id} data-anim="reveal-item" className="flex">
            <ProjectCard
              project={project}
              onClick={() => setSelectedProject(project)}
            />
          </div>
        ))}
      </div>

      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </section>
  );
}
