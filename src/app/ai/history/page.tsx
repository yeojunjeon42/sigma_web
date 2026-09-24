import type { Metadata } from "next";
import { getCohorts, getHistory } from "@/app/ai/corpus";
import { awardsOf, eventsList, page } from "@/app/ai/ld";
import { Bil, Ext, Head, Ld, Section, Table } from "@/app/ai/machine";

const DESCRIPTION = "The club's dated record, 1984–2026: events and awards by year, and cohort counts.";

export const metadata: Metadata = {
  title: "History",
  description: DESCRIPTION,
  alternates: { canonical: "/ai/history", types: { "text/markdown": "/ai/history.md" } },
};

export default async function MachineHistory() {
  const [history, cohorts] = await Promise.all([getHistory(), getCohorts()]);

  return (
    <>
      <Ld data={page("/ai/history", "History — 1984 to 2026", DESCRIPTION)} />
      <Ld data={eventsList(history)} />
      <Ld data={awardsOf(history)} />
      <Head
        title="History — 1984 to 2026"
        lede="Dates are ISO 8601. Where the record gives only a year, Period says which part of it. An award won more than once in a year appears once with its count."
        md="/ai/history.md"
        human="/history"
      />

      {history.map((y) => (
        <Section key={y.year} id={`y${y.year}`} title={String(y.year)}>
          <Table
            caption={`Entries for ${y.year}`}
            head={["Date", "Period", "Kind", "Entry", "Build"]}
            wrap={[3]}
            rows={y.entries.map((e) => ({
              id: e.id,
              cells: [
                <time key="d" dateTime={e.iso}>
                  {e.iso}
                </time>,
                e.period ?? "",
                e.kind === "award" ? `award${e.count > 1 ? ` ×${e.count}` : ""}` : "event",
                <Bil key="t" v={e.title} />,
                e.build ? (
                  <Ext key="b" href={`/archive?view=reel&at=${e.build.id}`}>
                    {e.build.id}
                  </Ext>
                ) : (
                  e.work ?? ""
                ),
              ],
            }))}
          />
        </Section>
      ))}

      <Section id="cohorts" title="Cohorts">
        <p className="text-machine-dim">
          기수 is the club&apos;s cohort number, counted from 1984. Entry year is the matriculation year (학번). Members on record counts
          the names the club has for that cohort.
        </p>
        <Table
          caption="Cohorts"
          head={["기수", "Entry year", "Members on record", "Source"]}
          rows={cohorts.map((c) => ({
            id: `g${c.generation}`,
            cells: [String(c.generation), String(c.entryYear), String(c.count), c.source === "ob" ? "alumni contact list" : "annual roster"],
          }))}
        />
      </Section>
    </>
  );
}
