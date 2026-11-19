import type { Locale } from "../config";

// The seasons a year is read by. The keys are what `when()` and `season()` work in.
export type Season = "Spring" | "Summer" | "Fall" | "Winter";

type History = {
  // The page's heading, read out in place of the two big years.
  heading: (latest: number) => string;
  now: string;
  award: string;
  cohorts: string;
  people: string;
  running: string;
  // The ticker's six units: years, months, days, hours, minutes, seconds.
  units: [string, string, string, string, string, string];
  seasons: Record<Season, string>;
  seasonYear: (season: string, year: number | string) => string;
  // The phone year dial.
  dial: string;
};

export const HISTORY: Record<Locale, History> = {
  en: {
    heading: (latest) => `History, 1984 to ${latest}`,
    now: "Now",
    award: "Award",
    cohorts: "Cohorts",
    people: "Members and alumni",
    running: "Running for",
    units: ["Y", "M", "D", "H", "M", "S"],
    seasons: { Spring: "Spring", Summer: "Summer", Fall: "Fall", Winter: "Winter" },
    seasonYear: (season, year) => `${season} ${year}`,
    dial: "The record, entry by entry",
  },
  ko: {
    heading: (latest) => `연혁, 1984년부터 ${latest}년까지`,
    now: "최근",
    award: "수상",
    cohorts: "기수",
    people: "부원과 졸업생",
    running: "창립 이후",
    // "개월" would run the line into the big year on a 320px phone.
    units: ["년", "달", "일", "시간", "분", "초"],
    seasons: { Spring: "봄", Summer: "여름", Fall: "가을", Winter: "겨울" },
    seasonYear: (season, year) => `${year}년 ${season}`,
    dial: "연혁, 항목별 이동",
  },
};

// A season's name in the reader's language; anything that is not a season is shown as it is.
export const seasonName = (locale: Locale, label: string): string =>
  (HISTORY[locale].seasons as Record<string, string>)[label] ?? label;
