import type { Locale } from "../config";

// The blog's own words: the index's control line and list, and an article's furniture.
type Blog = {
  title: string;
  all: string;
  // Names of the two navs in the control line.
  sections: string;
  view: string;
  grid: string;
  list: string;
  heads: { year: string; title: string; section: string; date: string };
  // The pill that opens the contact form with the blog draft.
  pill: string;
  by: string;
  team: string;
  reel: { label: string; photograph: string; previous: string; next: string };
  code: { copy: string; copied: string; selected: string };
  // A cover's alt: the post's title, then what the drawing shows (its SVG <title>, in English).
  coverAlt: (title: string, drawn: string) => string;
};

export const BLOG: Record<Locale, Blog> = {
  en: {
    title: "Blog",
    all: "All",
    sections: "Sections",
    view: "View",
    grid: "Grid",
    list: "List",
    heads: { year: "Year", title: "Title", section: "Section", date: "Date" },
    pill: "Write for the blog",
    by: "By",
    team: "Team",
    reel: { label: "Photographs", photograph: "Photograph ", previous: "Previous photograph", next: "Next photograph" },
    code: { copy: "Copy code", copied: "Copied", selected: "Selected; press Ctrl+C or ⌘C to copy" },
    coverAlt: (title, drawn) => `${title}, ${drawn}`,
  },
  ko: {
    title: "블로그",
    all: "전체",
    sections: "분류",
    view: "보기",
    grid: "그리드",
    list: "목록",
    heads: { year: "연도", title: "제목", section: "분류", date: "날짜" },
    pill: "블로그에 글 쓰기",
    by: "글",
    team: "팀",
    reel: { label: "사진", photograph: "사진 ", previous: "이전 사진", next: "다음 사진" },
    code: { copy: "코드 복사", copied: "복사했습니다", selected: "선택했습니다. Ctrl+C 또는 ⌘C로 복사하세요" },
    coverAlt: (title) => `${title}, 잉크 드로잉`,
  },
};
