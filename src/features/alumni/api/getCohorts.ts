import { ALUMNI_TOTAL, COHORTS } from "../data/cohorts";
import type { Cohort } from "../types";

export async function getCohorts(): Promise<Cohort[]> {
  return COHORTS;
}

export { ALUMNI_TOTAL };

export function generationLabel(n: number): string {
  const teen = n % 100 >= 11 && n % 100 <= 13;
  return `${n}${teen ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
}
