import type { MetadataRoute } from "next";
import { SITE } from "@/data/site";
import { DATASET_DATE } from "@/data/gateways";
import { categories } from "@/data/categories";
import { publishedPosts } from "@/data/blog";
import { allGateways } from "@/lib/gateway";

const lastModified = new Date(`${DATASET_DATE}T00:00:00Z`);

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { path: "/", priority: 1 },
    { path: "/compare", priority: 0.9 },
    { path: "/gateways", priority: 0.8 },
    { path: "/categories", priority: 0.8 },
    { path: "/blog", priority: 0.6 },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: new URL(route.path, SITE.url).toString(),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: route.priority,
    })),
    ...categories.map((category) => ({
      url: new URL(`/categories/${category.slug}`, SITE.url).toString(),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...allGateways().map((gateway) => ({
      url: new URL(`/gateways/${gateway.slug}`, SITE.url).toString(),
      lastModified: new Date(`${gateway.lastVerified}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...publishedPosts().map((post) => ({
      url: new URL(`/blog/${post.slug}`, SITE.url).toString(),
      lastModified: new Date(`${post.updatedAt ?? post.publishedAt}T00:00:00Z`),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
