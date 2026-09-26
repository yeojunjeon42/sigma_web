import fs from "node:fs";
import path from "node:path";
import { ARCHIVE } from "../data/projects";
import { COVERS } from "../data/covers";
import { ERAS, type ArchiveProject, type Era, type Photo } from "../types";
import { imageSize } from "./imageSize";

const PHOTO_ROOT = path.join(process.cwd(), "public", "archive-photos");
const VIDEO_ROOT = path.join(process.cwd(), "public", "archive-video");

function listMedia(root: string, urlBase: string, id: string, ext: RegExp): string[] {
  const dir = path.join(root, id);
  if (!/^[a-z0-9-]+$/.test(id) || !fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => ext.test(f))
    .sort()
    .map((f) => `${urlBase}/${id}/${f}`);
}

function sized(src: string): Photo {
  const size = imageSize(path.join(process.cwd(), "public", src));
  return { src, width: size?.width ?? 1000, height: size?.height ?? 1000 };
}

export function getLocalPhotos(id: string): Photo[] {
  return listMedia(PHOTO_ROOT, "/archive-photos", id, /\.(jpe?g|png|webp)$/i).map(sized);
}

const firstPhoto = new Map<string, Photo | null>();

function getFirstLocalPhoto(id: string): Photo | null {
  const hit = firstPhoto.get(id);
  if (hit !== undefined && process.env.NODE_ENV === "production") return hit;
  const cover = COVERS[id];
  const all = listMedia(PHOTO_ROOT, "/archive-photos", id, /\.(jpe?g|png|webp)$/i);
  const src = (cover?.file && all.find((s) => s.endsWith(`/${cover.file}`))) || all[0];
  const photo = src ? { ...sized(src), focus: cover?.focus } : null;
  firstPhoto.set(id, photo);
  return photo;
}

export function getLocalVideos(id: string): string[] {
  return listMedia(VIDEO_ROOT, "/archive-video", id, /\.(mp4|webm)$/i);
}

async function getArchive(): Promise<ArchiveProject[]> {
  return ARCHIVE;
}

export async function getArchiveWithMedia(): Promise<ArchiveProject[]> {
  const entries = await getArchive();
  return entries.map((entry) => {
    const local = getFirstLocalPhoto(entry.id);
    return local
      ? { ...entry, imageUrl: local.src, imageW: local.width, imageH: local.height, imageFocus: local.focus }
      : entry;
  });
}

export function parseEra(value: string | undefined): Era | null {
  return ERAS.some((e) => e.key === value) ? (value as Era) : null;
}

export type Sort = "year" | "team" | "name";

export function parseSort(value: string | undefined): Sort {
  return value === "team" || value === "name" ? value : "year";
}

export function sortArchive(
  projects: ArchiveProject[],
  sort: Sort,
  teamSize: Map<string, number>,
): ArchiveProject[] {
  const out = [...projects];
  if (sort === "name") {
    return out.sort((a, b) => a.title.localeCompare(b.title, "en"));
  }
  if (sort === "team") {
    return out.sort((a, b) => {
      const x = teamSize.get(a.id), y = teamSize.get(b.id);
      if (x === undefined && y === undefined) return (b.year ?? 0) - (a.year ?? 0);
      if (x === undefined) return 1;
      if (y === undefined) return -1;
      return y - x || (b.year ?? 0) - (a.year ?? 0);
    });
  }
  return out;
}
