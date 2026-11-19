import Image from "next/image";
import Link from "next/link";
import { Arrow, PhotoFrame } from "@/components/ui";
import { displayTags } from "../data/tags";
import { formatDate } from "@/lib/date";
import { READING_LINK, type Reading } from "../reading";
import { focusOf, type Doc } from "../types";
import CodeCopy from "./CodeCopy";
import PhotoReel from "./PhotoReel";

export default function Article({ doc, back, reading }: { doc: Doc; back: { href: string; label: string }; reading?: Reading }) {
  const stamp = doc.date ?? (doc.year ? String(doc.year) : undefined);
  const dateLabel = formatDate(stamp);
  const tags = displayTags(doc.tags, Infinity);
  // Body photographs are unedited photographs at one shape, 3:2: several run as a reel, one sits in
  // the column, and a post with none shows no picture.
  const [only, ...more] = doc.photos;

  const COL = "col-span-full md:col-span-10 md:col-start-2 lg:col-span-8 lg:col-start-3 xl:col-span-6 xl:col-start-4";

  return (
    <article>
      <div className="u-sheet u-clear-masthead mx-auto w-full max-w-wide">
        <div className="col-span-full mb-xl">
          <Back back={back} />
        </div>

        <header className="col-span-full md:col-span-10 md:col-start-2">
          <p className="flex flex-wrap items-center justify-center gap-x-md gap-y-xs text-[0.875rem] leading-[1.4] text-ink-muted tabular-nums">
            {dateLabel && (
              <span className="text-ink">
                {dateLabel}
              </span>
            )}
            {tags.map((tag) => (
              <span key={tag.ko}>
                {tag.en}
              </span>
            ))}
            {reading ? (
              <Link href={reading.href} className={READING_LINK}>
                {reading.label}
              </Link>
            ) : null}
          </p>
          <h1 className="mt-lg text-center text-[clamp(2rem,1.3rem+3vw,4rem)] leading-[1.13] tracking-[-0.03em] md:leading-[1.06] text-balance text-ink">
            {doc.title}
          </h1>
          {(doc.summary || doc.summaryKo) && (
            <p className="mx-auto mt-lg max-w-[37.5rem] text-center text-[1.0625rem] leading-[1.75rem] tracking-[-0.01em] text-ink text-pretty">
              {doc.summary ?? doc.summaryKo ?? ""}
            </p>
          )}
          <p className="mt-md text-center text-[0.875rem] text-ink-muted">
            By{" "}
            <span className="text-ink">{doc.authors.length ? doc.authors.join(", ") : "SIGMA INTELLIGENCE"}</span>
            {doc.team.length > 0 && (
              <>
                <span aria-hidden="true" className="mx-xs">·</span>
                Team {doc.team.join(", ")}
              </>
            )}
          </p>
        </header>

        {more.length > 0 && <PhotoReel photos={doc.photos} title={doc.title} column={COL} />}

        {only && more.length === 0 && (
          <PhotoFrame className={`relative mt-xxl aspect-[3/2] md:mt-16 ${COL}`}>
            <Image
              src={only.src}
              alt={only.alt ?? doc.title}
              fill
              sizes="(min-width: 708px) 50vw, calc(100vw - 2rem)"
              preload
              fetchPriority="high"
              style={{ objectPosition: focusOf(only) }}
              className="object-cover"
            />
          </PhotoFrame>
        )}

        <div className="col-span-full mt-xxl grid grid-cols-subgrid md:mt-16">
          {doc.html ? (
            <div
              className={`${COL} prose flow article-prose u-trim [&_figure[data-placeholder]]:my-xl [&_figure[data-placeholder]]:aspect-[16/9] [&_figure[data-placeholder]]:u-corner [&_figure[data-placeholder]]:bg-ink/5`}
              lang={doc.lang === "ko" ? "ko" : undefined}
              dangerouslySetInnerHTML={{ __html: doc.html }}
            />
          ) : null}
          <CodeCopy />

        </div>
      </div>
    </article>
  );
}

function Back({ back }: { back: { href: string; label: string } }) {
  return (
    <Link
      href={back.href}
      className="relative -my-sm flex w-fit items-center gap-xs py-sm text-caption text-ink-muted transition-colors before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-[''] hover:text-ink"
    >
      <Arrow />
      <span className="u-trim">
        {back.label}
      </span>
    </Link>
  );
}
