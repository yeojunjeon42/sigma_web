import Link from "@/i18n/Link";
import type { Locale } from "@/i18n/config";
import { ARCHIVE_TEXT } from "@/i18n/dict/archive";
import { Arrow } from "@/components/ui";
import EntryBody from "./EntryBody";
import EntryTop from "./EntryTop";
import Pending from "./Pending";
import type { ReelBuild } from "./ArchiveReel";

const META = "text-caption tracking-normal leading-[1.35]";
const HIT = "-mx-sm inline-flex min-h-11 items-center px-sm";
const TAP = `${HIT} transition-[color,opacity] hover:text-ink has-[[data-pending]]:opacity-50 has-[[data-pending]]:delay-150`;

interface EntryStep {
  href: string;
  name: string;
}

export default function ArchiveEntry({
  locale,
  build,
  close,
  prev,
  next,
}: {
  locale: Locale;
  build: ReelBuild;
  close: string;
  prev: EntryStep | null;
  next: EntryStep | null;
}) {
  const t = ARCHIVE_TEXT[locale];
  const step = (s: EntryStep | null, label: string) =>
    s ? (
      <Link href={s.href} replace className={TAP}>
        <Pending />
        <span className="u-trim">{label}</span>
      </Link>
    ) : (
      <span aria-hidden="true" className={`${HIT} text-rule-strong`}>
        <span className="u-trim">{label}</span>
      </span>
    );

  return (
    <article className="u-gutter pt-sm">
      <EntryTop key={build.id} />
      <nav aria-label={t.entryNav} className={`flex items-center justify-between gap-x-lg text-ink-muted ${META}`}>
        <Link href={close} replace className={`${TAP} gap-x-xs`}>
          <Pending />
          <Arrow />
          <span className="u-trim">{t.title}</span>
        </Link>
        <span className="flex items-center gap-x-lg">
          {step(prev, t.previous)}
          {step(next, t.next)}
        </span>
      </nav>

      <div className="mt-lg">
        <EntryBody locale={locale} build={build} variant="page" />
      </div>

      {prev || next ? (
        <nav aria-label={t.moreBuilds} className="mt-section border-t border-rule-strong">
          {(
            [
              [prev, t.previous],
              [next, t.next],
            ] as const
          ).map(([s, label]) =>
            s ? (
              <Link
                key={label}
                href={s.href}
                replace
                className="block border-b border-rule py-md transition-opacity has-[[data-pending]]:opacity-50 has-[[data-pending]]:delay-150"
              >
                <Pending />
                <span className={`block text-ink-muted ${META}`}>
                  {label}
                </span>
                <span className="mt-xs block text-title text-balance text-ink">
                  {s.name}
                </span>
              </Link>
            ) : null,
          )}
        </nav>
      ) : null}
    </article>
  );
}
