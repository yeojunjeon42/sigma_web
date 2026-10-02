export interface Bilingual {
  en: string;
  ko: string;
}

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
