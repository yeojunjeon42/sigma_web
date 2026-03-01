"use client";

/**
 * Inline translation component.
 *
 * Renders `ko` on the server (matching the default lang), then on the
 * client switches to the user's saved preference after hydration.
 * suppressHydrationWarning prevents React from warning when the
 * client value differs from the server-rendered Korean default.
 *
 * Usage:
 *   <T en="Members" ko="멤버" />
 *   <T en="Learn More" ko="더 알아보기" />
 */

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface TProps {
  en: string;
  ko: string;
}

export function T({ en, ko }: TProps) {
  const [mounted, setMounted] = useState(false);
  const { lang } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <span suppressHydrationWarning>
      {mounted ? (lang === "en" ? en : ko) : ko}
    </span>
  );
}

/**
 * Hook version — returns a translator function for use in string
 * contexts (e.g. placeholder, aria-label, title attributes).
 *
 * Usage:
 *   const tr = useT();
 *   <input placeholder={tr("Your name", "이름을 입력하세요")} />
 */
export function useT() {
  const [mounted, setMounted] = useState(false);
  const { lang } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  return function tr(en: string, ko: string): string {
    return mounted ? (lang === "en" ? en : ko) : ko;
  };
}
