export interface Bilingual {
  en: string;
  ko: string;
}

export const VOICE: { quote: Bilingual; source: Bilingual }[] = [
  {
    quote: {
      en: "Oh — I want to make that.",
      ko: "오! 만들고 싶다",
    },
    source: {
      en: "Named in the 2016 exhibition leaflet as the exclamation the club started from",
      ko: "2016 전시회 리플렛 — 동아리가 시작된 감탄사로 소개",
    },
  },
  {
    quote: {
      en: "Let's build the interesting things from the textbook ourselves.",
      ko: "책에 나온 재미있는 것들을 직접 만들어보자",
    },
    source: {
      en: "Given as the founding motive in a 2016 public talk",
      ko: "2016년 외부 강연 — 창립 동기로 제시",
    },
  },
  {
    quote: {
      en: "Research is the act of posing a problem and finding its answer.",
      ko: "연구는 문제를 제기하고 답을 찾는 행위이다.",
    },
    source: {
      en: "2015 exhibition document, and again in the 2016 leaflet",
      ko: "2015 전시회 문서 · 2016 리플렛",
    },
  },
  {
    quote: {
      en: "We Will Find A Way",
      ko: "We Will Find A Way",
    },
    source: {
      en: "Theme of the 2015 anniversary exhibition",
      ko: "2015년 기념 전시회 주제",
    },
  },
  {
    quote: {
      en: "For anyone who has something they want to build — who wants to learn engineering by making, not by theory.",
      ko: "만들고 싶은 게 있는 사람! 이론이 아닌 실습으로 공학을 배우고 싶은 사람!",
    },
    source: {
      en: "2025 recruiting deck",
      ko: "2025 신입생 모집 자료",
    },
  },
];

export const FACTS: { label: Bilingual; value: Bilingual }[] = [
  {
    label: { en: "Department", ko: "소속" },
    value: {
      en: "Electrical and Computer Engineering, SNU",
      ko: "서울대학교 전기·정보공학부",
    },
  },
  {
    label: { en: "Club room", ko: "동아리방" },
    value: { en: "Building 302, Room 215-2", ko: "302동 215-2호" },
  },
  {
    label: { en: "Officers", ko: "임원" },
    value: {
      en: "President, vice-president, treasurer, education lead",
      ko: "회장 · 부회장 · 총무 · 교육부장",
    },
  },
  {
    label: { en: "Charter", ko: "회칙" },
    value: { en: "Third revision, 8 September 2021", ko: "3차 개정, 2021년 9월 8일" },
  },
  {
    label: { en: "Path to full membership", ko: "정회원 요건" },
    value: {
      en: "Complete the Arduino course, enter the Creative Design Festival, then show at the club's own exhibition",
      ko: "아두이노 교육 이수 → 창의설계축전 참가 → 시그마 전시회 참여",
    },
  },
  {
    label: { en: "2023 intake", ko: "2023 지원" },
    value: {
      en: "65 applicants, from 19 departments across 8 colleges",
      ko: "8개 단과대 19개 학과에서 65명 지원",
    },
  },
  {
    label: { en: "2025 intake", ko: "2025 지원" },
    value: {
      en: "109 applicants, from 26 departments",
      ko: "26개 학과에서 109명 지원",
    },
  },
  {
    label: { en: "2026 intake", ko: "2026 신입부원" },
    value: {
      en: "Electrical and Computer Engineering 44%, Mechanical 18%, Liberal Studies 15%, Advanced Convergence 9% — and five more departments",
      ko: "전기정보공학부 44%, 기계공학부 18%, 자유전공학부 15%, 첨단융합학부 9% — 그 외 5개 학과",
    },
  },
];

export const CURRICULUM: (Bilingual & { href?: string })[] = [
  { en: "Arduino", ko: "아두이노", href: "https://www.arduino.cc" },
  { en: "Raspberry Pi", ko: "라즈베리 파이", href: "https://www.raspberrypi.com" },
  { en: "SolidWorks", ko: "솔리드웍스", href: "https://www.solidworks.com" },
  { en: "AutoCAD", ko: "오토캐드", href: "https://www.autodesk.com/products/autocad" },
  { en: "Fusion 360", ko: "Fusion 360", href: "https://www.autodesk.com/products/fusion-360" },
  { en: "KiCAD", ko: "KiCAD", href: "https://www.kicad.org" },
  { en: "ROS", ko: "ROS", href: "https://www.ros.org" },
  { en: "Git", ko: "Git", href: "https://git-scm.com" },
  { en: "GitHub", ko: "GitHub", href: "https://github.com" },
  { en: "AI", ko: "인공지능" },
  { en: "Web and app development", ko: "웹 · 앱 개발" },
  { en: "MBED", ko: "MBED", href: "https://github.com/ARMmbed" },
  { en: "PlatformIO", ko: "PlatformIO", href: "https://platformio.org" },
  { en: "AWS", ko: "AWS", href: "https://aws.amazon.com" },
];

export const EQUIPMENT: Bilingual[] = [
  { en: "3D printers", ko: "3D 프린터" },
  { en: "Microcontrollers", ko: "MCU" },
  { en: "Soldering stations", ko: "인두기" },
  { en: "Multimeters", ko: "멀티미터" },
  { en: "Oscilloscopes", ko: "오실로스코프" },
  { en: "Power supplies", ko: "파워 서플라이" },
  { en: "Resistors and essential components", ko: "저항 등 필수 부품" },
];

export const PARTNERS: { name: string; note: Bilingual }[] = [
  {
    name: "Roboticus",
    note: {
      en: "Founding club, alongside KAIST's MR and SNU's SHAPE — a student robotics community started in 2026",
      ko: "2026년 출범한 학생 로보틱스 커뮤니티의 창립 동아리. KAIST MR, 서울대 SHAPE와 함께",
    },
  },
  {
    name: "SNU · KAIST · POSTECH alliance",
    note: {
      en: "Robotics club alliance formed in August 2015 with 미스터 (KAIST) and 파워온 (POSTECH)",
      ko: "2015년 8월, 미스터(카이스트) · 파워온(포스텍)과 맺은 로봇동아리 연합",
    },
  },
  {
    name: "PORTAL301",
    note: {
      en: "Technical partnership on industrial autonomy, 2025",
      ko: "2025년 산업용 자율주행 기술 협업",
    },
  },
  {
    name: "SNU URP · KOFAC URP",
    note: {
      en: "Undergraduate research programmes the club's teams have been selected for repeatedly",
      ko: "학부생 연구 프로그램. 여러 팀이 반복 선정",
    },
  },
  {
    name: "Samsung Electronics Mecha Club",
    note: { en: "Selected club, 2015", ko: "2015년 지원 동아리 선정" },
  },
  {
    name: "Hanwha / Samsung Techwin Robot Membership",
    note: {
      en: "Selected teams and prizes, 2014 and 2015",
      ko: "2014 · 2015년 팀 선정 및 수상",
    },
  },
];
