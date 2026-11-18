import Image from "next/image";
import { coverFile } from "../data/coverFile";

// Type and padding scale with the cover's own width, so a card, a preview and the share image
// set the label and the title in the same place. Every cover is dark, so the text is white.
export default function PostCover({
  slug,
  title,
  section,
  ratio = "1 / 1",
  sizes,
  eager = false,
  heading = false,
  className = "",
}: {
  slug: string;
  title: string;
  section?: string;
  ratio?: string;
  sizes: string;
  eager?: boolean;
  // The cover carries the post's heading; elsewhere it is a picture of it.
  heading?: boolean;
  className?: string;
}) {
  const src = coverFile(slug);
  const Title = heading ? "h2" : "p";
  return (
    <div
      aria-hidden={heading ? undefined : true}
      style={{ aspectRatio: ratio }}
      className={`relative overflow-hidden bg-accent-deep text-overlay-ink [container-type:inline-size] ${className}`}
    >
      {src ? <Image src={src} alt="" fill sizes={sizes} preload={eager} className="object-cover" /> : null}
      <div data-offgrid className="absolute inset-0 flex flex-col justify-between p-[6cqw]">
        <p className="text-[max(3.4cqw,0.75rem)] leading-none">{section}</p>
        <Title className="max-w-[18ch] text-[8cqw] leading-[1.06] tracking-[-0.02em] text-balance">{title}</Title>
      </div>
    </div>
  );
}
