import { ALUMNI_TOTAL, COHORTS } from "../data/cohorts";
import type { Cohort } from "../types";

export async function getCohorts(): Promise<Cohort[]> {
  return COHORTS;
}

export { ALUMNI_TOTAL };

/**
 * `33기` in Korean, `33rd Cohort` in English.
 *
 * The Korean counter is a suffix and needs no ordinal; English does, and the
 * -st/-nd/-rd exceptions only apply outside the teens — 11th, 12th, 13th, but
 * 21st, 22nd, 23rd. Written once here because three surfaces print it: the
 * cohort scale, the club-life summary and the machine mirror.
 */
export function cohortLabel(n: number): { en: string; ko: string } {
  const rem100 = n % 100;
  const suffix =
    rem100 >= 11 && rem100 <= 13
      ? "th"
      : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
  return { en: `${n}${suffix} Cohort`, ko: `${n}기` };
}

/** The short form: `42nd` in English, `42기` in Korean. */
export function generationLabel(n: number): { en: string; ko: string } {
  const { en, ko } = cohortLabel(n);
  return { en: en.replace(/ Cohort$/, ""), ko };
}
