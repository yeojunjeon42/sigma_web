import fs from "node:fs";
import path from "node:path";
import { ROSTER, type RosterMember } from "../data/roster";

// The page shows each member's ink portrait, drawn from the photograph of the same name one
// folder up. A member with no drawing gets the shared placeholder.
const INK_ROOT = path.join(process.cwd(), "public", "members", "ink");

function getLocalPortrait(id: string): string | null {
  if (!/^[a-z0-9-]+$/.test(id) || !fs.existsSync(INK_ROOT)) return null;
  const hit = fs
    .readdirSync(INK_ROOT)
    .find((f) => f.replace(/\.[^.]+$/, "") === id && /\.(jpe?g|png|webp)$/i.test(f));
  return hit ? `/members/ink/${hit}` : null;
}

interface TeamMember extends RosterMember {
  portrait: string | null;
}

export async function getTeam(): Promise<TeamMember[]> {
  return ROSTER.map((member) => ({ ...member, portrait: getLocalPortrait(member.id) }));
}
