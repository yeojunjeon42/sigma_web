// Each post's cover as a PNG, made before every dev and build run: a heightmap of smoothed noise
// read through a colour scale, after Justin Jay Wang's "Methods for random gradients". The slug
// seeds both, so a post keeps its cover; the index and the share image use the one file.
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { createNoise2D } from "simplex-noise";

const POSTS = "content/posts";
const OUT = "public/blog-covers";
const LIST = "src/features/content/data/cover-files.json";
// The share image's size. A square card crops its middle.
const W = 1200;
const H = 630;
// Part of every filename: the image cache keeps a URL for 31 days, so a new look needs new names.
const LOOK = "heightmap-5";

// Colours are chosen in OKLCH. Every scale runs between the same dark and the same light, so
// covers share one brightness range and white text reads on any of them.
const DARK = 0.17;
const LIGHT = 0.47;
// The stops between them sit low, so a cover is mostly dark with one lighter run through it.
const MIDDLE = 0.36;
// Hues centre on crimson. A section shifts the scale a little, and each cover leans its own way
// besides, towards deep magenta or deep orange-red, so neighbours in the grid tell apart. The
// lean towards orange is the shorter one: in OKLCH a dark colour much past 30 degrees reads brown.
const CRIMSON = 18;
const SHIFT = { "Activity report": 3, Trip: -2, Collaboration: -7 };
const OTHER = 0;
const LEANS = [
  [-20, -10],
  [-5, 5],
  [5, 9],
];
// Film grain, in steps of the 255 a channel has.
const GRAIN = 2.6;
// White text keeps at least this contrast on the lightest colour of any scale.
const READABLE = 5;

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function random(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);

function oklab(l, c, h) {
  const t = (h * Math.PI) / 180;
  return [l, c * Math.cos(t), c * Math.sin(t)];
}

