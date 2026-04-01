import type { MetadataRoute } from "next";
import { SITE } from "@/config/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/editor/", "/checkout/"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
