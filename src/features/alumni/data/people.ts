import type { Bilingual } from "@/features/site/data/about";

/** The club's alumni as the club gives them; empty until it does. */
export interface Alumnus {
  id: string;
  name: string;
  /** What they are known for, in the roster's second column. */
  field: Bilingual;
  entryYear: number;
}

/** 1기 came up in 1984, so the 기수 is the entry year less 1983. */
export function alumnusGeneration(a: Alumnus): number {
  return a.entryYear - 1983;
}

export const ALUMNI: Alumnus[] = [];
