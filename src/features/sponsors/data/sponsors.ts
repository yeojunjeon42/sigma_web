export interface Sponsor {
  id: string;
  name: string;
  // cap: the letters' height as a share of the image's. foot: what hangs under their baseline, same
  // unit. The page sets every logo's letters to one height on one baseline. Each file keeps a
  // little room around the artwork: drawn to the very edge, a curve loses its soft outline there.
  logo: { src: string; width: number; height: number; cap: number; foot: number };
  website: string;
  // Awaiting the sponsor's go-ahead: shown in development only.
  pending?: boolean;
}

const ALL: Sponsor[] = [
  {
    id: "hyundai-mobis",
    name: "Hyundai Mobis",
    logo: { src: "/sponsors/hyundai-mobis-v2.svg", width: 728, height: 256, cap: 0.563, foot: 0.05 },
    website: "https://www.mobis.com/",
  },
  {
    id: "amd",
    name: "AMD",
    logo: { src: "/sponsors/amd-logo-v2.svg", width: 1980, height: 484, cap: 0.838, foot: 0.08 },
    website: "https://www.amd.com/",
  },
];

export const SPONSORS = ALL.filter((s) => !s.pending || process.env.NODE_ENV !== "production");

// SIGMA is a founding club of these, so they are not listed as sponsors.
export const COFOUNDED: Sponsor[] = [
  {
    id: "roboticus",
    name: "Roboticus",
    logo: { src: "/sponsors/roboticus-wordmark-v2.svg", width: 1946, height: 396, cap: 0.735, foot: 0.055 },
    website: "https://robotic-us.com/",
  },
];
