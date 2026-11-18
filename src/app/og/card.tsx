import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { coverFile } from "@/features/content/data/coverFile";

const W = 1200;
const H = 630;
const PAD = 80;
const PT = (95 * 4) / 3;
const LEAD = 1.05;
const LINES = 3;
const CORAL = "#f0d8d1";
const INK = "#000000";
const HANGUL = /[ㄱ-ㆎ가-힣]/;

const advance = (c: string) =>
  c === " "
    ? 0.31
    : HANGUL.test(c)
      ? 1
      : /[A-Z]/.test(c)
        ? 0.9
        : /[a-z]/.test(c)
          ? 0.67
          : /\d/.test(c)
            ? 0.77
            : c === "—"
              ? 1.25
              : 0.5;
const measure = (s: string, size: number) => [...s].reduce((a, c) => a + advance(c) - 0.02, 0) * size;

function fits(text: string, size: number) {
  const room = (W - 2 * PAD) * 0.82;
  let lines = 1;
  let line = "";
  for (const word of text.split(" ")) {
    if (measure(word, size) > room) return false;
    const next = line ? `${line} ${word}` : word;
    if (measure(next, size) > room) {
      lines += 1;
      line = word;
    } else line = next;
  }
  return lines <= LINES && lines * size * LEAD <= H - 2 * PAD;
}

const font = (name: string) => readFile(path.join(process.cwd(), "src/app/og", name));

export async function titleCard(title: string) {
  let size = PT;
  while (size > 40 && !fits(title, size)) size -= 2;
  const [latin, hangul] = await Promise.all([font("archivo-expanded-bold.ttf"), font("pretendard-bold-hangul.woff")]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: `0 ${PAD}px`,
          background: CORAL,
        }}
      >
        <div
          style={{
            display: "flex",
            textAlign: "center",
            fontFamily: "Archivo, Pretendard",
            fontSize: size,
            lineHeight: LEAD,
            letterSpacing: "-0.02em",
            color: INK,
          }}
        >
          {title}
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [
        { name: "Archivo", data: latin, weight: 700, style: "normal" },
        { name: "Pretendard", data: hangul, weight: 700, style: "normal" },
      ],
    },
  );
}

// A post's share image is its index cover at this size: the same file, with the section and
// the title in the same corners. Sizes are the cover's, as shares of the width.
const DEEP = "#8e1316";
const PAPER = "#ffffff";
const EDGE = W * 0.06;
const LABEL = W * 0.034;
const TITLE = [
  [24, W * 0.08],
  [40, W * 0.07],
  [Infinity, W * 0.06],
] as const;

export async function postCard({ slug, title, section }: { slug: string; title: string; section?: string }) {
  const file = coverFile(slug);
  // The folder is named in full: a path that could be anywhere under public/ makes the build pack all
  // of public/ into this function, and that is past the platform's size limit.
  const cover = file ? await readFile(path.join(process.cwd(), "public/blog-covers", path.basename(file))) : null;
  const size = TITLE.find(([most]) => [...title].length <= most)![1];
  const [latin, hangul] = await Promise.all([font("authentic-sans-100.otf"), font("pretendard-445-hangul.woff")]);

  return new ImageResponse(
    (
      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", background: DEEP }}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" width={W} height={H} src={`data:image/png;base64,${cover.toString("base64")}`} style={{ position: "absolute", left: 0, top: 0 }} />
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
            color: PAPER,
          }}
        >
          <div style={{ display: "flex", fontSize: LABEL, lineHeight: 1 }}>{section ?? ""}</div>
          <div style={{ display: "flex", maxWidth: W * 0.78, fontSize: size, lineHeight: 1.06, letterSpacing: "-0.02em" }}>
            {title}
          </div>
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
