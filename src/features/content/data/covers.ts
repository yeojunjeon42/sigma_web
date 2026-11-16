const POST_COVERS: Partial<Record<string, string>> = {
  "activity-report-2026-09-10": "/blog-photos/activity-report-2026-09-10-card-1.jpg",
  "ai-fusion-education-2025": "/blog-photos/ai-fusion-education-2025-card-1.jpg",
  "arduino-education-2025": "/blog-photos/arduino-education-2025-card-1.jpg",
  "creative-design-fair-2025": "/blog-photos/creative-design-fair-2025-card-1.jpg",
  "irex-2025": "/blog-photos/irex-2025-2x.jpg",
  "portal301-collaboration": "/blog-photos/portal301-collaboration-2x.jpg",
  "year-end-showcase-2025": "/blog-photos/year-end-showcase-2025-card-1.jpg",
};

export function coverFor(slug: string): string | undefined {
  return POST_COVERS[slug];
}
