import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CopyEmail from "@/components/CopyEmail";
import { ContactForm } from "@/components/ContactForm";
import SeoulClock, { SeoulZone } from "@/features/site/components/SeoulClock";
import { Container, GridField } from "@/components/ui";
import { FACTS } from "@/features/site/data/about";
import { MAPS } from "@/features/site/data/contact";
import { SOCIAL } from "@/features/site/data/social";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Sigma Intelligence at Seoul National University.",
};

const LINK =
  "u-swipe-rest relative text-ink before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 lg:before:hidden";

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="u-trim text-caption text-ink-muted">
        {label}
      </dt>
      <dd className="u-trim mt-xs text-body text-ink">{children}</dd>
    </div>
  );
}

export default function ContactPage() {
  const room = FACTS.find((f) => f.label.en === "Club room")?.value;
  const map = MAPS[0];

  return (
    <>
      <Navbar />

      <div className="relative z-10 bg-canvas">
        <main id="main" className="relative">
          <GridField>
            <Container as="header" className="u-clear-masthead text-center lg:pt-[calc(var(--masthead)+var(--spacing-section))]">
              <h1 className="sr-only">
                Contact
              </h1>
              <p className="u-trim text-[length:min(9rem,calc((100vw-2*var(--gutter))/5.1))] leading-none font-bold tracking-[-0.02em] text-ink tabular-nums [font-family:var(--f-display)] [font-stretch:125%]">
                <span className="sr-only">
                  {"The time in Seoul: "}
                </span>
                <SeoulClock />
              </p>
              <p className="u-trim mt-md text-caption text-balance text-ink-muted lg:mt-lg">
                <SeoulZone />
              </p>
            </Container>

            <section
              id="write"
              className="mt-xxl scroll-mt-[calc(var(--masthead)+var(--spacing-lg))] mb-section rounded-[2.5rem] bg-surface-sunken [corner-shape:squircle] lg:mt-xxxl"
            >
              <div className="u-gutter mx-auto grid w-full max-w-wide gap-y-xxl py-xxl lg:grid-cols-12 lg:gap-x-lg lg:py-xxxl">
                <dl className="flex flex-col gap-y-lg lg:col-span-4">
                  <Fact label="Email">
                    <CopyEmail />
                  </Fact>
                  {room ? (
                    <Fact label="Club room">
                      <a href={map.href} target="_blank" rel="noopener noreferrer" className={LINK}>
                        {room.en} ↗
                      </a>
                    </Fact>
                  ) : null}
                  <Fact label="Follow">
                    {SOCIAL.map((x, i) => (
                      <span key={x.name}>
                        {i > 0 ? <span className="text-ink-muted"> · </span> : null}
                        <a href={x.href} target="_blank" rel="noopener noreferrer" className={LINK}>
                          {x.name}
                        </a>
                      </span>
                    ))}
                  </Fact>
                </dl>
                <div className="lg:col-span-7 lg:col-start-6">
                  <ContactForm />
                </div>
              </div>
            </section>
          </GridField>
        </main>

        <Footer />
      </div>
    </>
  );
}
