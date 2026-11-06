import type { Metadata } from "next";
import { ARCHIVE_SPAN, getBuilds } from "@/app/ai/corpus";
import { buildsList, page } from "@/app/ai/ld";
import { Chips, DIM, Ext, Head, Items, Ld, Section } from "@/app/ai/terminal";

const DESCRIPTION = `Every build, ${ARCHIVE_SPAN}, with its award, tags and team.`;

export const metadata: Metadata = {
  title: "Archive",
  description: DESCRIPTION,
  alternates: { canonical: "/ai/archive", types: { "text/markdown": "/ai/archive.md" } },
};

export default function TerminalArchive() {
  const builds = getBuilds();
  const years = [...new Set(builds.map((b) => b.year ?? 0))].sort((a, b) => b - a);

  return (
    <>
      <Ld data={page("/ai/archive", "Archive", DESCRIPTION)} />
      <Ld data={buildsList(builds)} />
      <Head
        name="archive"
        notes={["builds by year, newest first.", "full texts: /llms-full.txt"]}
        facts={[{ k: "Builds", v: String(builds.length) }]}
        md="/ai/archive.md"
        human="/archive"
      />

      {years.map((y) => (
        <Section key={y} id={`y${y || "unknown"}`} title={y ? String(y) : "Year unknown"}>
          <Items mark="*">
            {builds
              .filter((b) => (b.year ?? 0) === y)
              .map((b) => (
                <li key={b.id} id={b.id} className="scroll-mt-6">
                  <Ext href={`/archive?view=reel&at=${b.id}`}>{b.title.en}</Ext>
                  {b.award && <span className="block">{b.award.en}</span>}
                  <Chips items={b.tags.map((t) => t.en)} />
                  {b.team.length > 0 && <span className={`block ${DIM}`}>team: {b.team.join(", ")}</span>}
                </li>
              ))}
          </Items>
        </Section>
      ))}
    </>
  );
}
