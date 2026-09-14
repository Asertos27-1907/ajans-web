import type { Metadata } from "next";
import { SITE_URL } from "@/config/constants";

const defaultTitle = "+Akademi Oyunculuk & Menajerlik";
const defaultDescription =
  "+Akademi; oyunculuk eğitimi, cast, menajerlik ve prodüksiyon alanlarında yetenekleri sektörün ihtiyaçlarıyla buluşturan profesyonel yapı.";

export function createMetadata({
  title,
  description,
  path = "/",
  image = "/images/home/anasayfa.jpeg",
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
} = {}): Metadata {
  const fullTitle = title ? `${title} | +Akademi` : defaultTitle;
  const desc = description ?? defaultDescription;
  const url = `${SITE_URL}${path}`;

  return {
    title: fullTitle,
    description: desc,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: "+Akademi",
      locale: "tr_TR",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: "+Akademi" }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [image],
    },
  };
}
