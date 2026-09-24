import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/about", destination: "/", permanent: true },

      { source: "/mabang", destination: "/archive", permanent: true },
      { source: "/club-life", destination: "/history", permanent: true },
      { source: "/record", destination: "/history", permanent: true },
      // The entries had their own pages once. They are read in the reel now, so both the old
      // archive paths and the entry paths land on the reel opened at that build.
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
};

export default nextConfig;
