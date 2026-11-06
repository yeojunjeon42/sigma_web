import type { Metadata } from "next";
import { getHistory } from "@/app/ai/corpus";
import { awardsOf, eventsList, page } from "@/app/ai/ld";
import { DIM, Ext, Head, Items, Ld, Section } from "@/app/ai/terminal";

const DESCRIPTION = "Events and awards by year, since 1984.";

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
      <Ld data={page("/ai/history", "History", DESCRIPTION)} />
      <Ld data={eventsList(history)} />
      <Ld data={awardsOf(history)} />
      <Head
        name="history"
        notes={["events and awards by year.", "dates in ISO 8601."]}
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
                {e.kind === "award" && <span className={DIM}>[award{e.count > 1 ? ` ×${e.count}` : ""}] </span>}
                {e.title.en}
                {e.build && (
                  <span className={`block ${DIM}`}>
                    build: <Ext href={`/archive?view=reel&at=${e.build.id}`}>{e.build.id}</Ext>
                  </span>
                )}
              </li>
            ))}
          </Items>
        </Section>
      ))}
    </>
  );
}
