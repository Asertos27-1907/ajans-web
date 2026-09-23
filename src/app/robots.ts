import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/api", "/update-password"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
