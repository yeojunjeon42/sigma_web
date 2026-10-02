import { SHOW_SAMPLES } from "@/features/content/data/samples";
import type { Bilingual } from "@/features/site/data/about";
import type { MemberLinks, RosterMember } from "./roster";

// Layout samples share the site's SHOW_SAMPLES flag.
const SHOW_CREW_SAMPLES = SHOW_SAMPLES;

const COUNT = 94;

const DEPARTMENTS: Bilingual[] = [
  { en: "Electrical and Computer Engineering", ko: "전기정보공학부" },
  { en: "Mechanical Engineering", ko: "기계공학부" },
  { en: "Computer Science and Engineering", ko: "컴퓨터공학부" },
  { en: "Aerospace Engineering", ko: "항공우주공학과" },
  { en: "Materials Science and Engineering", ko: "재료공학부" },
  { en: "Industrial Engineering", ko: "산업공학과" },
  { en: "Physics and Astronomy", ko: "물리천문학부" },
  { en: "Mathematical Sciences", ko: "수리과학부" },
  { en: "Chemical and Biological Engineering", ko: "화학생물공학부" },
  { en: "Design", ko: "디자인과" },
];

const FIELDS: Bilingual[] = [
  { en: "Control Systems", ko: "제어 시스템" },
  { en: "Computer Vision", ko: "컴퓨터 비전" },
  { en: "Embedded Systems", ko: "임베디드 시스템" },
  { en: "Mechanical Design", ko: "기구 설계" },
  { en: "Product Design", ko: "제품 디자인" },
];

const BIOS = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  undefined,
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.",
  "Duis aute irure dolor in reprehenderit.",
];

const LINKS: (MemberLinks | undefined)[] = [
  { instagram: "https://www.instagram.com/" },
  { instagram: "https://www.instagram.com/", github: "https://github.com/" },
  undefined,
  { github: "https://github.com/", linkedin: "https://www.linkedin.com/", site: "https://example.com/" },
  { instagram: "https://www.instagram.com/" },
];

const SAMPLES: RosterMember[] = Array.from({ length: COUNT }, (_, i) => ({
  id: `sample-${String(i + 1).padStart(2, "0")}`,
  name: "NAME",
  department: DEPARTMENTS[(i * 7) % DEPARTMENTS.length],
  duty: i % 3 === 0 ? undefined : FIELDS[i % FIELDS.length],
  links: LINKS[i % LINKS.length],
  bio: BIOS[i % BIOS.length],
}));

export const CREW_SAMPLES: RosterMember[] = SHOW_CREW_SAMPLES ? SAMPLES : [];
