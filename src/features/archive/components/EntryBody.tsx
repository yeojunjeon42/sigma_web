import Image from "next/image";
import type { ReactNode } from "react";
import type { ReelBuild } from "./ArchiveReel";

const SET = {
  panel: {
    name: "text-[clamp(1.75rem,1.1rem+1.3vw,2.5rem)] leading-[1.05] tracking-[-0.02em] text-balance text-ink",
    pairs: "mt-lg",
    body: "prose flow flow-panel mt-xl",
    media: "mt-xl columns-2 gap-sm [&>li]:mb-sm [&>li]:break-inside-avoid",
    sizes: "(min-width: 1024px) 15vw, 46vw",
  },
  page: {
    name: "text-display-md text-balance text-ink",
    pairs: "mt-lg",
    body: "prose flow mt-xl",
    media: "mt-xl columns-2 gap-sm [&>li]:mb-sm [&>li]:break-inside-avoid",
    sizes: "46vw",
  },
} as const;

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-y-xxs">
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

  return (
    <>
      <h2 className={s.name}>
        {b.name}
      </h2>

      <dl className={`${s.pairs} flex flex-wrap gap-x-xl gap-y-md`}>
        <Fact label="Year">
          <span className="tabular-nums">{b.year}</span>
          {b.era && b.era !== b.year ? <span className="ml-sm text-ink-muted tabular-nums">{b.era}</span> : null}
        </Fact>
        {b.award ? (
          <Fact label="Result">
            <span className="flex items-baseline gap-x-xs">
              <span aria-hidden="true" className="relative -top-[calc((1cap-0.34em)/2)] inline-block size-[0.34em] shrink-0 bg-accent" />
              <span>
                {b.award}
              </span>
            </span>
          </Fact>
        ) : null}
        {b.team?.length ? <Fact label="Team">{b.team.join(", ")}</Fact> : null}
        {b.tags.length ? (
          <Fact label="Tags">
            {b.tags.map((t, i) => (
              <span key={t} className={i > 0 ? "before:mx-1 before:text-ink-muted before:content-['·']" : ""}>
                {t}
              </span>
            ))}
          </Fact>
        ) : null}
      </dl>

      {b.body ? <div className={s.body} dangerouslySetInnerHTML={{ __html: b.body }} /> : null}

      {b.photos?.length || b.videos?.length ? (
        <ul className={s.media}>
          {b.photos?.map((photo) => (
            <li key={photo.src}>
              <Image
                src={photo.src}
                alt=""
                width={photo.width}
                height={photo.height}
                sizes={s.sizes}
                className="h-auto w-full"
              />
            </li>
          ))}
          {b.videos?.map((src) => (
            <li key={src}>
              <video src={src} controls preload="none" playsInline className="w-full" />
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
