"use client";

import { Fragment } from "react";
import Link from "@/i18n/Link";
import { useLocale } from "@/i18n/LocaleProvider";
import LocaleSwitch from "@/i18n/LocaleSwitch";
import { SHELL } from "@/i18n/dict/shell";
import { SOCIAL } from "@/features/site/data/social";
import FootGround from "./FootGround";

const FOUNDED = 1984;
const EMAIL = "record.snusigma@gmail.com";
// Read once, so the page a server drew and the browser's own agree within a visit.
const YEAR = new Date().getFullYear();

const PAGES = [
  { key: "archive", href: "/archive" },
  { key: "history", href: "/history" },
  { key: "members", href: "/members" },
  { key: "blog", href: "/blog" },
  { key: "contact", href: "/contact" },
  { key: "terminal", href: "/ai" },
] as const;

const LEGAL = [
  { key: "university", href: "https://www.snu.ac.kr" },
  { key: "department", href: "https://ece.snu.ac.kr" },
] as const;

const HIT = "relative before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-[''] lg:before:hidden";
const ITEM = `${HIT} u-swipe`;
const LINK = "u-swipe-rest whitespace-nowrap";
// The language switch's words get a finger's room below lg, as the links do.
const LANG_HIT =
  "[&>a]:relative [&>a]:before:absolute [&>a]:before:inset-x-[-0.5rem] [&>a]:before:top-1/2 [&>a]:before:h-11 [&>a]:before:-translate-y-1/2 [&>a]:before:content-['']";

function Wordmark() {
  return (
    <div aria-hidden="true" className="u-gutter @container pointer-events-none mx-auto mt-lg w-full max-w-wide select-none">
      <p className="u-trim -ml-[0.0555em] whitespace-nowrap font-[family-name:var(--f-display)] text-[length:calc(100cqw/4.115)] font-bold leading-none tracking-[-0.02em] text-ink [font-stretch:125%]">
        SIGMA
      </p>
    </div>
  );
}

export default function Footer() {
  const say = SHELL[useLocale()];
  const foot = say.footer;

  return (
    <div className="overflow-clip bg-canvas">
      <footer data-band className="u-card-rise overflow-hidden rounded-t-[2.5rem] bg-band text-ink [corner-shape:squircle]">
        <div className="u-gutter mx-auto w-full max-w-wide pt-xxl lg:pt-section">
          <div className="grid grid-cols-2 gap-x-gutter gap-y-xxxl text-body lg:grid-cols-12 lg:gap-y-xl">
            {/* The tagline and the email sit on the lists' first two lines. */}
            <div className="hidden lg:col-span-4 lg:flex lg:flex-col lg:gap-y-xxs">
              <p>{foot.tagline}</p>
              <p>
                <a href={`mailto:${EMAIL}`} className={LINK}>
                  {EMAIL}&nbsp;↗
                </a>
              </p>
              {/* The language, on the lists' last line. */}
              <LocaleSwitch className="mt-auto" />
            </div>

            <div className="flex flex-col lg:col-span-2 lg:col-start-6">
              <nav aria-label={foot.label}>
                <ul className="flex flex-col gap-y-xxs">
                  {PAGES.map((page) => (
                    <li key={page.href}>
                      <Link href={page.href} className={ITEM}>
                        {say.nav[page.key]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              {/* Below lg the language sits under the page links, on the second list's last line. */}
              <LocaleSwitch className={`mt-auto lg:hidden ${LANG_HIT}`} />
            </div>

            {/* Below lg, align the list with the last page link. */}
            <div className="max-lg:mt-[calc(5*(1lh+var(--spacing-xxs)))] max-lg:text-right lg:col-span-2">
              <ul className="flex flex-col gap-y-xxs max-lg:items-end">
                {SOCIAL.map((s) => (
                  <li key={s.name}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className={ITEM}>
                      {s.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 lg:col-span-3">
              {/* One line to a row, on the lists' rows. */}
              <p className="flex flex-col gap-y-xxs">
                {foot.address.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>
            </div>

            <div className="col-span-2 justify-self-end lg:hidden">
              <a href={`mailto:${EMAIL}`} className={`${HIT} ${LINK}`}>
                {EMAIL}
              </a>
            </div>
          </div>

          <div className="mt-xxxl flex flex-col gap-y-xxs text-body text-ink-muted lg:mt-section lg:grid lg:grid-cols-12 lg:gap-x-gutter lg:text-caption">
            <p suppressHydrationWarning className="lg:col-span-5">
              © {YEAR} SIGMA INTELLIGENCE · {foot.est(FOUNDED)}
            </p>
            <p className="max-lg:hidden lg:col-span-4 lg:col-start-6">
              {LEGAL.map((l, i) => (
                <Fragment key={l.href}>
                  {i > 0 && " · "}
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className={LINK}>
                    {foot[l.key]}
                  </a>
                </Fragment>
              ))}
            </p>
            <p className="lg:col-span-3 lg:col-start-10 lg:justify-self-end lg:text-right">
              <span className="whitespace-nowrap">
                {foot.powered}{" "}
                <a href="https://github.com/yeojunjeon42" target="_blank" rel="noopener noreferrer" className={LINK}>
                  Yeojun Jeon
                </a>
                ,
              </span>{" "}
              <span className="whitespace-nowrap">
                {foot.designed}{" "}
                <a href="https://xlaude2040.com/" target="_blank" rel="noopener noreferrer" className={LINK}>
                  Jin Myung Lee
                </a>
              </span>
            </p>
          </div>
        </div>

        <Wordmark />
      </footer>
      <FootGround />
    </div>
  );
}
