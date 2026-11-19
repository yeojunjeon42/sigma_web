export type Collection = "archive" | "posts";

// A photograph in a post's body: an unedited photograph, never a designed graphic. `focus` is the
// point the 3:2 crop keeps, as shares of the picture's width and height.
export type BodyPhoto = { src: string; alt?: string; focus?: [number, number] };
// Where the crop sits on the photograph, as CSS `object-position`.
export const focusOf = ({ focus }: BodyPhoto) => (focus ? `${focus[0] * 100}% ${focus[1] * 100}%` : undefined);

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
  photos: BodyPhoto[];
  // A drawing of the post's own for its cover, as a path under public/blog-illustrations/.
  coverIllustration?: string;
  sample?: boolean;
}

export interface Doc extends DocMeta {
  html: string;
  // The language the text is in: the reader's, or the other one where theirs has none.
  lang: "en" | "ko";
}
