import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow LAN devices to connect to the dev HMR socket.
  allowedDevOrigins: [
    "10.*.*.*",
    "192.168.*.*",
    ...Array.from({ length: 16 }, (_, i) => `172.${16 + i}.*.*`),
  ],
  // Photos use new filenames when replaced; a long TTL avoids repeated image transformations.
  images: {
    minimumCacheTTL: 2678400, // 31 days
    // No source is wider than 1600px; a wider request is the same picture under another key.
    deviceSizes: [640, 828, 1200, 1600],
    imageSizes: [128, 256, 384],
    qualities: [75],
    formats: ["image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
        ],
      },
    ];
  },
  // English has no prefix: every page address that is not Korean, the terminal, a share image or a
  // file is served from /en. `usePath` (src/i18n) hides the difference from the page.
  async rewrites() {
    const bare = ["era", "view", "sort", "look", "at"].map((key) => ({ type: "query" as const, key }));
    return {
      beforeFiles: [
        // The archive with no query is prerendered at /archive/all.
        { source: "/archive", missing: bare, destination: "/en/archive/all" },
        { source: "/ko/archive", missing: bare, destination: "/ko/archive/all" },
        { source: "/", destination: "/en" },
        { source: "/:path((?!ko(?:/|$)|en(?:/|$)|ai(?:/|$)|og/|_next/)[^.]+)", destination: "/en/:path" },
      ],
    };
  },
  async redirects() {
    return [
      { source: "/about", destination: "/", permanent: true },

      { source: "/mabang", destination: "/archive", permanent: true },
      { source: "/club-life", destination: "/history", permanent: true },
      { source: "/record", destination: "/history", permanent: true },
      // Redirect legacy entry URLs to the corresponding build in the reel.
      { source: "/archive/:slug", destination: "/archive?view=reel&at=:slug", permanent: true },
      { source: "/mabang/:slug", destination: "/archive?view=reel&at=:slug", permanent: true },
      { source: "/projects", destination: "/archive", permanent: true },
      { source: "/awards", destination: "/history", permanent: true },
      { source: "/alumni", destination: "/members", permanent: true },

      { source: "/people", destination: "/members", permanent: true },
      { source: "/posts", destination: "/blog", permanent: true },
      { source: "/posts/:slug", destination: "/blog/:slug", permanent: true },

      // The same old addresses under /ko.
      { source: "/ko/about", destination: "/ko/ko", permanent: true },
      { source: "/ko/mabang", destination: "/ko/archive", permanent: true },
      { source: "/ko/club-life", destination: "/ko/history", permanent: true },
      { source: "/ko/record", destination: "/ko/history", permanent: true },
      { source: "/ko/archive/:slug", destination: "/ko/archive?view=reel&at=:slug", permanent: true },
      { source: "/ko/mabang/:slug", destination: "/ko/archive?view=reel&at=:slug", permanent: true },
      { source: "/ko/projects", destination: "/ko/archive", permanent: true },
      { source: "/ko/awards", destination: "/ko/history", permanent: true },
      { source: "/ko/alumni", destination: "/ko/members", permanent: true },
      { source: "/ko/people", destination: "/ko/members", permanent: true },
      { source: "/ko/posts", destination: "/ko/blog", permanent: true },
      { source: "/ko/posts/:slug", destination: "/ko/blog/:slug", permanent: true },

      // /en is not an address: English lives at the root.
      { source: "/en", destination: "/", permanent: true },
      { source: "/en/:path*", destination: "/:path*", permanent: true },

      { source: "/ai/mabang", destination: "/ai/archive", permanent: true },
      { source: "/ai/club-life", destination: "/ai/history", permanent: true },
      { source: "/ai/record", destination: "/ai/history", permanent: true },
      { source: "/ai/posts", destination: "/ai/blog", permanent: true },
      { source: "/ai/people", destination: "/ai/members", permanent: true },
    ];
  },
  experimental: {
    agentUpgrade: "security",
  },
};

export default nextConfig;
