"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MachineToggle() {
  const pathname = usePathname();
  const machine = pathname.startsWith("/ai");


  // The same type and height as the contact pill on the other corner (ContactPill): a pair.
  const base = "flex h-full items-center rounded-pill px-2 text-[0.75rem] transition-colors";

  return (
    <div
      data-overlay
      className="pointer-events-none fixed right-[var(--gutter)] bottom-4 z-50 hidden justify-end lg:flex"
    >
      <div
        role="group"
        aria-label="Reading mode"
        className={`pointer-events-auto flex h-[30px] items-center rounded-pill border p-0.5 backdrop-blur ${
          machine
            ? "border-overlay-ink/20 bg-canvas-inverse/80"
            : "border-ink/15 bg-canvas/90"
        }`}
      >
        <Link
          href="/"
          aria-current={!machine ? "page" : undefined}
          className={`${base} ${
            machine
              ? "text-overlay-ink/50 hover:text-overlay-ink"
              : "text-accent-deep"
          }`}
        >
          Human
        </Link>
        <Link
          href="/ai"
          aria-current={machine ? "page" : undefined}
          className={`${base} ${
            machine
              ? "text-accent"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          Machine
        </Link>
      </div>
    </div>
  );
}
