export interface Sponsor {
  id: string;
  name: string;
  // cap: the letters' height as a share of the image's. foot: what hangs under their baseline, same
  // unit. The page sets every logo's letters to one height on one baseline.
  logo: { src: string; width: number; height: number; cap: number; foot: number };
  website: string;
  // Awaiting the sponsor's go-ahead: shown in development only.
  pending?: boolean;
}

const ALL: Sponsor[] = [
  {
    id: "hyundai-mobis",
    name: "Hyundai Mobis",
    logo: { src: "/sponsors/hyundai-mobis.png", width: 640, height: 221, cap: 0.579, foot: 0.041 },
    website: "https://www.mobis.com/",
  },
  {
    id: "amd",
    name: "AMD",
    logo: { src: "/sponsors/amd.svg", width: 1397, height: 334, cap: 0.865, foot: 0.068 },
    website: "https://www.amd.com/",
    pending: true,
  },
];

export const SPONSORS = ALL.filter((s) => !s.pending || process.env.NODE_ENV !== "production");

// SIGMA is a founding club of these, so they are not listed as sponsors.
export const COFOUNDED: Sponsor[] = [
  {
    id: "roboticus",
    name: "Roboticus",
    logo: { src: "/sponsors/roboticus.svg", width: 775, height: 897, cap: 0.669, foot: 0.014 },
    website: "https://robotic-us.com/",
  },
];
