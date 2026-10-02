"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TERMINAL_NAV } from "@/app/ai/terminal";

export function Prompt({ children }: { children?: React.ReactNode }) {
  return (
    <span className="text-ink-inverse-muted">
      snusigma.net:~$
      {children && <span className="text-ink-inverse"> {children}</span>}
    </span>
  );
}

export function TerminalNav() {
  const pathname = usePathname();
  const file = `${pathname === "/ai" ? "index" : pathname.split("/").pop()}.md`;

  return (
    <div className="flex flex-col gap-1">
      <p aria-hidden="true">
        <Prompt>ls</Prompt>
      </p>
      <nav aria-label="Terminal" className="flex flex-wrap gap-x-[2ch] [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center lg:[&_a]:min-h-0">
        {TERMINAL_NAV.map(({ label, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={active ? "" : "hover:underline hover:underline-offset-4"}
            >
              {/* Highlight the label, keeping the 44px hit area. */}
              <span className={active ? "-mx-[0.5ch] bg-ink-inverse px-[0.5ch] text-canvas-inverse" : ""}>{label.toLowerCase()}</span>
            </Link>
          );
        })}
        <Link href="/" className="text-ink-inverse-muted hover:text-ink-inverse">
          ../ (the site)
        </Link>
      </nav>
      <p aria-hidden="true" className="mt-4">
        <Prompt>cat {file}</Prompt>
      </p>
    </div>
  );
}
