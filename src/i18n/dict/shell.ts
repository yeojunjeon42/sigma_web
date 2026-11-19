import type { Locale } from "../config";

// The words of the site's shell: the bar, the phone menu, the footer, and the lost and error pages.
type Shell = {
  nav: { home: string; archive: string; history: string; members: string; blog: string; contact: string; terminal: string };
  primary: string;
  menu: string;
  footer: {
    label: string;
    tagline: string;
    address: string[];
    university: string;
    department: string;
    est: (year: number) => string;
    powered: string;
    designed: string;
  };
  copied: string;
  lost: {
    notFound: string;
    error: string;
    home: string;
    retry: string;
    maze: (word: string) => string;
    play: string;
    idle: string;
    over: string;
    tap: string;
    tapOver: string;
  };
};

export const SHELL: Record<Locale, Shell> = {
  en: {
    nav: { home: "Home", archive: "Archive", history: "History", members: "Members", blog: "Blog", contact: "Contact", terminal: "Terminal" },
    primary: "Primary",
    menu: "Menu",
    footer: {
      label: "Footer",
      tagline: "Where Imagination Meets Reality",
      address: ["Building 302, Room 215‑2", "Seoul National University", "1 Gwanak-ro, Gwanak-gu, Seoul"],
      university: "Seoul National University",
      department: "Electrical and Computer Engineering",
      est: (year) => `EST. ${year}`,
      powered: "Powered by",
      designed: "Designed by",
    },
    copied: "Copied",
    lost: {
      notFound: "Page not found",
      error: "Error",
      home: "Home ↗",
      retry: "Try again",
      maze: (word) => `A playable Pac-Man maze drawn around the word ${word}. Arrow keys, W A S D or the pointer steer.`,
      play: "Play Pac-Man: arrow keys, W A S D or the pointer steer",
      idle: "Press an arrow or click to play",
      over: "Game over. Press an arrow or click to play again",
      tap: "Tap to play",
      tapOver: "Tap to replay",
    },
  },
  ko: {
    nav: { home: "홈", archive: "아카이브", history: "연혁", members: "구성원", blog: "블로그", contact: "문의", terminal: "터미널" },
    primary: "주 메뉴",
    menu: "메뉴",
    footer: {
      label: "하단 메뉴",
      tagline: "상상과 현실이 만나는 곳",
      address: ["서울대학교 302동 215‑2호", "서울특별시 관악구 관악로 1"],
      university: "서울대학교",
      department: "전기·정보공학부",
      est: (year) => `${year}년 창립`,
      powered: "개발",
      designed: "디자인",
    },
    copied: "복사했습니다",
    lost: {
      notFound: "페이지를 찾을 수 없습니다",
      error: "오류",
      home: "홈 ↗",
      retry: "다시 시도",
      maze: (word) => `${word} 글자를 벽으로 삼은 팩맨 미로입니다. 방향키, W A S D 또는 포인터로 움직입니다.`,
      play: "팩맨 시작: 방향키, W A S D 또는 포인터로 움직입니다",
      idle: "방향키를 누르거나 클릭하면 시작합니다",
      over: "게임이 끝났습니다. 방향키를 누르거나 클릭하면 다시 시작합니다",
      tap: "탭하면 시작합니다",
      tapOver: "탭하면 다시 시작합니다",
    },
  },
};
