export interface ClubEvent {
  id: string;
  name: string;
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
    name: "15th Creative Design Fair, 2026",
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
    name: "14th Creative Design Fair, 2025",
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
