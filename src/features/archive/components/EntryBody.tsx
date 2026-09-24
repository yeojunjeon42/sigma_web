import type { ReactNode } from "react";
import Image from "next/image";
import { T } from "@/components/T";
import type { ReelBuild } from "./ArchiveReel";

// no hooks, no "use client": rendered by the reel (client) and the phone entry (server)
const SET = {
  panel: {
    name: "text-[clamp(1.75rem,1.1rem+1.3vw,2.5rem)] leading-[1.05] tracking-[-0.02em] text-balance text-ink",
    pairs: "mt-lg",
    body: "prose flow flow-panel mt-xl",
    media: "mt-xl flex flex-col gap-sm",
    sizes: "(min-width: 1024px) 30vw, 92vw",
  },
  page: {
    name: "text-display-md text-balance text-ink",
    pairs: "mt-lg",
    body: "prose flow mt-xl",
    media: "mt-xl columns-2 gap-sm [&>li]:mb-sm [&>li]:break-inside-avoid",
    sizes: "46vw",
  },
} as const;

function Pair({ dt, children }: { dt: { en: string; ko: string }; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-x-md border-t border-rule py-[0.7rem]">
      <dt className="text-caption text-ink-subtle">
        <T en={dt.en} ko={dt.ko} />
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
        <T en={b.name.en} ko={b.name.ko} />
      </h2>

      <dl className={`${s.pairs} border-b border-rule`}>
        <Pair dt={{ en: "Year", ko: "연도" }}>
          <span className="tabular-nums">{b.year}</span>
          {b.era && b.era !== b.year ? (
            <span className="ml-sm text-ink-subtle tabular-nums">{b.era}</span>
          ) : null}
        </Pair>
        {b.award ? (
          <Pair dt={{ en: "Result", ko: "수상" }}>
            <span className="flex gap-x-xs">
              <span aria-hidden="true" className="text-accent">
                •
              </span>
              <span>
                <T en={b.award.en} ko={b.award.ko} />
              </span>
            </span>
          </Pair>
        ) : null}
        {b.team?.length ? (
          <Pair dt={{ en: "Team", ko: "팀" }}>{b.team.join(", ")}</Pair>
        ) : null}
        {b.tags.length ? (
          <Pair dt={{ en: "Tags", ko: "태그" }}>
            {b.tags.map((t, i) => (
              <span key={t.ko} className={i > 0 ? "before:mx-1 before:text-ink-subtle before:content-['·']" : ""}>
                <T en={t.en} ko={t.ko} />
              </span>
            ))}
          </Pair>
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
