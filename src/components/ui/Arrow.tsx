// Draw arrows to avoid font fallback. Units are 1/100 em, matched to the sans metrics.
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
