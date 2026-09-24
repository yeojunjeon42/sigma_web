/**
 * A post's cover, by slug: a photograph, or generated coral art from `scripts/media/covers.py`
 * (`/blog-covers/<slug>.png`). A post without one shows no picture.
 */
export const POST_COVERS: Partial<Record<string, string>> = {
  "irex-2025": "/blog-covers/irex-2025.png",
  "portal301-collaboration": "/blog-covers/portal301-collaboration.png",
  "sample-least-squares-to-gradient-descent": "/blog-covers/sample-least-squares-to-gradient-descent.png",
};

export function coverFor(slug: string): string | undefined {
  return POST_COVERS[slug];
}
