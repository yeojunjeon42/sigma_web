import Image from "next/image";
import Link from "next/link";
import { T } from "@/components/T";
import { Container } from "@/components/ui";
import { displayTags } from "../data/tags";
import { formatDate } from "@/lib/date";
import type { Photo } from "@/features/archive/types";
import type { Doc, DocMeta } from "../types";
import { coverFor } from "../data/covers";
import CodeCopy from "./CodeCopy";
import PostImage from "./PostImage";

const BACK_ARROW_NUDGE = "-1.31px";
const LABEL = "text-caption tracking-normal leading-none text-ink-subtle";

export default function Article({
  doc,
  photos = [],
  videos = [],
  back,
  others = [],
  newer,
  older,
}: {
  doc: Doc;
  photos?: Photo[];
  videos?: string[];
  back: { href: string; label: { en: string; ko: string } };
  others?: DocMeta[];
  newer?: DocMeta;
  older?: DocMeta;
}) {
  const stamp = doc.date ?? (doc.year ? String(doc.year) : undefined);
  const dateLabel = formatDate(stamp);
  const tags = displayTags(doc.tags, Infinity);
  const [leadPhoto, ...inline] = photos;
  const cover = leadPhoto ? undefined : coverFor(doc.slug);

  // One reading column for everything, 676px as in the reference article, centred; from lg it
  // sits in columns 3–10 with the back link and the nearby posts in the left rail.
  const COL = "mx-auto w-full max-w-[42.25rem] lg:col-span-8 lg:col-start-3";

  return (
    <article>
      <Container className="u-clear-masthead lg:grid lg:grid-cols-12 lg:gap-x-lg">
        <div className="hidden lg:col-span-2 lg:row-span-3 lg:block">
          <div className="sticky top-[calc(var(--masthead)+var(--spacing-lg))]">
            <Back back={back} />
            {others.length > 0 && (
              <nav aria-label="More posts" className="mt-xxl">
                <p className={`u-trim ${LABEL}`}>
                  <T en="Nearby" ko="가까운 글" />
                </p>
                <ul className="mt-md flex flex-col gap-md">
                  {others.map((o) => (
                    <li key={o.slug}>
                      <Link
                        href={`/blog/${o.slug}`}
                        className="group/post flex items-start gap-sm text-caption text-ink-muted transition-colors hover:text-ink"
                      >
                        <PostImage src={coverFor(o.slug)} ratio="1 / 1" sizes="2.5rem" className="w-10 shrink-0" />
                        <span>
                          <T en={o.title} ko={o.titleKo ?? o.title} />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </div>

        <header className={COL}>
          <div className="lg:hidden">
            <Back back={back} />
          </div>
          <p className="mt-xl flex flex-wrap items-center justify-center gap-x-md gap-y-xs text-[0.875rem] leading-[1.4] text-ink-muted tabular-nums lg:mt-0">
            {doc.sample && (
              <span className="rounded-pill border border-ink/20 px-2 py-px text-ink">
                <T en="Sample" ko="샘플" />
              </span>
            )}
            {dateLabel && (
              <span className="text-ink">
                <T {...dateLabel} />
              </span>
            )}
            {tags.map((tag) => (
              <span key={tag.ko}>
                <T en={tag.en} ko={tag.ko} />
              </span>
            ))}
          </p>
          <h1 className="mt-lg text-center text-[clamp(2rem,1.3rem+3vw,4rem)] leading-[1.13] tracking-[-0.03em] md:leading-[1.06] lg:leading-none text-balance text-ink">
            <T en={doc.title} ko={doc.titleKo ?? doc.title} />
          </h1>
          {(doc.summary || doc.summaryKo) && (
            <p className="mx-auto mt-lg max-w-[37.5rem] text-center text-[1.0625rem] leading-[1.75rem] tracking-[-0.01em] text-ink text-pretty">
              <T en={doc.summary ?? doc.summaryKo ?? ""} ko={doc.summaryKo ?? doc.summary ?? ""} />
            </p>
          )}
          <p className="mt-md text-center text-[0.875rem] text-ink-muted">
            <T en="By" ko="글" />{" "}
            <span className="text-ink">{doc.authors.length ? doc.authors.join(", ") : "Sigma Intelligence"}</span>
            {doc.team.length > 0 && (
              <>
                <span aria-hidden="true" className="mx-xs">·</span>
                <T en="Team" ko="제작" /> {doc.team.join(", ")}
              </>
            )}
          </p>
        </header>

        {(leadPhoto || cover) && (
          <div className={`mt-16 ${COL}`}>
            {leadPhoto ? (
              <Image
                src={leadPhoto.src}
                alt=""
                width={leadPhoto.width}
                height={leadPhoto.height}
                sizes="(min-width: 768px) 42.25rem, 100vw"
                className="u-corner h-auto w-full"
                priority
              />
            ) : (
              <PostImage src={cover} ratio="16 / 9" sizes="(min-width: 768px) 42.25rem, 100vw" eager className="u-corner w-full" />
            )}
          </div>
        )}

        <div className={`mt-16 ${COL}`}>
          {doc.html ? (
            <div
              className="prose flow article-prose u-trim [&_figure[data-placeholder]]:my-xl [&_figure[data-placeholder]]:aspect-[16/9] [&_figure[data-placeholder]]:u-corner [&_figure[data-placeholder]]:bg-ink/5"
              dangerouslySetInnerHTML={{ __html: doc.html }}
            />
          ) : null}
          <CodeCopy />

          {(inline.length > 0 || videos.length > 0) && (
            <ul className="mt-xxl flex flex-col gap-lg">
              {inline.map((photo) => (
                <li key={photo.src} className="u-settle">
                  <Image
                    src={photo.src}
                    alt=""
                    width={photo.width}
                    height={photo.height}
                    sizes="(min-width: 768px) 42.25rem, 100vw"
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

          {doc.source && (
            <p className="mt-xxl border-t border-rule pt-md text-caption text-ink-muted">
              <T en="Source" ko="출처" /> — {doc.source}
            </p>
          )}

          {(newer || older) && (
            <nav aria-label="Next and previous posts" className={`grid border-t border-rule md:grid-cols-2 ${doc.source ? "mt-lg" : "mt-section"}`}>
              {[
                older && { post: older, label: { en: "Older", ko: "이전 글" }, align: "" },
                newer && { post: newer, label: { en: "Newer", ko: "다음 글" }, align: "md:col-start-2 md:text-right" },
              ]
                .filter((x): x is { post: DocMeta; label: { en: string; ko: string }; align: string } => Boolean(x))
                .map(({ post, label, align }) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className={`group/next flex flex-col gap-xs border-b border-rule py-lg md:border-b-0 ${align}`}
                  >
                    <span className={LABEL}>
                      <T en={label.en} ko={label.ko} />
                    </span>
                    <span className="text-title text-ink transition-colors group-hover/next:text-ink-muted">
                      <T en={post.title} ko={post.titleKo ?? post.title} />
                    </span>
                  </Link>
                ))}
            </nav>
          )}
        </div>
      </Container>
    </article>
  );
}

function Back({ back }: { back: { href: string; label: { en: string; ko: string } } }) {
  return (
    <Link
      href={back.href}
      className="relative -my-sm flex w-fit items-center gap-xs py-sm text-caption text-ink-subtle transition-colors before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-[''] hover:text-ink"
    >
      <span aria-hidden="true" className="u-trim" style={{ transform: `translateY(${BACK_ARROW_NUDGE})` }}>
        ←
      </span>
      <span className="u-trim">
        <T en={back.label.en} ko={back.label.ko} />
      </span>
    </Link>
  );
}
