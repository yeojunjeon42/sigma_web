export interface Cohort {
  generation: number;
  entryYear: number;
  count: number;
  source: "ob" | "roster";
}
