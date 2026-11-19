"use client";

import { useSyncExternalStore } from "react";
import type { Locale } from "@/i18n/config";
import { CONTACT } from "@/i18n/dict/contact";
import { useLocale } from "@/i18n/LocaleProvider";

const TIME = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Seoul",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function subscribe(tick: () => void) {
  let id = 0;
  const next = () => {
    tick();
    id = window.setTimeout(next, 1000 - (Date.now() % 1000));
  };
  id = window.setTimeout(next, 1000 - (Date.now() % 1000));
  return () => window.clearTimeout(id);
}

// "Thursday 19 November", or "11월 19일 목요일".
const day = (tag: string) => new Intl.DateTimeFormat(tag, { timeZone: "Asia/Seoul", weekday: "long", day: "numeric", month: "long" });
const DAY: Record<Locale, Intl.DateTimeFormat> = { en: day("en-GB"), ko: day("ko-KR") };

const KST = 9 * 60;

function gap(locale: Locale) {
  const d = KST + new Date().getTimezoneOffset();
  if (d === 0) return null;
  return CONTACT[locale].zone.gap(Math.floor(Math.abs(d) / 60), Math.abs(d) % 60, d > 0);
}

const now = () => Math.floor(Date.now() / 1000);
const never = () => 0;

export default function SeoulClock({ className = "" }: { className?: string }) {
  const s = useSyncExternalStore(subscribe, now, never);
  return (
    <time suppressHydrationWarning className={`${s ? "" : "invisible"} ${className}`}>
      {s ? TIME.format(s * 1000) : "00:00:00"}
    </time>
  );
}

export function SeoulZone({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const { city, zone } = CONTACT[locale].zone;
  const s = useSyncExternalStore(subscribe, now, never);
  const parts = [city, zone, ...(s ? [DAY[locale].format(s * 1000), gap(locale)] : [])].filter(Boolean);
  return (
    <span className={className}>
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 ? " · " : null}
          <span className="whitespace-nowrap">{p}</span>
        </span>
      ))}
    </span>
  );
}
