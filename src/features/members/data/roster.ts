import type { Bilingual } from "@/features/site/data/about";

export interface MemberLinks {
  email?: string;
  instagram?: string;
  github?: string;
  linkedin?: string;
  site?: string;
}

export interface RosterMember {
  id: string;
  name: string;
  nameEn?: string;
  role?: Bilingual;
  duty?: Bilingual;
  cohort: number;
  generation?: number;
  department: Bilingual;
  incoming?: boolean;
  links?: MemberLinks;
}

export function generationOf(m: RosterMember): number {
  return m.generation ?? 2000 + m.cohort - 1983;
}

export const INCOMING: Bilingual = { en: "Executive", ko: "임원" };

const ECE: Bilingual = {
  en: "Electrical and Computer Engineering",
  ko: "전기정보공학부",
};
const ME: Bilingual = { en: "Mechanical Engineering", ko: "기계공학부" };

const TRAINING: Bilingual = { en: "Education planning", ko: "교육 구상·추진" };

export const ROSTER: RosterMember[] = [
  {
    id: "hwang-inseong",
    name: "황인성",
    role: { en: "President", ko: "회장" },
    cohort: 25,
    department: ECE,
    duty: { en: "Making management", ko: "메이킹 관리" },
    links: { instagram: "https://www.instagram.com/hwanginseong691/" },
  },
  {
    id: "song-heekyung",
    name: "송희경",
    role: { en: "Vice-president", ko: "부회장" },
    cohort: 25,
    department: ECE,
    duty: { en: "Club room management", ko: "동아리방 관리" },
    links: { instagram: "https://www.instagram.com/song_heekyung/" },
  },
  {
    id: "jwa-heeju",
    name: "좌희주",
    role: { en: "Treasurer", ko: "총무" },
    cohort: 25,
    department: ECE,
    duty: { en: "General affairs", ko: "총무" },
    links: { instagram: "https://www.instagram.com/hjjwa_27/" },
  },
  {
    id: "jeon-hyuntae",
    name: "전현태",
    role: { en: "Communications lead", ko: "홍보부장" },
    cohort: 25,
    department: ECE,
    duty: { en: "Member-led seminars", ko: "자율세미나 관리" },
    links: { instagram: "https://www.instagram.com/adcj._/" },
  },
  {
    id: "lee-seunghyun",
    name: "이승현",
    role: { en: "Making lead", ko: "메이킹부장" },
    cohort: 25,
    department: ME,
    duty: TRAINING,
    links: { instagram: "https://www.instagram.com/itissonippy/" },
  },

  { id: "baek-sieun", name: "백시은", cohort: 26, department: ECE, incoming: true, duty: { en: "Making management", ko: "메이킹 관리" }, links: { instagram: "https://www.instagram.com/baeksieun1/" } },
  { id: "kim-muchan", name: "김무찬", cohort: 26, department: ME, incoming: true, duty: TRAINING, links: { instagram: "https://www.instagram.com/mvnchankim/" } },
  { id: "kim-hoyoon", name: "김호윤", cohort: 26, department: ECE, incoming: true, duty: TRAINING, links: { instagram: "https://www.instagram.com/sdcsfdsfc/" } },
  { id: "lee-jinmyung", name: "이진명", nameEn: "Jin Myung Lee", cohort: 26, department: ECE, incoming: true, duty: { en: "Website management", ko: "웹사이트 관리" }, links: { instagram: "https://www.instagram.com/nobel2040ne/", github: "https://github.com/nobel2040ne", linkedin: "https://www.linkedin.com/in/jin-myung-lee/", site: "https://xlaude2040.com/" } },
  { id: "jang-junhak", name: "장준학", cohort: 25, generation: 43, department: ME, incoming: true, duty: { en: "Instagram and business cards", ko: "인스타 관리 (+명함)" }, links: { instagram: "https://www.instagram.com/greeeendeeeer/" } },
];
