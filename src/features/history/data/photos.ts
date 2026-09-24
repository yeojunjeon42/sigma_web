// Club life in photographs, newest first: the collage beside the ledger. Not tied to its years.

import type { Bilingual } from "../types";

export interface ClubEvent {
  id: string;
  name: Bilingual;
  when: string;
  photos: { src: string; w: number; h: number }[];
  strip?: boolean;
}

const set = (dir: string, sizes: [number, number][]) =>
  sizes.map(([w, h], i) => ({ src: `/history-photos/${dir}/${String(i + 1).padStart(2, "0")}.jpg`, w, h }));

export const HERO_PHOTO = { src: "/history-photos/creative-design-fair/01.jpg", w: 1600, h: 1200 };

export const CLUB_EVENTS: ClubEvent[] = [
  {
    id: "cdf",
    name: { en: "15th Creative Design Fair, 2026", ko: "제15회 창의설계축전, 2026" },
    when: "Fall 2026",
    photos: set("creative-design-fair", [[1600, 1200]]),
  },
  {
    id: "hackathon",
    name: { en: "1st Roboticus Hackathon", ko: "제1회 로보티쿠스 해커톤" },
    when: "Summer 2026",
    photos: set("roboticus-hackathon", [[1600, 629], [1600, 909], [1600, 1600]]),
  },
  {
    id: "homecoming",
    name: { en: "Summer Homecoming", ko: "여름 홈커밍" },
    when: "Summer 2026",
    photos: set("homecoming", [[1600, 1200], [1080, 1440], [1080, 1440], [1080, 1440], [1440, 1081], [1440, 1081]]),
  },
  {
    id: "mt",
    name: { en: "Spring MT", ko: "봄 MT" },
    when: "Spring 2026",
    photos: set("spring-mt", [
      [1600, 1200], [1200, 1600], [1200, 1600], [1200, 1600],
      [1600, 1200], [1200, 1600], [1600, 1200],
    ]),
  },
  {
    id: "cdf-2025",
    name: { en: "14th Creative Design Fair, 2025", ko: "제14회 창의설계축전, 2025" },
    when: "Fall 2025",
    photos: set("creative-design-fair-2025", [[1600, 900], [1600, 900]]),
  },
  {
    id: "showcase",
    name: { en: "Year-end showcase, club room", ko: "성과공유회, 동아리방" },
    when: "Winter 2025",
    photos: [{ src: "/history-photos/2025.jpg", w: 1600, h: 900 }],
  },
  {
    id: "mmca",
    name: { en: "Club visit to Robot Essay, MMCA", ko: "국립현대미술관 로봇에세이 단체 관람" },
    when: "Summer 2015",
    strip: true,
    photos: [
      { src: "/club-photos/01.jpg", w: 1000, h: 750 },
      { src: "/club-photos/02.jpg", w: 1000, h: 750 },
      { src: "/club-photos/04.jpg", w: 1000, h: 750 },
    ],
  },
];
