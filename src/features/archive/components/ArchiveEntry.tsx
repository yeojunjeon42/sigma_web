import Link from "next/link";
import { T } from "@/components/T";
import type { Bilingual } from "../types";
import EntryBody from "./EntryBody";
import type { ReelBuild } from "./ArchiveReel";

const META = "text-caption tracking-normal leading-[1.35]";
const HIT = "-mx-sm inline-flex min-h-11 items-center px-sm";
const TAP = `${HIT} transition-colors hover:text-ink`;

export interface EntryStep {
  href: string;
  name: Bilingual;
}

export default function ArchiveEntry({
  build,
  close,
  prev,
  next,
}: {
  build: ReelBuild;
  close: string;
  prev: EntryStep | null;
  next: EntryStep | null;
}) {
  const step = (s: EntryStep | null, label: Bilingual) =>
    s ? (
      <Link href={s.href} replace className={TAP}>
        <T en={label.en} ko={label.ko} />
      </Link>
    ) : (
      <span aria-hidden="true" className={`${HIT} text-rule-strong`}>
        <T en={label.en} ko={label.ko} />
      </span>
    );

  return (
    <article className="u-gutter pt-[calc(var(--masthead)+var(--spacing-sm))]">
      <nav aria-label="Entry" className={`flex items-center justify-between gap-x-lg text-ink-subtle ${META}`}>
        <Link href={close} replace className={`${TAP} gap-x-xs`}>
          <span aria-hidden="true">←</span>
          <T en="Archive" ko="아카이브" />
        </Link>
        <span className="flex items-center gap-x-lg">
          {step(prev, { en: "Previous", ko: "이전" })}
          {step(next, { en: "Next", ko: "다음" })}
        </span>
      </nav>

      <div className="mt-lg max-w-content">
        <EntryBody build={build} variant="page" />
      </div>

      {prev || next ? (
        <nav aria-label="More builds" className="mt-section border-t border-rule-strong">
          {(
            [
              [prev, { en: "Previous", ko: "이전" }],
              [next, { en: "Next", ko: "다음" }],
            ] as const
          ).map(([s, label]) =>
            s ? (
              <Link
                key={label.en}
                href={s.href}
                replace
                className="block border-b border-rule py-md"
              >
                <span className={`block text-ink-subtle ${META}`}>
                  <T en={label.en} ko={label.ko} />
                </span>
                <span className="mt-xs block text-title text-balance text-ink">
                  <T en={s.name.en} ko={s.name.ko} />
                </span>
              </Link>
            ) : null,
          )}
        </nav>
      ) : null}
    </article>
  );
}
