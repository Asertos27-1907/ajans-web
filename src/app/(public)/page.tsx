import {
  AboutTeaser,
  ContactTeaser,
  CtaBand,
  HeroSection,
  ServicesSection,
  WhySection,
} from "@/components/public/HomeSections";
import { settingsRepository } from "@/lib/repositories";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Ana Sayfa",
  description:
    "+Akademi; oyunculuk eğitimi, cast, menajerlik ve prodüksiyon alanlarında yetenekleri sektörün ihtiyaçlarıyla buluşturan profesyonel yapı.",
  path: "/",
  image: "/images/hero/hero-main.jpg",
});

export default async function HomePage() {
  const settings = await settingsRepository.get();

  return (
    <>
      <HeroSection settings={settings} />
      <AboutTeaser settings={settings} />
      <ServicesSection settings={settings} />
      <WhySection settings={settings} />
      <CtaBand />
      <ContactTeaser settings={settings} />
    </>
  );
}
