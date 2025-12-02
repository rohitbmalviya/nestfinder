import type { MetadataRoute } from "next";

// Update to the real domain when deployed
const siteUrl = "https://nestfinder.example.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep private, session-only areas out of search results
      disallow: ["/favorites", "/agent", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
