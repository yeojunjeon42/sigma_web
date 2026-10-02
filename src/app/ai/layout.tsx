import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import { Ld } from "@/app/ai/terminal";
import { organization } from "@/app/ai/ld";
import { TerminalNav, Prompt } from "./TerminalNav";

const mono = Geist_Mono({ weight: ["400", "500"], subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Terminal", template: "%s \\ Terminal" },
};

export const viewport: Viewport = {
  themeColor: "#0a0907",
};

// data-terminal also darkens the root for overscroll and browser chrome.
export default function TerminalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      id="main"
      data-terminal=""
      style={{ fontFamily: `${mono.style.fontFamily}, var(--f-kr), ui-monospace, monospace` }}
      className="min-h-screen bg-canvas-inverse px-4 pt-10 pb-32 text-[13px] leading-5 text-ink-inverse [overflow-wrap:anywhere] selection:bg-ink-inverse selection:text-canvas-inverse"
    >
      <link rel="describedby" type="text/markdown" href="/llms.txt" />
      <Ld data={organization} />

      <div className="mx-auto flex max-w-4xl flex-col gap-10">
        <TerminalNav />

        <article className="flex flex-col gap-10">{children}</article>

        <footer className="flex flex-col text-ink-inverse-muted">
          <p>
            # plain-text index:{" "}
            <a href="/llms.txt" className="relative underline underline-offset-4 before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-[''] lg:before:hidden">
              /llms.txt
            </a>
          </p>
          <p>
            # full corpus:{" "}
            <a href="/llms-full.txt" className="relative underline underline-offset-4 before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-[''] lg:before:hidden">
              /llms-full.txt
            </a>
          </p>
          <p># built from the same data as the site.</p>
          <p aria-hidden="true" className="mt-6">
            <Prompt />
            <span className="term-cursor ml-[1ch] inline-block h-[1.15em] w-[1ch] translate-y-[0.2em] bg-ink-inverse" />
          </p>
        </footer>
      </div>
    </main>
  );
}
