import { AWARDS } from "../data/awards";
import type { Award } from "../types";

export async function getAwards(): Promise<Award[]> {
  return AWARDS;
}
