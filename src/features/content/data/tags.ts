import type { Bilingual } from "@/features/archive/types";

const EN: Record<string, string> = {
  창의설계축전: "Creative Design Festival",
  창의설계: "Creative design",
  전자전: "Electronics Fair",
  URP: "URP",
  창의재단URP: "KOFAC URP",
  테크윈: "Techwin",
  국제대회: "International competition",
  공모전: "Competition",
  해커톤: "Hackathon",
  해외탐방: "Field trip abroad",
  iREX: "iREX",
  수상: "Award",
  기업협력: "Industry partnership",
  협업: "Collaboration",
  창업: "Startup",
  세미나: "Seminar",
  전시: "Exhibition",

  자유연구: "Independent research",
  신입생프로젝트: "First-year project",
  신입생: "First-year",
  개인프로젝트: "Solo project",
  메이킹: "Making",
  사진기록: "Photographs only",

  로봇: "Robot",
  보행로봇: "Walking robot",
  로봇팔: "Robot arm",
  군집로봇: "Swarm robotics",
  탐사로봇: "Exploration robot",
  수중로봇: "Underwater robot",
  재난구조: "Disaster rescue",
  뱀로봇: "Snake robot",
  교감로봇: "Companion robot",
  드론: "Drone",
  잠수함: "Submarine",
  지능형자동차: "Intelligent vehicle",
  전기자전거: "Electric bicycle",
  수륙양용: "Amphibious",
  산업용로봇: "Industrial robot",
  중장비: "Heavy machinery",
  장난감: "Toy",
  플랫폼: "Platform",
  플로터: "Plotter",

  자율주행: "Autonomous driving",
  제어: "Control",
  머신러닝: "Machine learning",
  딥러닝: "Deep learning",
  강화학습: "Reinforcement learning",
  AI: "AI",
  소프트웨어: "Software",
  센서: "Sensors",
  디스플레이: "Display",
  LED: "LED",
  "3D프린팅": "3D printing",
  자동화: "Automation",
  원격조종: "Teleoperation",
  구형바퀴: "Spherical wheel",
  벽면주행: "Wall climbing",
  생체모방: "Biomimicry",
  인공근육: "Artificial muscle",
  외골격: "Exoskeleton",
  엑소스켈레톤: "Exoskeleton",
  웨어러블: "Wearable",
  노이즈캔슬링: "Noise cancelling",
  음향: "Audio",
  VR: "VR",

  접근성: "Accessibility",
  헬스케어: "Healthcare",
  안전: "Safety",
  사회문제: "Social problem",
  고령화: "Ageing",
  어린이: "Children",
  반려동물: "Pets",
  생활편의: "Everyday convenience",
  스마트가전: "Smart appliance",
  환경: "Environment",
  탐사: "Exploration",
  스포츠: "Sport",

  미디어아트: "Media art",
  인터랙티브: "Interactive",
  인터랙션: "Interaction",
  문화재복원: "Cultural heritage restoration",
  음악: "Music",
  빛: "Light",
};

export function isDateTag(tag: string): boolean {
  return /^\d{4}\s*[-–—]?\s*\d{0,4}$/.test(tag.trim());
}

export function tagLabel(tag: string): Bilingual {
  const ko = tag.trim();
  return { en: EN[ko] ?? ko, ko };
}

export function displayTags(tags: string[], limit = 2): Bilingual[] {
  return tags.filter((t) => !isDateTag(t)).slice(0, limit).map(tagLabel);
}
