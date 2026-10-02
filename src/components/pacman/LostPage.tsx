import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Container } from "@/components/ui";
import Arcade from "./Arcade";

export default function LostPage({ word, heading, extra }: { word: string; heading: string; extra?: ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main" className="relative z-10 bg-canvas">
        <h1 className="sr-only">{heading}</h1>
        <Container className="pt-[calc(var(--masthead)+var(--spacing-md))] pb-xxl">
          <Arcade
            word={word}
            extra={extra}
            label={`A playable Pac-Man maze drawn around the word ${word}. Arrow keys, W A S D or the pointer steer.`}
          />
          <div className="@container flex flex-col gap-y-xl pt-lg pb-xl md:hidden">
            <p
              aria-hidden="true"
              style={{ "--n": word.length } as CSSProperties}
              className="u-trim font-[family-name:var(--f-display)] text-[length:calc(100cqw/(var(--n)*0.85))] font-bold leading-none tracking-[-0.02em] text-ink [font-stretch:125%]"
            >
              {word}
            </p>
            <div>
              <p aria-hidden="true" className="text-title text-ink">
                {heading}
              </p>
              <div className="mt-md flex flex-wrap items-center gap-x-lg gap-y-sm">
                <Link href="/" className="inline-flex min-h-11 items-center text-body text-ink">
                  <span className="u-swipe-rest">Home ↗</span>
                </Link>
                {extra}
              </div>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
