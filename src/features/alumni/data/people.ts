import type { Bilingual } from "@/features/site/data/about";

interface Alumnus {
  id: string;
  name: string;
  field: Bilingual;
  entryYear: number;
}

export function alumnusGeneration(a: Alumnus): number {
  return a.entryYear - 1983;
}

export const ALUMNI: Alumnus[] = [];
