/**
 * Public site image paths — swap files under /public/images without
 * hunting through components. Paths are relative to /public.
 */
export const SITE_IMAGES = {
  hero: {
    main: "/images/hero/hero-main.jpg",
  },
  about: {
    main: "/images/about/about-main.jpg",
  },
  services: {
    education: "/images/services/services-edu.jpg",
    agency: "/images/services/services-agency.jpg",
    model: "/images/services/services-model.jpg",
    production: "/images/services/services-prod.jpg",
    management: "/images/services/services-management.jpg",
    cast: "/images/services/services-cast.jpg",
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
