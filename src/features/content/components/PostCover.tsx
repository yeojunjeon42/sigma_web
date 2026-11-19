import Image from "next/image";
import { MachineFrame } from "@/components/ui";
import { INKED, InkDefs } from "@/features/hand/HandLayer";
import type { Cover } from "../api/cover";
import { hang } from "./coverType";

// A post's cover: an ink drawing in the upper part of a square cell of the page's own paper, with
// the section top left and the title bottom left. Type and padding scale with the cover's width,
// so a card and a preview set both in the same place.
export default function PostCover({
  title,
  section,
  cover,
  ratio = "1 / 1",
  heading = false,
  eager = false,
  className = "",
}: {
  title: string;
  section?: string;
  cover?: Cover;
  ratio?: string;
  // The cover carries the post's heading; elsewhere it is a picture of it.
  heading?: boolean;
  eager?: boolean;
  className?: string;
}) {
  const Title = heading ? "h2" : "p";
  // A wide cover is short, so its drawing is smaller and keeps clear of the title.
  const room = ratio === "1 / 1" ? "top-[7cqw] w-[60cqw]" : "top-[4cqw] w-[38cqw]";
  return (
    <MachineFrame
      aria-hidden={heading ? undefined : true}
      style={{ aspectRatio: ratio }}
      className={`overflow-hidden bg-canvas text-ink [container-type:inline-size] [&_img]:rounded-none ${className}`}
    >
      <InkDefs />
      {cover ? (
        <Image
          src={cover.src}
          alt={heading ? cover.alt : ""}
          width={300}
          height={300}
          unoptimized
          preload={eager}
          style={INKED}
          className={`absolute right-[5cqw] aspect-square ${room}`}
        />
      ) : null}
      {/* The inset is `INSET` in coverType.ts: 4% of the cover's width on every side. */}
      <div data-offgrid className="absolute inset-0 flex flex-col justify-between p-[4cqw]">
        {/* The label's box starts on its capitals' tops, so they stand the inset from the top. Where
            the box cannot be trimmed, the same distance is taken off above. */}
        <p
          style={{ textIndent: hang(section) }}
          className="text-[max(3.4cqw,0.75rem)] leading-none [text-box:trim-start_cap_alphabetic] not-supports-[text-box:trim-start_cap_alphabetic]:-mt-[0.072em]"
        >
          {section}
        </p>
        {/* The title's box ends on its baseline, so the baseline stands as far from the foot of the
            card as the text does from its side; descenders hang into the padding. Where the box
            cannot be trimmed, the same distance is taken off below: the sans's descent (0.224em)
            less half of what this leading takes off the line (0.07em). */}
        <Title
          style={{ textIndent: hang(title) }}
          className="max-w-[18ch] text-[8cqw] leading-[1.06] tracking-[-0.02em] text-balance [text-box:trim-end_text_alphabetic] not-supports-[text-box:trim-end_text_alphabetic]:-mb-[0.154em]"
        >
          {title}
        </Title>
      </div>
    </MachineFrame>
  );
}
