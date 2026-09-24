import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CopyEmail from "@/components/CopyEmail";
import { ContactForm } from "@/components/ContactForm";
import ContactPlay from "@/components/ContactPlay";
import { T } from "@/components/T";
import { Container, GridField } from "@/components/ui";
import { FACTS } from "@/features/site/data/about";
import { MAPS } from "@/features/site/data/contact";
import { SOCIAL } from "@/features/site/data/social";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Sigma Intelligence at Seoul National University.",
};

// The finger-sized hit area is a pseudo-element, so a row of links is as tall as its lettering.
const ACT =
  "relative inline-flex items-center text-ui text-ink uppercase underline decoration-ink/35 underline-offset-4 transition-opacity before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 hover:opacity-60 lg:before:hidden";

function Out({ name, href }: { name: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={ACT}>
      {name} ↗
    </a>
  );
}

function Sheet({
  id,
  label,
  last,
  children,
}: {
  id?: string;
  label: { en: string; ko: string };
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`scroll-mt-[calc(var(--masthead)+var(--spacing-lg))] grid gap-y-lg border-t border-ink/30 pt-md pb-xxl lg:grid-cols-12 lg:gap-x-lg ${last ? "border-b pb-lg" : ""}`}>
      <h2 className="text-caption text-ink lg:col-span-3">
        <T en={label.en} ko={label.ko} />
      </h2>
      <div className="u-scroll-fade lg:col-span-9">{children}</div>
    </section>
  );
}

export default function ContactPage() {
  const room = FACTS.find((f) => f.label.en === "Club room")?.value;

  return (
    <>
      <Navbar />

      <div className="relative z-10 bg-canvas">
        <main id="main" className="relative">
          <GridField>
            <Container as="header" className="u-clear-masthead">
              <h1 className="sr-only">
                <T en="Contact" ko="연락처" />
              </h1>
              <CopyEmail />
            </Container>

            <Container className="mt-xxl pb-section lg:mt-xxxl">
              <Sheet id="write" label={{ en: "Write", ko: "쓰기" }}>
                <div className="flex gap-x-lg">
                  <p
                    aria-hidden="true"
                    className="hidden shrink-0 border-r border-ink/30 pr-md text-caption text-ink-muted [writing-mode:vertical-rl] rotate-180 lg:block"
                  >
                    Form · 2026
                  </p>
                  <div className="min-w-0 flex-1">
                    <ContactForm />
                  </div>
                </div>
              </Sheet>

              <Sheet label={{ en: "Visit", ko: "방문" }}>
                <div className="grid gap-y-xl md:grid-cols-8 md:gap-x-lg">
                  <div className="flex flex-col gap-y-lg md:col-span-4">
                    {room ? (
                      <p className="text-display-md text-ink">
                        <T en={room.en} ko={room.ko} />
                      </p>
                    ) : null}
                    <p className="text-caption leading-[1.6] text-ink-muted">
                      Seoul National University
                      <br />
                      1 Gwanak-ro, Gwanak-gu, Seoul
                    </p>
                    <p className="flex flex-wrap gap-x-lg gap-y-sm">
                      {MAPS.map((m) => (
                        <Out key={m.name} {...m} />
                      ))}
                    </p>
                  </div>
                  <figure className="md:col-span-4">
                    <Image
                      src="/contact/room-door.png"
                      alt="A line drawing of the club room's double doors, signed Electrical and Computer Engineering and Sigma Intelligence"
                      width={1672}
                      height={941}
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="h-auto w-full mix-blend-multiply"
                    />
                  </figure>
                </div>
              </Sheet>

              <Sheet label={{ en: "Follow", ko: "채널" }} last>
                <ul className="text-caption lg:mt-[calc((1lh-1cap)/2-var(--spacing-sm))]">
                  {SOCIAL.map((x, i) => (
                    <li key={x.name} className={i > 0 ? "border-t border-ink/15" : ""}>
                      <a
                        href={x.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex min-h-11 items-center justify-between py-sm text-display-md text-ink-subtle transition-colors hover:text-ink lg:justify-end lg:gap-x-md lg:text-display-lg"
                      >
                        <span className="u-trim">{x.name}</span>
                        <span aria-hidden="true" className="u-trim relative -top-[0.0245em] text-ink-subtle transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                          ↗
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </Sheet>
            </Container>
          </GridField>
          <ContactPlay />
        </main>

        <Footer />
      </div>
    </>
  );
}