function linear([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (rgb) => rgb.every((v) => v >= 0 && v <= 1);
const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const gamma = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

// A colour the screen can show: chroma gives way before lightness or hue.
function colour(l, c, h) {
  let lab = oklab(l, c, h);
  while (!inGamut(linear(lab)) && c > 0.001) lab = oklab(l, (c *= 0.96), h);
  return lab;
}

// The scale: stops at random places, each with its own hue, saturation and brightness, blended
// smoothly. One stop is the dark and one the light, wherever they fall.
function scale(rand, hue) {
  // Stops keep their distance: two close together draw a hard line where a blend should be.
  const n = 4 + Math.floor(rand() * 2);
  const room = 1 / (n - 1);
  const at = Array.from({ length: n }, (_, i) => (i === 0 ? 0 : i === n - 1 ? 1 : (i + lerp(-0.28, 0.28, rand())) * room));
  const light = Array.from({ length: n }, () => lerp(DARK + 0.03, MIDDLE, rand()));
  // The light is never an end stop: the highest and lowest ground is scarce, and a light there
  // shrinks to a spot. Between the ends it runs through the cover as a fold.
  const bright = 1 + Math.floor(rand() * (n - 2));
  let dark = Math.floor(rand() * (n - 1));
  if (dark >= bright) dark += 1;
  light[dark] = DARK;
  light[bright] = LIGHT;
  const stops = at.map((t, i) => ({ t, lab: colour(light[i], lerp(0.15, 0.24, rand()), hue + lerp(-4, 4, rand())) }));
  const table = Array.from({ length: 1024 }, (_, i) => {
    const t = i / 1023;
    const k = Math.min(stops.length - 2, stops.findLastIndex((s) => s.t <= t));
    const [a, b] = [stops[k], stops[k + 1]];
    const u = smooth((t - a.t) / (b.t - a.t || 1));
    return linear(a.lab.map((v, j) => lerp(v, b.lab[j], u))).map((v) => Math.min(1, Math.max(0, v)));
  });
  return table;
}

// The heightmap: very low, gently warped noise over the frame, stretched to fill 0 to 1. Low
// enough that a cover holds a few large folds, not a field of contour lines.
function heights(rand) {
  const noise = createNoise2D(rand);
  const warp = createNoise2D(rand);
  const turn = rand() * Math.PI;
  const [cos, sin] = [Math.cos(turn), Math.sin(turn)];
  const grain = lerp(0.2, 0.42, rand());
  const stretch = lerp(0.6, 1.4, rand());
  const bend = lerp(0.08, 0.26, rand());
  const detail = lerp(0.03, 0.1, rand());
  const [ox, oy] = [rand() * 100, rand() * 100];
  const map = new Float32Array(W * H);
  let lo = Infinity;
  let hi = -Infinity;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const px = x / H - W / H / 2;
      const py = y / H - 0.5;
      const u = (px * cos + py * sin) * grain + ox;
      const v = (-px * sin + py * cos) * grain * stretch + oy;
      const wu = u + bend * warp(u * 0.5, v * 0.5);
      const wv = v + bend * warp(u * 0.5 + 40, v * 0.5 + 40);
      const h = noise(wu, wv) + detail * noise(wu * 2.1 + 9, wv * 2.1 + 9);
      map[y * W + x] = h;
      if (h < lo) lo = h;
      if (h > hi) hi = h;
    }
  for (let i = 0; i < map.length; i++) map[i] = Math.min(1, Math.max(0, (map[i] - lo) / (hi - lo)));
  return map;
}

async function draw(slug, section, file) {
  const rand = random(hash(`${LOOK}:${slug}`));
  const map = heights(rand);
  const [from, to] = LEANS[Math.floor(rand() * LEANS.length)];
  const table = scale(rand, CRIMSON + (SHIFT[section] ?? OTHER) + lerp(from, to, rand()));
  const least = Math.min(...table.map((c) => 1.05 / (luminance(c) + 0.05)));
  if (least < READABLE) throw new Error(`${slug}: white text would fall to ${least.toFixed(2)}:1`);
  const pixels = Buffer.alloc(W * H * 3);
  for (let i = 0; i < map.length; i++) {
    const at = map[i] * 1023;
    const k = Math.min(1022, Math.floor(at));
    const f = at - k;
    // One value for all three channels: grain, and the noise that keeps dark tones this smooth
    // from showing their steps.
    const speck = (rand() - rand()) * GRAIN;
    for (let j = 0; j < 3; j++) {
      const v = gamma(lerp(table[k][j], table[k + 1][j], f)) * 255 + speck;
      pixels[i * 3 + j] = Math.min(255, Math.max(0, Math.round(v)));
    }
  }
  await sharp(pixels, { raw: { width: W, height: H, channels: 3 } }).png({ compressionLevel: 9 }).toFile(file);
  return least;
}

const isDate = (tag) => /^\d{4}\s*[-–—]?\s*\d{0,4}$/.test(tag.trim());

async function posts() {
  const names = (await readdir(POSTS)).filter((n) => n.endsWith(".md"));
  return Promise.all(
    names.map(async (name) => {
      const text = await readFile(path.join(POSTS, name), "utf8");
      const tags = /^tags:\s*\[(.*)\]\s*$/m.exec(text)?.[1].split(",").map((t) => t.trim()) ?? [];
      return { slug: name.replace(/\.md$/, ""), section: tags.find((t) => t && !isDate(t)) };
    }),
  );
}

await mkdir(OUT, { recursive: true });
const have = new Set(await readdir(OUT));
const list = {};
for (const { slug, section } of await posts()) {
  const name = `${slug}-${hash(`${LOOK}:${slug}:${section ?? ""}`).toString(36)}.png`;
  list[slug] = `/blog-covers/${name}`;
  if (have.delete(name)) continue;
  const least = await draw(slug, section, path.join(OUT, name));
  console.log(`cover  ${name}  ${section ?? "no section"}  text ${least.toFixed(1)}:1`);
}
for (const stale of have) await rm(path.join(OUT, stale));
const json = `${JSON.stringify(list, null, 2)}\n`;
if ((await readFile(LIST, "utf8").catch(() => "")) !== json) await writeFile(LIST, json);
