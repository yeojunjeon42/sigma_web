const POST_COVERS: Partial<Record<string, string>> = {
  "irex-2025": "/blog-photos/irex-2025.jpg",
  "portal301-collaboration": "/blog-photos/portal301-collaboration.jpg",
};

export function coverFor(slug: string): string | undefined {
  return POST_COVERS[slug];
}
