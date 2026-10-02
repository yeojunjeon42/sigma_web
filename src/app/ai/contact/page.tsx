import type { Metadata } from "next";
import { MAPS, ORG, SOCIAL } from "@/app/ai/corpus";
import { page } from "@/app/ai/ld";
import { Bil, Ext, Facts, Head, Ld, Section } from "@/app/ai/terminal";

const DESCRIPTION = "How to reach Sigma Intelligence: email, the club room and its channels.";

export const metadata: Metadata = {
  title: "Contact",
  description: DESCRIPTION,
  alternates: { canonical: "/ai/contact", types: { "text/markdown": "/ai/contact.md" } },
};

export default function TerminalContact() {
  return (
    <>
      <Ld data={page("/ai/contact", "Contact", DESCRIPTION)} />
      <Head name="contact" notes={["how to reach the club."]} md="/ai/contact.md" human="/contact" />

      <Section id="reach" title="Contact">
        <Facts
          rows={[
            { k: "Email", v: <Ext href={`mailto:${ORG.email}`}>{ORG.email}</Ext> },
            { k: "Club room", v: <Bil v={{ en: ORG.address, ko: ORG.addressKo }} /> },
            ...MAPS.map((m) => ({ k: m.name, v: <Ext href={m.href}>{m.href}</Ext> })),
          ]}
        />
      </Section>

      <Section id="channels" title="Channels">
        <Facts rows={SOCIAL.map((s) => ({ k: s.name, v: <Ext href={s.href} /> }))} />
      </Section>
    </>
  );
}
