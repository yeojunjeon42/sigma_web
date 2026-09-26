"use client";

import { useState } from "react";
import { EMAIL } from "@/features/site/data/contact";

export default function CopyEmail() {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard
      ?.writeText(EMAIL)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => {});
  }

  return (
    <span className="relative inline-block">
      <a
        href={`mailto:${EMAIL}`}
        onClick={copy}
        className="u-swipe-rest relative text-ink before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 lg:before:hidden"
      >
        {EMAIL}
      </a>
      <span aria-live="polite" className="absolute inset-x-0 top-full mt-xxs text-caption text-accent">
        {copied ? "Copied" : null}
      </span>
    </span>
  );
}
