import {
  AboutTeaser,
  ContactTeaser,
  CtaBand,
  HeroSection,
  ServicesSection,
  WhySection,
} from "@/components/public/HomeSections";
import { getMergedSiteSettings } from "@/lib/settings/service";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "+Akademi | Oyunculuk, Cast ve Menajerlik Ajansı",
  description:
    "+Akademi; oyunculuk eğitimi, cast, menajerlik, model ajansı ve prodüksiyon hizmetleri sunar. Oyuncu başvurusu ve iletişim için bizi keşfedin.",
  path: "/",
  image: "/images/home/anasayfa.jpeg",
  absolute: true,
});

export default async function HomePage() {
  const settings = await getMergedSiteSettings();

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
