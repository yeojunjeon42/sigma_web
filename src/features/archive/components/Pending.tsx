"use client";

import { useLinkStatus } from "next/link";

// Inside a Link: marks it while its page is on the way. A query render can take seconds on a cold
// start and PageTurn skips same-pathname moves, so a tap needs its own answer.
export default function Pending() {
  const { pending } = useLinkStatus();
  return pending ? <span data-pending hidden /> : null;
}
