import type { MetadataRoute } from "next";

const SITE_URL = "https://sigmaintelligence.org";

// Machine readers: ${SITE_URL}/llms.txt (index) and /llms-full.txt (full corpus).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
