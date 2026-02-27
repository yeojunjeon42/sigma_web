export type Lang = "en" | "ko";

export const dict = {
  nav: {
    about:    { en: "About",    ko: "소개" },
    projects: { en: "Projects", ko: "프로젝트" },
    sponsors: { en: "Sponsors", ko: "후원사" },
    members:  { en: "Members",  ko: "멤버" },
    contact:  { en: "Contact",  ko: "연락처" },
  },
  hero: {
    badge:    { en: "SNU Robotics Club",                              ko: "서울대학교 로봇 동아리" },
    tagline:  { en: "Korea's first university robotics club. Est. 1984.", ko: "국내 최초 설립 대학 로봇동아리. Est. 1984." },
    projects: { en: "Our Projects",                                   ko: "프로젝트 보기" },
    learn:    { en: "Learn More",                                     ko: "더 알아보기" },
    scroll:   { en: "Scroll",                                         ko: "스크롤" },
  },
  home: {
    mission_title: { en: "Our Mission",   ko: "우리의 미션" },
    mission_desc:  {
      en: "To inspire and educate the next generation of roboticists through hands-on projects, competition, and collaboration.",
      ko: "실전 프로젝트, 대회, 협업을 통해 차세대 로봇 공학자들을 양성하고 영감을 줍니다.",
    },
  },
  about: {
    badge:           { en: "About SIGMA",         ko: "시그마 소개" },
    title:           { en: "Sigma Intelligence",  ko: "Sigma Intelligence" },
    desc:            {
      en: "Sigma Intelligence at Seoul National University structures problems, builds solutions, and validates them in the field.",
      ko: "서울대학교 로봇 동아리 Sigma Intelligence는 문제를 구조화하고, 직접 만들고, 실전에서 검증하는 팀입니다. 아래는 현재 운영진입니다.",
    },
    leadership:      { en: "Leadership",  ko: "운영진" },
    gallery:         { en: "Gallery",     ko: "활동 사진" },
    gallery_caption: {
      en: "Images from Sigma Intelligence promotional materials.",
      ko: "아래 이미지는 시그마 홍보 자료(시그마_홍보PPT.pdf)에서 발췌했습니다.",
    },
  },
  members: {
    title: { en: "Members",                          ko: "멤버" },
    sub:   { en: "The people behind Sigma Intelligence.", ko: "시그마 인텔리전스를 이끄는 사람들." },
    empty: { en: "Members will be listed here soon.", ko: "멤버 정보가 곧 업데이트됩니다." },
  },
  sponsors: {
    title:        { en: "Sponsors",   ko: "후원사" },
    sub:          { en: "Your support makes Sigma Intelligence possible.", ko: "여러분의 후원이 Sigma Intelligence를 가능하게 합니다." },
    become_title: { en: "Become a Sponsor", ko: "후원사가 되세요" },
    become_desc:  {
      en: "Partner with Sigma Intelligence and support the next generation of robotics engineers at Seoul National University.",
      ko: "시그마 인텔리전스와 함께 서울대학교 차세대 로봇 엔지니어들을 후원해 주세요.",
    },
    cta: { en: "Get in Touch", ko: "문의하기" },
  },
  projects: {
    badge: { en: "What We Build", ko: "우리가 만드는 것" },
    title: { en: "Projects",      ko: "프로젝트" },
    desc:  {
      en: "From autonomous ground vehicles to robotic arms, Sigma Intelligence takes on complex engineering challenges and competes at the highest levels.",
      ko: "자율 주행 차량부터 로봇 팔까지, 시그마 인텔리전스는 복잡한 엔지니어링 과제에 도전하며 최고의 무대에서 경쟁합니다.",
    },
    empty: { en: "Projects coming soon.", ko: "프로젝트 정보가 곧 업데이트됩니다." },
  },
  contact: {
    badge:      { en: "Reach Out",  ko: "문의하기" },
    title:      { en: "Contact",    ko: "연락처" },
    desc:       {
      en: "Have a question, want to collaborate, or interested in sponsoring? We'd love to hear from you.",
      ko: "질문이 있거나 협업을 원하시거나 후원에 관심이 있으신가요? 언제든지 연락해 주세요.",
    },
    email:      { en: "Email",      ko: "이메일" },
    location:   { en: "Location",   ko: "위치" },
    follow:     { en: "Follow Us",  ko: "팔로우" },
    name:       { en: "Name",       ko: "이름" },
    name_ph:    { en: "Your name",  ko: "이름을 입력하세요" },
    email_ph:   { en: "you@example.com", ko: "email@example.com" },
    message:    { en: "Message",    ko: "메시지" },
    message_ph: { en: "Tell us about your inquiry...", ko: "문의 내용을 입력해 주세요..." },
    send:       { en: "Send Message", ko: "메시지 보내기" },
  },
} as const;

export type DictSection = keyof typeof dict;

/** Pull a translated string from the dict given a lang */
export function t<S extends DictSection>(
  section: S,
  key: keyof (typeof dict)[S],
  lang: Lang,
): string {
  const entry = dict[section][key] as { en: string; ko: string };
  return entry[lang];
}
