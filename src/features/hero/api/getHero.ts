import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/lib/client";

const query = `*[_type == "hero"][0] {
  backgroundImage
}`;

export type Hero = {
  backgroundImage: SanityImageSource;
};

export async function getHero(): Promise<Hero | null> {
  return client.fetch(query);
}
