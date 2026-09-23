import { getMergedSiteSettings } from "@/lib/settings/service";
import { createMetadata } from "@/lib/seo";
import { ServicesPageContent } from "@/components/public/ServicesPageContent";

export const metadata = createMetadata({
  title: "Hizmetlerimiz",
  description:
    "+Akademi oyunculuk ajansı, cast ajansı ve menajerlik ajansı hizmetlerini inceleyin. Eğitim, casting, temsil ve prodüksiyon desteği.",
  path: "/hizmetler",
});

export default async function ServicesPage() {
  const settings = await getMergedSiteSettings();
  return <ServicesPageContent settings={settings} />;
}
