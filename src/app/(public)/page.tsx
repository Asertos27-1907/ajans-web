import {
  AboutTeaser,
  ContactTeaser,
  CtaBand,
  FeaturedActors,
  FeaturedReferences,
  HeroSection,
  ServicesSection,
  StatsSection,
  WhySection,
} from "@/components/public/HomeSections";
import {
  actorRepository,
  referenceRepository,
  settingsRepository,
} from "@/lib/repositories";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Ana Sayfa",
  path: "/",
});

export default async function HomePage() {
  const [settings, actors, references] = await Promise.all([
    settingsRepository.get(),
    actorRepository.getFeatured(6),
    referenceRepository.list({ activeOnly: true, featuredOnly: true }),
  ]);

  return (
    <>
      <HeroSection settings={settings} />
      <StatsSection settings={settings} />
      <AboutTeaser settings={settings} />
      <ServicesSection settings={settings} />
      <FeaturedActors actors={actors} />
      <FeaturedReferences items={references} />
      <WhySection settings={settings} />
      <CtaBand />
      <ContactTeaser settings={settings} />
    </>
  );
}
