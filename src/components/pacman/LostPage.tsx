"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "@/i18n/Link";
import { useLocale } from "@/i18n/LocaleProvider";
import { SHELL } from "@/i18n/dict/shell";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Container } from "@/components/ui";
import Arcade from "./Arcade";

// Measured ink at 100px: the word's width and its left bearing, both in em, so it spans the sheet exactly.
const FIT = {
  "404": { width: 2.185, left: 0.025 },
  Error: { width: 2.7875, left: 0.0925 },
};

// The word is drawn, and stays as it is in either language; the heading under it is the reader's.
export default function LostPage({ word, extra }: { word: keyof typeof FIT; extra?: ReactNode }) {
  const say = SHELL[useLocale()].lost;
  const heading = word === "404" ? say.notFound : say.error;
  return (
    <>
      <Navbar />
      <main id="main" className="relative z-10 bg-canvas">
        <h1 className="sr-only">{heading}</h1>
        <Container className="pt-[calc(var(--masthead)+var(--spacing-md))] pb-xxl">
          <Arcade word={word} extra={extra} label={say.maze(word)} />
          <div className="@container flex flex-col gap-y-xl pt-lg pb-xl md:hidden">
            <p
              aria-hidden="true"
              style={{ "--fit": FIT[word].width, marginLeft: `-${FIT[word].left}em` } as CSSProperties}
              className="u-trim whitespace-nowrap font-[family-name:var(--f-display)] text-[length:calc(100cqw/var(--fit))] font-bold leading-none tracking-[-0.02em] text-ink [font-stretch:125%]"
            >
              {word}
            </p>
            {word !== "404" && <div>
              <p aria-hidden="true" className="text-title text-ink">
                {heading}
              </p>
              <div className="mt-md flex flex-wrap items-center gap-x-lg gap-y-sm">
                <Link href="/" className="inline-flex min-h-11 items-center text-body text-ink">
                  <span className="u-swipe-rest">{say.home}</span>
                </Link>
                {extra}
              </div>
            </div>}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
