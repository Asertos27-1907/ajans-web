import type { Metadata } from "next";
import { SITE_URL } from "@/config/constants";
import { SITE_IMAGES } from "@/config/site-images";

export const DEFAULT_TITLE =
  "+Akademi | Oyunculuk, Cast ve Menajerlik Ajansı";

export const DEFAULT_DESCRIPTION =
  "+Akademi; oyunculuk, cast, menajerlik ve prodüksiyon alanlarında profesyonel hizmet sunar. Oyuncu başvurusu ve hizmetlerimiz için bizi keşfedin.";

/** Short brand name for Google site-name / Open Graph siteName signals. */
export const SITE_NAME = "+Akademi";

export const SITE_NAME_FULL = "+Akademi Oyunculuk & Menajerlik";

const DEFAULT_OG_IMAGE = SITE_IMAGES.hero.main;

function absoluteUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return SITE_URL;
  return `${SITE_URL}${normalized}`;
}

function resolveTitle(title: string | undefined, absolute: boolean) {
  if (absolute || !title) return title ?? DEFAULT_TITLE;
  return `${title} | +Akademi`;
}

export function createMetadata({
  title,
  description,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  absolute = false,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  /** When true, use title as-is (no `%s | +Akademi` suffix). */
  absolute?: boolean;
  noIndex?: boolean;
} = {}): Metadata {
  const desc = description ?? DEFAULT_DESCRIPTION;
  const canonicalPath = path.startsWith("/") ? path : `/${path}`;
  const url = absoluteUrl(canonicalPath);
  const resolvedTitle = resolveTitle(title, absolute);
  const ogImage = image.startsWith("http") ? image : image;

  const robots: Metadata["robots"] = noIndex
    ? { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } }
    : { index: true, follow: true };

  return {
    title: absolute || !title
      ? { absolute: resolvedTitle }
      : title,
    description: desc,
    metadataBase: new URL(SITE_URL),
    alternates: noIndex ? undefined : { canonical: canonicalPath },
    robots,
    openGraph: {
      title: resolvedTitle,
      description: desc,
      url,
      siteName: SITE_NAME,
      locale: "tr_TR",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: SITE_NAME_FULL,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: desc,
      images: [ogImage],
    },
  };
}

/** Root layout metadata: default title + template for child segments. */
export function createRootMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: DEFAULT_TITLE,
      template: "%s | +Akademi",
    },
    description: DEFAULT_DESCRIPTION,
    applicationName: SITE_NAME,
    icons: {
      icon: [
        { url: "/brand/icon-48.png", sizes: "48x48", type: "image/png" },
        { url: "/brand/icon-96.png", sizes: "96x96", type: "image/png" },
        { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" }],
      shortcut: ["/brand/icon-48.png"],
    },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName: SITE_NAME,
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      url: SITE_URL,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: SITE_NAME_FULL,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: [DEFAULT_OG_IMAGE],
    },
    robots: { index: true, follow: true },
  };
}
