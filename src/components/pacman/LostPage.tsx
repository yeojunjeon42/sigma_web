import type { ReactNode } from "react";
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
            label={`A playable Pac-Man maze drawn around the word ${word}. Arrow keys, W A S D or the pointer steer; swipe on a phone.`}
          />
        </Container>
      </main>
      <Footer />
    </>
  );
}
