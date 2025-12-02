import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

// Update to the real domain when deployed
const siteUrl = "https://nestfinder.example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/properties`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/register`,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/login`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Every active property listing gets its own sitemap entry
  const properties = await db.property.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const propertyPages: MetadataRoute.Sitemap = properties.map((property) => ({
    url: `${siteUrl}/properties/${property.slug}`,
    lastModified: property.createdAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...propertyPages];
}
