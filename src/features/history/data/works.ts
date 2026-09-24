import { ARCHIVE } from "@/features/archive/data/projects";
import { splitTitle } from "@/features/archive/components/splitTitle";

/**
 * A result's `work` field names the build the way the club wrote it on the entry form — `LEAM`,
 * `인공 안내견`, `ISIM · SNUEWheel` — not by the id the archive files it under. The chronology
 * was putting that name straight into `?at=`, so all eighteen of its links opened the reel at
 * whatever happens to be first. This maps the name back onto the record.
 *
 * Both languages of a title are indexed, and matching ignores case, spacing and the dashes the
 * two sources punctuate differently.
 */
const key = (s: string) => s.toLowerCase().replace(/[\s·.–—-]+/g, "");

const BY_NAME = new Map<string, string>();
for (const p of ARCHIVE) {
  const t = splitTitle(p.title);
  for (const n of [t.en, t.ko]) {
    const k = key(n);
    if (k && !BY_NAME.has(k)) BY_NAME.set(k, p.id);
  }
}

/** The builds a result's `work` names, each with its archive id where the record has one. */
export function works(work: string): { name: string; id?: string }[] {
  return work
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name) => ({ name, id: BY_NAME.get(key(name)) }));
}

/** The one build a result is about, or nothing when it names several or none on record. */
export function soleWork(work: string | undefined): string | undefined {
  if (!work) return undefined;
  const found = works(work);
  return found.length === 1 ? found[0].id : undefined;
}
