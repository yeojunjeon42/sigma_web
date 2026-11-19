import Image from "next/image";
import { MachineFrame } from "@/components/ui";
import { INKED, InkDefs } from "@/features/hand/HandLayer";
import type { Cover } from "../api/cover";

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
      <div data-offgrid className="absolute inset-0 flex flex-col justify-between p-[6cqw]">
        <p className="text-[max(3.4cqw,0.75rem)] leading-none">{section}</p>
        <Title className="max-w-[18ch] text-[8cqw] leading-[1.06] tracking-[-0.02em] text-balance">{title}</Title>
      </div>
    </MachineFrame>
  );
}
