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
  async rewrites() {
    return {
      beforeFiles: [
        // A post's Korean reading, /blog/<slug>?lang=ko, is prerendered at /blog/<slug>/ko.
        { source: "/blog/:slug", has: [{ type: "query", key: "lang", value: "ko" }], destination: "/blog/:slug/ko" },
        {
          source: "/archive",
          missing: ["era", "view", "sort", "look", "at"].map((key) => ({ type: "query" as const, key })),
          destination: "/archive/all",
        },
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
