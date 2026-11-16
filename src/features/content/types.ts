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
  // Cards shown as a reel in place of the cover: one alt text a card, files
  // `blog-photos/<slug>-card-<n>.jpg` counted from 1.
  cards: string[];
  sample?: boolean;
}

export interface Doc extends DocMeta {
  html: string;
}
