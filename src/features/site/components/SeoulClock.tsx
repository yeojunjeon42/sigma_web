"use client";

import { useSyncExternalStore } from "react";

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

const DAY = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Seoul", weekday: "long", day: "numeric", month: "long" });

const KST = 9 * 60;

function gap() {
  const d = KST + new Date().getTimezoneOffset();
  if (d === 0) return null;
  const h = Math.floor(Math.abs(d) / 60);
  const m = Math.abs(d) % 60;
  const span = [h ? `${h} hour${h === 1 ? "" : "s"}` : "", m ? `${m} minutes` : ""].filter(Boolean).join(" ");
  return `${span} ${d > 0 ? "ahead of" : "behind"} you`;
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
  const s = useSyncExternalStore(subscribe, now, never);
  const parts = ["Seoul", "KST, UTC+9", ...(s ? [DAY.format(s * 1000), gap()] : [])].filter(Boolean);
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
