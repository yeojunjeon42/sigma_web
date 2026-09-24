"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LINK, MACHINE_NAV } from "@/app/ai/machine";

export function MachineNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Machine index" className="flex flex-wrap items-center gap-x-5 gap-y-1 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:min-w-6 [&_a]:items-center lg:[&_a]:min-h-0">
      {MACHINE_NAV.map(({ label, href }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={active ? "bg-machine-base px-1 text-machine-bg" : LINK}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
