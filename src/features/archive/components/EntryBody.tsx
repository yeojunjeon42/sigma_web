import Image from "next/image";
import type { ReactNode } from "react";
import type { ReelBuild } from "./ArchiveReel";

const SET = {
  panel: {
    name: "font-[family-name:var(--f-display)] font-bold [font-stretch:125%] text-[clamp(1.5rem,0.9rem+1.1vw,2.125rem)] leading-[1.05] tracking-[-0.02em] text-balance text-ink",
    row: "grid-cols-[5.5rem_minmax(0,1fr)] gap-x-md",
    body: "prose flow flow-panel mt-xl",
    media: "mt-xl columns-2 gap-gutter [&>li]:mb-gutter [&>li]:break-inside-avoid",
    sizes: "(min-width: 1024px) 15vw, 46vw",
    wide: "(min-width: 1024px) 40vw, 92vw",
  },
  page: {
    name: "font-[family-name:var(--f-display)] font-bold [font-stretch:125%] text-[clamp(1.625rem,7vw,2.5rem)] leading-[1.05] tracking-[-0.02em] text-balance text-ink",
    // The value starts on a column line of the phone's six.
    row: "grid-cols-6 gap-x-gutter [&>dd]:col-span-4 [&>dt]:col-span-2",
    body: "prose flow mt-xl",
    // Padding, not margin: a column drops a margin at its top only some of the time.
    media: "mt-xl columns-2 gap-gutter [&>li]:pb-gutter [&>li]:break-inside-avoid",
    sizes: "46vw",
    wide: "92vw",
  },
} as const;

const HANGUL = /[가-힣]/;

// With less than this to read, the pictures carry the entry: one to a row at full width.
const BRIEF = 200;
const BRIEF_MEDIA = "mt-xl flex flex-col gap-gutter";

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

// One fact to a ruled row: its label on the left, its value on one shared edge.
function Row({ label, className, value = "", children }: { label: string; className: string; value?: string; children: ReactNode }) {
  return (
    <div className={`grid border-b border-rule py-1.5 ${className}`}>
      <dt>{label}</dt>
      <dd className={`min-w-0 ${value}`}>{children}</dd>
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
  const words = b.body?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() ?? "";
  const brief = words.length < BRIEF;
  // A sentence or two with no structure is set large, as a statement.
  const statement = brief && words.length > 0 && !/<(h\d|li|img|pre|table|blockquote)\b/.test(b.body ?? "");

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

      <dl className="mt-lg border-t border-rule-strong text-body-sm text-ink">
        <Row label="Year" className={s.row}>
          <span className="tabular-nums">{b.year}</span>
          {!page && b.era && b.era !== b.year ? <span className="ml-sm text-ink-muted tabular-nums">{b.era}</span> : null}
        </Row>
        {b.award ? (
          <Row label="Result" className={s.row}>
            <span className="flex items-baseline gap-x-xs">
              <span aria-hidden="true" className="relative -top-[0.167em] inline-block size-[0.34em] shrink-0 bg-accent" />
              <span>
                {b.award}
              </span>
            </span>
          </Row>
        ) : null}
        {b.team?.length ? (
          // Korean names take the face the Members page sets them in. On the cell, so its metrics never stretch a line.
          <Row label="Team" className={s.row} value={b.team.some((n) => HANGUL.test(n)) ? "font-member-name" : ""}>
            {b.team.join(", ")}
          </Row>
        ) : null}
        {b.tags.length ? <Row label="Topics" className={s.row}>{b.tags.join(" · ")}</Row> : null}
      </dl>

      {b.body ? (
        <div className={`${s.body} ${statement ? "flow-lead" : ""}`} dangerouslySetInnerHTML={{ __html: b.body }} />
      ) : null}

      {photos?.length || columnVideos?.length ? (
        <ul className={brief ? BRIEF_MEDIA : s.media}>
          {photos?.map((photo) => (
            <li key={photo.src}>
              <Image
                src={photo.src}
                alt={b.name}
                width={photo.width}
                height={photo.height}
                sizes={brief ? s.wide : s.sizes}
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
