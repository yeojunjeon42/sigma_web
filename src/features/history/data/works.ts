import { ARCHIVE } from "@/features/archive/data/projects";
import { splitTitle } from "@/features/archive/components/splitTitle";

const key = (s: string) => s.toLowerCase().replace(/[\s·.–—-]+/g, "");

const BY_NAME = new Map<string, string>();
for (const p of ARCHIVE) {
  const t = splitTitle(p.title);
  for (const n of [t.en, t.ko]) {
    const k = key(n);
    if (k && !BY_NAME.has(k)) BY_NAME.set(k, p.id);
  }
}

function works(work: string): { name: string; id?: string }[] {
  return work
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name) => ({ name, id: BY_NAME.get(key(name)) }));
}

export function soleWork(work: string | undefined): string | undefined {
  if (!work) return undefined;
  const found = works(work);
  return found.length === 1 ? found[0].id : undefined;
}
