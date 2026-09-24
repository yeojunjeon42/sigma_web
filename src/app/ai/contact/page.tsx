import type { Metadata } from "next";
import { MAPS, ORG, SOCIAL } from "@/app/ai/corpus";
import { page } from "@/app/ai/ld";
import { Ext, Facts, Head, Ld, Section } from "@/app/ai/machine";

const DESCRIPTION = "How to reach Sigma Intelligence: email, the club room and its channels.";

export const metadata: Metadata = {
  title: "Contact",
  description: DESCRIPTION,
  alternates: { canonical: "/ai/contact", types: { "text/markdown": "/ai/contact.md" } },
};

export default function MachineContact() {
  return (
    <>
      <Ld data={page("/ai/contact", "Contact", DESCRIPTION)} />
      <Head title="Contact" lede={ORG.summary} md="/ai/contact.md" human="/contact" />

      <Section id="reach" title="Reach">
        <Facts
          rows={[
            { k: "Email", v: <Ext href={`mailto:${ORG.email}`}>{ORG.email}</Ext> },
            {
              k: "Club room",
              v: (
                <>
                  <span lang="en">{ORG.address}</span>{" "}
                  <span lang="ko" className="text-machine-dim">
                    ({ORG.addressKo})
                  </span>
                </>
              ),
            },
            ...MAPS.map((m) => ({ k: m.name, v: <Ext href={m.href}>Open map</Ext> })),
          ]}
        />
      </Section>

      <Section id="channels" title="Channels">
        <Facts rows={SOCIAL.map((s) => ({ k: s.name, v: <Ext href={s.href} /> }))} />
      </Section>
    </>
  );
}
