// The site's arrow, drawn: neither font carries ← or →, so the characters fell back to whatever
// the device had (Arial on a Mac, other faces elsewhere) and never matched the type. Units are
// hundredths of an em: the stroke is the sans' stem (0.085em), the head spans a little under the
// x-height, and in a centred flex row the box sits on the cap centre (the sans' metrics are set
// so a centred line box is centred on its capitals).
export function Arrow({ dir = "left", className = "" }: { dir?: "left" | "right"; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 80 50"
      className={`h-[0.5em] w-[0.8em] shrink-0 overflow-visible ${dir === "right" ? "rotate-180" : ""} ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={8.5}
      strokeLinecap="butt"
      strokeLinejoin="miter"
    >
      <path d="M27.5 4 L6.5 25 L27.5 46" />
      <path d="M6.5 25 H78" />
    </svg>
  );
}
