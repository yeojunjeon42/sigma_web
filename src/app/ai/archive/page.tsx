import type { Metadata } from "next";
import { getBuilds } from "@/app/ai/corpus";
import { buildsList, page } from "@/app/ai/ld";
import { Bil, Ext, Head, Ld, Section, Table } from "@/app/ai/machine";

const DESCRIPTION = "Every build on record, 2007–2025: year, bilingual title, award, tags and team.";

export const metadata: Metadata = {
  title: "Archive",
  description: DESCRIPTION,
  alternates: { canonical: "/ai/archive", types: { "text/markdown": "/ai/archive.md" } },
};

export default function MachineArchive() {
  const builds = getBuilds();
  const years = [...new Set(builds.map((b) => b.year ?? 0))].sort((a, b) => b - a);

  return (
    <>
      <Ld data={page("/ai/archive", "Archive — builds 2007–2025", DESCRIPTION)} />
      <Ld data={buildsList(builds)} />
      <Head
        title="Archive — builds 2007–2025"
        lede={`${builds.length} builds, newest first. Each row's id is its anchor here and its address in the archive. The full Korean entry texts are in /llms-full.txt.`}
        md="/ai/archive.md"
        human="/archive"
      />

      {years.map((y) => {
        const group = builds.filter((b) => (b.year ?? 0) === y);
        return (
          <Section key={y} id={`y${y || "unknown"}`} title={y ? String(y) : "Year unknown"}>
            <Table
              caption={`Builds from ${y || "an unknown year"}`}
              head={["Title", "Award", "Tags", "Team", "Page"]}
              wrap={[0, 1, 2, 3]}
              rows={group.map((b) => ({
                id: b.id,
                cells: [
                  <Bil key="t" v={b.title} />,
                  b.award ? <Bil key="a" v={b.award} /> : "",
                  b.tags.map((t) => t.en).join(", "),
                  b.team.length ? b.team.join(", ") : "",
                  <Ext key="u" href={`/archive?view=reel&at=${b.id}`}>
                    {b.id}
                  </Ext>,
                ],
              }))}
            />
          </Section>
        );
      })}
    </>
  );
}
