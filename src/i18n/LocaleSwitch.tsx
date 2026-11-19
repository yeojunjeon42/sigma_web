"use client";

import type { MouseEvent } from "react";
import { COOKIE, LOCALES, localePath, type Locale } from "./config";
import { COMMON } from "./dict/common";
import { useLocale, usePath } from "./LocaleProvider";

const ON = "text-ink";
const OFF = "text-ink-muted transition-colors hover:text-ink";

// EN KO, set like the view switches: plain words, the current one in ink. Choosing one remembers
// it and opens the same page in that language. A plain link, so the whole document, its `lang`
// included, is loaded again.
export default function LocaleSwitch({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const path = usePath();
  const choose = (to: Locale) => (event: MouseEvent<HTMLAnchorElement>) => {
    document.cookie = `${COOKIE}=${to}; path=/; max-age=31536000; samesite=lax`;
    event.currentTarget.href = localePath(to, path) + window.location.search + window.location.hash;
  };
  return (
    <nav aria-label={COMMON[locale].language} className={`flex items-baseline gap-x-md ${className}`}>
      {LOCALES.map((l) => (
        <a key={l} href={localePath(l, path)} hrefLang={l} aria-current={l === locale ? "true" : undefined} onClick={choose(l)} className={l === locale ? ON : OFF}>
          {l.toUpperCase()}
        </a>
      ))}
    </nav>
  );
}
