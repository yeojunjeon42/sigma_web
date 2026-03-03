"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { dict } from "@/lib/i18n";
import { initHeroMotion } from "@/lib/motion";

interface HeroProps {
  backgroundImageUrl?: string | null;
}

export default function Hero({ backgroundImageUrl }: HeroProps) {
  const { lang } = useLanguage();
  const h = dict.hero;
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initHeroMotion();
  }, []);

  useEffect(() => {
    if (!backgroundImageUrl) return;

    function onScroll() {
      if (bgRef.current) {
        bgRef.current.style.transform = `translateY(${window.scrollY * 0.4}px)`;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [backgroundImageUrl]);

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ background: "#ffffff" }}
    >
      {backgroundImageUrl && (
        <div
          ref={bgRef}
          className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none will-change-transform"
        >
          <Image
            src={backgroundImageUrl}
            alt=""
            width={1350}
            height={900}
            priority
            unoptimized
            className="object-contain"
          />
        </div>
      )}

      {/* Gradient overlay — z-[1], visible color gradients above the image */}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-br from-[#2B2D42]/30 to-bright-red/10" />

      {/* Centered content */}
      <div className="relative z-[2] mx-auto max-w-3xl px-6 text-center">
        <span
          data-anim="hero-badge"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#FAFAFA]/15 bg-[#FAFAFA]/5 px-5 py-2 text-sm font-semibold text-[#FAFAFA] [text-shadow:0_1px_2px_rgba(0,0,0,0.25)]"
        >
          <span className="h-2 w-2 rounded-full bg-bright-red" />
          {h.badge[lang]}
        </span>

        <h1
          data-anim="hero-title"
          className="mb-6 text-5xl font-bold leading-tight text-[#FAFAFA] sm:text-6xl md:text-6xl [text-shadow:0_1px_3px_rgba(0,0,0,0.3)]"
        >
          SIGMA{" "}
          <span className="text-bright-red">Intelligence</span>
          <span className="sr-only">
            - 서울대학교 로봇동아리 시그마 인텔리전스
          </span>
        </h1>

        <p
          data-anim="hero-sub"
          className="mb-12 text-lg font-medium text-[#FAFAFA] md:text-xl [text-shadow:0_1px_2px_rgba(0,0,0,0.25)]"
        >
          {h.tagline[lang]}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            data-anim="hero-cta"
            href="/projects"
            className="inline-flex items-center justify-center rounded-md bg-bright-red px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-darker-red"
          >
            {h.projects[lang]}
          </Link>
          <Link
            data-anim="hero-cta"
            href="/about"
            className="inline-flex items-center justify-center rounded-md border border-[#FAFAFA]/20 bg-[#FAFAFA]/5 px-8 py-3 text-base font-semibold text-[#FAFAFA] transition-colors hover:bg-[#2B2D42]/10 [text-shadow:0_1px_2px_rgba(0,0,0,0.25)]"
          >
            {h.learn[lang]}
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 z-[2] -translate-x-1/2 flex flex-col items-center gap-2 text-[#FAFAFA]/50">
        <span className="text-xs font-medium tracking-widest uppercase [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]">
          {h.scroll[lang]}
        </span>
        <div className="h-10 w-px bg-gradient-to-b from-[#FAFAFA]/40 to-transparent" />
      </div>
    </section>
  );
}
