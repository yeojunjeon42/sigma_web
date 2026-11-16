import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/ui";
import { displayTags } from "../data/tags";
import { formatDate } from "@/lib/date";
import { imageSize } from "@/features/archive/api/imageSize";
import type { Photo } from "@/features/archive/types";
import type { Doc } from "../types";
import { coverFor } from "../data/covers";
import CardReel from "./CardReel";
import CodeCopy from "./CodeCopy";
import PostImage from "./PostImage";

export default function Article({
  doc,
  photos = [],
  videos = [],
  back,
}: {
  doc: Doc;
  photos?: Photo[];
  videos?: string[];
  back: { href: string; label: string };
}) {
  const stamp = doc.date ?? (doc.year ? String(doc.year) : undefined);
  const dateLabel = formatDate(stamp);
  const tags = displayTags(doc.tags, Infinity);
  const [leadPhoto, ...inline] = photos;
  const cards = doc.cards.map((alt, i) => {
    const src = `/blog-photos/${doc.slug}-card-${i + 1}.jpg`;
    const size = imageSize(path.join(process.cwd(), "public", src)) ?? { width: 1080, height: 1080 };
    return { src, alt, ...size };
  });
  const cover = leadPhoto || cards.length ? undefined : coverFor(doc.slug);

  const COL = "col-span-full md:col-span-10 md:col-start-2 lg:col-span-8 lg:col-start-3 xl:col-span-6 xl:col-start-4";
  const imageSizes = "(min-width: 708px) 50vw, calc(100vw - 2rem)";

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
          </p>
          <h1 className="mt-lg text-center text-[clamp(2rem,1.3rem+3vw,4rem)] leading-[1.13] tracking-[-0.03em] md:leading-[1.06] lg:leading-none text-balance text-ink">
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

        {cards.length > 0 && <CardReel cards={cards} column={COL} />}

        {(leadPhoto || cover) && (
          <div className={`mt-xxl md:mt-16 ${COL}`}>
            {leadPhoto ? (
              <Image
                src={leadPhoto.src}
                alt={doc.title}
                width={leadPhoto.width}
                height={leadPhoto.height}
                sizes={imageSizes}
                className="u-corner h-auto w-full"
                priority
              />
            ) : (
              <PostImage src={cover} ratio="16 / 9" sizes={imageSizes} eager className="u-corner w-full" />
            )}
          </div>
        )}

        <div className="col-span-full mt-xxl grid grid-cols-subgrid md:mt-16">
          {doc.html ? (
            <div
              className={`${COL} prose flow article-prose u-trim [&_figure[data-placeholder]]:my-xl [&_figure[data-placeholder]]:aspect-[16/9] [&_figure[data-placeholder]]:u-corner [&_figure[data-placeholder]]:bg-ink/5`}
              dangerouslySetInnerHTML={{ __html: doc.html }}
            />
          ) : null}
          <CodeCopy />

          {(inline.length > 0 || videos.length > 0) && (
            <ul className={`mt-xxl flex flex-col gap-lg ${COL}`}>
              {inline.map((photo) => (
                <li key={photo.src} className="u-settle">
                  <Image
                    src={photo.src}
                    alt={doc.title}
                    width={photo.width}
                    height={photo.height}
                    sizes={imageSizes}
                    className="h-auto w-full"
                  />
                </li>
              ))}
              {videos.map((src) => (
                <li key={src}>
                  <video src={src} controls preload="metadata" playsInline className="w-full" />
                </li>
              ))}
            </ul>
          )}
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
