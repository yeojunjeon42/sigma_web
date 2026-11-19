import type { Locale } from "../config";

// The words of the home page: the hero, the supporters' row, the Founded band, the record and the lists.
type Home = {
  // The page's one heading, read by screen readers in place of the two display words.
  heading: string;
  // The hero's statements, in the order they are set.
  est: string;
  university: string;
  room: string;
  community: string;
  art: string;
  first: string;
  // The button that prints the next build.
  next: string;
  // The supporters' row, and what each one is to the club.
  supported: string;
  sponsor: string;
  cofounded: string;
  founded: string;
  years: string;
  foundedIn: (year: number) => string;
  builds: string;
  results: string;
  members: string;
  all: (count: number) => string;
  roster: (cohorts: number, people: number) => string;
  stacks: string;
  equipments: string;
  intake: string;
  months: [string, string];
};

export const HOME: Record<Locale, Home> = {
  en: {
    heading: "Sigma Intelligence — the robotics club of Seoul National University",
    est: "Est. 1984",
    university: "Seoul National University",
    room: "Room 215‑2, Mabang",
    community: "Undergraduate research community",
    art: "Media and kinetic art",
    first: "Korea’s first university robotics club",
    next: "Next",
    supported: "Supported by",
    sponsor: "Sponsor",
    cofounded: "Co-founded",
    founded: "Founded",
    years: "Years",
    foundedIn: (year) => `Founded ${year}`,
    builds: "Builds",
    results: "Competition results",
    members: "Members",
    all: (count) => `All ${count} ↗`,
    roster: (cohorts, people) => `${cohorts} cohorts · ${people} members and alumni ↗`,
    stacks: "Stacks",
    equipments: "Equipments",
    intake: "Intake",
    months: ["March", "September"],
  },
  ko: {
    heading: "SIGMA INTELLIGENCE — 서울대학교 로봇동아리",
    est: "1984년 창립",
    university: "서울대학교",
    room: "마방 215‑2호",
    community: "학부생 연구 공동체",
    art: "미디어 아트와 키네틱 아트",
    first: "국내 최초의 대학 로봇동아리",
    next: "다음",
    supported: "후원",
    sponsor: "후원사",
    cofounded: "공동 창립",
    founded: "창립",
    years: "년",
    foundedIn: (year) => `${year}년 창립`,
    builds: "제작물",
    results: "대회 성과",
    members: "구성원",
    all: (count) => `전체 ${count} ↗`,
    roster: (cohorts, people) => `${cohorts}개 기수 · 부원과 졸업생 ${people}명 ↗`,
    stacks: "기술 스택",
    equipments: "장비",
    intake: "모집",
    months: ["3월", "9월"],
  },
};
