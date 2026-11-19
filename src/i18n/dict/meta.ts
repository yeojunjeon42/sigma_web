import type { Locale } from "../config";

// Each page's name and description, as browsers, search engines and share cards show them.
type Page = { title: string; description: string };
type Meta = {
  skip: string;
  site: Page;
  home: Page;
  archive: Page;
  history: Page;
  members: Page;
  blog: Page;
  contact: Page;
  build: (name: string, year: number | null | undefined, award: string | undefined) => string;
  notFound: string;
};

export const META: Record<Locale, Meta> = {
  en: {
    skip: "Skip to content",
    site: {
      title: "SIGMA INTELLIGENCE \\ SNU Robotics Club",
      description:
        "SIGMA INTELLIGENCE is the robotics club of Seoul National University. Founded in 1984, it is Korea's first university robotics club. 서울대학교 로봇동아리 시그마 인텔리전스.",
    },
    home: {
      title: "SIGMA INTELLIGENCE \\ SNU Robotics Club · 서울대학교 로봇동아리",
      description:
        "SIGMA INTELLIGENCE is the robotics club of Seoul National University — Korea's first university robotics club, founded 1984. 서울대학교 로봇동아리 시그마 인텔리전스.",
    },
    archive: { title: "Archive", description: "Every machine SIGMA INTELLIGENCE has built, 2007–2025." },
    history: { title: "History", description: "Events and competition results of SIGMA INTELLIGENCE at Seoul National University, year by year." },
    members: { title: "Members", description: "The members and alumni of SIGMA INTELLIGENCE." },
    blog: { title: "Blog", description: "Writing from SIGMA INTELLIGENCE at Seoul National University." },
    contact: { title: "Contact", description: "Get in touch with SIGMA INTELLIGENCE at Seoul National University." },
    build: (name, year, award) =>
      [`${name}${year ? `, ${year}` : ""}.`, award ? `${award}.` : "", "A build by SIGMA INTELLIGENCE, the robotics club of Seoul National University."].filter(Boolean).join(" "),
    notFound: "Not found",
  },
  ko: {
    skip: "본문으로 건너뛰기",
    site: {
      title: "SIGMA INTELLIGENCE \\ 서울대학교 로봇동아리",
      description: "SIGMA INTELLIGENCE(시그마 인텔리전스)는 서울대학교 로봇동아리입니다. 1984년에 창립한 국내 최초의 대학 로봇동아리입니다.",
    },
    home: {
      title: "SIGMA INTELLIGENCE \\ 서울대학교 로봇동아리",
      description: "SIGMA INTELLIGENCE(시그마 인텔리전스)는 서울대학교 로봇동아리입니다. 1984년에 창립한 국내 최초의 대학 로봇동아리입니다.",
    },
    archive: { title: "아카이브", description: "SIGMA INTELLIGENCE가 만든 모든 제작물, 2007–2025." },
    history: { title: "연혁", description: "서울대학교 SIGMA INTELLIGENCE의 활동과 대회 성과를 연도별로 정리했습니다." },
    members: { title: "구성원", description: "SIGMA INTELLIGENCE의 부원과 졸업생." },
    blog: { title: "블로그", description: "서울대학교 SIGMA INTELLIGENCE의 글." },
    contact: { title: "문의", description: "서울대학교 SIGMA INTELLIGENCE에 문의하세요." },
    build: (name, year, award) =>
      [`${name}${year ? `, ${year}` : ""}.`, award ? `${award}.` : "", "서울대학교 로봇동아리 SIGMA INTELLIGENCE의 제작물."].filter(Boolean).join(" "),
    notFound: "페이지를 찾을 수 없습니다",
  },
};
