import { client } from "@/sanity/lib/client";
import type { Activity } from "../types";

const query = `*[_type == "activity"] | order(_createdAt desc) {
  _id,
  title,
  description,
  image,
  link
}`;

export async function getActivities(): Promise<Activity[]> {
  return client.fetch(query);
}
