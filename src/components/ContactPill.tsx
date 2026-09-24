import Link from "next/link";
import { T } from "@/components/T";

type Words = { en: string; ko: string };

// Desk: a pill at the bottom left, opposite the reading-mode toggle, into the contact form with
// its message started. Touch: the same invitation as a plain line at the foot of the page.
export default function ContactPill({ about, pill, ask, link }: { about: string; pill: Words; ask: Words; link: Words }) {
  const href = `/contact?about=${about}#write`;
  return (
    <>
      <div data-overlay className="pointer-events-none fixed bottom-4 left-[var(--gutter)] z-50 hidden lg:block">
        <Link
          href={href}
          className="pointer-events-auto flex items-center gap-xs rounded-pill border border-ink/15 bg-canvas/90 py-1 pr-2.5 pl-3 text-[0.8125rem] text-ink backdrop-blur transition-colors hover:border-ink/40 hover:bg-band"
        >
          <T {...pill} />
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <p className="px-[var(--gutter)] pt-xl pb-section text-body text-ink-muted lg:hidden">
        <T {...ask} />{" "}
        <Link href={href} className="text-ink underline decoration-ink/35 underline-offset-4">
          <T {...link} />
        </Link>
      </p>
    </>
  );
}
