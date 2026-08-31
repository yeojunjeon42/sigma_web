"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { dict } from "@/lib/i18n";

interface HeroProps {
  backgroundImageUrl?: string | null;
}

export default function Hero({ backgroundImageUrl }: HeroProps) {
  const { lang } = useLanguage();
  const h = dict.hero;

  return (
    <section id="home">
      {backgroundImageUrl && (
        <Image
          src={backgroundImageUrl}
          alt=""
          width={1350}
          height={900}
          priority
          unoptimized
        />
      )}

      <p>{h.badge[lang]}</p>

      <h1>
        SIGMA Intelligence
        <span className="sr-only">
          - 서울대학교 로봇동아리 시그마 인텔리전스
        </span>
      </h1>

      <p>{h.tagline[lang]}</p>

      <Link href="/projects">{h.projects[lang]}</Link>
      <Link href="/about">{h.learn[lang]}</Link>
    </section>
  );
}
