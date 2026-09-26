import Link from "next/link";
import EntryBody from "./EntryBody";
import type { ReelBuild } from "./ArchiveReel";

const META = "text-caption tracking-normal leading-[1.35]";
const HIT = "-mx-sm inline-flex min-h-11 items-center px-sm";
const TAP = `${HIT} transition-colors hover:text-ink`;

interface EntryStep {
  href: string;
  name: string;
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
  const step = (s: EntryStep | null, label: string) =>
    s ? (
      <Link href={s.href} replace className={TAP}>
        {label}
      </Link>
    ) : (
      <span aria-hidden="true" className={`${HIT} text-rule-strong`}>
        {label}
      </span>
    );

  return (
    <article className="u-gutter pt-[calc(var(--masthead)+var(--spacing-sm))]">
      <nav aria-label="Entry" className={`flex items-center justify-between gap-x-lg text-ink-muted ${META}`}>
        <Link href={close} replace className={`${TAP} gap-x-xs`}>
          <span aria-hidden="true">←</span>
          Archive
        </Link>
        <span className="flex items-center gap-x-lg">
          {step(prev, "Previous")}
          {step(next, "Next")}
        </span>
      </nav>

      <div className="mt-lg max-w-content">
        <EntryBody build={build} variant="page" />
      </div>

      {prev || next ? (
        <nav aria-label="More builds" className="mt-section border-t border-rule-strong">
          {(
            [
              [prev, "Previous"],
              [next, "Next"],
            ] as const
          ).map(([s, label]) =>
            s ? (
              <Link
                key={label}
                href={s.href}
                replace
                className="block border-b border-rule py-md"
              >
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
