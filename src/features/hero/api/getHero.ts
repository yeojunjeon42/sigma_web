import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { sanityFetch } from "@/sanity/lib/live";

const query = `*[_type == "hero"][0] {
  backgroundImage
}`;

export type Hero = {
  backgroundImage: SanityImageSource;
};

export async function getHero(): Promise<Hero | null> {
  const { data } = await sanityFetch({ query });
  return data;
}
