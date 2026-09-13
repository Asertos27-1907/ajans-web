import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/constants";
import { actorRepository } from "@/lib/repositories";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const actors = await actorRepository.listPublic(1, 100);
  const staticRoutes = [
    "",
    "/hakkimizda",
    "/hizmetler",
    "/oyuncular",
    "/referanslar",
    "/basvuru",
    "/iletisim",
    "/kvkk",
    "/gizlilik",
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${SITE_URL}${path || "/"}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...actors.data.map((actor) => ({
      url: `${SITE_URL}/oyuncular/${actor.slug}`,
      lastModified: new Date(actor.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
