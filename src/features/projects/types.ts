import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

export type ProjectStatus = "active" | "planned" | "completed" | "archived";

export interface Project {
  _id: string;
  title: string;
  slug: string;
  status: ProjectStatus;
  category: string;
  images: SanityImageSource[];
  description: unknown[];
  createdAt: string;
  updatedAt: string;
}
