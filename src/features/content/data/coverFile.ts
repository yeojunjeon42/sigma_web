import files from "./cover-files.json";

// `tools/covers.mjs` draws a cover for every post and writes this list before each dev and
// build run, so a new post has one without anyone asking.
export const coverFile = (slug: string): string | undefined => (files as Record<string, string>)[slug];
