"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MachineToggle() {
  const pathname = usePathname();
  const machine = pathname.startsWith("/ai");


  const base = "rounded-pill px-2 py-1 text-[0.6875rem] uppercase tracking-[0.02em] transition-colors";

  return (
    <div
      data-overlay
      className="pointer-events-none fixed right-[var(--gutter)] bottom-4 z-50 hidden justify-end lg:flex"
    >
      <div
        role="group"
        aria-label="Reading mode"
        className={`pointer-events-auto flex items-center rounded-pill border p-0.5 backdrop-blur ${
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
