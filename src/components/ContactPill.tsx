import Link from "next/link";

const href = (about: string) => `/contact?about=${about}#write`;

// From md the invitation floats over the page. Phones read it at the end instead (ContactRow):
// floating, it covered the text and stacked on the dial.
export default function ContactPill({ about, pill }: { about: string; pill: string }) {
  return (
    <div
      data-overlay
      className="pointer-events-none fixed left-[var(--gutter)] z-50 bottom-[max(1rem,env(safe-area-inset-bottom))] max-md:hidden"
    >
      <Link
        href={href(about)}
        className="pointer-events-auto relative flex h-[30px] items-center gap-xs rounded-pill border border-ink/15 bg-canvas/90 pr-2.5 pl-3 text-[0.75rem] text-ink backdrop-blur transition-colors before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-[''] hover:border-ink/40 hover:bg-band lg:before:hidden"
      >
        {pill}
        <span aria-hidden="true">↗</span>
      </Link>
    </div>
  );
}

export function ContactRow({ about, pill, className = "" }: { about: string; pill: string; className?: string }) {
  return (
    <Link
      href={href(about)}
      className={`flex min-h-11 items-center justify-between gap-x-md border-t border-rule pt-sm text-body text-ink md:hidden ${className}`}
    >
      <span className="text-balance">{pill}</span>
      <span aria-hidden="true">↗</span>
    </Link>
  );
}
