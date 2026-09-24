import fs from "node:fs";
import path from "node:path";
import { Marked, marked } from "marked";
import markedKatex from "marked-katex-extension";
import type { Collection, Doc, DocMeta } from "../types";
import { SAMPLES_DIR, SHOW_SAMPLES } from "../data/samples";

const ROOT = path.join(process.cwd(), "content");

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { data: {}, body: raw };

  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const at = line.indexOf(":");
    if (at === -1) continue;
    const key = line.slice(0, at).trim();
    let value = line.slice(at + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) data[key] = value;
  }
  return { data, body: raw.slice(match[0].length) };
}

function toMeta(collection: Collection, slug: string, data: Record<string, string>): DocMeta {
  const tags = (data.tags ?? "")
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    slug,
    collection,
    title: data.title || slug,
    titleKo: data.titleKo || undefined,
    date: data.date || undefined,
    year: data.year ? Number(data.year) : undefined,
    summary: data.summary || undefined,
    summaryKo: data.summaryKo || undefined,
    source: data.source || undefined,
    tags,
    team: list(data.team),
    authors: list(data.author),
    sample: data.sample === "true" || undefined,
  };
}

function dir(collection: Collection): string {
  return path.join(ROOT, collection);
}

function dirs(collection: Collection): string[] {
  return collection === "posts" && SHOW_SAMPLES
    ? [dir(collection), path.join(ROOT, SAMPLES_DIR)]
    : [dir(collection)];
}

function mdIn(d: string): string[] {
  if (!fs.existsSync(d)) return [];
  return fs
    .readdirSync(d)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

function slugs(collection: Collection): string[] {
  return dirs(collection).flatMap(mdIn);
}

function fileFor(collection: Collection, slug: string): string | null {
  for (const d of dirs(collection)) {
    const file = path.join(d, `${slug}.md`);
    if (fs.existsSync(file)) return file;
  }
  return null;
}

export async function getSlugs(collection: Collection): Promise<Set<string>> {
  return new Set(slugs(collection));
}

// Posts may carry TeX between $…$ / $$…$$; archive entries go through plain marked.
const withMath = new Marked(markedKatex({ throwOnError: false, nonStandard: false }));

export async function getDoc(
  collection: Collection,
  slug: string,
): Promise<Doc | null> {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;

  const file = fileFor(collection, slug);
  if (!file) return null;

  const { data, body } = parseFrontmatter(fs.readFileSync(file, "utf8"));
  const md = collection === "posts" ? withMath : marked;
  // Long display equations scroll sideways inside themselves, as a code block does.
  const html = (await md.parse(body, { async: true }))
    .replaceAll('class="katex-display"', 'class="katex-display u-scroll-x"');
  return { ...toMeta(collection, slug, data), html: collection === "posts" ? glue(html) : html };
}

// Punctuation straight after inline maths stays on its line: the formula and the mark are held
// together, the formula found by walking its own span nesting.
function glue(html: string): string {
  const open = '<span class="katex">';
  let out = "";
  let at = 0;
  for (let i = html.indexOf(open); i !== -1; i = html.indexOf(open, at)) {
    let depth = 0;
    let j = i;
    do {
      const o = html.indexOf("<span", j);
      const c = html.indexOf("</span>", j);
      if (c === -1) return out + html.slice(at);
      if (o !== -1 && o < c) {
        depth++;
        j = o + 5;
      } else {
        depth--;
        j = c + 7;
      }
    } while (depth > 0);
    const mark = /^[.,;:)?!]+/.exec(html.slice(j))?.[0];
    out += html.slice(at, i);
    out += mark ? `<span class="whitespace-nowrap">${html.slice(i, j)}${mark}</span>` : html.slice(i, j);
    at = j + (mark?.length ?? 0);
  }
  return out + html.slice(at);
}

function when(doc: DocMeta): string {
  return doc.date ?? (doc.year !== undefined ? String(doc.year) : "");
}

export async function getIndex(collection: Collection): Promise<DocMeta[]> {
  const out: DocMeta[] = [];
  for (const slug of slugs(collection)) {
    const file = fileFor(collection, slug);
    if (!file) continue;
    const { data } = parseFrontmatter(fs.readFileSync(file, "utf8"));
    out.push(toMeta(collection, slug, data));
  }
  return out.sort(
    (a, b) => when(b).localeCompare(when(a)) || a.slug.localeCompare(b.slug),
  );
}

// A bracketed or plain comma list on one line: "[a, b]" or "a, b".
function list(value: string | undefined): string[] {
  return (value ?? "")
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
