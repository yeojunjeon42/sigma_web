import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { SIGMA_ASCII } from "@/app/ai/ascii";
import { Ld } from "@/app/ai/machine";
import { organization } from "@/app/ai/ld";
import { MachineNav } from "./MachineNav";
import { MachineReveal } from "./MachineReveal";

const mono = Geist_Mono({ weight: ["400", "500"], subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Machine", template: "%s \\ Machine" },
};

export default function MachineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      id="main"
      style={{ fontFamily: `${mono.style.fontFamily}, var(--f-kr), ui-monospace, monospace` }}
      className={`min-h-screen bg-machine-bg px-4 pt-12 pb-32 text-[13px] leading-5 font-medium [overflow-wrap:anywhere] text-machine-base [text-shadow:0_0_8px_#ED202473] selection:bg-machine-base selection:text-machine-bg`}
    >
      <link rel="describedby" type="text/markdown" href="/llms.txt" />
      <Ld data={organization} />

      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <pre
          aria-hidden="true"
          style={{
            fontFamily:
              'Menlo, Consolas, "DejaVu Sans Mono", "Liberation Mono", "Courier New", monospace',
          }}
          className="w-full text-[min(16px,calc((100vw-2rem)/24))] leading-[1]"
        >
          {SIGMA_ASCII}
        </pre>

        <MachineNav />

        <article className="flex flex-col gap-10">{children}</article>

        <footer className="flex flex-col gap-2 text-machine-dim">
          <p>
            Plain-text index:{" "}
            <a href="/llms.txt" className="relative underline underline-offset-4 before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-[''] lg:before:hidden">
              /llms.txt
            </a>{" "}
            · Full corpus:{" "}
            <a href="/llms-full.txt" className="relative underline underline-offset-4 before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-[''] lg:before:hidden">
              /llms-full.txt
            </a>
          </p>
          <p>Generated from the same data as the rendered site.</p>
        </footer>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1200] [background:repeating-linear-gradient(#0000001f_0_1px,#0000_1px_3px)]"
      />
      <MachineReveal />
    </main>
  );
}
