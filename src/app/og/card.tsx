import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

const W = 1200;
const H = 630;
const PAD = 80;
const PT = (95 * 4) / 3;
const LEAD = 1.05;
const LINES = 3;
const CORAL = "#f0d8d1";
const INK = "#0f110d";
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
