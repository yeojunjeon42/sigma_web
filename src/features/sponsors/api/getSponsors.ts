import { COFOUNDED, SPONSORS, type Sponsor } from "../data/sponsors";

export type { Sponsor };

export async function getSponsors(): Promise<Sponsor[]> {
  return SPONSORS;
}

export async function getCofounded(): Promise<Sponsor[]> {
  return COFOUNDED;
}
