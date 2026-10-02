import type { Metadata } from "next";
import { getHistory } from "@/app/ai/corpus";
import { awardsOf, eventsList, page } from "@/app/ai/ld";
import { DIM, Ext, Head, Items, Ld, Section } from "@/app/ai/terminal";

const DESCRIPTION = "The club's dated record, 1984–2026: events and awards by year.";

export const metadata: Metadata = {
  title: "History",
  description: DESCRIPTION,
  alternates: { canonical: "/ai/history", types: { "text/markdown": "/ai/history.md" } },
};

export default async function TerminalHistory() {
  const history = await getHistory();
  const entries = history.reduce((n, y) => n + y.entries.length, 0);

  return (
    <>
      <Ld data={page("/ai/history", "History — 1984 to 2026", DESCRIPTION)} />
      <Ld data={eventsList(history)} />
      <Ld data={awardsOf(history)} />
      <Head
        name="history"
        notes={[
          "the club's record by year, 1984–2026.",
          "dates in ISO 8601. where only the year is known, the part of it follows in brackets. an award won more than once in a year is listed once, with its count.",
        ]}
        facts={[{ k: "Entries", v: String(entries) }]}
        md="/ai/history.md"
        human="/history"
      />

      {history.map((y) => (
        <Section key={y.year} id={`y${y.year}`} title={String(y.year)}>
          <Items>
            {y.entries.map((e) => (
              <li key={e.id} id={e.id} className="scroll-mt-6">
                <time dateTime={e.iso} className={DIM}>
                  {e.iso}
                </time>
                {e.period && <span className={DIM}> ({e.period})</span>}{" "}
                {e.kind === "award" && `Award${e.count > 1 ? ` ×${e.count}` : ""} — `}
                {e.title.en}
                {e.title.ko && e.title.ko !== e.title.en && (
                  <span lang="ko" className={`block ${DIM}`}>
                    {e.title.ko}
                  </span>
                )}
                {e.build ? (
                  <span className={`block ${DIM}`}>
                    build: <Ext href={`/archive?view=reel&at=${e.build.id}`}>{e.build.id}</Ext>
                  </span>
                ) : e.work ? (
                  <span className={`block ${DIM}`}>{e.work}</span>
                ) : null}
              </li>
            ))}
          </Items>
        </Section>
      ))}
    </>
  );
}
