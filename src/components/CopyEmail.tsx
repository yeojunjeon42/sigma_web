"use client";

import { useState } from "react";
import { T } from "@/components/T";
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
    <p className="relative">
      <a
        href={`mailto:${EMAIL}`}
        onClick={copy}
        className="u-trim relative block w-fit max-w-full before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 text-[length:min(7rem,calc((100vw-2*var(--gutter))/12.9))] leading-none tracking-[-0.03em] whitespace-nowrap text-ink transition-opacity hover:opacity-60"
      >
        {EMAIL}
        <span className="sr-only">
          <T en="Write an email" ko="메일 쓰기" />
        </span>
      </a>
      <span aria-live="polite" className="absolute top-full left-0 mt-xs text-caption text-accent">
        {copied ? <T en="Copied" ko="복사했습니다" /> : null}
      </span>
    </p>
  );
}
