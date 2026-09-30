import { Fragment } from "react";
import Link from "next/link";
import { SOCIAL } from "@/features/site/data/social";
import FootGround from "./FootGround";

const FOUNDED = 1984;
const EMAIL = "record.snusigma@gmail.com";

const PAGES = [
  { label: "Archive", href: "/archive" },
  { label: "History", href: "/history" },
  { label: "Members", href: "/members" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const LEGAL = [
  { label: "Seoul National University", href: "https://www.snu.ac.kr" },
  { label: "Electrical and Computer Engineering", href: "https://ece.snu.ac.kr" },
];

const LABEL = "mb-sm text-caption text-ink-muted";
const HIT = "relative before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-[''] lg:before:hidden";
const ITEM = `${HIT} u-swipe`;
const LINK = "u-swipe-rest whitespace-nowrap";

function Wordmark() {
  return (
    <div aria-hidden="true" className="u-gutter @container pointer-events-none mx-auto mt-lg w-full max-w-wide">
      <p className="u-trim -ml-[0.0555em] whitespace-nowrap font-[family-name:var(--f-display)] text-[length:calc(100cqw/4.115)] font-bold leading-none tracking-[-0.02em] text-ink [font-stretch:125%]">
        SIGMA
      </p>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <div className="overflow-clip bg-canvas">
      <footer data-band className="u-card-rise overflow-hidden rounded-t-[2.5rem] bg-band text-ink [corner-shape:squircle]">
        <div className="u-gutter mx-auto w-full max-w-wide pt-xxl lg:pt-section">
          <div className="grid grid-cols-2 gap-x-md gap-y-xxxl text-body lg:grid-cols-12 lg:gap-x-lg lg:gap-y-xl">
            {/* The tagline sits in a label's line box (its own line height 0), so it shares the labels'
                baseline; the email takes a link's line box, so it shares the first links'. */}
            <div className="hidden lg:col-span-4 lg:block">
              <p className="mb-sm text-caption">
                <span className="text-body leading-[0]">Where Imagination Meets Reality</span>
              </p>
              <p>
                <a href={`mailto:${EMAIL}`} className={LINK}>
                  {EMAIL}&nbsp;↗
                </a>
              </p>
            </div>

            <nav aria-label="Footer" className="lg:col-span-2 lg:col-start-6">
              <p className={`${LABEL} max-lg:hidden`}>
                Pages
              </p>
              <ul className="flex flex-col gap-y-xxs">
                {PAGES.map((page) => (
                  <li key={page.href}>
                    <Link href={page.href} className={ITEM}>
                      {page.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="max-lg:mt-[calc(4*(1lh+var(--spacing-xxs)))] max-lg:text-right lg:col-span-2">
              <p className={`${LABEL} max-lg:hidden`}>
                Follow
              </p>
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
              <p className={`${LABEL} max-lg:hidden`}>
                Visit
              </p>
              <p>
                Building 302, Room 215‑2
                <br />
                Seoul National University
                <br />
                1 Gwanak-ro, Gwanak-gu, Seoul
              </p>
            </div>

            <div className="col-span-2 justify-self-end lg:hidden">
              <a href={`mailto:${EMAIL}`} className={`${HIT} ${LINK}`}>
                {EMAIL}
              </a>
            </div>
          </div>

          <div className="mt-xxxl flex flex-col gap-y-xxs text-body text-ink-muted lg:mt-section lg:grid lg:grid-cols-12 lg:gap-x-lg lg:text-caption">
            <p className="lg:col-span-5">
              © {year} SIGMA INTELLIGENCE · {`EST. ${FOUNDED}`}
            </p>
            <p className="max-lg:hidden lg:col-span-4 lg:col-start-6">
              {LEGAL.map((l, i) => (
                <Fragment key={l.href}>
                  {i > 0 && " · "}
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className={LINK}>
                    {l.label}
                  </a>
                </Fragment>
              ))}
            </p>
            <p className="lg:col-span-3 lg:col-start-10 lg:justify-self-end">
              Made by{" "}
              <a href="https://github.com/yeojunjeon42" target="_blank" rel="noopener noreferrer" className={LINK}>
                Yeojun Jeon
              </a>
              {" & "}
              <a href="https://xlaude2040.com/" target="_blank" rel="noopener noreferrer" className={LINK}>
                Jin Myung Lee
              </a>
            </p>
          </div>
        </div>

        <Wordmark />
      </footer>
      <FootGround />
    </div>
  );
}
