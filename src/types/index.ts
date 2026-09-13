export type ApplicationStatus =
  | "yeni"
  | "inceleniyor"
  | "gorusme"
  | "kabul"
  | "red"
  | "arsiv";

export type Gender = "kadin" | "erkek" | "diger" | "belirtmek_istemiyor";

export type AdminRole =
  | "SUPER_ADMIN"
  | "EDITOR"
  | "CASTING_MANAGER"
  | "VIEWER";

export type ReferenceCategory =
  | "dizi"
  | "sinema"
  | "reklam"
  | "klip"
  | "produksiyon"
  | "diger";

export interface ActorPhoto {
  id: string;
  actorId: string;
  url: string;
  thumbnailUrl: string;
  alt: string;
  isCover: boolean;
  sortOrder: number;
}

export interface ApplicationPhoto {
  id: string;
  applicationId: string;
  url: string;
  thumbnailUrl: string;
  type: "portre" | "tam_boy" | "ek";
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
  district: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  guardianName?: string;
  guardianPhone?: string;
  heightCm: number;
  weightKg: number;
  hairColor: string;
  eyeColor: string;
  skinTone: string;
  shoeSize: string;
  topSize: string;
  bottomSize: string;
  bust?: string;
  waist?: string;
  hips?: string;
  actingExperience: string;
  actingEducation: string;
  projects: string;
  roles: string;
  languages: string;
  accents: string;
  sports: string;
  dance: string;
  instruments: string;
  specialSkills: string;
  drivingLicense: string;
  occupation: string;
  bio: string;
  showreelUrl?: string;
  youtubeUrl?: string;
  vimeoUrl?: string;
  instagram?: string;
  portfolioUrl?: string;
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
  heightCm: number;
  weightKg: number;
  hairColor: string;
  eyeColor: string;
  bodySize: string;
  phone?: string;
  email?: string;
  bio: string;
  experiences: string;
  projects: string;
  photos: ActorPhoto[];
  coverPhotoUrl: string;
  isActive: boolean;
  showOnWebsite: boolean;
  isFeatured: boolean;
  applicationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReferenceProject {
  id: string;
  title: string;
  category: ReferenceCategory;
  year: number;
  description: string;
  coverImageUrl: string;
  logoUrl?: string;
  actorIds: string[];
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
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
  /** Firma bilgileri */
  companyName: string;
  /** Kısa marka adı (navbar vb.) */
  agencyName: string;
  logoUrl: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  addressLines: string[];
  /** Maps link (yeni sekme) */
  googleMapsUrl?: string;
  /** iframe src — iletişim sayfası haritası */
  googleMapsEmbedUrl?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  linkedin?: string;
  /** @deprecated use slides — kept for soft migration */
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

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
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
  hairColor?: string;
  eyeColor?: string;
  ageMin?: number;
  ageMax?: number;
  heightMin?: number;
  heightMax?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface ActorFilters {
  search?: string;
  city?: string;
  gender?: Gender;
  showOnWebsite?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}
