"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { dict } from "@/lib/i18n";

export default function Hero() {
  const { lang } = useLanguage();
  const h = dict.hero;

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Background image */}
      <Image
        src="/images/about/sigma-img-p1-1.jpg"
        alt="Sigma Intelligence team"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark/80 via-dark/60 to-dark/80" />

      {/* Red accent glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-bright-red/10 via-transparent to-transparent" />

      {/* Centered content */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <span
          data-anim="hero-badge"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white backdrop-blur-sm"
        >
          <span className="h-2 w-2 rounded-full bg-bright-red" />
          {h.badge[lang]}
        </span>

        <h1
          data-anim="hero-title"
          className="mb-6 text-5xl font-bold leading-tight text-white sm:text-6xl md:text-7xl"
        >
          Sigma{" "}
          <span className="text-bright-red">Intelligence</span>
        </h1>

        <p
          data-anim="hero-sub"
          className="mb-12 text-lg font-medium text-white/70 md:text-xl"
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
            className="inline-flex items-center justify-center rounded-md border border-white/30 bg-white/10 px-8 py-3 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            {h.learn[lang]}
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
        <span className="text-xs font-medium tracking-widest uppercase">
          {h.scroll[lang]}
        </span>
        <div className="h-10 w-px bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}
