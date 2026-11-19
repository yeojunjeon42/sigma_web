import { PhotoFrame } from "@/components/ui";
import Image from "next/image";
import { pick, type Both, type Locale } from "@/i18n/config";
import { HISTORY, seasonName } from "@/i18n/dict/history";
import { splitResult } from "../splitResult";
import type { HistoryEvent } from "../types";
import type { ClubEvent } from "../data/photos";
import { season, when } from "./Chronology";
import RollingDate from "./RollingDate";

const BIG =
  "font-[family-name:var(--f-display)] [font-stretch:125%] font-bold tabular-nums tracking-[-0.02em] leading-[0.699] text-ink [writing-mode:vertical-rl] text-[length:var(--Y)]";
const CAP = "text-caption text-ink-muted";
const FIGURE = "whitespace-nowrap font-[family-name:var(--f-display)] font-bold [font-stretch:125%] text-[clamp(2.25rem,9vw,4rem)] leading-[0.85] tracking-[-0.02em] tabular-nums text-ink md:text-[clamp(2.75rem,1.6rem+2.6vw,4.5rem)]";

const MOTION = `
@media (prefers-reduced-motion: no-preference) {
  .hy-in-a { animation: hy-up 640ms cubic-bezier(0.22, 1, 0.36, 1) 80ms both; }
  .hy-in-b { animation: hy-down 640ms cubic-bezier(0.22, 1, 0.36, 1) 80ms both; }
}
@keyframes hy-up { from { opacity: 0; transform: translateY(35%); } }
@keyframes hy-down { from { opacity: 0; transform: translateY(-35%); } }
`;

export default function HistoryHero({
  locale,
  now,
  facts,
  latest,
  photo,
  event,
}: {
  locale: Locale;
  now: HistoryEvent[];
  facts: { label: string; value: string }[];
  latest: number;
  photo: { src: string; w: number; h: number; alt: Both };
  event: ClubEvent;
}) {
  const t = HISTORY[locale];
  // "Fall 2026": the season the photograph was taken in.
  const [taken, takenYear] = event.when.split(" ");
  return (
    <header className="grid grid-cols-6 gap-x-gutter gap-y-lg pb-xxl pt-[calc(var(--masthead)+var(--spacing-xl))] [--Y:clamp(4rem,12vw,7rem)] md:grid-cols-12 lg:min-h-svh lg:grid-rows-[auto_minmax(18rem,1fr)_auto] lg:gap-y-xl lg:pb-lg lg:pt-[calc(var(--masthead)+var(--spacing-lg))] lg:[--Y:min(calc((100svh-var(--masthead)-2*var(--spacing-lg))*0.7/2.83),calc(15vw))]">
      <style>{MOTION}</style>
      <h1 className="contents">
        <span className="sr-only">
          {t.heading(latest)}
        </span>
        <span
          aria-hidden="true"
          data-offgrid
          className={`${BIG} u-away [--away:-12svh] col-span-2 col-start-1 row-start-1 self-start justify-self-start lg:row-span-2`}
        >
          <span className="hy-in-a block">
            <span className="-ml-[0.022em] block rotate-180 max-md:ml-[0.02em]">1984</span>
          </span>
        </span>
      </h1>

      <section aria-label={t.now} className="col-span-3 col-start-4 row-start-1 md:col-span-6 md:col-start-4 lg:col-span-3 lg:col-start-10">
        <ul className="flex flex-col gap-y-lg">
          {now.slice(0, 2).map((e) => {
            const w = when(e.date);
            const [event, result] = splitResult(pick(locale, e.title).replaceAll("-", "\u2011"));
            return (
              <li key={e.id} className="flex flex-col gap-y-xs">
                <span className={CAP}>
                  {w ? t.seasonYear(seasonName(locale, season(w)), latest) : e.award ? t.award : latest}
                </span>
                <span className="flex flex-wrap gap-x-sm text-balance text-lead text-ink lg:text-title">
                  <span className="min-w-0">{event}</span>
                  {result ? <span className="whitespace-nowrap text-ink-muted">{result}</span> : null}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <figure className="col-span-full row-start-2 flex min-h-0 flex-col gap-sm lg:col-span-6 lg:col-start-4">
        <PhotoFrame className="relative aspect-[4/3] md:aspect-[16/9] bg-ink/10 lg:aspect-auto lg:min-h-0 lg:flex-1">
          <Image src={photo.src} alt={pick(locale, photo.alt)} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </PhotoFrame>
        <figcaption className={`flex justify-between gap-x-md ${CAP}`}>
          {pick(locale, { en: event.name, ko: event.ko }).replace(/, \d{4}$/, "")}
          <span>{takenYear ? t.seasonYear(seasonName(locale, taken), takenYear) : event.when}</span>
        </figcaption>
      </figure>

      <div className="col-span-4 row-start-3 flex flex-col gap-y-lg self-end md:col-span-9 md:grid md:grid-cols-subgrid lg:col-span-6 lg:col-start-1">
        <dl className="grid grid-cols-2 gap-x-gutter md:col-span-full md:grid-cols-subgrid">
          {facts.map((f) => (
            <div key={f.label} className="flex min-w-0 flex-col-reverse justify-end gap-y-xs md:col-span-3">
              <dt className={`${CAP} max-md:whitespace-nowrap`}>
                {f.label}
              </dt>
              <dd className={FIGURE}>{f.value}</dd>
            </div>
          ))}
        </dl>
        <p className={`${CAP} flex flex-col-reverse gap-y-xs md:col-span-full md:block`}>
          <span>{t.running}</span>
          <span className="text-lead text-ink md:ml-sm [&>span]:inline">
            <RollingDate />
          </span>
        </p>
      </div>

      <span
        aria-hidden="true"
        data-offgrid
        className={`${BIG} u-away [--away:40svh] [--away-blur:28px] [--away-fade:0] col-span-2 col-start-5 row-start-3 self-end justify-self-end md:col-start-11 lg:row-span-2 lg:row-start-2 lg:-mr-[0.02em]`}
      >
        <span className="hy-in-b block">{latest}</span>
      </span>
    </header>
  );
}
