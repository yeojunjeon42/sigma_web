import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { drawingFile, type Cover } from "@/features/content/api/cover";
import { HANG, leans } from "@/features/content/components/coverType";
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
const TITLE = [
  [24, W * 0.075],
  [40, W * 0.065],
  [Infinity, W * 0.055],
] as const;

// The card trims the title's box to its baseline; this renderer cannot, so the title is let down
// by what lies under the baseline in its line: the face's descent (0.224em) and half of the
// leading over one em. The baseline then stands as far from the foot as the words do from the side.
const LEAD = 1.06;
const UNDER = 0.224 + (LEAD - 1) / 2;
// The card's first-line indent for a line that starts with a diagonal capital.
const indent = (text: string | undefined, size: number) => (leans(text) ? size * HANG : 0);

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

export async function postCard({ title, section, cover }: { title: string; section?: string; cover?: Cover }) {
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
          <div style={{ display: "flex", fontSize: LABEL, lineHeight: 1, textIndent: indent(section, LABEL) }}>{section ?? ""}</div>
          <div style={{ display: "flex", maxWidth: W * 0.5, fontSize: size, lineHeight: LEAD, letterSpacing: "-0.02em", textIndent: indent(title, size), marginBottom: -size * UNDER }}>{title}</div>
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
