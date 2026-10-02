"use client";

import { useLinkStatus } from "next/link";

// Show feedback for slow query navigation, which PageTurn skips on the same pathname.
export default function Pending() {
  const { pending } = useLinkStatus();
  return pending ? <span data-pending hidden /> : null;
}
