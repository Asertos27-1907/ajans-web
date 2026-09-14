import { settingsRepository } from "@/lib/repositories";
import { createMetadata } from "@/lib/seo";
import { ServicesPageContent } from "@/components/public/ServicesPageContent";

export const metadata = createMetadata({
  title: "Hizmetler",
  description:
    "Oyunculuk eğitimi, ajans, model, prodüksiyon, menajerlik ve cast hizmetleri.",
  path: "/hizmetler",
});

export default async function ServicesPage() {
  const settings = await settingsRepository.get();
  return <ServicesPageContent settings={settings} />;
}
