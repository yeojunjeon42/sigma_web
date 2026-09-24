import type { Metadata } from "next";
import { ARCHIVE } from "@/features/archive/data/projects";
import { AWARDS, ORG, PAGES, SITE, SOCIAL, getCohorts, getHistory, getPosts } from "@/app/ai/corpus";
import { page } from "@/app/ai/ld";
import { Bil, Ext, Facts, Head, Ld, Section, Table } from "@/app/ai/machine";

const DESCRIPTION =
  "Machine-readable index of sigmaintelligence.org: identity, key facts and every machine page, with Markdown twins.";

export const metadata: Metadata = {
  title: { absolute: "Index \\ Machine" },
  description: DESCRIPTION,
  alternates: { canonical: "/ai", types: { "text/markdown": "/ai/index.md" } },
};

export default async function MachineHome() {
  const [history, cohorts] = await Promise.all([getHistory(), getCohorts()]);
  const entries = history.reduce((n, y) => n + y.entries.reduce((m, e) => m + e.count, 0), 0);
  const years = AWARDS.map((a) => a.year);

  return (
    <>
      <Ld data={page("/ai", "Sigma Intelligence — machine-readable index", DESCRIPTION)} />
      <Head title="Sigma Intelligence — machine-readable index" lede={ORG.summary} md="/ai/index.md" human="/" />

      <Section id="identity" title="Identity">
        <Facts
          rows={[
            { k: "Name", v: <Bil v={{ en: ORG.name, ko: ORG.nameKo }} /> },
            { k: "Type", v: "University robotics club" },
            { k: "Founded", v: <time dateTime={ORG.founded}>{ORG.founded}</time> },
            { k: "Institution", v: <Bil v={{ en: ORG.institution, ko: ORG.institutionKo }} /> },
            { k: "Department", v: <Bil v={ORG.department} /> },
            { k: "Club room", v: <Bil v={ORG.room} /> },
            { k: "Email", v: <Ext href={`mailto:${ORG.email}`}>{ORG.email}</Ext> },
            { k: "Website", v: <Ext href={SITE} /> },
            {
              k: "Channels",
              v: SOCIAL.map((s, i) => (
                <span key={s.name}>
                  {i > 0 && " · "}
                  <Ext href={s.href}>{s.name}</Ext>
                </span>
              )),
            },
          ]}
        />
      </Section>

      <Section id="record" title="Record at a glance">
        <Facts
          rows={[
            { k: "Builds", v: `${ARCHIVE.length} (2007–2025)` },
            { k: "Awards", v: `${AWARDS.length} (${Math.min(...years)}–${Math.max(...years)})` },
            { k: "Timeline entries", v: String(entries) },
            {
              k: "Cohorts (기수)",
              v: `${cohorts.length} (entry years ${cohorts[0].entryYear}–${cohorts[cohorts.length - 1].entryYear})`,
            },
            { k: "Published posts", v: String(getPosts().length) },
          ]}
        />
      </Section>

      <Section id="pages" title="Pages">
        <Table
          caption="Machine pages, their Markdown twins and the human pages they mirror"
          head={["Page", "Contents", "Markdown", "Human page"]}
          wrap={[1]}
          rows={PAGES.map((p) => ({
            id: `page-${p.key}`,
            cells: [
              <Ext key="a" href={p.ai}>
                {p.title}
              </Ext>,
              p.note,
              <Ext key="m" href={p.md}>
                {p.md}
              </Ext>,
              <Ext key="h" href={p.human}>
                {p.human}
              </Ext>,
            ],
          }))}
        />
      </Section>
    </>
  );
}
