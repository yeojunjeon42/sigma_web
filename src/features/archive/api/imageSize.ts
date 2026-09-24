import fs from "node:fs";

type Size = { width: number; height: number };

const cache = new Map<string, Size | null>();

/**
 * EXIF orientation from an APP1 segment, or 1. Phones store a portrait frame on its side
 * and set this; browsers and the image optimiser turn it upright, so the size we report
 * has to be the upright one or every rotated photo gets the wrong frame.
 */
function exifOrientation(b: Buffer, start: number, length: number): number {
  if (b.toString("ascii", start, start + 6) !== "Exif\0\0") return 1;
  const t = start + 6; // TIFF header
  if (t + 8 > start + length) return 1;
  const le = b.toString("ascii", t, t + 2) === "II";
  const u16 = (o: number) => (le ? b.readUInt16LE(o) : b.readUInt16BE(o));
  const u32 = (o: number) => (le ? b.readUInt32LE(o) : b.readUInt32BE(o));
  const ifd = t + u32(t + 4);
  if (ifd + 2 > b.length) return 1;
  const n = u16(ifd);
  for (let k = 0; k < n; k++) {
    const e = ifd + 2 + k * 12;
    if (e + 12 > b.length) break;
    if (u16(e) === 0x0112) return u16(e + 8) || 1;
  }
  return 1;
}

function jpeg(b: Buffer): Size | null {
  let i = 2;
  let orientation = 1;
  while (i < b.length - 9) {
    if (b[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = b[i + 1];
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      i += 2;
      continue;
    }
    const length = b.readUInt16BE(i + 2);
    if (marker === 0xe1) orientation = exifOrientation(b, i + 4, length - 2);
    if (
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc
    ) {
      const height = b.readUInt16BE(i + 5);
      const width = b.readUInt16BE(i + 7);
      return orientation >= 5 ? { width: height, height: width } : { width, height };
    }
    i += 2 + length;
  }
  return null;
}

function png(b: Buffer): Size | null {
  if (b.length < 24 || b.toString("ascii", 12, 16) !== "IHDR") return null;
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

function webp(b: Buffer): Size | null {
  if (b.length < 30 || b.toString("ascii", 8, 12) !== "WEBP") return null;
  const chunk = b.toString("ascii", 12, 16);

  if (chunk === "VP8X") {
    return {
      width: (b.readUIntLE(24, 3) & 0xffffff) + 1,
      height: (b.readUIntLE(27, 3) & 0xffffff) + 1,
    };
  }

  if (chunk === "VP8 ") {
    if (b[23] !== 0x9d || b[24] !== 0x01 || b[25] !== 0x2a) return null;
    return {
      width: b.readUInt16LE(26) & 0x3fff,
      height: b.readUInt16LE(28) & 0x3fff,
    };
  }

  if (chunk === "VP8L") {
    if (b[20] !== 0x2f) return null;
    const bits = b.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }

  return null;
}

export function imageSize(file: string): Size | null {
  const hit = cache.get(file);
  if (hit !== undefined) return hit;

  let out: Size | null = null;
  try {
    const b = fs.readFileSync(file);
    if (b.length > 24) {
      if (b[0] === 0xff && b[1] === 0xd8) out = jpeg(b);
      else if (b.readUInt32BE(0) === 0x89504e47) out = png(b);
      else if (b.toString("ascii", 0, 4) === "RIFF") out = webp(b);
    }
  } catch {
    out = null;
  }

  cache.set(file, out);
  return out;
}
