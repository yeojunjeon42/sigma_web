import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { coverOf, drawingFile, type Cover } from "@/features/content/api/cover";
import { getDoc } from "@/features/content/api/getContent";
import { displayTags } from "@/features/content/data/tags";
import { pick, type Locale } from "@/i18n/config";
import { INK_FILTER, inkFilter } from "@/features/hand/filter";

// A post's share image is its index cover at this size: the page's paper inside a hairline, the
// section and the title in the same corners, and the same drawing through the same filter.
const W = 1200;
const H = 630;
const PAPER = "#e4e4e4";
const RULE = "#bebebe";
const INK = "#000000";
const EDGE = W * 0.06;
const LABEL = W * 0.034;
const DRAWING = 500;
// A word space, as a share of the type size.
const SPACE = 0.24;
const TITLE = [
  [24, W * 0.075],
  [40, W * 0.065],
  [Infinity, W * 0.055],
] as const;

const font = (name: string) => readFile(path.join(process.cwd(), "src/app/og", name));

// The drawing as the page shows it: its own paths inside the hand layer's filter.
async function drawing(cover: Cover) {
  const file = drawingFile(cover.src);
  if (!existsSync(file)) return null;
  const svg = await readFile(file, "utf8");
  const [, box = "0 0 300 300"] = /viewBox="([^"]+)"/.exec(svg) ?? [];
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  const inked = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" width="${DRAWING}" height="${DRAWING}"><defs>${inkFilter()}</defs><g filter="${INK_FILTER}">${inner}</g></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(inked).toString("base64")}`;
}

// A post's card in a language: /og/blog/<slug> and /og/ko/blog/<slug> are the same drawing with
// the title and the section in that language.
export async function postImage(slug: string, locale: Locale) {
  const doc = await getDoc("posts", slug, locale);
  if (!doc) return new Response("Not found", { status: 404 });
  return postCard({ title: doc.title, section: displayTags(doc.tags, 1).map((tag) => pick(locale, tag))[0], cover: coverOf(doc, locale), whole: locale === "ko" });
}

// `whole` keeps each word in one piece: Korean breaks between words, as the page's cover does, where
// the renderer would break it between any two syllables.
export async function postCard({ title, section, cover, whole = false }: { title: string; section?: string; cover?: Cover; whole?: boolean }) {
  const size = TITLE.find(([most]) => [...title].length <= most)![1];
  const [latin, hangul, drawn] = await Promise.all([font("authentic-sans-100.otf"), font("pretendard-445-hangul.woff"), cover ? drawing(cover) : null]);

  return new ImageResponse(
    (
      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", background: PAPER, border: `2px solid ${RULE}` }}>
        {drawn ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" width={DRAWING} height={DRAWING} src={drawn} style={{ position: "absolute", right: EDGE * 0.7, top: (H - DRAWING) / 2 - 2 }} />
        ) : null}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: EDGE,
            fontFamily: "Sans, Pretendard",
            color: INK,
          }}
        >
          <div style={{ display: "flex", fontSize: LABEL, lineHeight: 1 }}>{section ?? ""}</div>
          {whole ? (
            <div style={{ display: "flex", flexWrap: "wrap", columnGap: size * SPACE, maxWidth: W * 0.5, fontSize: size, lineHeight: 1.06, letterSpacing: "-0.02em" }}>
              {title.split(/\s+/).map((word, i) => (
                <span key={i}>{word}</span>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", maxWidth: W * 0.5, fontSize: size, lineHeight: 1.06, letterSpacing: "-0.02em" }}>{title}</div>
          )}
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [
        { name: "Sans", data: latin, weight: 400, style: "normal" },
        { name: "Pretendard", data: hangul, weight: 400, style: "normal" },
      ],
    },
  );
}
