import { client } from "@/sanity/lib/client";

export interface Sponsor {
  _id: string;
  name: string;
  logo?: { asset: { _ref: string } };
  tier?: string;
  website?: string;
  order?: number;
}

const query = `*[_type == "sponsor"] | order(order asc, name asc) {
  _id,
  name,
  logo,
  tier,
  website,
  order
}`;

export async function getSponsors(): Promise<Sponsor[]> {
  return client.fetch(query);
}
