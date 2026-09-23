import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/constants";
import { listPublicActors } from "@/lib/actors/service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }[] = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/hakkimizda", changeFrequency: "monthly", priority: 0.8 },
    { path: "/hizmetler", changeFrequency: "monthly", priority: 0.9 },
    { path: "/basvuru", changeFrequency: "monthly", priority: 0.9 },
    { path: "/iletisim", changeFrequency: "monthly", priority: 0.8 },
    { path: "/oyuncular", changeFrequency: "weekly", priority: 0.7 },
    { path: "/referanslar", changeFrequency: "weekly", priority: 0.6 },
    { path: "/kvkk", changeFrequency: "yearly", priority: 0.3 },
    { path: "/gizlilik", changeFrequency: "yearly", priority: 0.3 },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: route.path === "/" ? SITE_URL : `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  let actorEntries: MetadataRoute.Sitemap = [];
  try {
    const actors = await listPublicActors(1, 200);
    actorEntries = actors.data.map((actor) => ({
      url: `${SITE_URL}/oyuncular/${actor.slug}`,
      lastModified: actor.updatedAt ? new Date(actor.updatedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    actorEntries = [];
  }

  return [...staticEntries, ...actorEntries];
}
