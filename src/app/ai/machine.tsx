const SITE = "https://sigmaintelligence.org";

export const MACHINE_NAV = [
  { label: "/ai", href: "/ai" },
  { label: "/ai/about", href: "/ai/about" },
  { label: "/ai/archive", href: "/ai/archive" },
  { label: "/ai/history", href: "/ai/history" },
  { label: "/ai/members", href: "/ai/members" },
  { label: "/ai/blog", href: "/ai/blog" },
  { label: "/ai/contact", href: "/ai/contact" },
];

export const LINK =
  "underline underline-offset-4 transition-colors hover:text-machine-bright";


type Bi = { en: string; ko?: string };

export function Bil({ v }: { v: Bi }) {
  return (
    <>
      <span lang="en">{v.en}</span>
      {v.ko && v.ko !== v.en && (
        <>
          {" "}
          <span lang="ko" className="text-machine-dim">
            ({v.ko})
          </span>
        </>
      )}
    </>
  );
}

export function Head({
  title,
  lede,
  md,
  human,
}: {
  title: string;
  lede: string;
  md: string;
  human: string;
}) {
  return (
    <header className="flex flex-col gap-3">
      <h1 className="text-machine-bright">{title}</h1>
      <p>{lede}</p>
      <dl className="grid grid-cols-[max-content_1fr] gap-x-[2ch] text-machine-dim">
        <dt>Markdown</dt>
        <dd>
          <a href={md} className={`${LINK} ${HIT}`}>{`${SITE}${md}`}</a>
        </dd>
        <dt>Human page</dt>
        <dd>
          <a href={human} className={`${LINK} ${HIT}`}>{`${SITE}${human}`}</a>
        </dd>
      </dl>
    </header>
  );
}

export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <h2 id={id} className="flex scroll-mt-6 items-baseline gap-2 text-machine-bright">
        <span aria-hidden="true" className="shrink-0 text-machine-dim">
          ──
        </span>
        <span className="shrink-0">{title}</span>
        <span
          aria-hidden="true"
          className="min-w-0 flex-1 translate-y-[-0.3em] border-b border-machine-base/40"
        />
      </h2>
      {children}
    </section>
  );
}

export function Facts({ rows }: { rows: { k: string; v: React.ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-1 gap-y-1 sm:grid-cols-[18ch_1fr] sm:gap-x-[2ch]">
      {rows.map((r) => (
        <div key={r.k} className="contents">
          <dt className="text-machine-dim">{r.k}</dt>
          <dd className="max-sm:mb-2">{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Table({
  caption,
  head,
  rows,
  wrap = [],
}: {
  caption: string;
  head: string[];
  rows: { id?: string; cells: React.ReactNode[] }[];
  wrap?: number[];
}) {
  const cell = (j: number) =>
    `border-machine-base/15 py-0.5 pr-[2ch] [overflow-wrap:normal] md:border-b md:py-1 ${wrap.includes(j) ? "md:min-w-[16ch]" : "md:whitespace-nowrap"}`;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left max-md:block">
        <caption className="sr-only">{caption}</caption>
        <thead className="max-md:sr-only">
          <tr className="text-machine-dim">
            {head.map((h) => (
              <th key={h} scope="col" className="border-b border-machine-base/40 py-1 pr-[2ch] align-bottom font-medium whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="max-md:flex max-md:flex-col max-md:gap-3">
          {rows.map((r, i) => (
            <tr
              key={r.id ?? i}
              id={r.id}
              className="scroll-mt-6 align-top max-md:grid max-md:grid-cols-[12ch_1fr] max-md:gap-x-[2ch] max-md:border-b max-md:border-machine-base/15 max-md:pb-3"
            >
              {r.cells.map((c, j) =>
                j === 0 ? (
                  <th key={j} scope="row" className={`${cell(j)} font-medium max-md:col-span-2 max-md:pb-1 max-md:text-machine-bright`}>
                    {c}
                  </th>
                ) : (
                  <td
                    key={j}
                    data-label={head[j]}
                    className={`${cell(j)} max-md:contents max-md:before:text-machine-dim max-md:before:content-[attr(data-label)]`}
                  >
                    <span className="min-w-0">{c}</span>
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const HIT =
  "relative before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:min-w-6 before:-translate-y-1/2 before:content-[''] lg:before:hidden";

export function Ext({ href, children }: { href: string; children?: React.ReactNode }) {
  return (
    <a href={href} className={`${LINK} ${HIT}`}>
      {children ?? href}
    </a>
  );
}

export function Ld({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
