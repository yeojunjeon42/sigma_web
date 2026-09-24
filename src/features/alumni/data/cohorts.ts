import type { Cohort } from "../types";

const OB = [
  6, 5, 8, 6, 2, 10, 11, 9, 6, 3, 2, 12, 5, 10,
  9, 12, 5, 12, 7, 12, 9, 5, 11, 2, 4, 2, 10, 1,
];

const ROSTER = [5, 17, 21, 41, 60, 65, 38, 45, 71, 36, 54, 49, 76, 108, 110];

export const COHORTS: Cohort[] = [
  ...OB.map((count, i) => ({
    generation: i + 1,
    entryYear: 1984 + i,
    count,
    source: "ob" as const,
  })),
  ...ROSTER.map((count, i) => ({
    generation: OB.length + i + 1,
    entryYear: 1984 + OB.length + i,
    count,
    source: "roster" as const,
  })),
];

export const ALUMNI_TOTAL = COHORTS.reduce((sum, c) => sum + c.count, 0);

