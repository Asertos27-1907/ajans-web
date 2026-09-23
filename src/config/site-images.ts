/**
 * Public site image paths — swap files under /public/images without
 * hunting through components. Paths are relative to /public.
 */
export const SITE_IMAGES = {
  brand: {
    logo: "/brand/logo.jpeg",
    icon: "/brand/icon-192.png",
    icon48: "/brand/icon-48.png",
  },
  hero: {
    main: "/images/home/anasayfa.jpeg",
  },
  about: {
    main: "/images/about/about-main.jpg",
  },
  services: {
    education: "/images/services/services-edu.jpg",
    agency: "/images/services/klaket.jpeg",
    model: "/images/services/services-model.jpg",
    production: "/images/services/cekim.jpeg",
    management: "/images/services/services-management.jpg",
    cast: "/images/services/kamera.jpeg",
  },
} as const;

export const SERVICE_IMAGE_FALLBACKS = [
  SITE_IMAGES.services.education,
  SITE_IMAGES.services.agency,
  SITE_IMAGES.services.model,
  SITE_IMAGES.services.production,
  SITE_IMAGES.services.management,
  SITE_IMAGES.services.cast,
] as const;
