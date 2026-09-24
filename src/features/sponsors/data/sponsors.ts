export interface Sponsor {
  id: string;
  name: string;
  /** A logo under /public/sponsors, or none: the name is printed instead. */
  logo?: { src: string; width: number; height: number };
  website?: string;
}

export const SPONSORS: Sponsor[] = [
  {
    id: "hyundai-mobis",
    name: "Hyundai Mobis",
    logo: { src: "/sponsors/hyundai-mobis.png", width: 640, height: 221 },
  },
];
