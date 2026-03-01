import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sigma Intelligence",
  description: "Official website for Sigma Intelligence (SNU Robotics Club)",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Sigma Intelligence",
    description: "Official website for Sigma Intelligence (SNU Robotics Club)",
    locale: "en_US",
  },
  alternates: {
    languages: {
      'ko': '/ko',
      'en': '/en',
    },
  },
};

// For Korean version
export const metadataKo: Metadata = {
  title: "시그마 인텔리전스",
  description: "서울대학교 로봇 동아리 공식 웹사이트",
  openGraph: {
    title: "시그마 인텔리전스",
    description: "서울대학교 로봇 동아리 공식 웹사이트",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
