"use client";

import { usePathname } from "next/navigation";

export function MachineReveal() {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      aria-hidden="true"
      className="machine-reveal pointer-events-none fixed inset-0 z-50 bg-machine-bg"
    />
  );
}
