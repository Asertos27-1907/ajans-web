export type ApplicationStatus =
  | "new"
  | "reviewing"
  | "interview"
  | "accepted"
  | "rejected"
  | "archived";

export type Gender = "kadin" | "erkek" | "diger" | "belirtmek_istemiyor";

export type AdminRole = "owner" | "admin";

export type ContactStatus = "new" | "read" | "resolved" | "archived";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: ContactStatus;
  isRead: boolean;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
}

export interface ActorPhoto {
  id: string;
  actorId: string;
  url: string;
  thumbnailUrl: string;
  storagePath: string;
  alt: string;
  isCover: boolean;
  sortOrder: number;
}

export interface ApplicationPhoto {
  id: string;
  applicationId: string;
  url: string;
  thumbnailUrl: string;
  storagePath: string;
  sortOrder: number;
  type?: "portre" | "tam_boy" | "ek";
  alt: string;
}

export interface Application {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  age: number;
  gender: Gender;
  city: string;
  phone: string;
  heightCm?: number;
  weightKg?: number;
  experience: string;
  photos: ApplicationPhoto[];
  status: ApplicationStatus;
  tags: string[];
  adminNotes: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Actor {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  age: number;
  city: string;
  gender: Gender;
  phone?: string;
  heightCm?: number;
  weightKg?: number;
  experience: string;
  photos: ActorPhoto[];
  coverPhotoUrl: string;
  isActive: boolean;
  showOnWebsite: boolean;
  isFeatured: boolean;
  applicationId?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReferenceCategory =
  | "dizi"
  | "sinema"
  | "reklam"
  | "klip"
  | "produksiyon"
  | "diger";

export interface ReferenceProject {
  id: string;
  title: string;
  category: ReferenceCategory;
  year: number;
  description: string;
  coverImageUrl: string;
  imagePath?: string | null;
  logoUrl?: string;
  actorIds: string[];
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface SiteStat {
  id: string;
  label: string;
  value: number;
  suffix: string;
  isActive: boolean;
  sortOrder: number;
}

export interface HeroSlide {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface AboutParagraph {
  id: string;
  text: string;
  sortOrder: number;
}

export interface AboutFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface SiteSettings {
  companyName: string;
  agencyName: string;
  logoUrl: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  addressLines: string[];
  googleMapsUrl?: string;
  googleMapsEmbedUrl?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  linkedin?: string;
  heroTitle: string;
  heroDescription: string;
  heroImageUrl: string;
  ctaText: string;
  ctaLink: string;
  slides: HeroSlide[];
  servicesSectionTitle: string;
  services: ServiceItem[];
  aboutTitle: string;
  aboutVision: string;
  aboutParagraphs: AboutParagraph[];
  aboutFeatures: AboutFeature[];
  aboutImageUrl: string;
  stats: SiteStat[];
  footerText: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApplicationFilters {
  search?: string;
  city?: string;
  gender?: Gender;
  status?: ApplicationStatus;
  ageMin?: number;
  ageMax?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface ActorFilters {
  search?: string;
  gender?: Gender;
  isActive?: boolean;
  showOnWebsite?: boolean;
  isFeatured?: boolean;
  page?: number;
  pageSize?: number;
}
