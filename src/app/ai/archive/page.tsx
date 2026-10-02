import type { Metadata } from "next";
import { getBuilds } from "@/app/ai/corpus";
import { buildsList, page } from "@/app/ai/ld";
import { Chips, DIM, Ext, Head, Items, Ld, Section } from "@/app/ai/terminal";

const DESCRIPTION = "Every build, 2007–2025: year, bilingual title, award, tags and team.";

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
      <Ld data={page("/ai/archive", "Archive — builds 2007–2025", DESCRIPTION)} />
      <Ld data={buildsList(builds)} />
      <Head
        name="archive"
        notes={["every build since 2007, newest first.", "full entry texts, in Korean: /llms-full.txt"]}
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
                  {b.title.ko && b.title.ko !== b.title.en && (
                    <span lang="ko" className={DIM}>
                      {" "}
                      {b.title.ko}
                    </span>
                  )}
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
