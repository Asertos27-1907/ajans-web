import {
  AboutTeaser,
  ContactTeaser,
  CtaBand,
  HeroSection,
  ServicesSection,
  WhySection,
} from "@/components/public/HomeSections";
import { ActorsMarqueeSection } from "@/components/public/ActorsMarquee";
import { listFeaturedPublicActors } from "@/lib/actors/service";
import { getMergedSiteSettings } from "@/lib/settings/service";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "+Akademi | Oyunculuk, Cast ve Menajerlik Ajansı",
  description:
    "+Akademi; oyunculuk, cast, menajerlik ve prodüksiyon alanlarında profesyonel hizmet sunar. Oyuncu başvurusu ve hizmetlerimiz için bizi keşfedin.",
  path: "/",
  image: "/images/home/anasayfa.jpeg",
  absolute: true,
});

export default async function HomePage() {
  const [settings, featuredActors] = await Promise.all([
    getMergedSiteSettings(),
    listFeaturedPublicActors(12).catch(() => []),
  ]);

  return (
    <>
      <HeroSection settings={settings} />
      <AboutTeaser settings={settings} />
      <ActorsMarqueeSection actors={featuredActors} />
      <ServicesSection settings={settings} />
      <WhySection settings={settings} />
      <CtaBand />
      <ContactTeaser settings={settings} />
    </>
  );
}
