export const STATUS_LABELS: Record<string, string> = {
  new: "Yeni",
  reviewing: "İnceleniyor",
  interview: "Görüşme",
  accepted: "Kabul",
  rejected: "Reddedildi",
  archived: "Arşiv",
};

export const GENDER_LABELS: Record<string, string> = {
  kadin: "Kadın",
  erkek: "Erkek",
  diger: "Diğer",
  belirtmek_istemiyor: "Belirtmek istemiyor",
};

export const CATEGORY_LABELS: Record<string, string> = {
  dizi: "Dizi",
  sinema: "Sinema",
  reklam: "Reklam",
  klip: "Klip",
  produksiyon: "Prodüksiyon",
  diger: "Diğer",
};

export const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
};

export const CONTACT_STATUS_LABELS: Record<string, string> = {
  new: "Yeni",
  read: "Okundu",
  resolved: "Çözüldü",
  archived: "Arşiv",
};

/** Public navbar/footer links. Oyuncular & Referanslar hidden until content is ready. */
export const NAV_LINKS = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/iletisim", label: "İletişim" },
] as const;

export const DASHBOARD_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/dashboard/basvurular", label: "Başvurular", icon: "FileText" },
  { href: "/dashboard/oyuncular", label: "Oyuncular", icon: "Users" },
  { href: "/dashboard/referanslar", label: "Referanslar", icon: "Clapperboard" },
  { href: "/dashboard/iletisim", label: "İletişim", icon: "Mail" },
  { href: "/dashboard/site-ayarlari", label: "Site Ayarları", icon: "Settings" },
  { href: "/dashboard/adminler", label: "Adminler", icon: "Shield" },
] as const;

export const APPLICATION_EXPORT_COLUMNS = [
  { key: "firstName", label: "Ad" },
  { key: "lastName", label: "Soyad" },
  { key: "age", label: "Yaş" },
  { key: "heightCm", label: "Boy" },
  { key: "weightKg", label: "Kilo" },
  { key: "city", label: "Şehir" },
  { key: "phone", label: "Telefon" },
  { key: "gender", label: "Cinsiyet" },
  { key: "status", label: "Durum" },
  { key: "createdAt", label: "Başvuru Tarihi" },
] as const;

export const ACTOR_EXPORT_COLUMNS = [
  { key: "firstName", label: "Ad" },
  { key: "lastName", label: "Soyad" },
  { key: "age", label: "Yaş" },
  { key: "heightCm", label: "Boy" },
  { key: "city", label: "Şehir" },
  { key: "phone", label: "Telefon" },
  { key: "email", label: "E-mail" },
  { key: "gender", label: "Cinsiyet" },
  { key: "isActive", label: "Aktif" },
  { key: "showOnWebsite", label: "Web'de Göster" },
] as const;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://artiakademi.com";
