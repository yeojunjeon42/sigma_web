import { T } from "@/components/T";
import type { Project } from "../types";
import ProjectCard from "./ProjectCard";

interface ProjectsGalleryProps {
  projects: Project[];
}

export default function ProjectsGallery({ projects }: ProjectsGalleryProps) {
  if (projects.length === 0) {
    return (
      <p>
        <T en="Projects coming soon." ko="프로젝트 정보가 곧 업데이트됩니다." />
      </p>
    );
  }

  return (
    <ul>
      {projects.map((project) => (
        <li key={project._id}>
          <ProjectCard project={project} />
        </li>
      ))}
    </ul>
  );
}
