import type { Locale } from "../config";

// The archive's own words: the control line, the catalogue's heads, the reel, an entry's facts.
type Archive = {
  title: string;
  all: string;
  // Names of the three navs on the control line, for screen readers.
  eraNav: string;
  sortNav: string;
  viewNav: string;
  sorts: { year: string; team: string; name: string };
  views: { depth: string; grid: string; reel: string; list: string };
  heads: { era: string; name: string; tags: string; team: string; year: string };
  facts: { year: string; result: string; team: string; topics: string };
  // The field's note under a team-size landmark.
  people: (count: number) => string;
  teamUnknown: string;
  // The reel's rail, and the phone entry's two navs.
  builds: string;
  entryNav: string;
  moreBuilds: string;
  previous: string;
  next: string;
  add: string;
  ruler: string;
};

export const ARCHIVE_TEXT: Record<Locale, Archive> = {
  en: {
    title: "Archive",
    all: "All",
    eraNav: "Era",
    sortNav: "Sort",
    viewNav: "View",
    sorts: { year: "Year", team: "Team size", name: "Name" },
    views: { depth: "Field", grid: "Grid", reel: "Reel", list: "List" },
    heads: { era: "Era", name: "Name", tags: "Tags", team: "Team", year: "Year" },
    facts: { year: "Year", result: "Result", team: "Team", topics: "Topics" },
    people: (count) => (count === 1 ? "person" : "people"),
    teamUnknown: "Team size unknown",
    builds: "Builds",
    entryNav: "Entry",
    moreBuilds: "More builds",
    previous: "Previous",
    next: "Next",
    add: "Add a build",
    ruler: "Archive builds, entry by entry",
  },
  ko: {
    title: "아카이브",
    all: "전체",
    eraNav: "시기",
    sortNav: "정렬",
    viewNav: "보기",
    sorts: { year: "연도", team: "팀 규모", name: "이름" },
    views: { depth: "필드", grid: "그리드", reel: "릴", list: "목록" },
    heads: { era: "시기", name: "이름", tags: "태그", team: "팀", year: "연도" },
    facts: { year: "연도", result: "성과", team: "팀", topics: "주제" },
    people: () => "명",
    teamUnknown: "팀 규모 미상",
    builds: "제작물",
    entryNav: "항목",
    moreBuilds: "다른 제작물",
    previous: "이전",
    next: "다음",
    add: "제작물 추가",
    ruler: "아카이브 제작물, 항목별 이동",
  },
};
