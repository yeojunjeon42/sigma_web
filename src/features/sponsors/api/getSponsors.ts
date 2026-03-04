import { sanityFetch } from "@/sanity/lib/live";

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
  const { data } = await sanityFetch({ query });
  return data;
}
