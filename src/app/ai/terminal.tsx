export const TERMINAL_NAV = [
  { label: "Index", href: "/ai" },
  { label: "About", href: "/ai/about" },
  { label: "Archive", href: "/ai/archive" },
  { label: "History", href: "/ai/history" },
  { label: "Members", href: "/ai/members" },
  { label: "Blog", href: "/ai/blog" },
  { label: "Contact", href: "/ai/contact" },
];

export const LINK = "underline decoration-ink-inverse/35 underline-offset-4 transition-colors hover:decoration-ink-inverse";

const HIT =
  "relative before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:min-w-6 before:-translate-y-1/2 before:content-[''] lg:before:hidden";

type Bi = { en: string; ko?: string };

export const DIM = "text-ink-inverse-muted";

export function Bil({ v, inline = false }: { v: Bi; inline?: boolean }) {
  const ko = v.ko && v.ko !== v.en ? v.ko : null;
  if (inline)
    return (
      <>
        <span lang="en">{v.en}</span>
        {ko && (
          <span lang="ko" className={DIM}>
            {" "}({ko})
          </span>
        )}
      </>
    );
  return (
    <>
      <span lang="en" className="block">
        {v.en}
      </span>
      {ko && (
        <span lang="ko" className={`block ${DIM}`}>
          {ko}
        </span>
      )}
    </>
  );
}

const key = (k: string) =>
  k
    .replace(/\s*\(.*?\)\s*/g, " ")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

export function Facts({ rows }: { rows: { k: string; v: React.ReactNode }[] }) {
  const keys = rows.map((r) => key(r.k));
  const width = Math.max(...keys.map((k) => k.length)) + 4;
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-[max-content_1fr] sm:gap-x-[1ch]">
      {rows.map((r, i) => (
        <div key={r.k} className="contents">
          <dt className={`${DIM} whitespace-pre`}>{`${keys[i]} ${".".repeat(width - keys[i].length - 1)}`}</dt>
          <dd className="max-sm:mb-2 max-sm:pl-[2ch]">{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Head({
  name,
  notes,
  facts = [],
  md,
  human,
}: {
  name: string;
  notes: string[];
  facts?: { k: string; v: React.ReactNode }[];
  md: string;
  human: string;
}) {
  return (
    <header className="flex flex-col gap-4">
      <div>
        <h1 className="font-medium">snusigma.net :: {name}</h1>
        {notes.map((n) => (
          <p key={n} className={DIM}>
            # {n}
          </p>
        ))}
      </div>
      <Facts
        rows={[
          ...facts,
          { k: "markdown", v: <Ext href={md}>{md}</Ext> },
          { k: "site", v: <Ext href={human}>{human}</Ext> },
        ]}
      />
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
  const code = title.toUpperCase().replace(/[^A-Z0-9가-힣]+/g, "_").replace(/^_|_$/g, "");
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2 id={id} aria-label={title} className="flex scroll-mt-6 overflow-hidden whitespace-nowrap">
        <span aria-hidden="true" className={DIM}>
          ──&nbsp;
        </span>
        <span aria-hidden="true">{code}</span>
        <span aria-hidden="true" className={`${DIM} min-w-0 flex-1 overflow-hidden`}>
          &nbsp;{"─".repeat(160)}
        </span>
      </h2>
      {children}
    </section>
  );
}

export function Items({ mark = "-", children }: { mark?: "-" | "*"; children: React.ReactNode }) {
  return (
    <ul
      className={`flex flex-col ${mark === "*" ? "gap-4" : "gap-1"} [&>li]:relative [&>li]:pl-[2ch] [&>li]:before:absolute [&>li]:before:left-0 ${
        mark === "*" ? "[&>li]:before:content-['*']" : "[&>li]:before:content-['-']"
      } [&>li]:before:text-ink-inverse-muted`}
    >
      {children}
    </ul>
  );
}

export function Chips({ items }: { items: string[] }) {
  if (!items.length) return null;
  return <span className={`block ${DIM}`}>{items.map((t) => `[${t}]`).join(" ")}</span>;
}

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
