import Link from "next/link";

export default function ContactPill({ about, pill, above = false }: { about: string; pill: string; above?: boolean }) {
  return (
    <div
      data-overlay
      className={`pointer-events-none fixed left-[var(--gutter)] z-50 bottom-[max(1rem,env(safe-area-inset-bottom))] ${above ? "pill-above" : ""}`}
    >
      <Link
        href={`/contact?about=${about}#write`}
        className="pointer-events-auto relative flex items-center gap-xs rounded-pill border border-ink/15 bg-canvas/90 py-1 pr-2.5 pl-3 text-[0.8125rem] text-ink backdrop-blur transition-colors before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-[''] hover:border-ink/40 hover:bg-band lg:before:hidden"
      >
        {pill}
        <span aria-hidden="true">↗</span>
      </Link>
    </div>
  );
}
