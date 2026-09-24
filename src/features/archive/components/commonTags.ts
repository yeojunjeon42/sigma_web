import type { ArchiveProject } from "../types";

/**
 * Tags on more than half of a run describe the run, not the build — "Creative Design
 * Festival" on every 2020 entry — so captions leave them out and keep what sets a build apart.
 */
export function commonTags(projects: ArchiveProject[], tags: Map<string, string[]>) {
  if (projects.length <= 2) return new Set<string>();
  const count = new Map<string, number>();
  for (const p of projects) {
    for (const t of new Set(tags.get(p.id))) count.set(t, (count.get(t) ?? 0) + 1);
  }
  return new Set([...count].filter(([, c]) => c > projects.length / 2).map(([t]) => t));
}
