import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

export interface Activity {
  _id: string;
  title: string;
  description: string;
  image: SanityImageSource | null;
  link: string | null;
}
