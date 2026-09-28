import type { Bilingual } from "@/features/site/data/about";
import { SHOW_SAMPLES } from "@/features/content/data/samples";
import type { MemberLinks } from "@/features/members/data/roster";

interface Alumnus {
  id: string;
  name: string;
  field: Bilingual;
  entryYear: number;
  quote?: string;
  links?: MemberLinks;
}

export function alumnusGeneration(a: Alumnus): number {
  return a.entryYear - 1983;
}

const SAMPLES: Alumnus[] = [
  { id: "sample-sigma", name: "SIGMA", field: { en: "Mechanical engineering", ko: "기계공학" }, entryYear: 1984, quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", links: { linkedin: "https://www.linkedin.com/", site: "https://example.com/" } },
  { id: "sample-sigma-intelligence", name: "SIGMA INTELLIGENCE", field: { en: "Control systems", ko: "제어 시스템" }, entryYear: 1991, quote: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.", links: { github: "https://github.com/", linkedin: "https://www.linkedin.com/" } },
  { id: "sample-snu-sigma", name: "SNU SIGMA", field: { en: "Embedded systems", ko: "임베디드 시스템" }, entryYear: 1998, quote: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.", links: { instagram: "https://www.instagram.com/" } },
  { id: "sample-sigma-lab", name: "SIGMA LAB", field: { en: "Computer vision", ko: "컴퓨터 비전" }, entryYear: 2006, quote: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Nemo enim ipsam voluptatem quia voluptas sit aspernatur.", links: { github: "https://github.com/", linkedin: "https://www.linkedin.com/", site: "https://example.com/" } },
  { id: "sample-sigma-robotics", name: "SIGMA ROBOTICS", field: { en: "Product design", ko: "제품 디자인" }, entryYear: 2013, quote: "Ut enim ad minima veniam, quis nostrum exercitationem.", links: { instagram: "https://www.instagram.com/", linkedin: "https://www.linkedin.com/" } },
];

export const ALUMNI: Alumnus[] = SHOW_SAMPLES ? SAMPLES : [];
