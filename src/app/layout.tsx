import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import MotionProvider from "@/components/MotionProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { JsonLd } from "@/components/JsonLd";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin", "korean"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const SITE_URL = "https://sigmaintelligence.org";

export const metadata: Metadata = {
  title: {
    default: "시그마 | 서울대학교 로봇동아리",
    template: "%s | 시그마",
  },
  description:
    "서울대학교 로봇동아리 시그마 인텔리전스(Sigma Intelligence) 공식 웹사이트. 1984년 설립된 국내 최초 대학 로봇 동아리로 자율주행, 로봇팔 등 다양한 프로젝트를 수행합니다.",
  keywords: [
    "서울대 로봇동아리",
    "서울대 로봇",
    "서울대학교 로봇동아리",
    "서울대학교 로봇",
    "시그마 인텔리전스",
    "Sigma Intelligence",
    "SNU robotics club",
    "SNU robotics",
    "로봇 동아리",
    "대학 로봇",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "시그마 | 서울대학교 로봇동아리",
    description:
      "서울대학교 로봇동아리 시그마 인텔리전스 공식 웹사이트. 1984년 설립, 국내 최초 대학 로봇 동아리.",
    url: SITE_URL,
    siteName: "시그마 | 서울대학교 로봇동아리",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "시그마 | 서울대학교 로봇동아리",
    description:
      "서울대학교 로봇동아리 시그마 인텔리전스 공식 웹사이트. 1984년 설립, 국내 최초 대학 로봇 동아리.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKR.variable} antialiased`}>
        <JsonLd />
        <LanguageProvider>
          <MotionProvider />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
