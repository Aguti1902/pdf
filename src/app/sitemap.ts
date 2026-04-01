import type { MetadataRoute } from "next";
import { tools } from "@/config/tools";
import { SITE } from "@/config/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const now = new Date();

  const staticPages = [
    { url: base, changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${base}/pricing`, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/blog`, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${base}/faq`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${base}/contact`, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${base}/legal/privacy`, changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${base}/legal/terms`, changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${base}/legal/cookies`, changeFrequency: "monthly" as const, priority: 0.2 },
    { url: `${base}/legal/subscription`, changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${base}/legal/refund`, changeFrequency: "monthly" as const, priority: 0.3 },
  ].map((p) => ({ ...p, lastModified: now }));

  const toolPages = tools.map((tool) => ({
    url: `${base}/${tool.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...toolPages];
}
