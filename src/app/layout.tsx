import type { Metadata } from "next";
import localFont from "next/font/local";
import { Archivo, Caveat, Geist_Mono } from "next/font/google";
import { MachineToggle } from "@/components/MachineToggle";
import { JsonLd } from "@/components/JsonLd";
import { ScrollRail } from "@/components/ScrollRail";
import SmoothScroll from "@/components/SmoothScroll";
import PageTurn from "@/components/PageTurn";
import "lenis/dist/lenis.css";
import "./globals.css";

const sans = localFont({
  src: [
    { path: "../fonts/authentic-sans-90.woff2", weight: "400", style: "normal" },
    { path: "../fonts/authentic-sans-130.woff2", weight: "700", style: "normal" },
  ],
  variable: "--f-sans",
  display: "swap",
  declarations: [
    { prop: "ascent-override", value: "97.6%" },
    { prop: "descent-override", value: "22.4%" },
    { prop: "line-gap-override", value: "0%" },
  ],
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

const kr = localFont({
  src: [
    { path: "../fonts/ibm-plex-sans-kr-regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/ibm-plex-sans-kr-medium.woff2", weight: "700", style: "normal" },
  ],
  variable: "--f-kr",
  display: "swap",
  preload: false,
  declarations: [
    { prop: "size-adjust", value: "102%" },
    { prop: "ascent-override", value: "95.7%" },
    { prop: "descent-override", value: "22%" },
    { prop: "line-gap-override", value: "0%" },
  ],
});

const display = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--f-display",
  display: "block",
  preload: false,
});

const hand = Caveat({
  weight: ["500"],
  subsets: ["latin"],
  variable: "--f-hand",
  display: "swap",
  preload: false,
});

const machine = Geist_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--f-machine",
  display: "swap",
  preload: false,
});

const SITE_URL = "https://sigmaintelligence.org";

export const metadata: Metadata = {
  title: {
    default: "Home \\ SIGMA",
    template: "%s \\ SIGMA",
  },
  description:
    "Sigma Intelligence is the robotics club of Seoul National University. Founded in 1984, it is Korea's first university robotics club. 서울대학교 로봇동아리 시그마 인텔리전스.",
  keywords: [
    "서울대 로봇동아리",
    "서울대학교 로봇동아리",
    "시그마 인텔리전스",
    "Sigma Intelligence",
    "SNU robotics club",
    "로봇 동아리",
  ],
  icons: {
    icon: [{ url: "/logo-mark.svg", type: "image/svg+xml" }],
    shortcut: "/logo-mark.svg",
    apple: "/favicon.png",
  },
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Sigma Intelligence — SNU Robotics Club",
    description: "Korea's first university robotics club, founded 1984 at Seoul National University.",
    url: SITE_URL,
    siteName: "Sigma Intelligence",
    locale: "en_US",
    alternateLocale: ["ko_KR"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sigma Intelligence — SNU Robotics Club",
    description: "Korea's first university robotics club, founded 1984 at Seoul National University.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${kr.variable} ${machine.variable} ${display.variable} ${hand.variable}`}
    >
      <body id="top" className="max-md:has-[.nav-open]:overflow-hidden">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-xs focus:bg-ink focus:px-lg focus:text-ui focus:text-canvas"
        >
          Skip to content
        </a>
        <JsonLd />
        {children}
        <ScrollRail />
        <SmoothScroll />
        <PageTurn />
        <MachineToggle />
      </body>
    </html>
  );
}
