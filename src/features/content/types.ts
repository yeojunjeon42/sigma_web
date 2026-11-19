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

// The languages an entry's text can be read in. English is the site's; Korean is offered beside it.
export type Lang = "en" | "ko";

export interface Doc extends DocMeta {
  html: string;
  // The language the text is in: the one asked for, or the other where that one has none.
  lang: Lang;
  // Every language the entry has text in.
  langs: Lang[];
}
