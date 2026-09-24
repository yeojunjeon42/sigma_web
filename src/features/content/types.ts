export type Collection = "archive" | "posts";

export interface DocMeta {
  slug: string;
  collection: Collection;
  title: string;
  titleKo?: string;
  date?: string;
  year?: number;
  summary?: string;
  summaryKo?: string;
  tags: string[];
  team: string[];
  authors: string[];
  source?: string;
  sample?: boolean;
}

export interface Doc extends DocMeta {
  html: string;
}
