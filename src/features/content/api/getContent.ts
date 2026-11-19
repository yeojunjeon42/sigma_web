import fs from "node:fs";
import path from "node:path";
import { Marked, marked } from "marked";
import markedKatex from "marked-katex-extension";
import type { BodyPhoto, Collection, Doc, DocMeta } from "../types";
import { DEFAULT, other, type Locale } from "@/i18n/config";
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

function toMeta(collection: Collection, slug: string, data: Record<string, string>, locale: Locale = DEFAULT): DocMeta {
  const tags = (data.tags ?? "")
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    slug,
    collection,
    title: (locale === "ko" && data.titleKo) || data.title || slug,
    titleKo: data.titleKo || undefined,
    date: data.date || undefined,
    year: data.year ? Number(data.year) : undefined,
    summary: (locale === "ko" && data.summaryKo) || data.summary || undefined,
    summaryKo: data.summaryKo || undefined,
    tags,
    team: list(data.team),
    authors: list(data.author),
    photos: photos(data.photos),
    coverIllustration: data.coverIllustration || undefined,
    sample: data.sample === "true" || undefined,
  };
}

// content/<locale>/<collection>/<slug>.md: the same file names in both languages.
function dir(collection: Collection, locale: Locale): string {
  return path.join(ROOT, locale, collection);
}

function dirs(collection: Collection, locale: Locale): string[] {
  return collection === "posts" && SHOW_SAMPLES
    ? [dir(collection, locale), path.join(ROOT, SAMPLES_DIR)]
    : [dir(collection, locale)];
}

function mdIn(d: string): string[] {
  if (!fs.existsSync(d)) return [];
  return fs
    .readdirSync(d)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

// An entry exists if either language has it.
function slugs(collection: Collection): string[] {
  return [...new Set([DEFAULT, other(DEFAULT)].flatMap((locale) => dirs(collection, locale).flatMap(mdIn)))];
}

function fileFor(collection: Collection, slug: string, locale: Locale): string | null {
  for (const d of dirs(collection, locale)) {
    const file = path.join(d, `${slug}.md`);
    if (fs.existsSync(file)) return file;
  }
  return null;
}

// An entry in a language. Where that language has no text for it, the other language's text is
// shown instead and `lang` says which it is, so the page can say so.
function read(collection: Collection, slug: string, locale: Locale) {
  const parse = (l: Locale) => {
    const file = fileFor(collection, slug, l);
    return file ? parseFrontmatter(fs.readFileSync(file, "utf8")) : null;
  };
  const own = parse(locale);
  if (own?.body.trim()) return { ...own, lang: locale };
  const lent = parse(other(locale));
  if (lent?.body.trim()) return { data: own?.data ?? lent.data, body: lent.body, lang: other(locale) };
  const empty = own ?? lent;
  return empty ? { ...empty, lang: locale } : null;
}

export async function getSlugs(collection: Collection): Promise<Set<string>> {
  return new Set(slugs(collection));
}

const withMath = new Marked(markedKatex({ throwOnError: false, nonStandard: false }));

export async function getDoc(
  collection: Collection,
  slug: string,
  locale: Locale = DEFAULT,
): Promise<Doc | null> {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;

  const found = read(collection, slug, locale);
  if (!found) return null;

  const { data, body, lang } = found;
  const md = collection === "posts" ? withMath : marked;
  const html = (await md.parse(body, { async: true }))
    .replaceAll('class="katex-display"', 'class="katex-display u-scroll-x"');
  return { ...toMeta(collection, slug, data, locale), html: collection === "posts" ? glue(html) : html, lang };
}

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

export async function getIndex(collection: Collection, locale: Locale = DEFAULT): Promise<DocMeta[]> {
  const out: DocMeta[] = [];
  for (const slug of slugs(collection)) {
    const found = read(collection, slug, locale);
    if (found) out.push(toMeta(collection, slug, found.data, locale));
  }
  return out.sort(
    (a, b) => when(b).localeCompare(when(a)) || a.slug.localeCompare(b.slug),
  );
}

// `photos: file | alt | x y; file | alt`: one photograph to a `;`, in the order they are shown. A
// bare file name is under /blog-photos/; a path from the root is taken as it is. The alt and the
// focus are optional.
function photos(value: string | undefined): BodyPhoto[] {
  return (value ?? "")
    .split(";")
    .map((item) => item.split("|").map((part) => part.trim()))
    .filter(([file]) => file)
    .map(([file, alt, focus]) => {
      const [x, y] = (focus ?? "").split(/\s+/).map(Number);
      return {
        src: file.startsWith("/") ? file : `/blog-photos/${file}`,
        alt: alt || undefined,
        focus: focus && Number.isFinite(x) && Number.isFinite(y) ? [x, y] : undefined,
      };
    });
}

function list(value: string | undefined): string[] {
  return (value ?? "")
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
