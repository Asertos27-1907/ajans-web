import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/hakkimizda",
    "/hizmetler",
    "/basvuru",
    "/iletisim",
    "/kvkk",
    "/gizlilik",
  ];

  return staticRoutes.map((path) => ({
    url: `${SITE_URL}${path || "/"}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
}
