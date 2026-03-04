import { sanityFetch } from "@/sanity/lib/live";
import type { Activity } from "../types";

const query = `*[_type == "activity"] | order(_createdAt desc) {
  _id,
  title,
  description,
  image,
  link
}`;

export async function getActivities(): Promise<Activity[]> {
  const { data } = await sanityFetch({ query });
  return data;
}
