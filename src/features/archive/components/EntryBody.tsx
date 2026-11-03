import Image from "next/image";
import type { ReactNode } from "react";
import type { ReelBuild } from "./ArchiveReel";

const SET = {
  panel: {
    name: "font-[family-name:var(--f-display)] font-bold [font-stretch:125%] text-[clamp(1.5rem,0.9rem+1.1vw,2.125rem)] leading-[1.05] tracking-[-0.02em] text-balance text-ink",
    pairs: "mt-lg flex flex-wrap gap-x-xl gap-y-md",
    result: "",
    body: "prose flow flow-panel mt-xl",
    media: "mt-xl columns-2 gap-gutter [&>li]:mb-gutter [&>li]:break-inside-avoid",
    sizes: "(min-width: 1024px) 15vw, 46vw",
  },
  page: {
    name: "font-[family-name:var(--f-display)] font-bold [font-stretch:125%] text-[clamp(1.625rem,7vw,2.5rem)] leading-[1.05] tracking-[-0.02em] text-balance text-ink",
    pairs: "mt-lg grid grid-cols-2 gap-x-gutter gap-y-md",
    result: "order-last col-span-2",
    body: "prose flow mt-xl",
    // Padding, not margin: a column drops a margin at its top only some of the time.
    media: "mt-xl columns-2 gap-gutter [&>li]:pb-gutter [&>li]:break-inside-avoid",
    sizes: "46vw",
  },
} as const;

export function Fact({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={`flex min-w-0 flex-col gap-y-xxs ${className}`}>
      <dt className="text-caption text-ink-muted">
        {label}
      </dt>
      <dd className="text-body-sm text-ink">{children}</dd>
    </div>
  );
}

export default function EntryBody({
  build: b,
  variant,
}: {
  build: ReelBuild;
  variant: keyof typeof SET;
}) {
  const s = SET[variant];
  const page = variant === "page";
  // A phone opens on a picture: the first photograph leads, the rest follow the text.
  const lead = page ? b.photos?.[0] : undefined;
  const photos = lead ? b.photos?.slice(1) : b.photos;
  const looseVideos = page ? b.videos : undefined;
  const columnVideos = page ? undefined : b.videos;

  return (
    <>
      {lead ? (
        <Image
          src={lead.src}
          alt={b.name}
          width={lead.width}
          height={lead.height}
          sizes="100vw"
          loading="eager"
          className="mb-lg h-auto max-h-[calc(var(--screen)*0.5)] w-full object-cover"
        />
      ) : null}

      <h2 className={s.name}>
        {b.name}
      </h2>

      <dl className={s.pairs}>
        <Fact label="Year">
          <span className="tabular-nums">{b.year}</span>
          {!page && b.era && b.era !== b.year ? <span className="ml-sm text-ink-muted tabular-nums">{b.era}</span> : null}
        </Fact>
        {b.award ? (
          <Fact label="Result" className={s.result}>
            <span className="flex items-baseline gap-x-xs">
              <span aria-hidden="true" className="relative -top-[0.167em] inline-block size-[0.34em] shrink-0 bg-accent" />
              <span>
                {b.award}
              </span>
            </span>
          </Fact>
        ) : null}
        {b.team?.length ? <Fact label="Team">{b.team.join(", ")}</Fact> : null}
      </dl>

      {b.tags.length ? (
        <p className="mt-md flex flex-wrap gap-x-sm gap-y-xxs text-body-sm text-ink-muted">
          {b.tags.map((t) => (
            <span key={t}>#{t}</span>
          ))}
        </p>
      ) : null}

      {b.body ? <div className={s.body} dangerouslySetInnerHTML={{ __html: b.body }} /> : null}

      {photos?.length || columnVideos?.length ? (
        <ul className={s.media}>
          {photos?.map((photo) => (
            <li key={photo.src}>
              <Image
                src={photo.src}
                alt={b.name}
                width={photo.width}
                height={photo.height}
                sizes={s.sizes}
                className="h-auto w-full"
              />
            </li>
          ))}
          {columnVideos?.map((src) => (
            <li key={src}>
              <video src={src} controls preload="none" playsInline className="w-full" />
            </li>
          ))}
        </ul>
      ) : null}

      {looseVideos?.map((src) => (
        // Metadata draws the first frame and the true shape before anything plays.
        <video
          key={src}
          src={`${src}#t=0.001`}
          controls
          preload="metadata"
          playsInline
          className="mt-gutter max-h-[calc(var(--screen)*0.8)] w-full bg-surface-sunken"
        />
      ))}
    </>
  );
}
