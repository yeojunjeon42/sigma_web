// Draws the site's ink illustrations: `node tools/ink.mjs` writes every SVG, `node tools/ink.mjs
// maple-leaf` just that one. Each drawing is a module in tools/ink/ that lays strokes on a sheet;
// the files it writes are what the site serves, so run this only after changing a drawing.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { sheet } from "./ink/pen.mjs";

const DRAWINGS = ["activity-report", "trip", "collaboration", "education", "maple-leaf", "placeholder"];
const INK = "#0a0907";
const ACCENT = "#ed2024";

for (const name of DRAWINGS.filter((n) => !process.argv[2] || n === process.argv[2])) {
  const { file, title, box, draw } = await import(`./ink/${name}.mjs`);
  const page = sheet();
  draw(page);
  // One path for the ink and one for the accent: the page roughens them, so they carry no filter.
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${box[0]} ${box[1]}"><title>${title}</title>` +
    `<path fill="${INK}" d="${page.marks.ink.join("")}"/><path fill="${ACCENT}" d="${page.marks.accent.join("")}"/></svg>\n`;
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, svg);
  console.log(`ink  ${file}  ${(svg.length / 1024).toFixed(0)} KB`);
}
