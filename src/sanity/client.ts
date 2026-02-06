import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "mh1jfv2u",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});