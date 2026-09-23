import { getMergedSiteSettings } from "@/lib/settings/service";
import { createMetadata } from "@/lib/seo";
import { ServicesPageContent } from "@/components/public/ServicesPageContent";

export const metadata = createMetadata({
  title: "Hizmetlerimiz",
  description:
    "Oyunculuk eğitimi, cast, menajerlik, model ajansı ve prodüksiyon hizmetlerimizi inceleyin.",
  path: "/hizmetler",
});

export default async function ServicesPage() {
  const settings = await getMergedSiteSettings();
  return <ServicesPageContent settings={settings} />;
}
