import fs from "node:fs";
import path from "node:path";
import { ROSTER, type RosterMember } from "../data/roster";

const PHOTO_ROOT = path.join(process.cwd(), "public", "members");

export function getLocalPortrait(id: string): string | null {
  if (!/^[a-z0-9-]+$/.test(id) || !fs.existsSync(PHOTO_ROOT)) return null;
  const hit = fs
    .readdirSync(PHOTO_ROOT)
    .find((f) => f.replace(/\.[^.]+$/, "") === id && /\.(jpe?g|png|webp)$/i.test(f));
  return hit ? `/members/${hit}` : null;
}

export interface TeamMember extends RosterMember {
  portrait: string | null;
}

export async function getTeam(): Promise<TeamMember[]> {
  return ROSTER.map((member) => ({ ...member, portrait: getLocalPortrait(member.id) }));
}
