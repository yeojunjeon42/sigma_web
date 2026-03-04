import { sanityFetch } from "@/sanity/lib/live";
import type { Project } from "../types";

const query = `*[_type == "project"] | order(coalesce(updatedAt, _updatedAt) desc) {
  _id,
  title,
  "slug": slug.current,
  status,
  category,
  images,
  description,
  "createdAt": coalesce(createdAt, _createdAt),
  "updatedAt": coalesce(updatedAt, _updatedAt)
}`;

export async function getProjects(): Promise<Project[]> {
  const { data } = await sanityFetch({ query });
  return data;
}
