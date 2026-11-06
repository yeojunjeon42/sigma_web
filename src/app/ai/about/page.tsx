import type { Metadata } from "next";
import { CURRICULUM, EQUIPMENT } from "@/app/ai/corpus";
import { page } from "@/app/ai/ld";
import { Ext, Head, Ld, Section } from "@/app/ai/terminal";

const DESCRIPTION = "The curriculum, and the equipment in the club room.";

export const metadata: Metadata = {
  title: "About",
  description: DESCRIPTION,
  alternates: { canonical: "/ai/about", types: { "text/markdown": "/ai/about.md" } },
};

export default function TerminalAbout() {
  return (
    <>
      <Ld data={page("/ai/about", "About SIGMA INTELLIGENCE", DESCRIPTION)} />
      <Head name="about" notes={["curriculum and equipment."]} md="/ai/about.md" human="/" />

      <Section id="curriculum" title="Curriculum">
        <p className="flex flex-wrap gap-x-[1ch]">
          {CURRICULUM.map((c) => (
            <span key={c.en}>
              [{c.href ? <Ext href={c.href}>{c.en}</Ext> : c.en}]
            </span>
          ))}
        </p>
      </Section>

      <Section id="equipment" title="Equipment">
        <p className="flex flex-wrap gap-x-[1ch]">
          {EQUIPMENT.map((e) => (
            <span key={e.en}>[{e.en}]</span>
          ))}
        </p>
      </Section>
    </>
  );
}
