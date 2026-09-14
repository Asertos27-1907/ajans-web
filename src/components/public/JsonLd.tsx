import { SITE_URL } from "@/config/constants";
import { hasValue } from "@/lib/utils";
import type { SiteSettings } from "@/types";

export function JsonLd({ settings }: { settings: SiteSettings }) {
  const sameAs = [
    settings.instagram,
    settings.facebook,
    settings.youtube,
    settings.tiktok,
    settings.linkedin,
  ].filter(hasValue);

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.companyName,
    alternateName: settings.agencyName,
    url: SITE_URL,
    logo: `${SITE_URL}${settings.logoUrl}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "1471 Sokak No:9 İç Kapı No:12, Alsancak Mahallesi",
      addressLocality: "Konak",
      addressRegion: "İzmir",
      addressCountry: "TR",
    },
    ...(sameAs.length ? { sameAs } : {}),
  };

  const service = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: settings.companyName,
    description: settings.heroDescription,
    url: SITE_URL,
    areaServed: "TR",
    address: organization.address,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }}
      />
    </>
  );
}
