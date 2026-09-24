import { Fragment } from "react";
import Link from "next/link";
import { T } from "./T";
import { SOCIAL } from "@/features/site/data/social";

const FOUNDED = 1984;
const EMAIL = "record.snusigma@gmail.com";

const PAGES = [
  { label: { en: "Archive", ko: "아카이브" }, href: "/archive" },
  { label: { en: "History", ko: "연혁" }, href: "/history" },
  { label: { en: "Members", ko: "구성원" }, href: "/members" },
  { label: { en: "Blog", ko: "블로그" }, href: "/blog" },
  { label: { en: "Contact", ko: "연락처" }, href: "/contact" },
];

const LEGAL = [
  { label: { en: "Seoul National University", ko: "서울대학교" }, href: "https://www.snu.ac.kr" },
  { label: { en: "Electrical and Computer Engineering", ko: "전기·정보공학부" }, href: "https://ece.snu.ac.kr" },
];

function GhostWordmark() {
  return (
    <div className="overflow-hidden">
      <p
        aria-hidden="true"
        className="u-trim whitespace-nowrap font-[family-name:var(--f-display)] text-[25vw] leading-[0.78] font-bold tracking-[-0.065em] text-ink opacity-[0.07] [font-stretch:125%]"
      >
        SIGMA
      </p>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="flex min-h-svh flex-col bg-band text-ink">
      <div className="u-gutter mx-auto flex w-full max-w-wide flex-1 flex-col justify-center pt-section pb-xxxl">
        <div className="grid gap-y-section lg:grid-cols-2 lg:gap-x-xxxl">
          <div className="lg:pt-lg">
            <div className="max-w-[38ch]">
              <p className="u-trim text-title">
                <T
                  en="Where Imagination Meets Reality"
                  ko="Where Imagination Meets Reality"
                />
              </p>

              <a
                href={`mailto:${EMAIL}`}
                className="mt-lg inline-flex min-h-11 items-center gap-xs rounded-pill bg-ink px-lg text-ui text-canvas transition-colors hover:bg-ink-muted"
              >
                {EMAIL}
                <span aria-hidden="true">↗</span>
              </a>
            </div>

            <ul className="mt-xxl flex flex-wrap gap-lg">
              {SOCIAL.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="-my-sm flex min-h-11 items-center py-sm text-ui text-ink-muted underline decoration-transparent underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
                  >
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Footer">
            <ul className="border-t border-rule-strong">
              {PAGES.map((page, i) => (
                <li key={page.href} className="u-rule-under border-b border-rule-strong transition-colors duration-300 has-[a:hover]:border-ink">
                  <Link
                    href={page.href}
                    className="group flex items-center gap-lg py-lg"
                  >
                    <span className="u-trim w-10 shrink-0 text-title tabular-nums text-ink-subtle">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="u-ink-in u-trim text-display-lg transition-transform duration-300 ease-out group-hover:translate-x-2 motion-reduce:transition-none">
                      <T en={page.label.en} ko={page.label.ko} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-section text-body-sm text-ink-muted">
          <T en="This website is crafted by" ko="웹사이트 제작" />{" "}
          <a href="https://github.com/yeojunjeon42" target="_blank" rel="noopener noreferrer" className="whitespace-nowrap underline underline-offset-4 transition-colors hover:text-ink">
            Yeojun Jeon
          </a>
          {" "}
          <T en="and" ko="·" />{" "}
          <a href="https://xlaude2040.com/" target="_blank" rel="noopener noreferrer" className="whitespace-nowrap underline underline-offset-4 transition-colors hover:text-ink">
            Jin Myung Lee
          </a>
        </p>

        <div className="mt-sm flex flex-wrap items-baseline justify-between gap-x-xxl gap-y-sm border-t border-ink/15 pt-sm text-body-sm text-ink-muted">
          <p>
            © {year} SIGMA INTELLIGENCE ·{" "}
            <T en={`EST. ${FOUNDED}`} ko={`${FOUNDED}년 창립`} />
          </p>

          <p className="text-ink-subtle">
            {/* The separators are text in the sentence, not wrappers around each link — a link
                boxed on its own reads as a standalone target that ought to be finger-sized. */}
            {LEGAL.map((l, i) => (
              <Fragment key={l.href}>
                {i > 0 && " · "}
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 transition-colors hover:text-ink"
                >
                  <T en={l.label.en} ko={l.label.ko} />
                </a>
              </Fragment>
            ))}
          </p>
        </div>
      </div>

      <GhostWordmark />
    </footer>
  );
}
