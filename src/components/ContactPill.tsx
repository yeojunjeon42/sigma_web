import Link from "next/link";

type ContactLinkProps = { pill: string } & (
  | { about: string; href?: never }
  | { href: string; about?: never }
);

function linkProps({ href, about }: ContactLinkProps) {
  const destination = href ?? `/contact?about=${about}`;
  return {
    href: destination,
    ...(/^https?:\/\//.test(destination) ? { target: "_blank", rel: "noopener noreferrer" } : {}),
  };
}

export default function ContactPill({ showOnMobile = false, ...props }: ContactLinkProps & { showOnMobile?: boolean }) {
  return (
    <div
      data-overlay
      className={`pointer-events-none fixed left-[var(--gutter)] z-50 bottom-[max(1rem,env(safe-area-inset-bottom))] max-w-[calc(100vw-2*var(--gutter))] ${showOnMobile ? "" : "max-md:hidden"}`}
    >
      <Link
        {...linkProps(props)}
        className="pointer-events-auto relative flex h-[30px] items-center gap-xs rounded-pill border border-ink/15 bg-canvas/90 pr-2.5 pl-3 text-[0.75rem] text-ink backdrop-blur transition-colors before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-[''] hover:border-ink/40 hover:bg-band lg:before:hidden"
      >
        <span className="truncate">{props.pill}</span>
        <span aria-hidden="true" className="shrink-0">↗</span>
      </Link>
    </div>
  );
}

export function ContactRow({ className = "", ...props }: ContactLinkProps & { className?: string }) {
  return (
    <Link
      {...linkProps(props)}
      className={`flex min-h-11 items-center justify-between gap-x-md border-t border-rule pt-sm text-body text-ink md:hidden ${className}`}
    >
      <span className="text-balance">{props.pill}</span>
      <span aria-hidden="true">↗</span>
    </Link>
  );
}
