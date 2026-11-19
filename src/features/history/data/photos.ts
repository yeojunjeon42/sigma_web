import type { Both } from "@/i18n/config";

// `name` is what the collage writes by hand, in English in both languages: the handwriting face
// has no Hangul. `ko` is the name set in type.
export interface ClubEvent {
  id: string;
  name: string;
  ko?: string;
  when: string;
  photos: { src: string; w: number; h: number }[];
  strip?: boolean;
}

const set = (dir: string, sizes: [number, number][]) =>
  sizes.map(([w, h], i) => ({ src: `/history-photos/${dir}/${String(i + 1).padStart(2, "0")}.jpg`, w, h }));

export const HERO_PHOTO = {
  src: "/history-photos/creative-design-fair/01.jpg",
  w: 1600,
  h: 1200,
  alt: { en: "Members on a lawn holding two award boards", ko: "잔디밭에서 상장 보드 두 개를 든 부원들" },
};

// One photograph leads a year on phones, where the collage is hidden.
export const YEAR_PHOTOS: Record<number, { src: string; w: number; h: number; alt: Both }> = {
  2026: { src: "/history-photos/homecoming/01.jpg", w: 1600, h: 1200, alt: { en: "Members and alumni posing in a lecture room at the summer homecoming", ko: "여름 홈커밍데이에 강의실에 모인 부원과 졸업생" } },
  2025: { src: "/history-photos/creative-design-fair-2025/01.jpg", w: 1600, h: 900, alt: { en: "Members holding four award boards at the SNU Creative Design Fair", ko: "서울대학교 창의설계축전에서 상장 보드 네 개를 든 부원들" } },
};

export const CLUB_EVENTS: ClubEvent[] = [
  {
    id: "cdf",
    name: "15th SNU Creative Design Fair, 2026",
    ko: "제15회 서울대학교 창의설계축전, 2026",
    when: "Fall 2026",
    photos: set("creative-design-fair", [[1600, 1200]]),
  },
  {
    id: "hackathon",
    name: "1st Roboticus Hackathon",
    when: "Summer 2026",
    photos: set("roboticus-hackathon", [[1600, 629], [1600, 909], [1600, 1600]]),
  },
  {
    id: "homecoming",
    name: "Summer Homecoming",
    when: "Summer 2026",
    photos: set("homecoming", [[1600, 1200], [1080, 1440], [1080, 1440], [1080, 1440], [1440, 1081], [1440, 1081]]),
  },
  {
    id: "mt",
    name: "Spring MT",
    when: "Spring 2026",
    photos: set("spring-mt", [
      [1600, 1200], [1200, 1600], [1200, 1600], [1200, 1600],
      [1600, 1200], [1200, 1600], [1600, 1200],
    ]),
  },
  {
    id: "cdf-2025",
    name: "14th SNU Creative Design Fair, 2025",
    when: "Fall 2025",
    photos: set("creative-design-fair-2025", [[1600, 900], [1600, 900]]),
  },
  {
    id: "showcase",
    name: "Year-end showcase, club room",
    when: "Winter 2025",
    photos: [{ src: "/history-photos/2025.jpg", w: 1600, h: 900 }],
  },
  {
    id: "mmca",
    name: "Club visit to Robot Essay, MMCA",
    when: "Summer 2015",
    strip: true,
    photos: [
      { src: "/club-photos/01.jpg", w: 1000, h: 750 },
      { src: "/club-photos/02.jpg", w: 1000, h: 750 },
      { src: "/club-photos/04.jpg", w: 1000, h: 750 },
    ],
  },
];
