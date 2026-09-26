import { Fragment } from "react";
import Link from "next/link";
import { SOCIAL } from "@/features/site/data/social";

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
    <footer className="u-card-rise overflow-hidden rounded-t-[2.5rem] bg-band text-ink [corner-shape:squircle]">
      <div className="u-gutter mx-auto w-full max-w-wide pt-xxl lg:pt-section">
        <div className="grid grid-cols-2 gap-x-md gap-y-xl text-body lg:grid-cols-12 lg:gap-x-lg">
          <div className="hidden lg:col-span-4 lg:block">
            <p>
              Where Imagination Meets Reality
            </p>
            <a href={`mailto:${EMAIL}`} className={`mt-xs inline-block ${LINK}`}>
              {EMAIL}&nbsp;↗
            </a>
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

          <div className="lg:col-span-2">
            <p className={`${LABEL} max-lg:hidden`}>
              Follow
            </p>
            <ul className="flex flex-col gap-y-xxs">
              {SOCIAL.map((s) => (
                <li key={s.name}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className={ITEM}>
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden lg:col-span-3 lg:block">
            <p className={LABEL}>
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

          <dl className="col-span-2 grid gap-y-sm lg:hidden">
            <div className="grid grid-cols-[4rem_minmax(0,1fr)] gap-x-sm">
              <dt className="pt-[0.2rem] text-caption text-ink-muted">
                Room
              </dt>
              <dd>
                Building 302, Room 215‑2
                <br />
                Seoul National University
              </dd>
            </div>
            <div className="grid grid-cols-[4rem_minmax(0,1fr)] gap-x-sm">
              <dt className="pt-[0.2rem] text-caption text-ink-muted">
                Email
              </dt>
              <dd>
                <a href={`mailto:${EMAIL}`} className={`${HIT} ${LINK}`}>
                  {EMAIL}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-xxl flex flex-col gap-y-xxs text-caption text-ink-muted lg:mt-section lg:flex-row lg:justify-between lg:gap-x-lg">
          <p>
            © {year} SIGMA INTELLIGENCE · {`EST. ${FOUNDED}`}
          </p>
          <p className="max-lg:hidden">
            {LEGAL.map((l, i) => (
              <Fragment key={l.href}>
                {i > 0 && " · "}
                <a href={l.href} target="_blank" rel="noopener noreferrer" className={LINK}>
                  {l.label}
                </a>
              </Fragment>
            ))}
          </p>
          <p>
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
  );
}
