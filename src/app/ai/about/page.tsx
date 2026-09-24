import type { Metadata } from "next";
import { CURRICULUM, EQUIPMENT, FACTS, ORG, PARTNERS, VOICE } from "@/app/ai/corpus";
import { page } from "@/app/ai/ld";
import { Bil, Ext, Facts, Head, Ld, Section, Table } from "@/app/ai/machine";

const DESCRIPTION = "How Sigma Intelligence runs: operations, curriculum, equipment, partners and the club's own words.";

export const metadata: Metadata = {
  title: "About",
  description: DESCRIPTION,
  alternates: { canonical: "/ai/about", types: { "text/markdown": "/ai/about.md" } },
};

export default function MachineAbout() {
  return (
    <>
      <Ld data={page("/ai/about", "About Sigma Intelligence", DESCRIPTION)} />
      <Head title="About Sigma Intelligence" lede={ORG.summary} md="/ai/about.md" human="/" />

      <Section id="operations" title="Operations">
        <Facts rows={FACTS.map((f) => ({ k: f.label.en, v: <Bil v={f.value} /> }))} />
      </Section>

      <Section id="curriculum" title="Curriculum">
        <ul className="flex flex-col gap-1">
          {CURRICULUM.map((c) => (
            <li key={c.en}>
              {c.href ? <Ext href={c.href}>{c.en}</Ext> : c.en}
              {c.ko !== c.en && (
                <span lang="ko" className="text-machine-dim">
                  {" "}
                  ({c.ko})
                </span>
              )}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="equipment" title="Equipment in the club room">
        <ul className="flex flex-col gap-1">
          {EQUIPMENT.map((e) => (
            <li key={e.en}>
              <Bil v={e} />
            </li>
          ))}
        </ul>
      </Section>

      <Section id="partners" title="Partners and programmes">
        <Table
          caption="Partners and programmes"
          head={["Name", "Relationship"]}
          wrap={[1]}
          rows={PARTNERS.map((p) => ({ cells: [p.name, <Bil key="n" v={p.note} />] }))}
        />
      </Section>

      <Section id="voice" title="In the club's own words">
        <p className="text-machine-dim">Quoted from club documents; the source of each is given.</p>
        {VOICE.map((v) => (
          <figure key={v.quote.ko} className="flex flex-col gap-1">
            <blockquote>
              <p lang="en">{v.quote.en}</p>
              {v.quote.ko !== v.quote.en && (
                <p lang="ko" className="text-machine-dim">
                  {v.quote.ko}
                </p>
              )}
            </blockquote>
            <figcaption className="text-machine-dim">Source: {v.source.en}</figcaption>
          </figure>
        ))}
      </Section>
    </>
  );
}
