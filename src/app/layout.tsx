import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Archivo, Caveat, Geist_Mono, Newsreader, Noto_Serif_KR } from "next/font/google";
import { JsonLd } from "@/components/JsonLd";
import { ScrollRail } from "@/components/ScrollRail";
import SmoothScroll from "@/components/SmoothScroll";
import PageTurn from "@/components/PageTurn";
import "lenis/dist/lenis.css";
import "./globals.css";
import { SITE_URL } from "@/features/site/data/site";

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

// Custom glyphs replace missing sans symbols; matching metrics preserve line height.
const marks = localFont({
  src: [
    { path: "../fonts/marks-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/marks-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--f-marks",
  display: "swap",
  adjustFontFallback: false,
  declarations: [
    { prop: "unicode-range", value: "U+00B7, U+00D7, U+2190-2193, U+2196-2199" },
    { prop: "ascent-override", value: "97.6%" },
    { prop: "descent-override", value: "22.4%" },
    { prop: "line-gap-override", value: "0%" },
  ],
});

const kr = localFont({
  src: [
    { path: "../fonts/pretendard-regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/pretendard-medium.woff2", weight: "700", style: "normal" },
  ],
  variable: "--f-kr",
  display: "swap",
  preload: false,
  declarations: [
    { prop: "size-adjust", value: "104.6%" },
    { prop: "ascent-override", value: "93.3%" },
    { prop: "descent-override", value: "21.4%" },
    { prop: "line-gap-override", value: "0%" },
  ],
});

const display = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--f-display",
  display: "block",
});

const serif = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--f-serif",
  display: "swap",
  preload: false,
});

const serifKr = Noto_Serif_KR({
  weight: ["400"],
  variable: "--f-serif-kr",
  display: "swap",
  preload: false,
});

const hand = Caveat({
  weight: ["500"],
  subsets: ["latin"],
  variable: "--f-hand",
  display: "swap",
  preload: false,
});

const mono = Geist_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--f-mono",
  display: "swap",
  preload: false,
});


const SCREEN = `(()=>{const s=document.createElement("style"),r=()=>{s.textContent=":root{--screen:"+innerHeight+"px}"};let w=innerWidth;r();document.head.appendChild(s);addEventListener("resize",()=>{if(innerWidth!==w||!matchMedia("(pointer:coarse)").matches){w=innerWidth;r()}})})()`;

export const viewport: Viewport = {
  themeColor: "#dfe1dc",
};

export const metadata: Metadata = {
  title: {
    default: "SIGMA INTELLIGENCE \\ SNU Robotics Club",
    template: "%s \\ SIGMA INTELLIGENCE",
  },
  description:
    "SIGMA INTELLIGENCE is the robotics club of Seoul National University. Founded in 1984, it is Korea's first university robotics club. 서울대학교 로봇동아리 시그마 인텔리전스.",
  keywords: [
    "서울대 로봇동아리",
    "서울대학교 로봇동아리",
    "시그마 인텔리전스",
    "SIGMA INTELLIGENCE",
    "SNU robotics club",
    "로봇 동아리",
    "서울대 로봇",
    "SNU robotics",
    "Seoul National University robotics club",
    "university robotics club Korea",
  ],
  applicationName: "SIGMA INTELLIGENCE",
  authors: [{ name: "SIGMA INTELLIGENCE", url: SITE_URL }],
  creator: "SIGMA INTELLIGENCE",
  publisher: "SIGMA INTELLIGENCE",
  category: "education",
  icons: {
    icon: [{ url: "/logo-mark.svg", type: "image/svg+xml" }],
    shortcut: "/logo-mark.svg",
    apple: "/favicon.png",
  },
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "SIGMA INTELLIGENCE — SNU Robotics Club",
    description: "Korea's first university robotics club, founded 1984 at Seoul National University.",
    url: SITE_URL,
    siteName: "SIGMA INTELLIGENCE",
    locale: "en_US",
    alternateLocale: ["ko_KR"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SIGMA INTELLIGENCE — SNU Robotics Club",
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
      className={`${marks.variable} ${sans.variable} ${kr.variable} ${mono.variable} ${display.variable} ${hand.variable} ${serif.variable} ${serifKr.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCREEN }} />
      </head>
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
