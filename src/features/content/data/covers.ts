const POST_COVERS: Partial<Record<string, string>> = {
  "irex-2025": "/blog-photos/irex-2025-2x.jpg",
  "portal301-collaboration": "/blog-photos/portal301-collaboration-2x.jpg",
};

export function coverFor(slug: string): string | undefined {
  return POST_COVERS[slug];
}
