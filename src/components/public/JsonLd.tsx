import { SITE_URL } from "@/config/constants";
import { hasValue } from "@/lib/utils";
import type { SiteSettings } from "@/types";

const VERIFIED_SAME_AS = [
  "https://www.instagram.com/artiakademioyunculukmenajerlik",
  "https://www.facebook.com/share/1LmC9CvhLf/",
] as const;

export function JsonLd({ settings }: { settings: SiteSettings }) {
  const fromSettings = [
    settings.instagram,
    settings.facebook,
    settings.youtube,
    settings.tiktok,
    settings.linkedin,
  ].filter(hasValue);

  const sameAs = [...new Set([...fromSettings, ...VERIFIED_SAME_AS])];

  const logoPath = `${SITE_URL}/brand/icon-512.png`;
  const wideLogoPath = settings.logoUrl?.startsWith("http")
    ? settings.logoUrl
    : `${SITE_URL}${settings.logoUrl || "/brand/logo.jpeg"}`;

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "+Akademi Oyunculuk & Menajerlik",
    alternateName: "+Akademi",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: logoPath,
      width: 512,
      height: 512,
    },
    image: wideLogoPath,
    description:
      "+Akademi Oyunculuk & Menajerlik; İzmir'de oyunculuk, cast ve menajerlik hizmetleri sunan profesyonel ajans.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1471 sokak no:9 iç kapı no:12",
      addressLocality: "Konak",
      addressRegion: "İzmir",
      addressCountry: "TR",
    },
    areaServed: [
      { "@type": "City", name: "İzmir" },
      { "@type": "Country", name: "Türkiye" },
    ],
    sameAs,
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "+Akademi",
    alternateName: "+Akademi Oyunculuk & Menajerlik",
    url: `${SITE_URL}/`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
